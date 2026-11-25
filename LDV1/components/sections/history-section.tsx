// ---------------------------------------------------------------------------
// LUMA — Screen 02: Result History
// Calendar-based date navigation with dynamic live result queries.
// ---------------------------------------------------------------------------
"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
} from "lucide-react";
import type { DrawResult } from "@/lib/types";
import { DRAWS, fetchResults, getTodayIST } from "@/lib/data";
import { DrawGrid } from "@/components/draw-grid";

type HistorySectionProps = {
  copiedDraw: string;
  onShare: (result: DrawResult) => void;
  activeDate?: string;
};

// Default initial date: active date or today in IST (YYYY-MM-DD)
function getInitialDate(activeDate?: string): string {
  if (activeDate && /^\d{4}-\d{2}-\d{2}$/.test(activeDate)) {
    return activeDate;
  }
  return getTodayIST().ymd;
}

export function HistorySection({ copiedDraw, onShare, activeDate }: HistorySectionProps) {
  const [selectedDate, setSelectedDate] = useState(getInitialDate(activeDate));
  const [selectedDraw, setSelectedDraw] = useState("ALL");
  const [results, setResults] = useState<DrawResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Keep in sync if activeDate becomes available
  useEffect(() => {
    if (activeDate && /^\d{4}-\d{2}-\d{2}$/.test(activeDate)) {
      setSelectedDate(activeDate);
    }
  }, [activeDate]);

  useEffect(() => {
    let mounted = true;
    async function loadHistory() {
      setLoading(true);
      try {
        const data = await fetchResults(selectedDate);
        if (mounted) {
          setResults(data.results || []);
        }
      } catch {
        if (mounted) setResults([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadHistory();
    return () => {
      mounted = false;
    };
  }, [selectedDate]);

  const filteredResults = results.filter(
    (r) => selectedDraw === "ALL" || r.drawId === selectedDraw
  );

  const shiftDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const displayDate = new Date(selectedDate).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="py-[42px] max-sm:py-8">
      {/* Section heading */}
      <div className="flex items-end justify-between gap-5 max-sm:flex-col max-sm:items-start">
        <div>
          <span className="text-2xs font-bold text-luma-muted tracking-[.15em]">
            ARCHIVE
          </span>
          <h2 className="font-heading font-bold text-4xl mt-[9px] max-sm:text-3xl">
            Result history
          </h2>
          <p className="text-base text-luma-muted mt-[9px] max-w-[620px] leading-relaxed">
            Choose a date to view its official verified draw results.
          </p>
        </div>

        {/* Date control — 90-95% transparent */}
        <div className="flex items-center gap-2 max-sm:w-full">
          <button
            className="grid place-items-center w-10 h-10 border border-white/10 rounded-lg bg-black/15 hover:bg-white/10 transition-colors shadow-sm text-slate-200"
            onClick={() => shiftDate(-1)}
            aria-label="Previous day"
          >
            <ChevronLeft size={17} />
          </button>
          <div className="flex items-center gap-[9px] bg-black/15 border border-white/10 rounded-lg px-3 py-[10px] text-slate-300 flex-1 sm:flex-initial shadow-sm">
            <CalendarDays size={17} className="text-cyan-400" />
            <input
              type="date"
              value={selectedDate}
              min="2026-10-01"
              max={getTodayIST().ymd}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-0 bg-transparent text-white text-sm outline-none w-full sm:w-auto"
            />
          </div>
          <button
            className="grid place-items-center w-10 h-10 border border-white/10 rounded-lg bg-black/15 hover:bg-white/10 transition-colors shadow-sm text-slate-200"
            onClick={() => shiftDate(1)}
            aria-label="Next day"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* Draw filter */}
      <div className="flex items-center gap-3 mt-5 flex-wrap">
        <span className="text-xs text-slate-300">Filter by draw:</span>
        <div className="flex gap-[6px] flex-wrap">
          <button
            className={`text-xs px-3 py-[6px] rounded-pill border transition-colors ${selectedDraw === "ALL"
                ? "bg-white text-slate-950 font-bold border-white"
                : "bg-black/15 border-white/10 hover:border-white/30 text-slate-300"
              }`}
            onClick={() => setSelectedDraw("ALL")}
          >
            All draws
          </button>
          {DRAWS.map((d) => (
            <button
              key={d.id}
              className={`text-xs px-3 py-[6px] rounded-pill border transition-colors font-mono ${selectedDraw === d.id
                  ? "bg-cyan-400 text-slate-950 font-bold border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                  : "bg-black/15 border-white/10 hover:border-white/30 text-slate-300"
                }`}
              onClick={() => setSelectedDraw(d.id)}
            >
              {d.time}
            </button>
          ))}
        </div>
      </div>

      {/* Date display */}
      <p className="text-xs text-slate-300 mt-5 mb-2">
        Showing results for <strong className="text-white font-bold">{displayDate}</strong>
      </p>

      {/* Notice — 90-95% transparent banner */}
      <div className="flex items-start gap-2.5 bg-black/10 border border-white/10 rounded-xl px-4 py-[14px] my-[22px] text-slate-300 text-sm leading-relaxed">
        <CircleHelp size={17} className="shrink-0 mt-0.5 text-cyan-400" />
        Historical records are queried live from the official draw database. If a
        past date has no verified results published, an honest empty state is shown.
      </div>

      {/* Results */}
      <DrawGrid
        results={filteredResults}
        loading={loading}
        copiedDraw={copiedDraw}
        onShare={onShare}
        emptyIcon={<CalendarDays size={26} />}
        emptyTitle="No verified archive records for this date"
        emptyDescription="No draw results were found for the selected date in the official database."
      />
    </section>
  );
}
