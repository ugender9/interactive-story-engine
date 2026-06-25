"use client";

export default function LoadingDots({ label = "Processing…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-gray-400 text-sm font-sans">{label}</p>
    </div>
  );
}
