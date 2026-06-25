"""Tests for POST /api/story/ingest."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

VALID_STORY = (
    "The old lighthouse keeper had not left the island in forty years. "
    "Every morning he climbed the iron stairs, polished the great lens, and watched the horizon "
    "for ships that never came. One stormy evening, a small boat appeared through the mist, "
    "carrying a young woman with salt-white hair and desperate eyes. She begged him for shelter "
    "and claimed to be fleeing a powerful merchant who had stolen her family's maps. "
    "The keeper hesitated, studying her face for deceit, before finally stepping aside to let her in."
)


def test_ingest_valid_story_returns_202() -> None:
    response = client.post("/api/story/ingest", json={"story_text": VALID_STORY})
    assert response.status_code == 202
    data = response.json()
    assert "story_id" in data
    assert len(data["story_id"]) == 36  # UUID format
    assert data["message"] == "Story received and is being processed."


def test_ingest_stores_processing_status() -> None:
    response = client.post("/api/story/ingest", json={"story_text": VALID_STORY})
    assert response.status_code == 202
    story_id = response.json()["story_id"]

    status_response = client.get(f"/api/story/{story_id}/status")
    assert status_response.status_code == 200
    status_data = status_response.json()
    assert status_data["story_id"] == story_id
    assert status_data["status"] in ("processing", "ready", "failed")


def test_ingest_story_too_short_returns_422() -> None:
    response = client.post("/api/story/ingest", json={"story_text": "Too short."})
    assert response.status_code == 422


def test_ingest_story_too_long_returns_422() -> None:
    long_story = "a" * 5001
    response = client.post("/api/story/ingest", json={"story_text": long_story})
    assert response.status_code == 422


def test_ingest_missing_field_returns_422() -> None:
    response = client.post("/api/story/ingest", json={})
    assert response.status_code == 422


def test_status_unknown_story_returns_404() -> None:
    response = client.get("/api/story/00000000-0000-0000-0000-000000000000/status")
    assert response.status_code == 404


def test_graph_unknown_story_returns_404() -> None:
    response = client.get("/api/story/00000000-0000-0000-0000-000000000000/graph")
    assert response.status_code == 404


def test_health_check() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "model": "granite"}
