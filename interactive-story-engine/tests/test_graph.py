"""Unit tests for graph_builder — verifies correct node assembly from mock data."""
from __future__ import annotations

import pytest

from app.models.story import Character, StoryBible, StoryGraph, TurningPoint
from app.services.graph_builder import build_graph

# ---------------------------------------------------------------------------
# Shared fixtures
# ---------------------------------------------------------------------------

STORY_ID = "test-story-001"

STORY_TEXT = (
    "Paragraph zero: The world was quiet before the war.\n"
    "Paragraph one: Elena found the letter buried under the oak tree.\n"
    "Paragraph two: She had to decide — open it now or wait for her brother.\n"
    "Paragraph three: The letter contained coordinates to a hidden vault.\n"
    "Paragraph four: She stood at the vault door, key in hand."
)

STORY_BIBLE = StoryBible(
    characters=[
        Character(name="Elena", description="A cautious archivist with a secret past"),
        Character(name="Brother", description="Elena's pragmatic older sibling"),
    ],
    setting="Rural countryside, near-future dystopia",
    tone="quiet mystery",
    world_rules=["Letters are rare — the internet collapsed", "Vaults store pre-war knowledge"],
)

TURNING_POINTS = [
    TurningPoint(
        scene_index=2,
        scene_text="She had to decide — open it now or wait for her brother.",
        choice_prompt="Does Elena open the letter immediately or wait?",
        choice_a="Open it now",
        choice_b="Wait for brother",
    ),
    TurningPoint(
        scene_index=4,
        scene_text="She stood at the vault door, key in hand.",
        choice_prompt="Does Elena unlock the vault alone or call for help?",
        choice_a="Unlock alone",
        choice_b="Call for help",
    ),
]

BRANCHES = [
    ("Elena tore open the letter with trembling hands.", "She pocketed the letter and ran home."),
    ("She turned the key and the vault groaned open.", "She backed away and sent a signal flare."),
]


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_build_graph_returns_story_graph() -> None:
    graph = build_graph(STORY_ID, STORY_TEXT, STORY_BIBLE, TURNING_POINTS, BRANCHES)
    assert isinstance(graph, StoryGraph)


def test_build_graph_story_id() -> None:
    graph = build_graph(STORY_ID, STORY_TEXT, STORY_BIBLE, TURNING_POINTS, BRANCHES)
    assert graph.story_id == STORY_ID


def test_build_graph_story_bible_preserved() -> None:
    graph = build_graph(STORY_ID, STORY_TEXT, STORY_BIBLE, TURNING_POINTS, BRANCHES)
    assert graph.story_bible.tone == "quiet mystery"
    assert graph.story_bible.characters[0].name == "Elena"


def test_build_graph_node_count() -> None:
    # 2 turning points × 3 nodes each (scene + branch_a + branch_b) = 6 nodes
    graph = build_graph(STORY_ID, STORY_TEXT, STORY_BIBLE, TURNING_POINTS, BRANCHES)
    assert len(graph.nodes) == 6


def test_build_graph_node_ids() -> None:
    graph = build_graph(STORY_ID, STORY_TEXT, STORY_BIBLE, TURNING_POINTS, BRANCHES)
    node_ids = {n.node_id for n in graph.nodes}
    assert node_ids == {"node_0", "node_0a", "node_0b", "node_1", "node_1a", "node_1b"}


def test_build_graph_scene_nodes_have_two_choices() -> None:
    graph = build_graph(STORY_ID, STORY_TEXT, STORY_BIBLE, TURNING_POINTS, BRANCHES)
    scene_nodes = [n for n in graph.nodes if n.type == "scene"]
    assert len(scene_nodes) == 2
    for node in scene_nodes:
        assert len(node.choices) == 2


def test_build_graph_branch_nodes_have_no_choices() -> None:
    graph = build_graph(STORY_ID, STORY_TEXT, STORY_BIBLE, TURNING_POINTS, BRANCHES)
    branch_nodes = [n for n in graph.nodes if n.type == "branch"]
    assert len(branch_nodes) == 4
    for node in branch_nodes:
        assert node.choices == []


def test_build_graph_choice_labels_match_turning_points() -> None:
    graph = build_graph(STORY_ID, STORY_TEXT, STORY_BIBLE, TURNING_POINTS, BRANCHES)
    node_0 = next(n for n in graph.nodes if n.node_id == "node_0")
    labels = [c.label for c in node_0.choices]
    assert "Open it now" in labels
    assert "Wait for brother" in labels


def test_build_graph_choices_link_to_correct_branches() -> None:
    graph = build_graph(STORY_ID, STORY_TEXT, STORY_BIBLE, TURNING_POINTS, BRANCHES)
    node_0 = next(n for n in graph.nodes if n.node_id == "node_0")
    next_nodes = {c.next_node for c in node_0.choices}
    assert next_nodes == {"node_0a", "node_0b"}


def test_build_graph_branch_text_matches_generated_text() -> None:
    graph = build_graph(STORY_ID, STORY_TEXT, STORY_BIBLE, TURNING_POINTS, BRANCHES)
    node_0a = next(n for n in graph.nodes if n.node_id == "node_0a")
    node_0b = next(n for n in graph.nodes if n.node_id == "node_0b")
    assert node_0a.text == "Elena tore open the letter with trembling hands."
    assert node_0b.text == "She pocketed the letter and ran home."


def test_build_graph_single_turning_point() -> None:
    """Graph builder must handle a single turning point gracefully."""
    graph = build_graph(
        STORY_ID,
        STORY_TEXT,
        STORY_BIBLE,
        TURNING_POINTS[:1],
        BRANCHES[:1],
    )
    assert len(graph.nodes) == 3
    node_ids = {n.node_id for n in graph.nodes}
    assert node_ids == {"node_0", "node_0a", "node_0b"}


def test_build_graph_serialises_to_dict() -> None:
    """Ensure model_dump produces the expected top-level keys."""
    graph = build_graph(STORY_ID, STORY_TEXT, STORY_BIBLE, TURNING_POINTS, BRANCHES)
    data = graph.model_dump()
    assert set(data.keys()) == {"story_id", "story_bible", "nodes"}
    assert data["story_id"] == STORY_ID
