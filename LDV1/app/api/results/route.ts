import { NextRequest, NextResponse } from "next/server";
import type { DrawResult, PrizeCategory } from "@/lib/types";
import { fetchGoogleSheetResults } from "@/lib/google-sheets";
import { SYNTHETIC_ARCHIVE } from "@/lib/synthetic-archive";

export const dynamic = "force-dynamic";

// Real-time cache headers: zero client/edge caching for instant spreadsheet updates
const CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

// In-memory runtime cache for warm executions (short 2s TTL to prevent thunder herd)
type CacheEntry = {
  data: any;
  timestamp: number;
};
const RUNTIME_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 2 * 1000; // 2 seconds for rapid updates
// In-flight request deduplication to protect upstream Google Sheets under high traffic
const IN_FLIGHT_REQUESTS = new Map<string, Promise<any>>();

const DRAW_DEFINITIONS = [
  { id: "LUCKYDIAMOND_1110", name: "LUCKYDIAMOND", time: "11:10 AM", rawTime: "11:10:00", sequence: 1 },
  { id: "LUCKYDIAMOND_1210", name: "LUCKYDIAMOND", time: "12:10 PM", rawTime: "12:10:00", sequence: 2 },
  { id: "LUCKYDIAMOND_1310", name: "LUCKYDIAMOND", time: "01:10 PM", rawTime: "13:10:00", sequence: 3 },
  { id: "LUCKYDIAMOND_1810", name: "LUCKYDIAMOND", time: "06:10 PM", rawTime: "18:10:00", sequence: 4 },
  { id: "LUCKYDIAMOND_1910", name: "LUCKYDIAMOND", time: "07:10 PM", rawTime: "19:10:00", sequence: 5 },
  { id: "LUCKYDIAMOND_2010", name: "LUCKYDIAMOND", time: "08:10 PM", rawTime: "20:10:00", sequence: 6 },
];

function makePrizes(numbers: [string | null, string | null]): PrizeCategory[] {
  return [
    {
      label: "1ST PRIZE",
      displayName: "First Prize",
      amount: "₹10,000",
      number: numbers[0],
    },
    {
      label: "2ND PRIZE",
      displayName: "Second Prize",
      amount: "₹1,000",
      number: numbers[1],
    },
  ];
}

// Convert YYYY-MM-DD or DD/MM/YYYY or D-M-YY to DD-MM-YYYY
function toDMY(dateStr: string): string {
  if (!dateStr) return "";
  const cleaned = dateStr.trim().replace(/\s+/g, "").replace(/[\/\.]+/g, "-");
  const parts = cleaned.split("-").filter(Boolean);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (d.length === 4) {
      // YYYY-MM-DD
      return `${y.padStart(2, "0")}-${m.padStart(2, "0")}-${d}`;
    }
    // DD-MM-YYYY or D-M-YY
    const fullYear = y.length === 2 ? `20${y}` : y;
    return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${fullYear}`;
  }
  return dateStr;
}

// Convert DD-MM-YYYY to YYYY-MM-DD
function toYMD(dateStr: string): string {
  if (!dateStr) return "";
  const dmy = toDMY(dateStr);
  const parts = dmy.split("-").filter(Boolean);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return dateStr;
}

function getFallbackResults(dmy: string): DrawResult[] {
  const ymd = toYMD(dmy);
  const rows = SYNTHETIC_ARCHIVE[dmy] || SYNTHETIC_ARCHIVE["24-11-2026"] || SYNTHETIC_ARCHIVE["23-11-2026"];

  return DRAW_DEFINITIONS.map((def, i) => {
    const data = rows ? rows[i] : null;
    const p1 = data?.p1 ?? null;
    const p2 = data?.p2 ?? (p1 && p1.length >= 2 ? p1.slice(-2) : null);
    const drawNo = data?.drawNo ?? (426 + i);
    return {
      drawId: def.id,
      drawName: def.name,
      drawNumber: drawNo,
      date: dmy,
      isoDate: ymd,
      time: def.time,
      status: p1 ? ("published" as const) : ("awaiting" as const),
      prizes: makePrizes([p1, p2]),
    };
  });
}

// Parse Today's Results from result.php
function parseTodayResults(html: string): DrawResult[] {
  const extractedPrizes: { p1: string | null; p2: string | null; drawNo: number; date: string }[] = [];
  const panelRegex = /<div id="panel-(\d+)"[^>]*>([\s\S]*?)<\/div>/gi;
  let match;

  while ((match = panelRegex.exec(html)) !== null) {
    const content = match[2];
    const drawNoMatch = content.match(/DRAW NO\s*:\s*(\d+)/i);
    const dateMatch = content.match(/DRAW DATE ON\.\s*([0-9\-]+)/i);

    const p1Match = content.match(/1\s*ST PRIZE.*?<a[^>]*>([0-9]+)<\/a>/i);
    const p2Match = content.match(/2\s*ND PRIZE.*?<a[^>]*>([0-9]+)<\/a>/i);

    const p1 = p1Match ? p1Match[1].trim() : null;
    const p2 = p2Match ? p2Match[1].trim() : (p1 && p1.length >= 2 ? p1.slice(-2) : null);
    const drawNo = drawNoMatch ? parseInt(drawNoMatch[1], 10) : 0;
    const date = dateMatch ? dateMatch[1].trim() : "";

    extractedPrizes.push({ p1, p2, drawNo, date });
  }

  const todayDMY = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
  const todayYMD = toYMD(todayDMY);

  return DRAW_DEFINITIONS.map((def, i) => {
    const extracted = extractedPrizes[i];
    const p1 = extracted?.p1 ?? null;
    const p2 = extracted?.p2 ?? (p1 && p1.length >= 2 ? p1.slice(-2) : null);
    const drawNo = extracted?.drawNo || (420 + i);
    const date = extracted?.date || todayDMY;

    return {
      drawId: def.id,
      drawName: def.name,
      drawNumber: drawNo,
      date: date,
      isoDate: toYMD(date) || todayYMD,
      time: def.time,
      status: p1 ? "published" : "awaiting",
      prizes: makePrizes([p1, p2]),
    };
  });
}

// Parse Historical Results from filedownload.php POST response
function parseHistoryResults(html: string, reqDateDMY: string): DrawResult[] {
  const rowRegex = /<tr[^>]*>\s*<td[^>]*>(\d+)<\/td>\s*<td[^>]*>([0-9:]+)<\/td>\s*<td[^>]*>([0-9\-]*)<\/td>\s*<td[^>]*>([0-9\-]*)<\/td>/gi;
  const rows: { p1: string | null; p2: string | null }[] = [];
  let match;

  while ((match = rowRegex.exec(html)) !== null) {
    const p1Raw = match[3].trim();
    const p2Raw = match[4].trim();

    const p1 = p1Raw && p1Raw !== "-" ? p1Raw : null;
    let p2 = p2Raw && p2Raw !== "-" ? p2Raw : null;
    if (p1 && p1.length >= 2 && !p2) p2 = p1.slice(-2);

    rows.push({ p1, p2 });
  }

  return DRAW_DEFINITIONS.map((def, i) => {
    const row = rows[i];
    const p1 = row?.p1 ?? null;
    const p2 = row?.p2 ?? (p1 && p1.length >= 2 ? p1.slice(-2) : null);

    return {
      drawId: def.id,
      drawName: def.name,
      drawNumber: 0,
      date: reqDateDMY,
      isoDate: toYMD(reqDateDMY),
      time: def.time,
      status: p1 ? "published" : "awaiting",
      prizes: makePrizes([p1, p2]),
    };
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date"); // can be YYYY-MM-DD or DD-MM-YYYY
  const refreshParam = searchParams.get("refresh") === "true";
  const customSheet = searchParams.get("sheet");
  const sheetConfig = customSheet || process.env.GOOGLE_SHEET_ID || process.env.GOOGLE_SHEET_URL;

  // Determine target dates
  const todayDMY = new Date().toLocaleDateString("en-GB").replace(/\//g, "-");
  const targetDMY = dateParam ? toDMY(dateParam) : todayDMY;
  const targetYMD = toYMD(targetDMY);
  const cacheKey = `${sheetConfig ? "sheet_" : ""}${dateParam ? `hist_${targetDMY}` : `today_${todayDMY}`}`;

  // If client requested immediate refresh, clear cache
  if (refreshParam) {
    RUNTIME_CACHE.delete(cacheKey);
  } else {
    // Check in-memory runtime cache first (serves in <0.5ms on warm invocations)
    const cached = RUNTIME_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return NextResponse.json(cached.data, { headers: CACHE_HEADERS });
    }
  }

  // ── Priority 1: Google Sheets CMS Integration ──────────────────────────
  if (sheetConfig) {
    try {
      const isExplicitDate = Boolean(dateParam);
      // In-flight deduplication: collapse simultaneous concurrent requests into a single fetch
      let fetchPromise = IN_FLIGHT_REQUESTS.get(cacheKey);
      if (!fetchPromise) {
        fetchPromise = fetchGoogleSheetResults(sheetConfig, targetDMY, isExplicitDate);
        IN_FLIGHT_REQUESTS.set(cacheKey, fetchPromise);
      }

      const sheetData = await fetchPromise;
      IN_FLIGHT_REQUESTS.delete(cacheKey);

      if (sheetData && sheetData.success && sheetData.results && sheetData.results.length > 0 && sheetData.totalRecords > 0) {
        const effDMY = sheetData.effectiveDate || targetDMY;
        const effYMD = toYMD(effDMY);
        const payload = {
          success: true,
          source: "google_sheets",
          date: effDMY,
          isoDate: effYMD,
          results: sheetData.results,
          count: sheetData.results.length,
          totalRecords: sheetData.totalRecords,
        };
        RUNTIME_CACHE.set(cacheKey, { data: payload, timestamp: Date.now() });
        return NextResponse.json(payload, { headers: CACHE_HEADERS });
      }
    } catch (sheetErr) {
      IN_FLIGHT_REQUESTS.delete(cacheKey);
      console.warn("Google Sheet fetch error, falling back to backup sources:", sheetErr);
      // Graceful high-availability fallback to stale cache if available
      const stale = RUNTIME_CACHE.get(cacheKey);
      if (stale) {
        return NextResponse.json(stale.data, { headers: CACHE_HEADERS });
      }
    }
  }

  try {
    if (!dateParam) {
      // Live fetch with fast 2000ms timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch("https://luckylott.org/result.php", {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const html = await res.text();
        const results = parseTodayResults(html);

        if (results.length > 0) {
          const payload = {
            success: true,
            source: "live",
            date: results[0]?.date || targetDMY,
            isoDate: results[0]?.isoDate || targetYMD,
            results,
            count: results.length,
          };
          RUNTIME_CACHE.set(cacheKey, { data: payload, timestamp: Date.now() });
          return NextResponse.json(payload, { headers: CACHE_HEADERS });
        }
      }
    } else {
      // Historical request with fast 2000ms timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const bodyParams = new URLSearchParams();
      bodyParams.append("datepicker", targetDMY);
      bodyParams.append("Submit", "Result View");

      const res = await fetch("https://luckylott.org/filedownload.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        body: bodyParams.toString(),
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const html = await res.text();
        const results = parseHistoryResults(html, targetDMY);

        if (results.length > 0) {
          const payload = {
            success: true,
            source: "live_history",
            date: targetDMY,
            isoDate: targetYMD,
            results,
            count: results.length,
          };
          RUNTIME_CACHE.set(cacheKey, { data: payload, timestamp: Date.now() });
          return NextResponse.json(payload, { headers: CACHE_HEADERS });
        }
      }
    }
  } catch (err) {
    // Upstream timeout or offline — fall through to high-availability snapshot
  }

  // ── Priority 3: Hardcoded Synthetic & Historical Archive (01/10/26 to 24/11/26) ────
  if (SYNTHETIC_ARCHIVE[targetDMY]) {
    const results = getFallbackResults(targetDMY);
    const payload = {
      success: true,
      source: "synthetic_archive",
      date: targetDMY,
      isoDate: targetYMD,
      results,
      count: results.length,
    };
    RUNTIME_CACHE.set(cacheKey, { data: payload, timestamp: Date.now() });
    return NextResponse.json(payload, { headers: CACHE_HEADERS });
  }

  // If live feed requested without dateParam and upstream failed, serve today's synthetic feed
  if (!dateParam || targetDMY === todayDMY) {
    const results = getFallbackResults("24-11-2026");
    const payload = {
      success: true,
      source: "synthetic_today",
      date: targetDMY,
      isoDate: targetYMD,
      results,
      count: results.length,
    };
    RUNTIME_CACHE.set(cacheKey, { data: payload, timestamp: Date.now() });
    return NextResponse.json(payload, { headers: CACHE_HEADERS });
  }

  // If specific date not in archive and live query failed
  const emptyPayload = {
    success: true,
    source: "archive_miss",
    date: targetDMY,
    isoDate: targetYMD,
    results: [],
    count: 0,
  };
  return NextResponse.json(emptyPayload, { headers: CACHE_HEADERS });
}
