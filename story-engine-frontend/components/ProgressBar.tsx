"use client";

interface ProgressBarProps {
  depth: number;
  maxDepth: number;
}

export default function ProgressBar({ depth, maxDepth }: ProgressBarProps) {
  const pct = maxDepth > 0 ? Math.min(100, Math.round((depth / maxDepth) * 100)) : 0;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-gray-800">
      <div
        className="h-full bg-amber-500 transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
