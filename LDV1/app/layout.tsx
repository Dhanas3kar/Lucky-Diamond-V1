import type { Metadata, Viewport } from "next";
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
  title: "Lucky Diamond — Results, made clear",
  description:
    "Today's results, draw history, and draw schedule. Official results platform for Lucky Diamond.",
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
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
