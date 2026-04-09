import re
from app.services.ingestion.pmc_xml_parser import parse_pmc_xml


SAMPLE_XML = """<?xml version="1.0"?>
<article>
  <front>
    <article-meta>
      <article-title>Test Article</article-title>
      <abstract><p>This is the abstract text about gallbladder disease [1].</p></abstract>
    </article-meta>
  </front>
  <body>
    <sec>
      <title>Introduction</title>
      <p>Gallstone disease is common [2,3]. It affects many patients [4-6].</p>
    </sec>
    <sec>
      <title>Methods</title>
      <p>We reviewed 500 cases.</p>
    </sec>
    <sec>
      <title>Discussion</title>
      <p>The results suggest cholecystectomy is effective [7].</p>
      <table-wrap><table><tr><td>data</td></tr></table></table-wrap>
      <fig><graphic/></fig>
    </sec>
  </body>
</article>"""


def test_no_citation_markers_in_output():
    """No [digit] citation markers in parsed output."""
    sections = parse_pmc_xml(SAMPLE_XML, included_sections={"abstract", "introduction", "discussion"})
    for s in sections:
        assert re.search(r'\[\d+\]', s["text"]) is None, f"Citation marker found in: {s['text'][:100]}"
        assert re.search(r'\[\d+[,\-]\d+\]', s["text"]) is None


def test_methods_excluded():
    """Methods section excluded when not in included_sections."""
    sections = parse_pmc_xml(SAMPLE_XML, included_sections={"abstract", "introduction", "discussion"})
    headings = [s.get("heading", "").lower() for s in sections]
    assert "methods" not in headings


def test_discussion_included():
    sections = parse_pmc_xml(SAMPLE_XML, included_sections={"discussion"})
    headings = [s.get("heading", "").lower() for s in sections]
    assert "discussion" in headings


def test_empty_section_skipped():
    xml = """<?xml version="1.0"?>
    <article><body><sec><title>Empty</title><p></p></sec></body></article>"""
    sections = parse_pmc_xml(xml, included_sections={"empty"})
    assert len(sections) == 0
