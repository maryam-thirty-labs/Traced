import re
from xml.etree import ElementTree


def parse_pmc_xml(
    xml_text: str,
    included_sections: set[str] | None = None,
) -> list[dict]:
    """
    Parse PMC full-text XML and extract sections.
    - Handles nested <sec> elements
    - Excludes <table-wrap> and <fig> content
    - Removes [digit] citation markers
    - Skips empty sections after cleaning
    """
    root = ElementTree.fromstring(xml_text)
    sections: list[dict] = []

    # Find the body element
    body = root.find(".//body")
    if body is None:
        # Try extracting abstract as fallback
        abstract = root.find(".//abstract")
        if abstract is not None:
            text = _extract_text(abstract)
            if text:
                sections.append({"heading": "Abstract", "text": text})
        return sections

    for sec in body.findall(".//sec"):
        heading = _get_section_heading(sec)
        heading_lower = heading.lower() if heading else ""

        # Filter to included sections if specified
        if included_sections:
            if not any(inc in heading_lower for inc in included_sections):
                continue

        text = _extract_text(sec)
        if text and len(text.strip()) > 20:
            sections.append({"heading": heading or None, "text": text})

    # Also try to get abstract
    abstract = root.find(".//abstract")
    if abstract is not None and (included_sections is None or "abstract" in included_sections):
        text = _extract_text(abstract)
        if text and len(text.strip()) > 20:
            sections.insert(0, {"heading": "Abstract", "text": text})

    return sections


def _get_section_heading(sec: ElementTree.Element) -> str:
    """Extract the heading from a <sec> element."""
    title = sec.find("title")
    if title is not None:
        return "".join(title.itertext()).strip()
    label = sec.find("label")
    if label is not None:
        return "".join(label.itertext()).strip()
    return ""


def _extract_text(element: ElementTree.Element) -> str:
    """
    Extract clean text from an XML element.
    Excludes table-wrap and fig elements.
    Removes [digit] citation markers.
    """
    parts: list[str] = []

    for child in element.iter():
        # Skip table and figure elements
        if child.tag in ("table-wrap", "fig", "table", "graphic", "supplementary-material"):
            continue

        if child.text:
            parts.append(child.text)
        if child.tail:
            parts.append(child.tail)

    raw = " ".join(parts)

    # Remove [digit] citation markers like [1], [2,3], [1-5]
    raw = re.sub(r'\[\d+(?:[,\-–]\d+)*\]', '', raw)

    # Clean up whitespace
    raw = re.sub(r'\s+', ' ', raw).strip()

    return raw
