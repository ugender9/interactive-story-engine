import type { IngestResponse, StatusResponse, StoryGraph } from "./types";

// Use relative URLs so requests go through the Next.js rewrite proxy
// (next.config.js forwards /api/* → http://localhost:8000/api/*)
// This avoids CORS issues entirely since the browser talks to port 3000.
const API = "/api";

export async function ingestStory(storyText: string): Promise<IngestResponse> {
  const res = await fetch(`${API}/story/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ story_text: storyText }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
}

export async function getStoryStatus(storyId: string): Promise<StatusResponse> {
  const res = await fetch(`${API}/story/${storyId}/status`);
  if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
  return res.json();
}

export async function getStoryGraph(storyId: string): Promise<StoryGraph> {
  const res = await fetch(`${API}/story/${storyId}/graph`);
  if (!res.ok) throw new Error(`Graph fetch failed: ${res.status}`);
  return res.json();
}
