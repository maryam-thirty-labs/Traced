import httpx
from bs4 import BeautifulSoup

from app.clients.spring_client import register_source_document, SourceDocumentRequest, SpringClientError

NICE_SEARCH_URL = "https://www.nice.org.uk/search"
NICE_BASE_URL = "https://www.nice.org.uk"
TRUST_SCORE = 0.95
SOURCE_TYPE = "GUIDELINE"
JURISDICTION = "UK"


async def scrape_nice(topic: str) -> dict:
    """
    Search NICE for a topic, fetch the first guideline result,
    extract clean text sections, and register via Spring Boot.
    """
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        # Search NICE
        search_resp = await client.get(
            NICE_SEARCH_URL,
            params={"q": topic, "ps": 1, "pa": 1},
        )
        search_resp.raise_for_status()

        soup = BeautifulSoup(search_resp.text, "html.parser")
        result_link = soup.select_one("a.results__link, .results-list a, a[href*='/guidance/']")

        if not result_link:
            return {"status": "no_results", "topic": topic}

        href = result_link.get("href", "")
        guideline_url = href if href.startswith("http") else f"{NICE_BASE_URL}{href}"
        title = result_link.get_text(strip=True) or f"NICE guideline: {topic}"

        # Fetch guideline page
        page_resp = await client.get(guideline_url)
        page_resp.raise_for_status()

        page_soup = BeautifulSoup(page_resp.text, "html.parser")

        # Extract text sections
        sections = []
        for section in page_soup.select("div.chapter, div.section, article, .content-body"):
            heading = section.find(["h1", "h2", "h3"])
            heading_text = heading.get_text(strip=True) if heading else ""
            body_text = section.get_text(separator=" ", strip=True)
            if body_text and len(body_text) > 50:
                sections.append({
                    "heading": heading_text,
                    "text": body_text,
                })

        if not sections:
            # Fallback: extract all paragraph text
            paragraphs = page_soup.find_all("p")
            raw_text = " ".join(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))
        else:
            raw_text = "\n\n".join(
                f"## {s['heading']}\n{s['text']}" if s["heading"] else s["text"]
                for s in sections
            )

        if not raw_text or len(raw_text) < 100:
            return {"status": "insufficient_content", "topic": topic, "url": guideline_url}

        # Register source via Spring Boot
        request = SourceDocumentRequest(
            url=guideline_url,
            title=title,
            source_type=SOURCE_TYPE,
            trust_score=TRUST_SCORE,
            jurisdiction=JURISDICTION,
            raw_text=raw_text,
        )

        try:
            result = await register_source_document(request)
            return {"status": "ingested", "url": guideline_url, "title": title, "source_id": result.get("id")}
        except SpringClientError as e:
            if e.status_code == 409:
                return {"status": "already_exists", "url": guideline_url}
            raise
