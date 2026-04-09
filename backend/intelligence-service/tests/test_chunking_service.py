from app.services.ingestion.chunking_service import chunk_text


def test_max_chunk_size_within_limit():
    """Max chunk ≤ 350 words."""
    long_text = " ".join(["word"] * 1000)
    chunks = chunk_text("src-001", long_text)
    for c in chunks:
        assert c.word_count <= 350, f"Chunk {c.chunk_order} has {c.word_count} words"


def test_all_chunks_have_source_id():
    """All chunks have non-null sourceId."""
    text = " ".join(["medical"] * 200)
    chunks = chunk_text("src-002", text)
    assert len(chunks) > 0
    for c in chunks:
        assert c.source_id is not None
        assert c.source_id == "src-002"


def test_section_aware_splitting():
    """Sections split on markdown headings."""
    text = "## Introduction\n" + " ".join(["intro"] * 100) + "\n\n## Discussion\n" + " ".join(["discuss"] * 100)
    chunks = chunk_text("src-003", text)
    headings = [c.section_title for c in chunks]
    assert "Introduction" in headings
    assert "Discussion" in headings


def test_empty_text_returns_empty():
    chunks = chunk_text("src-004", "")
    assert chunks == []
