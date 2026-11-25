// ---------------------------------------------------------------------------
// Lucky Diamond — Home Section
// Exclusively displays the currently selected draw details (no other draws shown).
// Clean, seamless transparent panel without heavy enclosing boxes, allowing the
// background artwork to blend through with crystal clarity.
// ---------------------------------------------------------------------------
"use client";

import { useState, useEffect } from "react";
import { CalendarDays, FileText, Share2, Check, RefreshCw } from "lucide-react";
import type { DrawResult } from "@/lib/types";
import { DRAWS, getTodayDisplay, getTodayIST, getExpectedDrawNumber } from "@/lib/data";
import type { SectionId } from "@/components/topbar";

type HomeSectionProps = {
  results: DrawResult[];
  loading?: boolean;
  dateStr?: string;
  copiedDraw: string;
  selectedDrawId: string;
  onSelectDraw: (id: string) => void;
  onShare: (result: DrawResult) => void;
  onNavigate: (id: SectionId) => void;
  onRefresh?: () => void;
};

export function HomeSection({
  results,
  loading = false,
  dateStr,
  copiedDraw,
  selectedDrawId,
  onSelectDraw,
  onShare,
  onNavigate,
  onRefresh,
}: HomeSectionProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Find currently selected draw, fallback to empty awaiting placeholder for today
  const selectedIndex = Math.max(0, DRAWS.findIndex((d) => d.id === selectedDrawId));
  const selectedDef = DRAWS[selectedIndex] || DRAWS[0];
  const { dmy: todayDMY, ymd: todayYMD } = mounted
    ? getTodayIST()
    : { dmy: "--/--/----", ymd: "" };

  const currentResult =
    results.find((r) => r.drawId === selectedDrawId) ||
    results[0] || {
      drawId: selectedDef.id,
      drawName: selectedDef.name,
      drawNumber: mounted ? getExpectedDrawNumber(todayDMY, selectedIndex) : 0,
      date: dateStr ? dateStr.split("-").reverse().join("-") : todayDMY,
      isoDate: todayYMD,
      time: selectedDef.time,
      status: "awaiting" as const,
      prizes: [
        { label: "1ST PRIZE", displayName: "First Prize", amount: "₹10,000", number: null },
        { label: "2ND PRIZE", displayName: "Second Prize", amount: "₹1,000", number: null },
      ],
    };

  const displayDateLabel = dateStr
    ? getTodayDisplay(dateStr)
    : mounted
    ? getTodayDisplay()
    : "Loading date...";

  const isPublished = currentResult.status === "published";
  const p1 = currentResult.prizes[0];
  const p2 = currentResult.prizes[1];

  return (
    <section className="py-6 sm:py-10">
      {/* ── Sub-header: Live Status & Date & Rapid Sync ── */}
      <div className="flex items-center justify-between mb-4 max-w-3xl mx-auto flex-wrap gap-2 px-1">
        <span className="text-2xs font-mono font-bold text-cyan-300 tracking-[0.18em] uppercase drop-shadow flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          OFFICIAL LIVE DRAW RESULT
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-2 text-slate-200 text-xs sm:text-sm bg-black/15 px-3 py-1 rounded-lg font-mono border border-white/10">
            <CalendarDays size={14} className="text-cyan-400" />
            {displayDateLabel}
          </span>
          {onRefresh && (
            <button
              onClick={() => onRefresh()}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-black/15 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition-colors font-mono cursor-pointer active:scale-95"
              title="Refresh spreadsheet data"
            >
              <RefreshCw size={12} className={`text-cyan-400 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          )}
        </div>
      </div>

      {/* ── SINGLE SELECTED DRAW ANNOUNCEMENT (95% transparent, crystal-clear background) ── */}
      <div id="featured-result-box" className="max-w-3xl mx-auto my-2 scroll-mt-48">
        <div className="bg-black/10 border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl transition-all duration-200">
          {/* Header Line: LUCKYDIAMOND 11:10 AM */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-2">
            <h1 className="font-mono text-2xl sm:text-4xl font-black tracking-wider text-amber-300 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              {currentResult.drawName}&nbsp;&nbsp;{currentResult.time}
            </h1>

            <span
              className={`text-2xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                isPublished
                  ? "text-emerald-300 bg-emerald-950/60 border border-emerald-500/40"
                  : "text-amber-300 bg-amber-950/60 border border-amber-500/40"
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

          {/* Monospace Metadata Line (No enclosing boxes, clean text) */}
          <div className="my-5 font-mono text-sm sm:text-base text-slate-200 tracking-wider flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-amber-200/70 font-semibold">DRAW NO :</span>{" "}
              <strong className="text-white font-bold">#{currentResult.drawNumber}</strong>
            </div>
            <div>
              <span className="text-amber-200/70 font-semibold">DRAW DATE ON :</span>{" "}
              <strong className="text-white font-bold">{currentResult.date}</strong>
            </div>
          </div>

          {/* Prize Announcement Lines — Pure transparent lines with no inner boxes */}
          <div className="my-8 space-y-6 font-mono">
            {/* 1st Prize Row */}
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-sm sm:text-lg font-bold text-amber-200 tracking-wider">
                1 ST PRIZE RS. 10000/-
              </span>
              <span className="text-3xl sm:text-5xl font-black tracking-[0.2em] text-white drop-shadow-[0_0_16px_rgba(251,191,36,0.95)]">
                {p1?.number ?? "— — —"}
              </span>
            </div>

            {/* 2nd Prize Row */}
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-sm sm:text-lg font-bold text-emerald-300 tracking-wider">
                2 ND PRIZE RS. 1000/-
              </span>
              <span className="text-3xl sm:text-5xl font-black tracking-[0.2em] text-white drop-shadow-[0_0_16px_rgba(52,211,153,0.95)]">
                {p2?.number ?? "— —"}
              </span>
            </div>
          </div>

          {/* Pending helper note */}
          {!isPublished && (
            <p className="text-xs text-amber-200/90 font-mono py-2 text-center my-2">
              Results for {currentResult.time} will appear here promptly when announced.
            </p>
          )}

          {/* Card Actions: Print & Share */}
          <div className="pt-4 mt-6 flex items-center justify-between">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition-colors bg-transparent border-0 p-1"
            >
              <FileText size={15} className="text-cyan-400" />
              <span>Print result</span>
            </button>
            <button
              onClick={() => onShare(currentResult)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition-colors bg-transparent border-0 p-1"
            >
              {copiedDraw === currentResult.drawName ? (
                <>
                  <Check size={15} className="text-emerald-400" />
                  <span className="text-emerald-300">Link copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={15} className="text-cyan-400" />
                  <span>Share result</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
