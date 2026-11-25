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
import { DRAWS, fetchResults, fetchResultsRange, getYesterdayIST } from "@/lib/data";
import { DrawGrid } from "@/components/draw-grid";

type HistorySectionProps = {
  copiedDraw: string;
  onShare: (result: DrawResult) => void;
  activeDate?: string;
};

function shiftYMD(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = String(dt.getUTCFullYear());
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayYMD(ymd: string): string {
  return new Date(`${ymd}T12:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function HistorySection({ copiedDraw, onShare }: HistorySectionProps) {
  const yesterdayYMD = getYesterdayIST().ymd;
  const [viewMode, setViewMode] = useState<"single" | "range">("single");
  const [selectedDate, setSelectedDate] = useState(yesterdayYMD);
  const [fromDate, setFromDate] = useState(() => shiftYMD(yesterdayYMD, -6));
  const [toDate, setToDate] = useState(yesterdayYMD);
  const [selectedDraw, setSelectedDraw] = useState("ALL");
  const [results, setResults] = useState<DrawResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadHistory() {
      setLoading(true);
      try {
        if (viewMode === "single") {
          const safeDate = selectedDate > yesterdayYMD ? yesterdayYMD : selectedDate;
          const data = await fetchResults(safeDate);
          if (mounted) {
            setResults(data.results || []);
          }
        } else {
          const safeTo = toDate > yesterdayYMD ? yesterdayYMD : toDate;
          const safeFrom = fromDate > safeTo ? safeTo : fromDate;
          const data = await fetchResultsRange(safeFrom, safeTo);
          if (mounted) {
            setResults(data.results || []);
          }
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
  }, [viewMode, selectedDate, fromDate, toDate, yesterdayYMD]);

  const filteredResults = results.filter(
    (r) => selectedDraw === "ALL" || r.drawId === selectedDraw
  );

  const shiftDate = (days: number) => {
    const next = shiftYMD(selectedDate, days);
    if (next <= yesterdayYMD && next >= "2026-10-01") {
      setSelectedDate(next);
    }
  };

  const displayDate = formatDisplayYMD(selectedDate);

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
            Choose a previous date or date range to view official verified draw results.
          </p>
        </div>

        {/* Mode toggle + Date control — 90-95% transparent */}
        <div className="flex flex-col items-end gap-2.5 max-sm:w-full max-sm:items-stretch">
          <div className="inline-flex rounded-lg bg-black/25 border border-white/10 p-1 self-end max-sm:self-start">
            <button
              type="button"
              onClick={() => setViewMode("single")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                viewMode === "single"
                  ? "bg-cyan-400 text-slate-950 font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Single Day
            </button>
            <button
              type="button"
              onClick={() => setViewMode("range")}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                viewMode === "range"
                  ? "bg-cyan-400 text-slate-950 font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Date Range
            </button>
          </div>

          {viewMode === "single" ? (
            <div className="flex items-center gap-2 max-sm:w-full">
              <button
                className="grid place-items-center w-10 h-10 border border-white/10 rounded-lg bg-black/15 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm text-slate-200"
                onClick={() => shiftDate(-1)}
                disabled={selectedDate <= "2026-10-01"}
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
                  max={yesterdayYMD}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) setSelectedDate(val > yesterdayYMD ? yesterdayYMD : val);
                  }}
                  className="border-0 bg-transparent text-white text-sm outline-none w-full sm:w-auto"
                />
              </div>
              <button
                className="grid place-items-center w-10 h-10 border border-white/10 rounded-lg bg-black/15 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm text-slate-200"
                onClick={() => shiftDate(1)}
                disabled={selectedDate >= yesterdayYMD}
                aria-label="Next day"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap max-sm:w-full">
              <div className="flex items-center gap-2 bg-black/15 border border-white/10 rounded-lg px-3 py-[10px] text-slate-300 flex-1 sm:flex-initial shadow-sm">
                <span className="text-xs text-slate-400">From</span>
                <input
                  type="date"
                  value={fromDate}
                  min="2026-10-01"
                  max={toDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) setFromDate(val > toDate ? toDate : val);
                  }}
                  className="border-0 bg-transparent text-white text-sm outline-none w-full sm:w-auto"
                />
              </div>
              <div className="flex items-center gap-2 bg-black/15 border border-white/10 rounded-lg px-3 py-[10px] text-slate-300 flex-1 sm:flex-initial shadow-sm">
                <span className="text-xs text-slate-400">To</span>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  max={yesterdayYMD}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) setToDate(val > yesterdayYMD ? yesterdayYMD : val);
                  }}
                  className="border-0 bg-transparent text-white text-sm outline-none w-full sm:w-auto"
                />
              </div>
            </div>
          )}
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
        {viewMode === "single" ? (
          <>
            Showing results for <strong className="text-white font-bold">{displayDate}</strong>
          </>
        ) : (
          <>
            Showing results from{" "}
            <strong className="text-white font-bold">{formatDisplayYMD(fromDate)}</strong> to{" "}
            <strong className="text-white font-bold">{formatDisplayYMD(toDate)}</strong>{" "}
            <span className="text-slate-400">({filteredResults.length} draws)</span>
          </>
        )}
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
