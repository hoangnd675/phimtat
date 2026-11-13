import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const configured = Boolean(process.env.API_TOKEN && process.env.COBALT_API_URL);
  return NextResponse.json({ status: "ok", service: "universal-media-downloader", version: "1.0.0", extractorConfigured: Boolean(process.env.COBALT_API_URL), authConfigured: Boolean(process.env.API_TOKEN), ready: configured }, { status: 200 });
}
