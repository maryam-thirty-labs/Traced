from openai import AsyncOpenAI

from app.config import settings
from app.services.ingestion.chunking_service import Chunk

MODEL = "text-embedding-3-small"
DIMENSIONS = 1536
BATCH_SIZE = 100


class EmbeddedChunk(Chunk):
    embedding: list[float]


_client: AsyncOpenAI | None = None


def _get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(api_key=settings.openai_api_key)
    return _client


async def embed_chunks(chunks: list[Chunk]) -> list[EmbeddedChunk]:
    """
    Generate embeddings for chunks using OpenAI text-embedding-3-small.
    Processes in batches of 100. Returns empty list for empty input (zero API calls).
    """
    if not chunks:
        return []

    client = _get_client()
    results: list[EmbeddedChunk] = []

    for i in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[i : i + BATCH_SIZE]
        texts = [c.chunk_text for c in batch]

        response = await client.embeddings.create(
            model=MODEL,
            input=texts,
            dimensions=DIMENSIONS,
        )

        for chunk, embedding_data in zip(batch, response.data):
            results.append(EmbeddedChunk(
                source_id=chunk.source_id,
                chunk_text=chunk.chunk_text,
                section_title=chunk.section_title,
                chunk_order=chunk.chunk_order,
                word_count=chunk.word_count,
                embedding=embedding_data.embedding,
            ))

    return results
