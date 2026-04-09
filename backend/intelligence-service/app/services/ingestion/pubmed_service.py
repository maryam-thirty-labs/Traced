import httpx
from xml.etree import ElementTree

from app.config import settings
from app.clients.spring_client import register_source_document, SourceDocumentRequest, SpringClientError

EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
TRUST_SCORE = 0.80
SOURCE_TYPE = "ABSTRACT"


async def fetch_pubmed_abstracts(topic: str, max_results: int = 5) -> list[dict]:
    """
    Search PubMed for review articles on a topic, fetch abstracts,
    and register each via Spring Boot.
    """
    params: dict = {
        "db": "pubmed",
        "term": f"{topic}[Title/Abstract] AND review[pt]",
        "retmax": max_results,
        "sort": "relevance",
        "retmode": "json",
    }
    if settings.ncbi_api_key:
        params["api_key"] = settings.ncbi_api_key

    results = []

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Step 1: Search for PMIDs
        search_resp = await client.get(f"{EUTILS_BASE}/esearch.fcgi", params=params)
        search_resp.raise_for_status()
        search_data = search_resp.json()

        pmids = search_data.get("esearchresult", {}).get("idlist", [])
        if not pmids:
            return [{"status": "no_results", "topic": topic}]

        # Step 2: Fetch abstracts via efetch
        fetch_params: dict = {
            "db": "pubmed",
            "id": ",".join(pmids),
            "rettype": "xml",
            "retmode": "xml",
        }
        if settings.ncbi_api_key:
            fetch_params["api_key"] = settings.ncbi_api_key

        fetch_resp = await client.get(f"{EUTILS_BASE}/efetch.fcgi", params=fetch_params)
        fetch_resp.raise_for_status()

        root = ElementTree.fromstring(fetch_resp.text)

        for article in root.findall(".//PubmedArticle"):
            pmid_el = article.find(".//PMID")
            pmid = pmid_el.text if pmid_el is not None else None
            if not pmid:
                continue

            title_el = article.find(".//ArticleTitle")
            title = title_el.text.strip() if title_el is not None and title_el.text else f"PubMed {pmid}"

            # Collect abstract text
            abstract_parts = []
            for abs_text in article.findall(".//AbstractText"):
                label = abs_text.get("Label", "")
                text = abs_text.text or ""
                if label:
                    abstract_parts.append(f"{label}: {text.strip()}")
                else:
                    abstract_parts.append(text.strip())

            raw_text = "\n\n".join(abstract_parts)
            if not raw_text or len(raw_text) < 50:
                continue

            url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"

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
                results.append({"status": "ingested", "pmid": pmid, "title": title, "source_id": result.get("id")})
            except SpringClientError as e:
                if e.status_code == 409:
                    results.append({"status": "already_exists", "pmid": pmid})
                else:
                    raise

    return results
