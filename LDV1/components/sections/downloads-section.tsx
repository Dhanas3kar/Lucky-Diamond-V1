// ---------------------------------------------------------------------------
// LUMA — Screen 05: Downloads
// Result download centre with live file cards, filter controls, and print actions.
// ---------------------------------------------------------------------------
"use client";

import { useState, useEffect } from "react";
import { Download, FileText } from "lucide-react";
import { buildDownloadEntries, DRAWS, fetchResults, getTodayIST } from "@/lib/data";
import type { DrawResult, DownloadEntry } from "@/lib/types";

type DownloadsSectionProps = {
  initialRecords: DrawResult[];
};

export function DownloadsSection({ initialRecords }: DownloadsSectionProps) {
  const [dateFilter, setDateFilter] = useState("");
  const [drawFilter, setDrawFilter] = useState("ALL");
  const [records, setRecords] = useState<DrawResult[]>(initialRecords);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dateFilter) {
      setRecords(initialRecords);
      return;
    }
    let mounted = true;
    async function loadDateFiles() {
      setLoading(true);
      try {
        const data = await fetchResults(dateFilter);
        if (mounted) {
          setRecords(data.results || []);
        }
      } catch {
        if (mounted) setRecords([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadDateFiles();
    return () => {
      mounted = false;
    };
  }, [dateFilter, initialRecords]);

  const allEntries: DownloadEntry[] = buildDownloadEntries(records);
  const entries = allEntries.filter((e) => {
    if (drawFilter !== "ALL" && e.drawId !== drawFilter) return false;
    return true;
  });

  return (
    <section className="py-[42px] max-sm:py-8">
      {/* Section heading */}
      <div>
        <span className="text-2xs font-bold text-luma-muted tracking-[.15em]">
          RESULT FILES
        </span>
        <h2 className="font-heading font-bold text-4xl mt-[9px] max-sm:text-3xl">
          Downloads
        </h2>
        <p className="text-base text-luma-muted mt-[9px] max-w-[620px] leading-relaxed">
          Print a result summary now. Official PDF files can be connected when
          supplied.
        </p>
      </div>

      {/* Filters — 95% transparent, no blur */}
      <div className="flex items-center gap-2.5 mt-5 flex-wrap">
        <div className="flex items-center gap-[9px] bg-black/10 border border-white/10 rounded-lg px-3 py-[10px] text-slate-300">
          <FileText size={16} className="shrink-0 text-cyan-400" />
          <select
            value={drawFilter}
            onChange={(e) => setDrawFilter(e.target.value)}
            className="border-0 bg-transparent text-white text-sm outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-white">All draws</option>
            {DRAWS.map((d) => (
              <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-[9px] bg-black/10 border border-white/10 rounded-lg px-3 py-[10px] text-slate-300 max-sm:w-full">
          <input
            type="date"
            value={dateFilter}
            min="2026-10-01"
            max={getTodayIST().ymd}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border-0 bg-transparent text-white text-sm outline-none flex-1"
            placeholder="Filter by date"
          />
        </div>
      </div>

      {/* Download grid — 95% transparent cards without blur */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 mt-[25px] max-sm:grid-cols-1">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="flex items-center gap-3 bg-black/5 border border-white/10 rounded-[12px] p-[15px] animate-pulse"
            >
              <div className="w-[39px] h-[39px] bg-white/5 rounded-[9px]" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="w-24 h-4 bg-white/5 rounded" />
                <div className="w-32 h-3 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 mt-[25px] max-sm:grid-cols-1">
          {entries.map((entry, idx) => (
            <article
              key={`${entry.drawId}-${entry.date || idx}`}
              className="flex items-center gap-3 bg-black/10 hover:bg-black/15 border border-white/10 hover:border-cyan-400/30 rounded-[12px] p-[15px] max-sm:p-3 transition-colors"
            >
              {/* File icon */}
              <div className="w-[39px] h-[39px] grid place-items-center bg-white/5 border border-white/10 rounded-[9px] shrink-0 text-cyan-300">
                <FileText size={21} />
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <strong className="font-heading font-bold text-sm truncate text-white">
                  {entry.drawName}
                </strong>
                <span className="text-2xs text-slate-300 tracking-normal">
                  {entry.drawNumber ? `Draw #${entry.drawNumber} · ` : ""}
                  {entry.date}
                </span>
                <small
                  className={`text-2xs tracking-normal ${
                    entry.statusLabel === "Result available"
                      ? "text-emerald-400 font-bold"
                      : "text-amber-400"
                  }`}
                >
                  {entry.statusLabel}
                </small>
              </div>

              {/* Download / print action */}
              <button
                className="flex items-center gap-[5px] border border-white/10 bg-black/20 hover:bg-white/10 rounded-[8px] px-2.5 py-2 text-2xs font-semibold hover:border-cyan-400/40 text-slate-200 transition-colors shrink-0 tracking-normal cursor-pointer"
                onClick={() => window.print()}
                title="Print or save as PDF"
              >
                <Download size={17} />
                <span className="hidden sm:inline">Print</span>
              </button>
            </article>
          ))}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="flex flex-col items-center gap-2.5 text-center py-14 px-5 bg-luma-surface border border-dashed border-luma-line rounded-[13px] text-luma-muted mt-5">
          <FileText size={25} />
          <strong className="text-luma-text font-heading font-bold text-md">
            No files match your filter
          </strong>
          <span className="text-sm">Try selecting a different draw or date.</span>
        </div>
      )}
    </section>
  );
}
