import httpx

from app.clients.spring_client import register_source_document, SourceDocumentRequest, SpringClientError

MEDLINEPLUS_API_URL = "https://wsearch.nlm.nih.gov/ws/query"
TRUST_SCORE = 0.85
SOURCE_TYPE = "REFERENCE"


async def ingest_medlineplus(topic: str) -> dict:
    """
    Fetch a MedlinePlus health topic article via the free NLM web search API.
    No API key required. Rate limit: 3 req/s.
    """
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        # Search MedlinePlus health topics
        resp = await client.get(
            MEDLINEPLUS_API_URL,
            params={
                "db": "healthTopics",
                "term": topic,
                "retmax": 1,
            },
        )
        resp.raise_for_status()

        # Parse XML response
        from xml.etree import ElementTree
        root = ElementTree.fromstring(resp.text)

        documents = root.findall(".//document")
        if not documents:
            return {"status": "no_results", "topic": topic}

        doc = documents[0]
        url = doc.get("url", "")
        title_el = doc.find(".//content[@name='title']")
        title = title_el.text.strip() if title_el is not None and title_el.text else f"MedlinePlus: {topic}"

        summary_el = doc.find(".//content[@name='FullSummary']")
        snippet_el = doc.find(".//content[@name='snippet']")

        raw_text = ""
        if summary_el is not None and summary_el.text:
            # Strip HTML tags from full summary
            from bs4 import BeautifulSoup
            raw_text = BeautifulSoup(summary_el.text, "html.parser").get_text(separator=" ", strip=True)
        elif snippet_el is not None and snippet_el.text:
            from bs4 import BeautifulSoup
            raw_text = BeautifulSoup(snippet_el.text, "html.parser").get_text(separator=" ", strip=True)

        if not raw_text or len(raw_text) < 50:
            return {"status": "insufficient_content", "topic": topic, "url": url}

        request = SourceDocumentRequest(
            url=url,
            title=title,
            source_type=SOURCE_TYPE,
            trust_score=TRUST_SCORE,
            jurisdiction=None,
            raw_text=raw_text,
        )

        try:
            result = await register_source_document(request)
            return {"status": "ingested", "url": url, "title": title, "source_id": result.get("id")}
        except SpringClientError as e:
            if e.status_code == 409:
                return {"status": "already_exists", "url": url}
            raise
