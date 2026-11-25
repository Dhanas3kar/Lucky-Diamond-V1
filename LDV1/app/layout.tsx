import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6f4" },
    { media: "(prefers-color-scheme: dark)", color: "#111210" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "LuckyDiamond.in",
  description:
    "Today's results, draw history, and draw schedule. Official results platform for Lucky Diamond.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  keywords: [
    "Lucky Diamond",
    "Diamond Lottery",
    "results",
    "draw results",
    "LUCKYWIN",
    "LUCKYGOLD",
    "LUCKYDIAMOND",
    "LUCKYJACKPOT",
    "LUCKYQUEEN",
    "LUCKYRANGEELA",
    "LUCKYBHAGYA",
  ],
  openGraph: {
    title: "Lucky Diamond — Results, made clear",
    description: "Every draw. Every update. One clear place to check.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-body antialiased bg-[#030712] text-luma-text min-h-screen relative overflow-x-hidden">
        {/* Fullscreen Fixed Wallpaper — always visible at every scroll position with zero jitter */}
        <div aria-hidden="true" className="fixed-bg-wallpaper print:hidden" />
        <div className="relative z-[1] flex flex-col min-h-screen">
          {children}
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
