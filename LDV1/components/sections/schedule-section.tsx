// ---------------------------------------------------------------------------
// LUMA — Screen 04: Draw Schedule
// Clean timeline showing all seven daily draws in chronological order.
// ---------------------------------------------------------------------------
"use client";

import { Clock3 } from "lucide-react";
import { DRAWS } from "@/lib/data";
import { padSequence } from "@/lib/utils";
import type { DrawResult } from "@/lib/types";

type ScheduleSectionProps = {
  todayResults?: DrawResult[];
};

export function ScheduleSection({ todayResults = [] }: ScheduleSectionProps) {
  return (
    <section className="py-[42px] max-sm:py-8">
      {/* Section heading */}
      <div>
        <span className="text-2xs font-bold text-cyan-400 tracking-[.18em] uppercase">
          DAILY TIMINGS
        </span>
        <h2 className="font-heading font-black text-3xl sm:text-4xl text-white mt-1">
          Draw schedule
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-[620px] leading-relaxed">
          Six daily Lucky Diamond draws, arranged in chronological order.
        </p>
      </div>

      {/* Schedule list — 95% transparent container, no blur so crown shines through */}
      <div className="mt-[25px] bg-black/5 rounded-2xl p-3 sm:p-6 border border-white/10 shadow-md">
        {DRAWS.map((draw, i) => {
          const result = todayResults.find((r) => r.drawId === draw.id);
          const isPublished = result?.status === "published";

          return (
            <div
              key={draw.id}
              className={`flex items-center gap-[18px] px-[10px] py-[17px] max-sm:gap-2.5 ${
                i !== DRAWS.length - 1 ? "border-b border-white/10" : ""
              }`}
            >
              {/* Sequence number */}
              <span className="font-heading font-semibold text-xs text-luma-muted w-[22px] shrink-0">
                {padSequence(i)}
              </span>

              {/* Draw name + type */}
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <strong className="font-heading font-bold text-base truncate">
                  {draw.name}
                </strong>
                <small className="text-2xs text-luma-muted font-normal tracking-normal">
                  Daily draw
                </small>
              </div>

              {/* Time */}
              <span className="flex items-center gap-[7px] text-sm text-luma-muted min-w-[95px] max-sm:min-w-[88px] max-sm:justify-end">
                <Clock3 size={15} className="shrink-0" />
                {draw.time}
              </span>

              {/* Status */}
              <span
                className={`text-2xs font-bold min-w-[115px] text-right max-sm:hidden tracking-normal ${
                  isPublished ? "text-luma-green" : "text-luma-amber"
                }`}
              >
                {isPublished ? "Result published" : "Awaiting result"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary note */}
      <p className="text-xs text-luma-muted mt-5 leading-relaxed">
        All draw times are in Indian Standard Time (IST). Draws occur daily at
        the scheduled times shown above.
      </p>
    </section>
  );
}
