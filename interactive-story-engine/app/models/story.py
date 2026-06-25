from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Request models
# ---------------------------------------------------------------------------


class IngestRequest(BaseModel):
    story_text: str = Field(
        ...,
        min_length=100,
        max_length=5000,
        description="Plain-text linear story to transform into a branching experience.",
    )


# ---------------------------------------------------------------------------
# Story Bible
# ---------------------------------------------------------------------------


class Character(BaseModel):
    name: str
    description: str


class StoryBible(BaseModel):
    characters: list[Character]
    setting: str
    tone: str
    world_rules: list[str]


# ---------------------------------------------------------------------------
# Decision Points
# ---------------------------------------------------------------------------


class TurningPoint(BaseModel):
    scene_index: int
    scene_text: str
    choice_prompt: str
    choice_a: str
    choice_b: str


# ---------------------------------------------------------------------------
# Story Graph nodes
# ---------------------------------------------------------------------------


class Choice(BaseModel):
    label: str
    next_node: str


class StoryNode(BaseModel):
    node_id: str
    type: Literal["scene", "branch"]
    text: str
    choices: list[Choice] = Field(default_factory=list)


class StoryGraph(BaseModel):
    story_id: str
    story_bible: StoryBible
    nodes: list[StoryNode]


# ---------------------------------------------------------------------------
# API response models
# ---------------------------------------------------------------------------


class IngestResponse(BaseModel):
    story_id: str
    message: str = "Story received and is being processed."


class StatusResponse(BaseModel):
    story_id: str
    status: Literal["processing", "ready", "failed"]
    error: str | None = None


class HealthResponse(BaseModel):
    status: str = "ok"
    model: str = "granite"
