// ---------------------------------------------------------------------------
// LUMA — Footer component
// ---------------------------------------------------------------------------
"use client";

import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-luma-line py-[22px] flex justify-between items-center text-luma-muted text-xs flex-wrap gap-2.5 print:hidden">
      <span>© 2026 Lucky Diamond</span>
      <span>Results, made clear.</span>
      <button
        className="flex items-center gap-1 bg-transparent border-0 text-luma-muted text-xs hover:text-luma-text transition-colors"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Back to top
        <ArrowUpRight size={13} />
      </button>
    </footer>
  );
}
