"""Assembles the final StoryGraph from analysis results."""
from __future__ import annotations

from app.models.story import Choice, StoryBible, StoryGraph, StoryNode, TurningPoint


def build_graph(
    story_id: str,
    story_text: str,
    story_bible: StoryBible,
    turning_points: list[TurningPoint],
    branches: list[tuple[str, str]],
) -> StoryGraph:
    """
    Build the StoryGraph from the raw story text, detected turning points, and
    pre-generated branch texts.

    Nodes layout per turning point i:
      node_{i}      — scene node (text up to this decision)
      node_{i}a     — branch A continuation
      node_{i}b     — branch B continuation

    The root node (node_0) holds the story text up to the FIRST turning point.
    """
    paragraphs = [p.strip() for p in story_text.split("\n") if p.strip()]
    nodes: list[StoryNode] = []

    for idx, (tp, (branch_a_text, branch_b_text)) in enumerate(
        zip(turning_points, branches)
    ):
        node_id = f"node_{idx}"
        node_a_id = f"node_{idx}a"
        node_b_id = f"node_{idx}b"

        # Collect story text up to (and including) the turning-point paragraph
        scene_end = min(tp.scene_index, len(paragraphs) - 1)
        if idx == 0:
            scene_text = "\n\n".join(paragraphs[: scene_end + 1])
        else:
            # For subsequent turning points, show only the paragraphs between
            # the previous turning point and this one.
            prev_end = min(turning_points[idx - 1].scene_index, len(paragraphs) - 1)
            start = prev_end + 1
            scene_text = "\n\n".join(paragraphs[start : scene_end + 1])
            # Fall back to the turning point's own scene text if range is empty
            if not scene_text:
                scene_text = tp.scene_text

        scene_node = StoryNode(
            node_id=node_id,
            type="scene",
            text=scene_text if scene_text else tp.scene_text,
            choices=[
                Choice(label=tp.choice_a, next_node=node_a_id),
                Choice(label=tp.choice_b, next_node=node_b_id),
            ],
        )

        branch_a_node = StoryNode(
            node_id=node_a_id,
            type="branch",
            text=branch_a_text,
            choices=[],
        )

        branch_b_node = StoryNode(
            node_id=node_b_id,
            type="branch",
            text=branch_b_text,
            choices=[],
        )

        nodes.extend([scene_node, branch_a_node, branch_b_node])

    return StoryGraph(
        story_id=story_id,
        story_bible=story_bible,
        nodes=nodes,
    )
