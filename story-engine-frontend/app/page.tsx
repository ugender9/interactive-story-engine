"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import LanternIcon from "@/components/LanternIcon";
import LoadingDots from "@/components/LoadingDots";
import { ingestStory, getStoryStatus } from "@/lib/api";

const POLL_MESSAGES = [
  "AI is reading your story…",
  "Extracting characters and world rules…",
  "Detecting decision points…",
  "Generating branching scenes…",
  "Assembling your adventure…",
];

export default function LandingPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (msgRef.current)  clearInterval(msgRef.current);
  }, []);

  const charCount = text.length;
  const isValid   = charCount >= 100 && charCount <= 5000;

  async function handleSubmit() {
    if (!isValid || loading) return;
    setLoading(true);
    setError(null);
    setMsgIndex(0);

    msgRef.current = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, POLL_MESSAGES.length - 1));
    }, 3000);

    try {
      const { story_id } = await ingestStory(text);

      pollRef.current = setInterval(async () => {
        try {
          const status = await getStoryStatus(story_id);
          if (status.status === "ready") {
            clearInterval(pollRef.current!);
            clearInterval(msgRef.current!);
            router.push(`/story/${story_id}`);
          } else if (status.status === "failed") {
            clearInterval(pollRef.current!);
            clearInterval(msgRef.current!);
            setError(status.error ?? "Processing failed. Please try again.");
            setLoading(false);
          }
        } catch (e) {
          clearInterval(pollRef.current!);
          clearInterval(msgRef.current!);
          setError("Network error while checking status.");
          setLoading(false);
        }
      }, 2000);
    } catch (e: any) {
      clearInterval(msgRef.current!);
      setError(e.message ?? "Failed to submit story.");
      setLoading(false);
    }
  }

  const counterColor =
    charCount > 4800 ? "text-red-400" :
    charCount > 4000 ? "text-amber-400" :
    "text-gray-600";

  return (
    <main className="stars-bg min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Hero */}
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center text-center mb-10">
        <LanternIcon className="mb-8" />
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3 leading-tight">
          Interactive Story Engine
        </h1>
        <p className="font-sans text-gray-400 text-base md:text-lg max-w-md">
          Paste your story. Let AI build the adventure.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl glow-amber">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 md:p-8">
          {!loading ? (
            <>
              <label className="block font-sans text-xs text-gray-500 uppercase tracking-widest mb-3">
                Your Story
              </label>
              <textarea
                className="w-full bg-[#111111] border border-[#2a2a2a] focus:border-amber-500/50
                           rounded-xl text-gray-100 font-serif text-base leading-relaxed
                           placeholder:text-gray-700 p-4 resize-none outline-none
                           transition-colors duration-200 min-h-[200px]"
                placeholder="Paste or write your story here… (min 100 characters)&#10;&#10;Example: The old lighthouse keeper had not left the island in forty years. Every morning he climbed the iron stairs and watched the horizon for ships that never came..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={5000}
                rows={8}
              />
              <div className="flex justify-between items-center mt-2 mb-5">
                <span className={`font-sans text-xs ${counterColor}`}>
                  {charCount} / 5000
                </span>
                <span className="font-sans text-xs text-gray-700">min 100 · max 5000</span>
              </div>

              {error && (
                <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 mb-4">
                  <p className="font-sans text-red-400 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={!isValid}
                className="w-full py-4 rounded-xl font-sans font-semibold text-base
                           bg-gradient-to-r from-amber-500 to-amber-600
                           hover:from-amber-400 hover:to-amber-500
                           disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500
                           text-[#0f0f0f] disabled:text-gray-500
                           transition-all duration-200 transform hover:scale-[1.01]
                           disabled:cursor-not-allowed disabled:scale-100"
              >
                ✨ Transform My Story
              </button>

              <p className="font-sans text-xs text-gray-700 text-center mt-4">
                Powered by Groq · LangChain · IBM Granite
              </p>
            </>
          ) : (
            <div className="py-6">
              <LoadingDots label={POLL_MESSAGES[msgIndex]} />
              <p className="font-sans text-xs text-gray-700 text-center mt-2">
                This usually takes 15–30 seconds
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
