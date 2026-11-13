import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const endpoint = process.env.COBALT_API_URL;
  const authConfigured = Boolean(process.env.API_TOKEN);
  let extractorReachable = false;
  let extractorStatus: number | null = null;

  if (endpoint) {
    try {
      const response = await fetch(endpoint, { method: "GET", cache: "no-store", signal: AbortSignal.timeout(5000) });
      extractorStatus = response.status;
      if (response.ok) {
        const info = await response.json().catch(() => null) as Record<string, any> | null;
        extractorReachable = Boolean(info?.cobalt);
      }
    } catch {
      extractorReachable = false;
    }
  }

  const extractorConfigured = Boolean(endpoint && process.env.COBALT_API_KEY);
  return NextResponse.json({
    status: "ok",
    service: "universal-media-downloader",
    version: "1.0.0",
    extractorConfigured,
    extractorReachable,
    extractorStatus,
    authConfigured,
    ready: extractorConfigured && extractorReachable && authConfigured,
  }, { status: 200, headers: { "Cache-Control": "no-store" } });
}
