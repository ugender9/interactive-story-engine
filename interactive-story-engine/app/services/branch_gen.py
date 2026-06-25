"""Branch scene generation using IBM Granite."""
from __future__ import annotations

import json
import logging

from langchain_core.prompts import PromptTemplate
from langchain_core.language_models import BaseLLM
from typing import Any

from app.models.story import StoryBible, TurningPoint

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Prompts
# ---------------------------------------------------------------------------

_BRANCH_PROMPT = PromptTemplate(
    input_variables=["story_bible", "scene_text", "choice_label"],
    template=(
        "You are continuing a story. Here is the story bible you must follow strictly:\n"
        "{story_bible}\n\n"
        "The story so far ended at this scene:\n"
        "{scene_text}\n\n"
        "The reader chose: {choice_label}\n\n"
        "Write a continuation scene of 3–4 sentences that follows this choice. "
        "Match the tone, honor the world rules, and keep all character names and traits consistent.\n\n"
        "Return ONLY the scene text. No titles, no explanation."
    ),
)

_BRANCH_STRICT_PROMPT = PromptTemplate(
    input_variables=["story_bible", "scene_text", "choice_label"],
    template=(
        "Continue the story in exactly 3–4 sentences. "
        "Story bible to follow:\n{story_bible}\n\n"
        "Scene that just happened:\n{scene_text}\n\n"
        "Reader's choice: {choice_label}\n\n"
        "Write ONLY the continuation text, nothing else:"
    ),
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _bible_summary(bible: StoryBible) -> str:
    chars = ", ".join(f"{c.name} ({c.description})" for c in bible.characters)
    rules = "; ".join(bible.world_rules) if bible.world_rules else "none"
    return (
        f"Characters: {chars}\n"
        f"Setting: {bible.setting}\n"
        f"Tone: {bible.tone}\n"
        f"World rules: {rules}"
    )


def _invoke(llm: Any, prompt: PromptTemplate, **kwargs: str) -> str:
    chain = prompt | llm
    result = chain.invoke(kwargs)
    # ChatOpenAI / Groq returns AIMessage; plain LLMs return a string
    text = result.content if hasattr(result, "content") else str(result)
    return text.strip()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def generate_branch(
    scene_text: str,
    choice_label: str,
    story_bible: StoryBible,
    llm: BaseLLM,
) -> str:
    """Generate a single branch continuation. Retries once on empty/very short output."""
    bible_str = _bible_summary(story_bible)

    text = _invoke(
        llm,
        _BRANCH_PROMPT,
        story_bible=bible_str,
        scene_text=scene_text,
        choice_label=choice_label,
    )

    if len(text) < 20:
        logger.warning("Branch output too short (%r), retrying with strict prompt.", text)
        text = _invoke(
            llm,
            _BRANCH_STRICT_PROMPT,
            story_bible=bible_str,
            scene_text=scene_text,
            choice_label=choice_label,
        )

    if len(text) < 20:
        raise ValueError(
            f"Branch generation failed for choice '{choice_label}': output too short after retry."
        )

    return text


def generate_branches_for_turning_point(
    turning_point: TurningPoint,
    story_bible: StoryBible,
    llm: BaseLLM,
) -> tuple[str, str]:
    """Return (branch_a_text, branch_b_text) for a single turning point."""
    branch_a = generate_branch(
        scene_text=turning_point.scene_text,
        choice_label=turning_point.choice_a,
        story_bible=story_bible,
        llm=llm,
    )
    branch_b = generate_branch(
        scene_text=turning_point.scene_text,
        choice_label=turning_point.choice_b,
        story_bible=story_bible,
        llm=llm,
    )
    return branch_a, branch_b
