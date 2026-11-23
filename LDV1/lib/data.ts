// ---------------------------------------------------------------------------
// LUMA — Dynamic Data Client & Helpers
// NO hardcoded winning numbers, dates, or results.
// All result data is fetched dynamically from the /api/results endpoints,
// which proxy and parse live data directly from the reference backend.
// ---------------------------------------------------------------------------

import type { Draw, DrawResult, DownloadEntry, PrizeCategory } from "./types";

// ── Six official Lucky Diamond daily draws definition ────────────────────────

export const DRAWS: Draw[] = [
  { id: "LUCKYDIAMOND_1110", name: "LUCKYDIAMOND", time: "11:10 AM", sequence: 1 },
  { id: "LUCKYDIAMOND_1210", name: "LUCKYDIAMOND", time: "12:10 PM", sequence: 2 },
  { id: "LUCKYDIAMOND_1310", name: "LUCKYDIAMOND", time: "01:10 PM", sequence: 3 },
  { id: "LUCKYDIAMOND_1810", name: "LUCKYDIAMOND", time: "06:10 PM", sequence: 4 },
  { id: "LUCKYDIAMOND_1910", name: "LUCKYDIAMOND", time: "07:10 PM", sequence: 5 },
  { id: "LUCKYDIAMOND_2010", name: "LUCKYDIAMOND", time: "08:10 PM", sequence: 6 },
];

export interface FetchResultsResponse {
  success: boolean;
  source?: string;
  date?: string;
  isoDate?: string;
  results: DrawResult[];
  count: number;
  error?: string;
}

/**
 * Dynamically fetch results from our Next.js API route.
 * If date is omitted, fetches today's live results.
 * If date is provided (YYYY-MM-DD or DD-MM-YYYY), queries historical results.
 */
export async function fetchResults(date?: string): Promise<FetchResultsResponse> {
  const ts = Date.now();
  const url = date
    ? `/api/results?date=${encodeURIComponent(date)}&_t=${ts}`
    : `/api/results?_t=${ts}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache, no-store, must-revalidate" },
    });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data: FetchResultsResponse = await res.json();
    return data;
  } catch (err: any) {
    console.error("fetchResults error:", err);
    return {
      success: false,
      results: [],
      count: 0,
      error: err?.message || "Failed to fetch live results",
    };
  }
}

/**
 * Filter dynamic results by query and draw filter.
 */
export function filterResults(
  records: DrawResult[],
  query: string,
  drawFilter?: string
): DrawResult[] {
  const q = query.trim().toLowerCase();
  return records.filter((r) => {
    const matchesDraw = !drawFilter || drawFilter === "ALL" || r.drawId === drawFilter;
    if (!matchesDraw) return false;
    if (!q) return true;
    if (r.drawName.toLowerCase().includes(q)) return true;
    if (String(r.drawNumber).includes(q)) return true;
    if (r.prizes.some((p) => p.number?.toLowerCase().includes(q))) return true;
    return false;
  });
}

/**
 * For a matching result, identify which prize(s) matched the query.
 * Returns labels like "1ST PRIZE" for highlighting in the UI.
 */
export function getMatchingPrizes(
  result: DrawResult,
  query: string
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return result.prizes
    .filter((p) => p.number?.toLowerCase().includes(q))
    .map((p) => p.label);
}

/**
 * Convert dynamic results into download entries.
 */
export function buildDownloadEntries(records: DrawResult[]): DownloadEntry[] {
  return records.map((r) => ({
    drawId: r.drawId,
    drawName: r.drawName,
    drawNumber: r.drawNumber,
    date: r.date,
    isoDate: r.isoDate,
    fileAvailable: false,
    fileUrl: null,
    statusLabel:
      r.status === "published" ? "Result available" : "Result pending",
  }));
}

/**
 * Format a date string for display in the hero pill.
 */
export function getTodayDisplay(customDate?: string): string {
  const d = customDate ? new Date(customDate) : new Date();
  if (isNaN(d.getTime())) {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
