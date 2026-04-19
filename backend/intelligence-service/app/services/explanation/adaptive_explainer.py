"""AdaptiveExplainer — rewrites RAG-retrieved clinical text for a user_background.

RAG owns accuracy. AdaptiveExplainer owns voice and content emphasis. The two
steps are deliberately separate: on any failure or timeout, return the raw
clinical text unchanged so the explanation always renders.
"""
import asyncio
import json
import logging
from dataclasses import dataclass
from typing import Optional

from app.clients.anthropic_client import get_anthropic_client

logger = logging.getLogger(__name__)

# Single source of truth for the model ID. Bump this one constant when the
# recommended Sonnet tier ships a new minor version.
MODEL = "claude-sonnet-4-6"

# Hard cap on explainer wall-time. On timeout we fall back to raw clinical text.
EXPLAINER_TIMEOUT_SECONDS = 8.0
EXPLAINER_MAX_TOKENS = 1000

SYSTEM_PROMPT_BASE = """You are the explanation engine for Traced, an anatomy learning app.
You will receive a clinical text about an anatomical structure retrieved from medical literature.
Your job is to rewrite it for a specific audience without inventing any new medical facts.
You may only use facts present in the clinical text provided.
You must never add clinical claims, statistics, or medical assertions not in the source text.
The source text is the single source of truth for accuracy.

Output format — return valid JSON only, no markdown, no preamble:
{
  "adapted_text": "3-4 paragraphs of personalised explanation",
  "aha_fact": "one single sentence closing fact, no newline characters"
}"""

BACKGROUND_INSTRUCTIONS = {
    "curious_adult": """
Audience: a curious adult with no medical background.
Voice: warm, conversational. Use "you" and "your body" throughout.
Emphasise: etymology if provided, wonder, surprising evolutionary facts, "why does this exist", what makes this structure remarkable.
De-emphasise: clinical pathology, disease statistics, precise measurements, Latin/Greek terms without plain English gloss immediately after.
Analogies: use everyday comparisons freely (plumbing, electrical wiring, doors, pumps).
aha_fact: one genuinely surprising fact that makes the reader think "I never knew that."
""",
    "med_student": """
Audience: a medical or healthcare student.
Voice: precise and readable. Anatomical terminology is acceptable — gloss it once on first use, then use it freely.
Emphasise: clinical relevance, what goes wrong with this structure, adjacent structures and how they relate, exam-relevant detail, how this connects to pathology they will encounter.
De-emphasise: basic analogies (condescending at this level), wonder framing, oversimplification.
aha_fact: one clinical pearl — a fact that matters in practice, something a junior doctor should know.
""",
    "fitness": """
Audience: someone interested in physical performance and training.
Voice: active, performance-oriented. Relate everything to what the body does under physical load.
Emphasise: how this structure responds to exercise, training adaptations, cardiac output / stroke volume / muscle fibre type / VO2 max where relevant, how athletes differ from sedentary individuals in this structure.
De-emphasise: pathology, rare diseases, purely theoretical anatomy with no performance relevance.
aha_fact: one training-relevant insight — something that changes how the reader thinks about their own training.
""",
    "health_scare": """
Audience: someone who arrived because of a personal health event, symptom, or diagnosis.
Voice: calm, reassuring, never alarmist. This person may be anxious.
Emphasise: normal function, what healthy looks like day-to-day, how robust this structure normally is, when it is appropriate to speak to a doctor (general guidance only, never specific medical advice).
De-emphasise: scary statistics, worst-case scenarios, rare complications, disease progression language.
Do not include: mortality rates, incidence statistics, or alarming clinical language even if present in the source text.
aha_fact: one reassuring fact that highlights how well-designed or resilient this structure normally is.
""",
}

DEFAULT_BACKGROUND = "curious_adult"


@dataclass
class Citation:
    title: str
    source: str
    url: Optional[str] = None


@dataclass
class AdaptiveExplanationResult:
    adapted_text: str
    aha_fact: Optional[str]
    citations: list
    user_background_applied: str


async def adapt_explanation(
    structure_name: str,
    clinical_text: str,
    source_citations: list,
    user_background: str,
    etymology_root: Optional[str],
    anthropic_client=None,
) -> AdaptiveExplanationResult:
    """Rewrite `clinical_text` for `user_background`.

    Never invents facts. Never modifies citations. Returns `clinical_text`
    unchanged on any failure or timeout — callers can rely on this function
    never raising.
    """

    if user_background not in BACKGROUND_INSTRUCTIONS:
        logger.warning(
            "Unknown user_background '%s', defaulting to %s",
            user_background,
            DEFAULT_BACKGROUND,
        )
        user_background = DEFAULT_BACKGROUND

    # Pull the singleton if the caller didn't inject one. Tests inject.
    if anthropic_client is None:
        anthropic_client = get_anthropic_client()

    etymology_line = ""
    if etymology_root:
        etymology_line = (
            f"\nEtymology context (weave in naturally if appropriate): {etymology_root}"
        )

    user_prompt = f"""Structure: {structure_name}
{etymology_line}

Clinical source text (your only source of facts):
{clinical_text}

{BACKGROUND_INSTRUCTIONS[user_background]}

Return only valid JSON. No markdown fences, no preamble."""

    try:
        response = await asyncio.wait_for(
            anthropic_client.messages.create(
                model=MODEL,
                max_tokens=EXPLAINER_MAX_TOKENS,
                system=SYSTEM_PROMPT_BASE,
                messages=[{"role": "user", "content": user_prompt}],
            ),
            timeout=EXPLAINER_TIMEOUT_SECONDS,
        )

        raw = response.content[0].text.strip()
        parsed = json.loads(raw)

        adapted_text = (parsed.get("adapted_text") or "").strip()
        aha_fact = (parsed.get("aha_fact") or "").strip()

        # aha_fact must be a single sentence.
        if "\n" in aha_fact:
            aha_fact = aha_fact.split("\n")[0].strip()

        if not adapted_text:
            raise ValueError("adapted_text was empty in LLM response")

        return AdaptiveExplanationResult(
            adapted_text=adapted_text,
            aha_fact=aha_fact if aha_fact else None,
            citations=source_citations,
            user_background_applied=user_background,
        )

    except asyncio.TimeoutError:
        logger.warning(
            "AdaptiveExplainer timeout for structure '%s', returning fallback",
            structure_name,
        )
        return AdaptiveExplanationResult(
            adapted_text=clinical_text,
            aha_fact=None,
            citations=source_citations,
            user_background_applied="fallback",
        )

    except Exception as e:  # noqa: BLE001 — intentional catch-all per sprint spec
        logger.error(
            "AdaptiveExplainer error for structure '%s': %s", structure_name, e
        )
        return AdaptiveExplanationResult(
            adapted_text=clinical_text,
            aha_fact=None,
            citations=source_citations,
            user_background_applied="fallback",
        )
