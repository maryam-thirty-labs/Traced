"""
NHS Conditions API ingestion service — OPTIONAL, not part of v1 core.
Requires NHS_API_KEY environment variable when activated.
Added in later phases when the pipeline is proven.
"""


async def ingest_nhs(topic: str) -> dict:
    """Fetch and store an NHS Conditions article. Not implemented in v1."""
    raise NotImplementedError(
        "NHS ingestion is not part of v1 core sources. "
        "Activate in a future phase by implementing this function."
    )
