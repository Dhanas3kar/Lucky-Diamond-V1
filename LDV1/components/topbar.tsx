// ---------------------------------------------------------------------------
// Lucky Diamond — Consolidated Header Component
// Includes:
// 1. Logo banner (Diamond Emblem + Wordmark)
// 2. Main Navigation bar in vibrant golden yellow (matching reference luckylott)
// 3. Timing Navigation bar (11:10 AM, 12:10 PM, 01:10 PM, 06:10 PM, 07:10 PM, 08:10 PM)
// Responsive: start-aligned on mobile so no left clipping occurs, centered on tablet/desktop.
// ---------------------------------------------------------------------------
"use client";

import Image from "next/image";
import { Home, CalendarCheck, History, FileDown, Clock3 } from "lucide-react";
import { DRAWS } from "@/lib/data";
import type { DrawResult } from "@/lib/types";

export type SectionId = "home" | "history" | "schedule" | "downloads";

interface NavItem {
  key: string;
  sectionId: SectionId;
  label: string;
  icon: typeof Home;
  target?: "top" | "results";
}

const NAV_ITEMS: NavItem[] = [
  { key: "home-results", sectionId: "home", label: "Today Result", icon: CalendarCheck, target: "results" },
  { key: "history", sectionId: "history", label: "Previous Result", icon: History },
  { key: "downloads", sectionId: "downloads", label: "Result File Download", icon: FileDown },
  { key: "schedule", sectionId: "schedule", label: "Draw Schedule", icon: Clock3 },
];

type TopbarProps = {
  activeSection: SectionId;
  onNavigate: (id: SectionId) => void;
  selectedDrawId: string;
  onSelectDraw: (id: string) => void;
  todayResults?: DrawResult[];
};

export function Topbar({
  activeSection,
  onNavigate,
  selectedDrawId,
  onSelectDraw,
  todayResults = [],
}: TopbarProps) {
  // Map of results by drawId
  const resultMap = todayResults.reduce<Record<string, DrawResult>>((acc, r) => {
    acc[r.drawId] = r;
    return acc;
  }, {});

  const handleNavClick = (item: NavItem) => {
    onNavigate(item.sectionId);

    if (item.target === "results") {
      setTimeout(() => {
        const box = document.getElementById("featured-result-box");
        if (box) {
          box.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 60);
    } else if (item.target === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleTimingClick = (e: React.MouseEvent, drawId: string) => {
    (e.currentTarget as HTMLElement)?.blur();
    onSelectDraw(drawId);
    if (activeSection !== "home") {
      onNavigate("home");
    }
    setTimeout(() => {
      const box = document.getElementById("featured-result-box");
      if (box) {
        box.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 60);
  };

  const renderTickerItem = (draw: (typeof DRAWS)[number], keyPrefix: string) => {
    const isSelected = selectedDrawId === draw.id;
    const result = resultMap[draw.id];
    const isPublished = result?.status === "published";

    return (
      <button
        key={`${keyPrefix}-${draw.id}`}
        onClick={(e) => handleTimingClick(e, draw.id)}
        className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs sm:text-sm transition-all duration-150 focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none select-none cursor-pointer ${
          isSelected
            ? "bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.7)] font-black"
            : "bg-black/40 hover:bg-white/10 text-slate-200 border border-white/10"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            isSelected
              ? "bg-slate-950"
              : isPublished
              ? "bg-emerald-400 animate-pulse"
              : "bg-amber-400/80"
          }`}
        />
        <span className="font-bold">{draw.time}</span>
        <span className="text-cyan-500/40 text-[10px] ml-1">◆</span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-2xl backdrop-blur-md" role="banner">
      {/* ── 1. Brand Logo Banner ── */}
      <div className="bg-[#071330]/90 border-b border-blue-900/50 px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-center">
        <button
          onClick={() => {
            onNavigate("home");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center justify-center gap-1.5 sm:gap-2.5 group focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none rounded-2xl p-1 transition-transform active:scale-[0.98]"
          aria-label="Lucky Diamond Home"
        >
          {/* Diamond emblem */}
          <div className="shrink-0 w-20 h-16 sm:w-26 sm:h-20 md:w-32 md:h-24 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Diamond Emblem"
              width={130}
              height={100}
              priority
              className="max-h-full max-w-full object-contain drop-shadow-[0_4px_24px_rgba(56,189,248,0.7)] transition-transform group-hover:scale-105"
            />
          </div>

          {/* Lucky Diamond wordmark */}
          <div className="h-14 sm:h-18 md:h-22 flex items-center">
            <Image
              src="/wordmark.png"
              alt="Lucky Diamond - लक्की डायमंड"
              width={440}
              height={115}
              priority
              className="h-full w-auto max-w-[230px] sm:max-w-[360px] md:max-w-[440px] object-contain drop-shadow-[0_2px_20px_rgba(255,255,255,0.5)] transition-opacity group-hover:opacity-95"
            />
          </div>
        </button>
      </div>

      {/* ── 2. Main Navigation Bar: Golden Yellow for High Contrast (Zero Clipping Bug) ── */}
      <nav
        aria-label="Main navigation"
        className="w-full bg-gradient-to-r from-[#d99404] via-[#e5a00d] to-[#d99404] border-y border-amber-600/60 shadow-md"
      >
        <div className="w-full overflow-x-auto scrollbar-none overscroll-x-contain py-1">
          <div
            role="tablist"
            className="flex items-center justify-start md:justify-center w-max min-w-full px-3 sm:px-6 py-0.5 divide-x divide-amber-700/25"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.sectionId;
              const Icon = item.icon;

              return (
                <button
                  key={item.key}
                  role="tab"
                  id={`tab-${item.key}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${item.sectionId}`}
                  aria-current={isActive ? "page" : undefined}
                  tabIndex={0}
                  onClick={() => handleNavClick(item)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 sm:px-5 py-1.5 text-xs sm:text-sm font-black uppercase tracking-wider whitespace-nowrap transition-all duration-150 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-950 ${
                    isActive
                      ? "bg-[#6b1515] text-white shadow-md rounded-md mx-0.5"
                      : "text-[#451806] hover:text-[#1a0802] hover:bg-amber-400/70 rounded-md"
                  }`}
                >
                  <Icon
                    size={14}
                    className={isActive ? "text-amber-200" : "text-[#451806]"}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── 3. Timing Navigation Bar — News Ticker / Live Marquee ── */}
      <div
        aria-label="Draw timing news ticker"
        className="w-full bg-[#050e26]/95 border-b border-cyan-500/25 py-1.5 flex items-center relative overflow-hidden select-none"
      >
        {/* Subtle left gradient overlay over ticker start */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#050e26] to-transparent z-10" />

        {/* Ticker Track (Infinite seamless marquee) */}
        <div className="flex-1 overflow-hidden relative flex items-center">
          <div className="flex shrink-0 animate-marquee items-center gap-2 sm:gap-3 pr-2 sm:pr-3">
            {DRAWS.map((draw) => renderTickerItem(draw, "t1"))}
          </div>
          <div
            aria-hidden="true"
            className="flex shrink-0 animate-marquee items-center gap-2 sm:gap-3 pr-2 sm:pr-3"
          >
            {DRAWS.map((draw) => renderTickerItem(draw, "t2"))}
          </div>
        </div>

        {/* Subtle right gradient overlay over ticker end */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#050e26] to-transparent z-10" />
      </div>
    </header>
  );
}
