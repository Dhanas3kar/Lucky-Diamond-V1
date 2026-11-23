import { NextResponse } from "next/server";
import { DRAWS } from "@/lib/data";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      draws: DRAWS,
    },
    { headers: CACHE_HEADERS }
  );
}
