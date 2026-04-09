"""
Wikipedia medicine article ingestion service — OPTIONAL, not part of v1 core.
Added in later phases when the pipeline is proven.
"""


async def ingest_wikipedia(topic: str) -> dict:
    """Fetch and store a Wikipedia medicine article. Not implemented in v1."""
    raise NotImplementedError(
        "Wikipedia ingestion is not part of v1 core sources. "
        "Activate in a future phase by implementing this function."
    )
