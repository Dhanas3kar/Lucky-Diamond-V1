/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output is enabled when building for Docker/container deployments
  // (e.g. STANDALONE=1). For Vercel/Netlify, standard output is auto-optimized.
  output: process.env.STANDALONE ? "standalone" : undefined,
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
