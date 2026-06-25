"""Unit tests for story bible extraction and turning-point detection (mocked LLM)."""
from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

import pytest

from app.models.story import StoryBible, TurningPoint
from app.services.analyzer import detect_turning_points, extract_story_bible

# ---------------------------------------------------------------------------
# Test data
# ---------------------------------------------------------------------------

STORY_TEXT = (
    "Captain Mara stood on the rain-soaked deck of her ship as the storm raged around her. "
    "Her first mate handed her a crumpled note — a ransom demand for her missing crew. "
    "She had two choices: pay the pirates or sail into the storm to rescue her people herself. "
    "The coins in her chest were barely enough to cover the demand, and her ship was old. "
    "She closed her fist around the note and made her decision."
)

BIBLE_JSON = json.dumps(
    {
        "characters": [
            {"name": "Captain Mara", "description": "A seasoned seafarer with fierce loyalty to her crew"},
            {"name": "First Mate", "description": "Loyal officer who delivers the ransom note"},
        ],
        "setting": "A storm-battered ship at sea, present-day nautical adventure",
        "tone": "tense nautical drama",
        "world_rules": ["Ships can be damaged by storms", "Pirates demand ransoms"],
    }
)

TURNING_POINTS_JSON = json.dumps(
    [
        {
            "scene_index": 2,
            "scene_text": "She had two choices: pay the pirates or sail into the storm.",
            "choice_prompt": "Does Mara pay the ransom or sail into the storm?",
            "choice_a": "Pay the ransom",
            "choice_b": "Sail into the storm",
        },
        {
            "scene_index": 4,
            "scene_text": "She closed her fist around the note and made her decision.",
            "choice_prompt": "Does she burn the note or keep it as evidence?",
            "choice_a": "Burn the note",
            "choice_b": "Keep the note",
        },
    ]
)


# ---------------------------------------------------------------------------
# Story Bible tests
# ---------------------------------------------------------------------------


def test_extract_story_bible_returns_story_bible_model() -> None:
    """Happy path: _invoke returns valid JSON, should produce a StoryBible."""
    with patch("app.services.analyzer._invoke", return_value=BIBLE_JSON):
        result = extract_story_bible(STORY_TEXT, MagicMock())
    assert isinstance(result, StoryBible)
    assert result.tone == "tense nautical drama"
    assert len(result.characters) == 2
    assert result.characters[0].name == "Captain Mara"
    assert result.setting == "A storm-battered ship at sea, present-day nautical adventure"
    assert "Ships can be damaged by storms" in result.world_rules


def test_extract_story_bible_strips_markdown_fences() -> None:
    """JSON wrapped in markdown code fences should be parsed successfully."""
    wrapped = f"```json\n{BIBLE_JSON}\n```"
    with patch("app.services.analyzer._invoke", return_value=wrapped):
        result = extract_story_bible(STORY_TEXT, MagicMock())
    assert isinstance(result, StoryBible)
    assert result.tone == "tense nautical drama"


def test_extract_story_bible_retries_on_bad_json() -> None:
    """First _invoke returns garbage; second (strict prompt) returns valid JSON."""
    responses = iter(["NOT JSON AT ALL %%", BIBLE_JSON])

    def _fake_invoke(_llm, _prompt, **_kwargs):
        return next(responses)

    with patch("app.services.analyzer._invoke", side_effect=_fake_invoke):
        result = extract_story_bible(STORY_TEXT, MagicMock())
    assert isinstance(result, StoryBible)


def test_extract_story_bible_raises_after_two_failures() -> None:
    """Both attempts return garbage — should raise ValueError."""
    with patch("app.services.analyzer._invoke", return_value="garbage"):
        with pytest.raises(ValueError, match="Story bible extraction failed"):
            extract_story_bible(STORY_TEXT, MagicMock())


# ---------------------------------------------------------------------------
# Turning point tests
# ---------------------------------------------------------------------------


def test_detect_turning_points_returns_list() -> None:
    with patch("app.services.analyzer._invoke", return_value=TURNING_POINTS_JSON):
        result = detect_turning_points(STORY_TEXT, MagicMock())
    assert isinstance(result, list)
    assert len(result) == 2
    assert all(isinstance(tp, TurningPoint) for tp in result)


def test_detect_turning_points_fields() -> None:
    with patch("app.services.analyzer._invoke", return_value=TURNING_POINTS_JSON):
        result = detect_turning_points(STORY_TEXT, MagicMock())
    first = result[0]
    assert first.choice_a == "Pay the ransom"
    assert first.choice_b == "Sail into the storm"
    assert first.scene_index == 2


def test_detect_turning_points_retries_on_bad_json() -> None:
    """First call returns invalid JSON; second call returns valid array."""
    responses = iter(["not json", TURNING_POINTS_JSON])

    def _fake_invoke(_llm, _prompt, **_kwargs):
        return next(responses)

    with patch("app.services.analyzer._invoke", side_effect=_fake_invoke):
        result = detect_turning_points(STORY_TEXT, MagicMock())
    assert len(result) == 2


def test_detect_turning_points_raises_after_two_failures() -> None:
    """Both retry attempts fail — should raise ValueError."""
    with patch("app.services.analyzer._invoke", return_value="[[[ invalid"):
        with pytest.raises(ValueError, match="Turning point detection failed"):
            detect_turning_points(STORY_TEXT, MagicMock())
