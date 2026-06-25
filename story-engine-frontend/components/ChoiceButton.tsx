"use client";

import { motion } from "framer-motion";

interface ChoiceButtonProps {
  label: string;
  index: number;
  onClick: () => void;
}

export default function ChoiceButton({ label, index, onClick }: ChoiceButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="group w-full flex items-center gap-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]
                 hover:border-amber-500/50 hover:bg-amber-500/5
                 px-6 py-4 text-left transition-all duration-200 cursor-pointer"
    >
      {/* Amber left accent */}
      <span className="flex-shrink-0 w-1.5 h-8 rounded-full bg-amber-500/40 group-hover:bg-amber-500 transition-colors duration-200" />

      {/* Arrow */}
      <span className="text-amber-500 font-sans text-lg font-bold group-hover:translate-x-1 transition-transform duration-200">
        →
      </span>

      {/* Label */}
      <span className="font-sans text-gray-200 text-sm font-medium leading-snug group-hover:text-white transition-colors duration-200">
        {label}
      </span>
    </motion.button>
  );
}
