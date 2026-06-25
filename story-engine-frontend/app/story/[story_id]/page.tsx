"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { getStoryGraph } from "@/lib/api";
import { useStoryGraph } from "@/hooks/useStoryGraph";
import type { StoryGraph } from "@/lib/types";
import SceneCard from "@/components/SceneCard";
import ChoiceButton from "@/components/ChoiceButton";
import ProgressBar from "@/components/ProgressBar";
import LoadingDots from "@/components/LoadingDots";

export default function StoryReaderPage() {
  const router   = useRouter();
  const params   = useParams();
  const storyId  = params.story_id as string;

  const [graph, setGraph]   = useState<StoryGraph | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [showBible, setShowBible] = useState(false);

  useEffect(() => {
    if (!storyId) return;
    getStoryGraph(storyId)
      .then(setGraph)
      .catch((e) => setLoadErr(e.message));
  }, [storyId]);

  if (loadErr) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-950/50 border border-red-800 rounded-2xl p-8 max-w-md text-center">
          <p className="font-sans text-red-400 mb-4">{loadErr}</p>
          <button
            onClick={() => router.push("/")}
            className="font-sans text-sm text-amber-500 hover:text-amber-400 underline"
          >
            ← Back to home
          </button>
        </div>
      </main>
    );
  }

  if (!graph) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <LoadingDots label="Loading your story…" />
      </main>
    );
  }

  return <StoryReader graph={graph} storyId={storyId} />;
}

function StoryReader({ graph, storyId }: { graph: StoryGraph; storyId: string }) {
  const router = useRouter();
  const { currentNode, visitedPath, depth, maxDepth, makeChoice } = useStoryGraph(graph);
  const [bibleOpen, setBibleOpen] = useState(false);

  if (!currentNode) return null;

  const sceneNumber = visitedPath.length;
  const totalScenes = graph.nodes.length;
  const isEnd       = currentNode.choices.length === 0;
  const bible       = graph.story_bible;

  return (
    <>
      <ProgressBar depth={depth} maxDepth={maxDepth} />

      <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <span className="font-serif text-amber-500 text-lg">📖</span>
            <span className="font-serif text-gray-300 text-sm hidden sm:block">
              Interactive Story Engine
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/story/${storyId}/map`)}
              className="font-sans text-xs text-gray-500 hover:text-amber-400 transition-colors px-3 py-1.5 rounded-lg border border-[#2a2a2a] hover:border-amber-500/30"
            >
              🗺 Map
            </button>
            <button
              onClick={() => router.push("/")}
              className="font-sans text-xs text-gray-400 hover:text-white transition-colors"
            >
              ↩ New Story
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center px-4 py-10">
          <div className="w-full max-w-2xl">

            {/* Breadcrumb */}
            {visitedPath.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {visitedPath.slice(0, -1).map((id) => {
                  const node = graph.nodes.find((n) => n.node_id === id);
                  return (
                    <span key={id} className="font-sans text-xs bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-3 py-1 text-gray-600">
                      {node?.text.slice(0, 22) ?? id}…
                    </span>
                  );
                })}
              </div>
            )}

            {/* Scene */}
            <AnimatePresence mode="wait">
              <SceneCard
                key={currentNode.node_id}
                text={currentNode.text}
                sceneNumber={sceneNumber}
                totalScenes={totalScenes}
                type={currentNode.type}
              />
            </AnimatePresence>

            {/* Choices */}
            {!isEnd && (
              <div className="space-y-3 mt-2">
                <p className="font-sans text-xs text-gray-600 uppercase tracking-widest mb-2">
                  ⚡ What happens next?
                </p>
                {currentNode.choices.map((choice, i) => (
                  <ChoiceButton
                    key={choice.next_node}
                    label={choice.label}
                    index={i}
                    onClick={() => makeChoice(choice.next_node)}
                  />
                ))}
              </div>
            )}

            {/* End screen */}
            {isEnd && (
              <div className="text-center py-8 border-t border-[#1f1f1f]">
                <p className="font-serif text-2xl text-gray-200 mb-2">The End of This Path</p>
                <p className="font-sans text-sm text-gray-500 mb-8">
                  Your story concluded here. Start a new story or explore another path.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 rounded-xl font-sans font-semibold text-sm
                               bg-gradient-to-r from-amber-500 to-amber-600 text-[#0f0f0f]
                               hover:from-amber-400 hover:to-amber-500 transition-all"
                  >
                    ✨ Transform Another Story
                  </button>
                  <button
                    onClick={() => router.push(`/story/${storyId}/map`)}
                    className="px-6 py-3 rounded-xl font-sans font-semibold text-sm
                               bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300
                               hover:border-amber-500/40 hover:text-amber-400 transition-all"
                  >
                    🗺 View Story Map
                  </button>
                </div>
              </div>
            )}

            {/* ── Story Bible collapsible card ── */}
            <div className="mt-10 rounded-2xl border border-amber-500/20 bg-[#1a1a1a] overflow-hidden">
              {/* Header / toggle button */}
              <button
                onClick={() => setBibleOpen((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-4
                           hover:bg-amber-500/5 transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3">
                  {/* Amber accent dot */}
                  <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="font-sans text-sm font-semibold text-gray-300 group-hover:text-amber-400 transition-colors">
                    📚 Story Bible
                  </span>
                  <span className="font-sans text-xs text-gray-600">
                    · {bible.characters.length} character{bible.characters.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {/* Chevron */}
                <svg
                  className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${bibleOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Collapsible body */}
              {bibleOpen && (
                <div className="border-t border-amber-500/10 px-6 py-5 space-y-5">

                  {/* Setting & Tone row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#111111] rounded-xl px-4 py-3 border border-[#2a2a2a]">
                      <p className="font-sans text-xs text-amber-500/70 uppercase tracking-widest mb-1.5">
                        Setting
                      </p>
                      <p className="font-sans text-sm text-gray-300 leading-relaxed">
                        {bible.setting}
                      </p>
                    </div>
                    <div className="bg-[#111111] rounded-xl px-4 py-3 border border-[#2a2a2a]">
                      <p className="font-sans text-xs text-amber-500/70 uppercase tracking-widest mb-1.5">
                        Tone
                      </p>
                      <p className="font-sans text-sm text-gray-300 leading-relaxed">
                        {bible.tone}
                      </p>
                    </div>
                  </div>

                  {/* Characters */}
                  <div className="bg-[#111111] rounded-xl px-4 py-3 border border-[#2a2a2a]">
                    <p className="font-sans text-xs text-amber-500/70 uppercase tracking-widest mb-3">
                      Characters
                    </p>
                    <div className="space-y-2">
                      {bible.characters.map((c) => (
                        <div key={c.name} className="flex items-start gap-2">
                          <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/10
                                           border border-amber-500/20 flex items-center justify-center
                                           text-xs">
                            👤
                          </span>
                          <div>
                            <span className="font-sans text-sm font-semibold text-amber-400">
                              {c.name}
                            </span>
                            <span className="font-sans text-sm text-gray-500 ml-1.5">
                              — {c.description}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* World Rules */}
                  <div className="bg-[#111111] rounded-xl px-4 py-3 border border-[#2a2a2a]">
                    <p className="font-sans text-xs text-amber-500/70 uppercase tracking-widest mb-3">
                      World Rules
                    </p>
                    {bible.world_rules.length > 0 ? (
                      <ul className="space-y-1.5">
                        {bible.world_rules.map((rule, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                            <span className="font-sans text-sm text-gray-400">{rule}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-sans text-sm text-gray-600">None specified</p>
                    )}
                  </div>

                </div>
              )}
            </div>
            {/* ── end Story Bible ── */}

          </div>
        </main>
      </div>
    </>
  );
}
