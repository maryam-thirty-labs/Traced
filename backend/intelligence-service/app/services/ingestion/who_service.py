"""
WHO fact sheets ingestion service — OPTIONAL, not part of v1 core.
Added in later phases when the pipeline is proven.
"""


async def ingest_who(topic: str) -> dict:
    """Fetch and store a WHO fact sheet. Not implemented in v1."""
    raise NotImplementedError(
        "WHO ingestion is not part of v1 core sources. "
        "Activate in a future phase by implementing this function."
    )
