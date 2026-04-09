import httpx
from xml.etree import ElementTree

from app.config import settings
from app.clients.spring_client import register_source_document, SourceDocumentRequest, SpringClientError
from app.services.ingestion.pmc_xml_parser import parse_pmc_xml

EUTILS_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
PMC_OA_URL = "https://www.ncbi.nlm.nih.gov/pmc/utils/oa/oa.fcgi"
TRUST_SCORE = 0.80
SOURCE_TYPE = "FULL_TEXT"

# Sections to include — skip Methods and Results
INCLUDED_SECTIONS = {"abstract", "introduction", "discussion", "conclusion", "background"}


class NotOpenAccessError(Exception):
    def __init__(self, pmcid: str):
        super().__init__(f"PMC article {pmcid} is not available in the Open Access subset")


async def fetch_pmc_full_text(pmcid: str) -> dict:
    """
    Fetch a PMC Open Access full-text article, extract selected sections,
    and register via Spring Boot.
    OA subset only — non-OA raises NotOpenAccessError.
    """
    params: dict = {
        "db": "pmc",
        "id": pmcid,
        "rettype": "xml",
        "retmode": "xml",
    }
    if settings.ncbi_api_key:
        params["api_key"] = settings.ncbi_api_key

    async with httpx.AsyncClient(timeout=30.0) as client:
        # Fetch full XML
        resp = await client.get(f"{EUTILS_BASE}/efetch.fcgi", params=params)
        resp.raise_for_status()

        xml_text = resp.text

        # Check if we got a valid article
        if "<error>" in xml_text.lower() or "<ERROR>" in xml_text:
            raise NotOpenAccessError(pmcid)

        # Parse sections
        sections = parse_pmc_xml(xml_text, included_sections=INCLUDED_SECTIONS)

        if not sections:
            return {"status": "no_content", "pmcid": pmcid}

        # Extract title
        root = ElementTree.fromstring(xml_text)
        title_el = root.find(".//article-title")
        title = title_el.text.strip() if title_el is not None and title_el.text else f"PMC: {pmcid}"

        raw_text = "\n\n".join(
            f"## {s['heading']}\n{s['text']}" if s.get("heading") else s["text"]
            for s in sections
        )

        url = f"https://www.ncbi.nlm.nih.gov/pmc/articles/{pmcid}/"

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
            return {
                "status": "ingested",
                "pmcid": pmcid,
                "title": title,
                "sections_extracted": len(sections),
                "source_id": result.get("id"),
            }
        except SpringClientError as e:
            if e.status_code == 409:
                return {"status": "already_exists", "pmcid": pmcid}
            raise
