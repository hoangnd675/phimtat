import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const extractorConfigured = Boolean(process.env.COBALT_INTERNAL_URL || process.env.COBALT_API_URL);
  const authConfigured = Boolean(process.env.API_TOKEN);
  return NextResponse.json({
    status: "ok",
    service: "universal-media-downloader",
    version: "1.0.0",
    extractorConfigured,
    authConfigured,
    ready: extractorConfigured && authConfigured,
  }, { status: 200, headers: { "Cache-Control": "no-store" } });
}
