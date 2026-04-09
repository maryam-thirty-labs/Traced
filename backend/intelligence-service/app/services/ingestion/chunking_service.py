import re
from pydantic import BaseModel


class Chunk(BaseModel):
    source_id: str
    chunk_text: str
    section_title: str | None = None
    chunk_order: int
    word_count: int


MIN_WORDS = 150
MAX_WORDS = 300
OVERLAP_WORDS = 30


def _split_into_sections(text: str) -> list[tuple[str | None, str]]:
    """Split text into (heading, body) tuples based on markdown-style headings."""
    sections: list[tuple[str | None, str]] = []
    current_heading: str | None = None
    current_lines: list[str] = []

    for line in text.split("\n"):
        heading_match = re.match(r"^#{1,3}\s+(.+)$", line.strip())
        if heading_match:
            if current_lines:
                body = "\n".join(current_lines).strip()
                if body:
                    sections.append((current_heading, body))
                current_lines = []
            current_heading = heading_match.group(1).strip()
        else:
            current_lines.append(line)

    if current_lines:
        body = "\n".join(current_lines).strip()
        if body:
            sections.append((current_heading, body))

    if not sections and text.strip():
        sections.append((None, text.strip()))

    return sections


def _split_text_into_windows(words: list[str]) -> list[list[str]]:
    """Split a word list into overlapping windows of MIN_WORDS–MAX_WORDS."""
    windows: list[list[str]] = []
    start = 0

    while start < len(words):
        end = min(start + MAX_WORDS, len(words))
        window = words[start:end]
        windows.append(window)

        if end >= len(words):
            break

        start = end - OVERLAP_WORDS
        if start < 0:
            start = 0

    return windows


def chunk_text(source_id: str, text: str) -> list[Chunk]:
    """
    Section-aware chunking: splits on markdown headings first,
    then windows each section into 150–300 word chunks with 30-word overlap.
    """
    sections = _split_into_sections(text)
    chunks: list[Chunk] = []
    order = 0

    for heading, body in sections:
        words = body.split()

        if len(words) <= MAX_WORDS:
            chunks.append(Chunk(
                source_id=source_id,
                chunk_text=body,
                section_title=heading,
                chunk_order=order,
                word_count=len(words),
            ))
            order += 1
        else:
            windows = _split_text_into_windows(words)
            for window in windows:
                chunk_text_str = " ".join(window)
                chunks.append(Chunk(
                    source_id=source_id,
                    chunk_text=chunk_text_str,
                    section_title=heading,
                    chunk_order=order,
                    word_count=len(window),
                ))
                order += 1

    return chunks
