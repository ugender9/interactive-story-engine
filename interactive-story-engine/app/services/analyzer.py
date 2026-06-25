"""Story Bible extraction and decision-point detection."""
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

_BIBLE_PROMPT = PromptTemplate(
    input_variables=["story_text"],
    template=(
        "Analyze the following story and extract a structured story bible in JSON format "
        "with these exact keys: characters (list of {{name, description}}), setting (string), "
        "tone (string), world_rules (list of strings).\n\n"
        "Story:\n{story_text}\n\n"
        "Return ONLY valid JSON. No explanation."
    ),
)

_BIBLE_STRICT_PROMPT = PromptTemplate(
    input_variables=["story_text"],
    template=(
        "You must respond with a single valid JSON object and nothing else.\n"
        "Keys required: characters (array of objects with 'name' and 'description'), "
        "setting (string), tone (string), world_rules (array of strings).\n\n"
        "Story:\n{story_text}\n\n"
        "JSON:"
    ),
)

_TURNING_PROMPT = PromptTemplate(
    input_variables=["story_text"],
    template=(
        "Read this story carefully. Identify exactly 2 turning points where the main character "
        "faces a meaningful decision. For each turning point return: scene_index (int, which "
        "paragraph the decision occurs at), scene_text (the paragraph text), choice_prompt "
        "(a question to ask the reader, e.g. 'Do you follow the stranger or turn back?'), "
        "choice_a (label for option A), choice_b (label for option B).\n\n"
        "Story:\n{story_text}\n\n"
        "Return ONLY a JSON array of turning point objects. No explanation."
    ),
)

_TURNING_STRICT_PROMPT = PromptTemplate(
    input_variables=["story_text"],
    template=(
        "You must respond with a JSON array and nothing else. "
        "Each element must have exactly these keys: scene_index (integer), scene_text (string), "
        "choice_prompt (string), choice_a (string), choice_b (string). "
        "Produce exactly 2 elements.\n\n"
        "Story:\n{story_text}\n\n"
        "JSON array:"
    ),
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _parse_json(raw: str) -> object:
    """Strip markdown fences and parse JSON."""
    text = raw.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        # drop opening fence
        lines = lines[1:] if lines else lines
        # drop closing fence
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return json.loads(text)


def _invoke(llm: Any, prompt: PromptTemplate, **kwargs: str) -> str:
    chain = prompt | llm
    result = chain.invoke(kwargs)
    # ChatOpenAI / Groq returns an AIMessage; plain LLMs return a string
    text = result.content if hasattr(result, "content") else str(result)
    return text.strip()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def extract_story_bible(story_text: str, llm: BaseLLM) -> StoryBible:
    """Call Granite to extract the story bible. Retries once with stricter prompt."""
    raw = _invoke(llm, _BIBLE_PROMPT, story_text=story_text)
    try:
        data = _parse_json(raw)
        return StoryBible(**data)
    except Exception as first_err:
        logger.warning("Story bible parse failed (%s), retrying with strict prompt.", first_err)
        raw2 = _invoke(llm, _BIBLE_STRICT_PROMPT, story_text=story_text)
        try:
            data2 = _parse_json(raw2)
            return StoryBible(**data2)
        except Exception as second_err:
            raise ValueError(
                f"Story bible extraction failed after retry: {second_err}"
            ) from second_err


def detect_turning_points(story_text: str, llm: BaseLLM) -> list[TurningPoint]:
    """Call Granite to detect decision points. Retries once with stricter prompt."""
    raw = _invoke(llm, _TURNING_PROMPT, story_text=story_text)
    try:
        data = _parse_json(raw)
        return [TurningPoint(**item) for item in data]
    except Exception as first_err:
        logger.warning("Turning point parse failed (%s), retrying.", first_err)
        raw2 = _invoke(llm, _TURNING_STRICT_PROMPT, story_text=story_text)
        try:
            data2 = _parse_json(raw2)
            return [TurningPoint(**item) for item in data2]
        except Exception as second_err:
            raise ValueError(
                f"Turning point detection failed after retry: {second_err}"
            ) from second_err
