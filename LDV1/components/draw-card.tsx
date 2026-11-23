// ---------------------------------------------------------------------------
// Lucky Diamond — Draw Result Announcement Box Component
// Styled after the reference terminal announcement panel on luckylott.org/result.php:
// - Title: LUCKYDIAMOND with draw time
// - Monospace metadata: DRAW NO : [no]    DRAW DATE ON : [date]
// - 1 ST PRIZE RS. 28000/- with glowing 3-digit winning number
// - 2 ND PRIZE RS. 1000/- with glowing 2-digit winning number
// - Print and Share actions intact
// ---------------------------------------------------------------------------
"use client";

import { FileText, Share2, Check, Clock3 } from "lucide-react";
import type { DrawResult } from "@/lib/types";

type DrawCardProps = {
  result: DrawResult;
  /** Query string to highlight matching prizes (optional) */
  highlightQuery?: string;
  /** Which prizes matched the query (labels like "1ST PRIZE") */
  matchingPrizes?: string[];
  /** Current copied draw name for feedback */
  copiedDraw?: string;
  onShare: (result: DrawResult) => void;
};

export function DrawCard({
  result,
  highlightQuery,
  matchingPrizes = [],
  copiedDraw,
  onShare,
}: DrawCardProps) {
  const isPublished = result.status === "published";
  const p1 = result.prizes[0];
  const p2 = result.prizes[1];

  const isMatchP1 = matchingPrizes.includes("1ST PRIZE");
  const isMatchP2 = matchingPrizes.includes("2ND PRIZE");

  return (
    <article
      id={result.drawId}
      className="bg-black/10 hover:bg-black/15 border border-white/10 hover:border-cyan-400/30 rounded-2xl p-5 sm:p-6 transition-all duration-200 scroll-mt-36"
    >
      {/* Header Bar: Draw Name + Time + Status */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10 flex-wrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="font-heading font-black text-2xl sm:text-3xl tracking-tight text-white">
            {result.drawName}
          </h3>
          <span className="flex items-center gap-1.5 font-mono text-sm sm:text-base font-bold text-cyan-300 bg-black/20 border border-cyan-400/30 px-3 py-0.5 rounded-lg">
            <Clock3 size={14} className="text-cyan-400" />
            {result.time}
          </span>
        </div>

        <span
          className={`text-2xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
            isPublished
              ? "text-emerald-300 bg-emerald-950/40 border border-emerald-500/40"
              : "text-amber-300 bg-amber-950/40 border border-amber-500/40"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isPublished ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
          {isPublished ? "Published" : "Awaiting result"}
        </span>
      </div>

      {/* Metadata strip: DRAW NO and DRAW DATE ON — Transparent, no heavy box */}
      <div className="my-3 py-1 flex items-center justify-between font-mono text-xs sm:text-sm text-slate-200 border-b border-white/10 pb-2.5 flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <span className="text-slate-400 font-semibold">DRAW NO :</span>
          <strong className="text-white font-bold tracking-wide">
            #{result.drawNumber}
          </strong>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-slate-400 font-semibold">DRAW DATE ON :</span>
          <strong className="text-white font-bold tracking-wide">
            {result.date}
          </strong>
        </div>
      </div>

      {/* Prize Announcement Rows: 90-95% transparent rows without nested boxes */}
      <div className="flex flex-col my-2">
        {/* 1st Prize */}
        <div
          className={`flex items-center justify-between py-2.5 border-b border-white/10 transition-colors ${
            isMatchP1 ? "bg-cyan-950/20 px-2 rounded-md" : ""
          }`}
        >
          <div className="flex flex-col">
            <span className="font-mono text-xs sm:text-sm font-bold text-cyan-300 tracking-wider">
              1 ST PRIZE RS. 10000/-
            </span>
            <span className="text-2xs text-slate-400 mt-0.5">First Prize</span>
          </div>

          <div className="flex items-center">
            {p1?.number ? (
              <span className="font-mono font-black text-2xl sm:text-4xl tracking-[0.2em] text-white drop-shadow-[0_0_12px_rgba(56,189,248,0.9)]">
                {p1.number}
              </span>
            ) : (
              <span className="font-mono text-xl sm:text-2xl font-bold text-slate-500 tracking-widest">
                — — —
              </span>
            )}
          </div>
        </div>

        {/* 2nd Prize */}
        <div
          className={`flex items-center justify-between py-2.5 border-b border-white/10 transition-colors ${
            isMatchP2 ? "bg-emerald-950/20 px-2 rounded-md" : ""
          }`}
        >
          <div className="flex flex-col">
            <span className="font-mono text-xs sm:text-sm font-bold text-emerald-300 tracking-wider">
              2 ND PRIZE RS. 1000/-
            </span>
            <span className="text-2xs text-slate-400 mt-0.5">Second Prize</span>
          </div>

          <div className="flex items-center">
            {p2?.number ? (
              <span className="font-mono font-black text-2xl sm:text-4xl tracking-[0.2em] text-white drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]">
                {p2.number}
              </span>
            ) : (
              <span className="font-mono text-xl sm:text-2xl font-bold text-slate-500 tracking-widest">
                — —
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pending status helper */}
      {!isPublished && (
        <p className="text-xs text-amber-200/80 py-2 text-center">
          Winning numbers will be announced here promptly at {result.time}.
        </p>
      )}

      {/* Card Actions: Print & Share */}
      <div className="border-t border-blue-900/50 pt-3 mt-3 flex items-center justify-between">
        <button
          className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold hover:text-cyan-300 transition-colors bg-transparent border-0 p-1 rounded focus-visible:ring-1 focus-visible:ring-cyan-400"
          onClick={() => window.print()}
          aria-label="Print draw result"
        >
          <FileText size={14} className="text-cyan-400" />
          <span>Print result</span>
        </button>

        <button
          className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold hover:text-cyan-300 transition-colors bg-transparent border-0 p-1 rounded focus-visible:ring-1 focus-visible:ring-cyan-400"
          onClick={() => onShare(result)}
          aria-label="Share draw result"
        >
          {copiedDraw === result.drawName ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-300">Link copied!</span>
            </>
          ) : (
            <>
              <Share2 size={14} className="text-cyan-400" />
              <span>Share</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
