"""All story-related API routes."""
from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.core.llm import get_llm
from app.models.story import (
    HealthResponse,
    IngestRequest,
    IngestResponse,
    StatusResponse,
    StoryGraph,
)
from app.services.analyzer import detect_turning_points, extract_story_bible
from app.services.branch_gen import generate_branches_for_turning_point
from app.services.graph_builder import build_graph

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# In-memory story store
# Structure: { story_id: { "status": str, "graph": dict|None, "error": str|None } }
# ---------------------------------------------------------------------------
_store: dict[str, dict] = {}


# ---------------------------------------------------------------------------
# Background pipeline
# ---------------------------------------------------------------------------


def _run_pipeline(story_id: str, story_text: str) -> None:
    """Full AI analysis pipeline executed as a background task."""
    try:
        llm = get_llm()

        # Step A — Story Bible
        logger.info("[%s] Extracting story bible…", story_id)
        story_bible = extract_story_bible(story_text, llm)

        # Step B — Decision Points
        logger.info("[%s] Detecting turning points…", story_id)
        turning_points = detect_turning_points(story_text, llm)

        # Step C — Branch Generation
        logger.info("[%s] Generating branches…", story_id)
        branches: list[tuple[str, str]] = []
        for tp in turning_points:
            pair = generate_branches_for_turning_point(tp, story_bible, llm)
            branches.append(pair)

        # Assemble graph
        graph = build_graph(
            story_id=story_id,
            story_text=story_text,
            story_bible=story_bible,
            turning_points=turning_points,
            branches=branches,
        )

        _store[story_id]["graph"] = graph.model_dump()
        _store[story_id]["status"] = "ready"
        logger.info("[%s] Pipeline complete.", story_id)

    except Exception as exc:
        logger.exception("[%s] Pipeline failed: %s", story_id, exc)
        _store[story_id]["status"] = "failed"
        _store[story_id]["error"] = str(exc)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check() -> HealthResponse:
    """Liveness probe."""
    return HealthResponse()


@router.post(
    "/api/story/ingest",
    response_model=IngestResponse,
    status_code=202,
    tags=["Story"],
)
async def ingest_story(
    payload: IngestRequest,
    background_tasks: BackgroundTasks,
) -> IngestResponse:
    """Accept a plain-text story and kick off the AI analysis pipeline."""
    story_id = str(uuid.uuid4())
    _store[story_id] = {"status": "processing", "graph": None, "error": None}
    background_tasks.add_task(_run_pipeline, story_id, payload.story_text)
    return IngestResponse(story_id=story_id)


@router.get(
    "/api/story/{story_id}/status",
    response_model=StatusResponse,
    tags=["Story"],
)
async def get_story_status(story_id: str) -> StatusResponse:
    """Poll the processing status of a story."""
    entry = _store.get(story_id)
    if entry is None:
        raise HTTPException(status_code=404, detail=f"Story '{story_id}' not found.")
    return StatusResponse(
        story_id=story_id,
        status=entry["status"],
        error=entry.get("error"),
    )


@router.get(
    "/api/story/{story_id}/graph",
    response_model=StoryGraph,
    tags=["Story"],
)
async def get_story_graph(story_id: str) -> StoryGraph:
    """Return the assembled story graph once processing is complete."""
    entry = _store.get(story_id)
    if entry is None:
        raise HTTPException(status_code=404, detail=f"Story '{story_id}' not found.")
    if entry["status"] == "processing":
        raise HTTPException(status_code=202, detail="Story is still being processed.")
    if entry["status"] == "failed":
        raise HTTPException(
            status_code=500,
            detail=f"Story processing failed: {entry.get('error', 'unknown error')}",
        )
    return StoryGraph(**entry["graph"])
