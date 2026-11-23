// ---------------------------------------------------------------------------
// LUMA — Data models
// Structured types for draws, results, prize categories, downloads, and
// notification preferences. These types form the data layer that every UI
// component consumes. They are intentionally decoupled from any backend so
// Phase 2 / Phase 3 can plug in a real API without touching the UI.
// ---------------------------------------------------------------------------

/** Prize category within a single draw result. */
export type PrizeCategory = {
  /** Label shown to visitors, e.g. "1ST PRIZE" */
  label: string;
  /** Display name for the prize tier */
  displayName: string;
  /** Prize amount formatted for display, e.g. "₹28,000" */
  amount: string;
  /** Winning number — `null` when the result has not been published yet */
  number: string | null;
};

/** Publication status of a draw result. */
export type PublicationStatus = "published" | "awaiting";

/** A single draw definition (identity + schedule). */
export type Draw = {
  /** Unique slug, e.g. "LUCKYWIN" */
  id: string;
  /** Display name */
  name: string;
  /** Scheduled daily time, e.g. "11:00 AM" */
  time: string;
  /** Chronological sequence (1‑based) */
  sequence: number;
};

/** A draw result — one per draw per day. */
export type DrawResult = {
  /** References `Draw.id` */
  drawId: string;
  /** Draw name (denormalised for convenience) */
  drawName: string;
  /** Incrementing draw number */
  drawNumber: number;
  /** Result date formatted as DD-MM-YYYY */
  date: string;
  /** ISO date string YYYY-MM-DD for programmatic use */
  isoDate: string;
  /** Scheduled time of the draw */
  time: string;
  /** Whether this result has been officially published */
  status: PublicationStatus;
  /** Ordered prize categories (1st, 2nd, 3rd …) */
  prizes: PrizeCategory[];
};

/** Downloadable result file entry. */
export type DownloadEntry = {
  drawId: string;
  drawName: string;
  drawNumber: number;
  date: string;
  isoDate: string;
  /** Whether an official file (e.g. PDF) is available for download */
  fileAvailable: boolean;
  /** Optional URL or path — `null` when no file exists */
  fileUrl: string | null;
  /** Human‑readable file status label */
  statusLabel: string;
};

/** Visitor notification preferences (stored locally in Phase 1). */
export type NotificationPreferences = {
  /** Notify when any new result is published */
  newResult: boolean;
  /** Notify for specific selected draws */
  selectedDraws: boolean;
  /** Remind before scheduled draw times */
  drawReminders: boolean;
};

/** Navigation item definition. */
export type NavItem = {
  id: string;
  label: string;
  hint: string;
  icon: string; // Lucide icon name
};
