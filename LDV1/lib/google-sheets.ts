// ---------------------------------------------------------------------------
// Lucky Diamond — Google Sheets Data Provider & Live Parser
// Allows clients to update daily winners directly in Google Sheets and publish
// instantly to the website with auto-normalization, derivation, and caching.
// ---------------------------------------------------------------------------

import type { DrawResult, PrizeCategory } from "@/lib/types";

export const DRAW_DEFINITIONS = [
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

// Convert YYYY-MM-DD, DD/MM/YYYY, DD.MM.YYYY, DD/MM/.YYYY to DD-MM-YYYY
export function normalizeToDMY(dateStr: string): string {
  if (!dateStr) return "";
  const cleaned = dateStr.trim().replace(/\s+/g, "").replace(/[\/\.]+/g, "-");
  const parts = cleaned.split("-").filter(Boolean);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    if (d.length === 4) {
      return `${y.padStart(2, "0")}-${m.padStart(2, "0")}-${d}`;
    }
    return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y}`;
  }
  return dateStr.trim();
}

// Convert DD-MM-YYYY to YYYY-MM-DD
export function normalizeToYMD(dateStr: string): string {
  if (!dateStr) return "";
  const dmy = normalizeToDMY(dateStr);
  const parts = dmy.split("-").filter(Boolean);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return dmy;
}

/**
 * Parses CSV text safely handling quotes and commas.
 */
function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

export interface SheetRowRecord {
  date: string;
  isoDate: string;
  drawId: string;
  drawName: string;
  drawNumber: number;
  time: string;
  p1: string | null;
  p2: string | null;
  status: "published" | "awaiting";
}

function matchDrawDef(rawName: string, rawTime: string, rowIndex: number) {
  const normTime = rawTime ? rawTime.toLowerCase().replace(/[\.\s]/g, ":") : "";

  if (normTime) {
    if (normTime.includes("11:10") || normTime.includes("1110")) return DRAW_DEFINITIONS[0];
    if (normTime.includes("12:10") || normTime.includes("1210")) return DRAW_DEFINITIONS[1];
    if (normTime.includes("1:10") || normTime.includes("01:10") || normTime.includes("13:10")) return DRAW_DEFINITIONS[2];
    if (normTime.includes("6:10") || normTime.includes("06:10") || normTime.includes("18:10")) return DRAW_DEFINITIONS[3];
    if (normTime.includes("7:10") || normTime.includes("07:10") || normTime.includes("19:10")) return DRAW_DEFINITIONS[4];
    if (normTime.includes("8:10") || normTime.includes("08:10") || normTime.includes("20:10")) return DRAW_DEFINITIONS[5];
  }

  const normName = (rawName || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  const byId = DRAW_DEFINITIONS.find((d) => d.id === normName);
  if (byId) return byId;

  return DRAW_DEFINITIONS[rowIndex % DRAW_DEFINITIONS.length];
}

/**
 * Maps raw sheet rows to normalized draw results.
 * Matches column headers flexibly so client typos won't break publishing.
 */
export function parseSheetData(csvText: string): SheetRowRecord[] {
  const rows = parseCSV(csvText);
  if (rows.length < 2) return [];

  // Header indexing
  const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const dateIdx = headers.findIndex((h) => h.includes("date"));
  const drawNameIdx = headers.findIndex((h) => h.includes("draw") && (h.includes("name") || (!h.includes("no") && !h.includes("num"))));
  const drawNoIdx = headers.findIndex((h) => h.includes("drawno") || h.includes("drawnum") || h.includes("number"));
  const timeIdx = headers.findIndex((h) => h.includes("time"));
  const p1Idx = headers.findIndex((h) => h.includes("1st") || h.includes("first") || h === "p1" || h === "prize1");
  const p2Idx = headers.findIndex((h) => h.includes("2nd") || h.includes("second") || h === "p2" || h === "prize2");
  const statusIdx = headers.findIndex((h) => h.includes("status"));

  const records: SheetRowRecord[] = [];
  let lastSeenDate = "";

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || !row.some((c) => c && c.trim().length > 0)) continue;

    const rawDate = dateIdx !== -1 ? row[dateIdx] : "";
    if (rawDate && rawDate.trim()) {
      lastSeenDate = normalizeToDMY(rawDate);
    }

    const dmy = lastSeenDate;
    if (!dmy) continue;
    const ymd = normalizeToYMD(dmy);

    const rawDrawName = drawNameIdx !== -1 ? row[drawNameIdx] : "";
    const rawTime = timeIdx !== -1 ? row[timeIdx] : "";
    const p1Raw = p1Idx !== -1 ? row[p1Idx] : "";

    // Skip empty filler rows that have date only but no draw name, time, or prize
    if (!rawDrawName && !rawTime && !p1Raw) continue;

    const drawDef = matchDrawDef(rawDrawName, rawTime, r - 1);
    const rawDrawNo = drawNoIdx !== -1 ? row[drawNoIdx] : "";
    const drawNo = parseInt(rawDrawNo.replace(/\D/g, ""), 10) || 0;

    const time = rawTime ? rawTime.trim() : drawDef.time;

    const cleanPrize = (val: string | null): string | null => {
      if (!val) return null;
      const v = val.trim();
      if (v === "" || v === "-" || /await/i.test(v) || /pend/i.test(v) || isNaN(Number(v))) {
        return null;
      }
      return v;
    };

    // Prizes (only 2 prizes)
    let p1 = cleanPrize(p1Idx !== -1 ? row[p1Idx] : null);
    let p2 = cleanPrize(p2Idx !== -1 ? row[p2Idx] : null);

    // Auto-derive 2nd prize if client only entered 1st prize
    if (p1 && !p2) {
      if (p1.length >= 2) {
        p2 = p1.slice(-2);
      } else if (p1.length === 1) {
        p2 = p1.padStart(2, "0");
      }
    }

    const rawStatus = statusIdx !== -1 ? (row[statusIdx] || "").toLowerCase() : "";
    const status: "published" | "awaiting" =
      rawStatus.includes("publish") || (p1 !== null && !rawStatus.includes("await"))
        ? "published"
        : "awaiting";

    records.push({
      date: dmy,
      isoDate: ymd,
      drawId: drawDef.id,
      drawName: drawDef.name,
      drawNumber: drawNo,
      time,
      p1,
      p2,
      status,
    });
  }

  return records;
}

/**
 * Converts parsed records into the full 6-draw daily result list for a specific date.
 * If targetDMY has no published records, smartly falls back to the latest date that HAS published records,
 * unless isExplicitDate is true (which means user specifically navigated to a historical date in the Archive).
 */
export function buildDrawResultsForDate(
  records: SheetRowRecord[],
  targetDMY: string,
  isExplicitDate: boolean = false
): { results: DrawResult[]; effectiveDate: string } {
  let activeDMY = targetDMY;
  let dateRecords = records.filter((r) => r.date === activeDMY);
  const hasExactRecords = dateRecords.length > 0 && dateRecords.some((r) => r.status === "published");

  // If user explicitly queried a historical date, and the sheet has no published records for that date:
  if (isExplicitDate && !hasExactRecords) {
    return { results: [], effectiveDate: targetDMY };
  }

  // If no published records found for targetDMY (e.g. today's live feed before first draw):
  if (dateRecords.length === 0 || dateRecords.every((r) => r.status === "awaiting")) {
    const publishedRecords = records.filter((r) => r.status === "published");
    if (publishedRecords.length > 0) {
      const latestDate = publishedRecords[publishedRecords.length - 1].date;
      const fallbackRecords = records.filter((r) => r.date === latestDate);
      if (fallbackRecords.length > 0) {
        dateRecords = fallbackRecords;
        activeDMY = latestDate;
      }
    }
  }

  const targetYMD = normalizeToYMD(activeDMY);

  const results = DRAW_DEFINITIONS.map((def) => {
    const found = dateRecords.find((r) => r.drawId === def.id);

    if (found) {
      return {
        drawId: def.id,
        drawName: def.name,
        drawNumber: found.drawNumber,
        date: activeDMY,
        isoDate: targetYMD,
        time: found.time || def.time,
        status: found.status,
        prizes: makePrizes([found.p1, found.p2]),
      };
    }

    // Default awaiting slot if row not yet published
    return {
      drawId: def.id,
      drawName: def.name,
      drawNumber: 0,
      date: activeDMY,
      isoDate: targetYMD,
      time: def.time,
      status: "awaiting" as const,
      prizes: makePrizes([null, null]),
    };
  });

  return { results, effectiveDate: activeDMY };
}

export interface SheetFetchResult {
  success: boolean;
  status: "success" | "empty" | "auth_required" | "network_error" | "not_found";
  results: DrawResult[];
  totalRecords: number;
  effectiveDate?: string;
  message?: string;
}

/**
 * Fetch and parse a public Google Sheet as CSV directly from Google's real-time export endpoint.
 */
export async function fetchGoogleSheetResults(
  sheetIdOrUrl: string,
  targetDMY: string,
  isExplicitDate: boolean = false
): Promise<SheetFetchResult> {
  if (!sheetIdOrUrl) {
    return {
      success: false,
      status: "not_found",
      results: [],
      totalRecords: 0,
      message: "No sheet ID or URL provided",
    };
  }

  const raw = sheetIdOrUrl.trim();
  const idMatch = raw.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const sheetId = idMatch ? idMatch[1] : raw.replace(/^https?:\/\/[^\/]+\//, "").split("/")[0].trim();

  // Direct export URL with dynamic timestamp to completely bypass Google CDN cache
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&id=${sheetId}&t=${Date.now()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/csv,text/plain,*/*",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    if (res.status === 404) {
      return {
        success: false,
        status: "not_found",
        results: [],
        totalRecords: 0,
        message: "Google Sheet not found. Please verify the Sheet ID.",
      };
    }

    if (!res.ok) {
      return {
        success: false,
        status: "network_error",
        results: [],
        totalRecords: 0,
        message: `Google Sheets returned HTTP ${res.status}`,
      };
    }

    const csvText = await res.text();

    // Check if Google redirected to login HTML
    if (csvText.includes("<!DOCTYPE html>") && (csvText.includes("Sign in") || csvText.includes("ServiceLogin"))) {
      return {
        success: false,
        status: "auth_required",
        results: [],
        totalRecords: 0,
        message: "Google Sheet requires authentication. Set sharing to 'Anyone with the link can view'.",
      };
    }

    // Check if sheet is empty
    if (!csvText || csvText.trim().length === 0) {
      return {
        success: true,
        status: "empty",
        results: [],
        totalRecords: 0,
        message: "Connected to Google Sheet successfully! The sheet is currently empty. Add your draw rows to publish results.",
      };
    }

    const records = parseSheetData(csvText);
    if (records.length === 0) {
      return {
        success: true,
        status: "empty",
        results: [],
        totalRecords: 0,
        message: "Connected to Google Sheet successfully! No valid data rows found. Ensure row 1 has the column headers.",
      };
    }

    const { results, effectiveDate } = buildDrawResultsForDate(records, targetDMY, isExplicitDate);

    return {
      success: true,
      status: "success",
      results,
      totalRecords: records.length,
      effectiveDate,
      message: `Synchronized ${records.length} records successfully.`,
    };
  } catch (err: any) {
    console.warn("Failed to fetch Google Sheet results:", err);
    return {
      success: false,
      status: "network_error",
      results: [],
      totalRecords: 0,
      message: err?.message || "Failed to reach Google Sheets.",
    };
  }
}
