// src/components/public/BatikMotif.tsx
// Reusable SVG batik decorative overlay — drop into any relative-positioned section
import React from 'react';

export type BatikVariant = "kawung" | "parang" | "circles" | "mega-mendung" | "tech-batik";

interface BatikMotifProps {
  variant?: BatikVariant;
  opacity?: number;
  className?: string;
}

export default function BatikMotif({
  variant = "kawung",
  opacity = 0.06,
  className = "",
}: BatikMotifProps) {
  const base = `absolute inset-0 w-full h-full pointer-events-none select-none ${className}`;

  if (variant === "parang") {
    return (
      <svg className={base} xmlns="http://www.w3.org/2000/svg" style={{ opacity }} aria-hidden="true">
        <defs>
          <pattern id="bm-parang" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
            <path d="M0 90L90 0" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="12 6" />
            <path d="M-15 75L75 -15" stroke="#1e3a5f" strokeWidth="0.8" />
            <path d="M15 105L105 15" stroke="#1e3a5f" strokeWidth="0.8" />
            <path d="M30 90L90 30" stroke="#60a5fa" strokeWidth="0.5" strokeDasharray="4 12" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bm-parang)" />
      </svg>
    );
  }

  if (variant === "circles") {
    return (
      <svg className={base} xmlns="http://www.w3.org/2000/svg" style={{ opacity }} aria-hidden="true">
        <defs>
          <pattern id="bm-circles" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#3b82f6" strokeWidth="1" />
            <circle cx="32" cy="32" r="18" fill="none" stroke="#1e3a5f" strokeWidth="0.8" />
            <circle cx="32" cy="32" r="8" fill="none" stroke="#60a5fa" strokeWidth="0.8" />
            <circle cx="32" cy="32" r="2.5" fill="#3b82f6" />
            <circle cx="4"  cy="4"  r="2" fill="none" stroke="#1e3a5f" strokeWidth="0.8" />
            <circle cx="60" cy="4"  r="2" fill="none" stroke="#1e3a5f" strokeWidth="0.8" />
            <circle cx="4"  cy="60" r="2" fill="none" stroke="#1e3a5f" strokeWidth="0.8" />
            <circle cx="60" cy="60" r="2" fill="none" stroke="#1e3a5f" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bm-circles)" />
      </svg>
    );
  }

  if (variant === "mega-mendung") {
    return (
      <svg className={base} xmlns="http://www.w3.org/2000/svg" style={{ opacity }} aria-hidden="true">
        <defs>
          <pattern id="bm-mega" x="0" y="0" width="140" height="70" patternUnits="userSpaceOnUse">
            <path d="M10 55 Q25 20 50 35 Q65 5 90 25 Q105 0 130 18 Q138 38 140 35"
              fill="none" stroke="#3b82f6" strokeWidth="1.5" />
            <path d="M0 48 Q18 25 38 38 Q52 15 72 28 Q88 8 108 22 Q120 40 140 38"
              fill="none" stroke="#1e3a5f" strokeWidth="0.8" />
            <path d="M5 62 Q28 35 52 48 Q70 25 92 40 Q110 18 132 32"
              fill="none" stroke="#60a5fa" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bm-mega)" />
      </svg>
    );
  }

  if (variant === "tech-batik") {
    return (
      <svg className={base} xmlns="http://www.w3.org/2000/svg" style={{ opacity }} aria-hidden="true">
        <defs>
          <pattern id="bm-tech" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            {/* Background circuit lines */}
            <path d="M50 0 L50 20 M50 80 L50 100 M0 50 L20 50 M80 50 L100 50" stroke="#fbbf24" strokeWidth="1" />
            <path d="M20 20 L35 35 M80 20 L65 35 M20 80 L35 65 M80 80 L65 65" stroke="#fbbf24" strokeWidth="1" />
            <circle cx="20" cy="20" r="2" fill="#fbbf24" />
            <circle cx="80" cy="20" r="2" fill="#fbbf24" />
            <circle cx="20" cy="80" r="2" fill="#fbbf24" />
            <circle cx="80" cy="80" r="2" fill="#fbbf24" />
            {/* Outer octagon */}
            <polygon points="35,15 65,15 85,35 85,65 65,85 35,85 15,65 15,35" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            {/* Inner gear/cog */}
            <path d="M45 40 L55 40 L55 35 L45 35 Z" fill="#fcd34d" />
            <path d="M45 60 L55 60 L55 65 L45 65 Z" fill="#fcd34d" />
            <path d="M35 45 L40 45 L40 55 L35 55 Z" fill="#fcd34d" />
            <path d="M60 45 L65 45 L65 55 L60 55 Z" fill="#fcd34d" />
            <circle cx="50" cy="50" r="10" fill="none" stroke="#f59e0b" strokeWidth="2" />
            <circle cx="50" cy="50" r="4" fill="none" stroke="#fbbf24" strokeWidth="1" />
            <circle cx="50" cy="30" r="1.5" fill="#fcd34d" />
            <circle cx="50" cy="70" r="1.5" fill="#fcd34d" />
            <circle cx="30" cy="50" r="1.5" fill="#fcd34d" />
            <circle cx="70" cy="50" r="1.5" fill="#fcd34d" />
            {/* Corner semi-circles (wifi-like pattern) */}
            <path d="M0 10 A10 10 0 0 1 10 0 M0 20 A20 20 0 0 1 20 0" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
            <path d="M90 0 A10 10 0 0 1 100 10 M80 0 A20 20 0 0 1 100 20" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
            <path d="M0 90 A10 10 0 0 0 10 100 M0 80 A20 20 0 0 0 20 100" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
            <path d="M100 90 A10 10 0 0 1 90 100 M100 80 A20 20 0 0 1 80 100" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bm-tech)" />
      </svg>
    );
  }

  // Default: kawung
  return (
    <svg className={base} xmlns="http://www.w3.org/2000/svg" style={{ opacity }} aria-hidden="true">
      <defs>
        <pattern id="bm-kawung" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <ellipse cx="40" cy="20" rx="18" ry="10" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
          <ellipse cx="40" cy="60" rx="18" ry="10" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
          <ellipse cx="20" cy="40" rx="10" ry="18" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
          <ellipse cx="60" cy="40" rx="10" ry="18" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
          <circle cx="40" cy="40" r="6" fill="none" stroke="#60a5fa" strokeWidth="0.8" />
          <circle cx="40" cy="40" r="2.5" fill="#3b82f6" />
          <circle cx="0"  cy="0"  r="5" fill="none" stroke="#1e3a5f" strokeWidth="0.8" />
          <circle cx="80" cy="0"  r="5" fill="none" stroke="#1e3a5f" strokeWidth="0.8" />
          <circle cx="0"  cy="80" r="5" fill="none" stroke="#1e3a5f" strokeWidth="0.8" />
          <circle cx="80" cy="80" r="5" fill="none" stroke="#1e3a5f" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#bm-kawung)" />
    </svg>
  );
}
