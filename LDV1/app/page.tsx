// ---------------------------------------------------------------------------
// Diamond Lottery — Main page (app/page.tsx)
// Orchestrates the public website: dynamic data fetching from the live API
// layer, horizontal top nav, and the four content sections.
// No sidebar/drawer — navigation is a horizontal bar matching the reference.
// ---------------------------------------------------------------------------
"use client";

import { useState, useEffect, useCallback } from "react";
import type { DrawResult } from "@/lib/types";
import { shareResult } from "@/lib/utils";
import { fetchResults } from "@/lib/data";

import { Topbar, type SectionId } from "@/components/topbar";
import { Footer } from "@/components/footer";

import { HomeSection } from "@/components/sections/home-section";
import { HistorySection } from "@/components/sections/history-section";
import { ScheduleSection } from "@/components/sections/schedule-section";
import { DownloadsSection } from "@/components/sections/downloads-section";

export default function DiamondLotteryPage() {
  // ── State ──────────────────────────────────────────────────────────────
  const [section, setSection] = useState<SectionId>("home");
  const [copiedDraw, setCopiedDraw] = useState("");
  const [selectedDrawId, setSelectedDrawId] = useState<string>("LUCKYDIAMOND_1110");

  // ── Live Data State (zero hardcoding) ──────────────────────────────────
  const [todayResults, setTodayResults] = useState<DrawResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [resultDate, setResultDate] = useState<string>("");

  // ── Force dark mode on mount ───────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // ── Fetch live data on mount + rapid background auto-polling (every 4s) ──
  const loadLiveData = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const todayData = await fetchResults();
      const liveToday = todayData.results || [];
      setTodayResults(liveToday);
      setResultDate(todayData.isoDate || todayData.date || "");
    } catch (err) {
      console.error("Failed to load live results:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLiveData(true);

    // Rapid auto-polling every 4 seconds so spreadsheet changes appear without reloading
    // Only polls when tab is actively visible to preserve client battery & server capacity under high traffic
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      loadLiveData(false);
    }, 4000);

    const onVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        loadLiveData(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [loadLiveData]);

  // ── Navigation ─────────────────────────────────────────────────────────
  const navigate = useCallback((id: SectionId) => {
    setSection(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── Share action ───────────────────────────────────────────────────────
  const handleShare = useCallback(async (result: DrawResult) => {
    const numbers = result.prizes.map((p) => p.number);
    const outcome = await shareResult(
      result.drawName,
      result.drawNumber,
      result.date,
      numbers
    );
    if (outcome === "copied") {
      setCopiedDraw(result.drawName);
      setTimeout(() => setCopiedDraw(""), 1800);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-luma-bg text-luma-text relative z-[1]">
      {/* Topbar with logo + top nav + timing nav */}
      <Topbar
        activeSection={section}
        onNavigate={navigate}
        selectedDrawId={selectedDrawId}
        onSelectDraw={setSelectedDrawId}
        todayResults={todayResults}
      />

      {/* Page content with sticky footer to bottom */}
      <main
        id={`panel-${section}`}
        role="tabpanel"
        aria-labelledby={`tab-${section}`}
        className="flex-1 w-full max-w-[1180px] mx-auto px-[24px] max-sm:px-[16px] flex flex-col justify-between"
      >
        {/* Active section content */}
        <div className="flex-1 w-full">
          {section === "home" && (
            <HomeSection
              results={todayResults}
              loading={loading}
              dateStr={resultDate}
              copiedDraw={copiedDraw}
              selectedDrawId={selectedDrawId}
              onSelectDraw={setSelectedDrawId}
              onShare={handleShare}
              onNavigate={navigate}
              onRefresh={() => loadLiveData(true)}
            />
          )}

          {section === "history" && (
            <HistorySection copiedDraw={copiedDraw} onShare={handleShare} activeDate={resultDate} />
          )}

          {section === "schedule" && (
            <ScheduleSection todayResults={todayResults} />
          )}

          {section === "downloads" && (
            <DownloadsSection initialRecords={todayResults} />
          )}
        </div>

        {/* Footer firmly at bottom */}
        <Footer />
      </main>
    </div>
  );
}
