// ---------------------------------------------------------------------------
// LUMA — Draw grid
// Renders a responsive 2-column grid of DrawCards with loading skeletons and
// empty state fallback.
// ---------------------------------------------------------------------------
"use client";

import { Search } from "lucide-react";
import type { DrawResult } from "@/lib/types";
import { DrawCard } from "./draw-card";

type DrawGridProps = {
  results: DrawResult[];
  loading?: boolean;
  highlightQuery?: string;
  matchingPrizesMap?: Map<string, string[]>;
  copiedDraw?: string;
  onShare: (result: DrawResult) => void;
  /** Custom empty-state content */
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function DrawGrid({
  results,
  loading = false,
  highlightQuery,
  matchingPrizesMap,
  copiedDraw,
  onShare,
  emptyIcon,
  emptyTitle = "No matching results",
  emptyDescription = "Try another number, draw name or draw ID.",
}: DrawGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-[14px] max-[900px]:grid-cols-1">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="bg-luma-surface border border-luma-line rounded-lg p-[21px] animate-pulse"
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <div className="w-16 h-3 bg-luma-surface-2 rounded" />
                <div className="w-32 h-6 bg-luma-surface-2 rounded" />
                <div className="w-48 h-3 bg-luma-surface-2 rounded" />
              </div>
              <div className="w-20 h-6 bg-luma-surface-2 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-[22px] mb-[14px]">
              {[1, 2].map((p) => (
                <div
                  key={p}
                  className="bg-luma-surface-2 rounded-[9px] px-[10px] py-4 h-20"
                />
              ))}
            </div>
            <div className="border-t border-luma-line pt-3 flex gap-5">
              <div className="w-20 h-4 bg-luma-surface-2 rounded" />
              <div className="w-16 h-4 bg-luma-surface-2 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2.5 text-center py-14 px-5 bg-luma-surface border border-dashed border-luma-line rounded-[13px] text-luma-muted">
        {emptyIcon ?? <Search size={25} />}
        <strong className="text-luma-text font-heading font-bold text-md">
          {emptyTitle}
        </strong>
        <span className="text-sm max-w-md">{emptyDescription}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-[14px] max-[900px]:grid-cols-1">
      {results.map((r, i) => (
        <DrawCard
          key={`${r.drawId}-${r.date || i}`}
          result={r}
          highlightQuery={highlightQuery}
          matchingPrizes={matchingPrizesMap?.get(r.drawId)}
          copiedDraw={copiedDraw}
          onShare={onShare}
        />
      ))}
    </div>
  );
}
