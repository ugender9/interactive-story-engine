"use client";

export default function LanternIcon({ className = "" }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Glow */}
      <div className="absolute inset-0 rounded-full bg-amber-500 opacity-20 blur-2xl scale-150" />
      <svg
        width="64"
        height="80"
        viewBox="0 0 64 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_0_18px_rgba(245,158,11,0.7)]"
      >
        {/* Top hook */}
        <path d="M32 4 C32 4 28 8 28 12 L36 12 C36 8 32 4 32 4Z" fill="#f59e0b" />
        <rect x="30" y="2" width="4" height="10" rx="2" fill="#d97706" />
        {/* Top cap */}
        <rect x="20" y="12" width="24" height="5" rx="2" fill="#d97706" />
        {/* Glass panels */}
        <rect x="16" y="17" width="32" height="38" rx="4" fill="#1a1a1a" stroke="#f59e0b" strokeWidth="1.5" />
        {/* Flame */}
        <ellipse cx="32" cy="36" rx="6" ry="10" fill="#f59e0b" opacity="0.9" />
        <ellipse cx="32" cy="38" rx="3.5" ry="6" fill="#fbbf24" />
        <ellipse cx="32" cy="40" rx="2" ry="3" fill="#fef3c7" />
        {/* Light rays */}
        <line x1="10" y1="36" x2="4" y2="36" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="54" y1="36" x2="60" y2="36" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="12" y1="24" x2="7" y2="19" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="52" y1="24" x2="57" y2="19" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="12" y1="48" x2="7" y2="53" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="52" y1="48" x2="57" y2="53" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.4" />
        {/* Bottom cap */}
        <rect x="20" y="55" width="24" height="5" rx="2" fill="#d97706" />
        {/* Chain */}
        <line x1="32" y1="60" x2="32" y2="72" stroke="#6b7280" strokeWidth="2" />
        <ellipse cx="32" cy="74" rx="4" ry="2" fill="#374151" />
      </svg>
    </div>
  );
}
