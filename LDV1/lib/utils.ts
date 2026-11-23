// ---------------------------------------------------------------------------
// Diamond Lottery — Utility functions
// Shared helpers used across components.
// ---------------------------------------------------------------------------

import { type ClassValue, clsx } from "clsx";

/** Merge class names, filtering falsy values. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Format a 0-based index as a 2-digit display number: 0 → "01". */
export function padSequence(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/** Share a result using Web Share API with clipboard fallback. */
export async function shareResult(
  drawName: string,
  drawNumber: number,
  date: string,
  numbers: (string | null)[]
): Promise<"shared" | "copied" | "failed"> {
  const numbersText = numbers.every((n) => n != null)
    ? `1st: ${numbers[0]} | 2nd: ${numbers[1]} | 3rd: ${numbers[2]}`
    : "Result awaiting publication";

  const text = `${drawName} · Draw #${drawNumber} · ${date}\n${numbersText}`;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: `${drawName} result`, text });
      return "shared";
    } catch {
      return "failed";
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return "copied";
    } catch {
      return "failed";
    }
  }

  return "failed";
}
