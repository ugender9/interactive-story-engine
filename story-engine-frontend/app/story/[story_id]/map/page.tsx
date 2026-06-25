"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getStoryGraph } from "@/lib/api";
import type { StoryGraph } from "@/lib/types";
import StoryMap from "@/components/StoryMap";
import LoadingDots from "@/components/LoadingDots";

export default function StoryMapPage() {
  const router  = useRouter();
  const params  = useParams();
  const storyId = params.story_id as string;

  const [graph, setGraph]     = useState<StoryGraph | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  // Retrieve the visited path from sessionStorage if available
  const [visited, setVisited] = useState<string[]>([]);

  useEffect(() => {
    if (!storyId) return;
    getStoryGraph(storyId)
      .then(setGraph)
      .catch((e) => setLoadErr(e.message));

    // Best-effort: read visited path from sessionStorage
    try {
      const saved = sessionStorage.getItem(`visited_${storyId}`);
      if (saved) setVisited(JSON.parse(saved));
    } catch {}
  }, [storyId]);

  if (loadErr) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-950/50 border border-red-800 rounded-2xl p-8 max-w-md text-center">
          <p className="font-sans text-red-400 mb-4">{loadErr}</p>
          <button onClick={() => router.back()} className="font-sans text-sm text-amber-500 underline">
            ← Go back
          </button>
        </div>
      </main>
    );
  }

  if (!graph) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <LoadingDots label="Loading story map…" />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f]">
        <button
          onClick={() => router.push(`/story/${storyId}`)}
          className="font-sans text-sm text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-2"
        >
          ← Back to Story
        </button>
        <div className="text-center">
          <h1 className="font-serif text-lg text-white">Your Story Map</h1>
          <p className="font-sans text-xs text-gray-600">Every path your story can take</p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="font-sans text-sm text-gray-400 hover:text-amber-400 transition-colors"
        >
          ✨ New Story
        </button>
      </header>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 px-6 py-3 border-b border-[#1a1a1a]">
        {[
          { color: "#a78bfa", label: "Start" },
          { color: "#f59e0b", label: "Visited path" },
          { color: "#374151", label: "Unvisited" },
          { color: "#10b981", label: "Ending" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm border-2" style={{ borderColor: color }} />
            <span className="font-sans text-xs text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <main className="flex-1 overflow-auto px-4 py-10">
        <StoryMap graph={graph} visitedPath={visited} />

        {/* Story Bible summary */}
        <div className="max-w-2xl mx-auto mt-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
          <p className="font-sans text-xs text-gray-600 uppercase tracking-widest mb-4">Story Bible</p>
          <div className="grid grid-cols-2 gap-4 text-sm font-sans">
            <div>
              <p className="text-xs text-gray-700 mb-1">Setting</p>
              <p className="text-gray-300">{graph.story_bible.setting}</p>
            </div>
            <div>
              <p className="text-xs text-gray-700 mb-1">Tone</p>
              <p className="text-gray-300">{graph.story_bible.tone}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-700 mb-1">Characters</p>
              <div className="flex flex-wrap gap-2">
                {graph.story_bible.characters.map((c) => (
                  <div key={c.name} className="bg-[#111111] border border-[#2a2a2a] rounded-lg px-3 py-1.5">
                    <span className="text-amber-500 font-medium">{c.name}</span>
                    <span className="text-gray-500 ml-1 text-xs">— {c.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
