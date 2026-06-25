"use client";

import { motion } from "framer-motion";

interface SceneCardProps {
  text: string;
  sceneNumber: number;
  totalScenes: number;
  type: "scene" | "branch";
}

export default function SceneCard({ text, sceneNumber, totalScenes, type }: SceneCardProps) {
  return (
    <motion.div
      key={text}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] p-8 mb-6"
    >
      {/* Accent bar */}
      <div
        className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full ${
          type === "branch" ? "bg-emerald-500" : "bg-amber-500"
        }`}
      />

      {/* Scene counter */}
      <div className="flex justify-end mb-4">
        <span className="text-xs font-sans text-gray-600 tracking-widest uppercase">
          {type === "branch" ? "Branch" : `Scene ${sceneNumber}`} · {totalScenes} total
        </span>
      </div>

      {/* Scene text */}
      <p className="font-serif text-lg text-gray-100 leading-[1.85] tracking-wide whitespace-pre-wrap">
        {text}
      </p>
    </motion.div>
  );
}
