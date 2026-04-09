import re
import math
from collections import Counter
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config import settings

# Replace psycopg2 sync URL with asyncpg
_async_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://").replace("psycopg2", "asyncpg")
_engine = create_async_engine(_async_url, pool_size=5)
_async_session = sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)


class RetrievedChunk(BaseModel):
    chunk_id: str
    source_document_id: str
    chunk_text: str
    section_title: str | None = None
    semantic_score: float = 0.0
    bm25_score: float = 0.0
    combined_score: float = 0.0


SEMANTIC_WEIGHT = 0.6
BM25_WEIGHT = 0.4


def _compute_bm25_scores(
    query_terms: list[str],
    documents: list[tuple[str, str]],
    k1: float = 1.5,
    b: float = 0.75,
) -> dict[str, float]:
    """Simple BM25 scoring over (chunk_id, chunk_text) pairs."""
    if not documents or not query_terms:
        return {}

    doc_lengths = {}
    doc_term_freqs: dict[str, Counter] = {}
    doc_freq: Counter = Counter()

    for chunk_id, text_content in documents:
        words = re.findall(r'\w+', text_content.lower())
        doc_lengths[chunk_id] = len(words)
        tf = Counter(words)
        doc_term_freqs[chunk_id] = tf
        for term in set(words):
            doc_freq[term] += 1

    n = len(documents)
    avgdl = sum(doc_lengths.values()) / n if n else 1

    scores: dict[str, float] = {}
    for chunk_id, _ in documents:
        score = 0.0
        dl = doc_lengths[chunk_id]
        tf = doc_term_freqs[chunk_id]

        for term in query_terms:
            term_lower = term.lower()
            df = doc_freq.get(term_lower, 0)
            if df == 0:
                continue
            idf = math.log((n - df + 0.5) / (df + 0.5) + 1)
            term_freq = tf.get(term_lower, 0)
            numerator = term_freq * (k1 + 1)
            denominator = term_freq + k1 * (1 - b + b * dl / avgdl)
            score += idf * numerator / denominator

        scores[chunk_id] = score

    return scores


async def hybrid_search(
    query: str,
    canonical_ids: list[str] | None = None,
    top_k: int = 10,
    query_embedding: list[float] | None = None,
) -> list[RetrievedChunk]:
    """
    Hybrid retrieval: pgvector cosine similarity + BM25.
    Combined score = 0.6 * semantic + 0.4 * bm25.
    Returns empty list for empty corpus — no exception.
    """
    async with _async_session() as session:
        # Step 1: Semantic search via pgvector
        if query_embedding:
            embedding_str = "[" + ",".join(str(x) for x in query_embedding) + "]"
            semantic_sql = text("""
                SELECT ec.chunk_id, ec.source_document_id::text, ec.chunk_text, ec.section_title,
                       1 - (ec.embedding <=> :embedding::vector) AS cosine_sim
                FROM evidence_chunks ec
                WHERE ec.embedding IS NOT NULL
                ORDER BY ec.embedding <=> :embedding::vector
                LIMIT :limit
            """)
            result = await session.execute(semantic_sql, {"embedding": embedding_str, "limit": top_k * 2})
        else:
            # Fallback: text search only
            semantic_sql = text("""
                SELECT ec.chunk_id, ec.source_document_id::text, ec.chunk_text, ec.section_title,
                       0.0 AS cosine_sim
                FROM evidence_chunks ec
                WHERE ec.chunk_text ILIKE :pattern
                LIMIT :limit
            """)
            result = await session.execute(semantic_sql, {"pattern": f"%{query}%", "limit": top_k * 2})

        rows = result.fetchall()
        if not rows:
            return []

        # Step 2: BM25 scoring
        query_terms = re.findall(r'\w+', query.lower())
        documents = [(row[0], row[2]) for row in rows]
        bm25_scores = _compute_bm25_scores(query_terms, documents)

        # Step 3: Combine scores
        chunks: list[RetrievedChunk] = []
        max_semantic = max((row[4] for row in rows), default=1.0) or 1.0
        max_bm25 = max(bm25_scores.values(), default=1.0) or 1.0

        for row in rows:
            chunk_id, source_doc_id, chunk_text, section_title, cosine_sim = row
            norm_semantic = cosine_sim / max_semantic if max_semantic else 0
            norm_bm25 = bm25_scores.get(chunk_id, 0) / max_bm25 if max_bm25 else 0
            combined = SEMANTIC_WEIGHT * norm_semantic + BM25_WEIGHT * norm_bm25

            chunks.append(RetrievedChunk(
                chunk_id=chunk_id,
                source_document_id=source_doc_id,
                chunk_text=chunk_text,
                section_title=section_title,
                semantic_score=cosine_sim,
                bm25_score=bm25_scores.get(chunk_id, 0),
                combined_score=combined,
            ))

        chunks.sort(key=lambda c: c.combined_score, reverse=True)
        return chunks[:top_k]
