import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  // Only expose short-lived Cobalt download tunnels; keep the resolver API private.
  if (path.length !== 1 || path[0] !== "tunnel") return NextResponse.json({ error: "not_found" }, { status: 404 });
  const internal = process.env.COBALT_INTERNAL_URL;
  if (!internal) return NextResponse.json({ error: "extractor_not_configured" }, { status: 503 });
  try {
    const base = internal.endsWith("/") ? internal : internal + "/";
    const target = new URL("tunnel" + req.nextUrl.search, base);
    const headers = new Headers();
    const range = req.headers.get("range");
    if (range) headers.set("range", range);
    const upstream = await fetch(target, { method: "GET", headers, cache: "no-store", redirect: "follow" });
    const responseHeaders = new Headers();
    for (const key of ["content-type", "content-length", "content-disposition", "accept-ranges", "content-range", "cache-control"]) {
      const value = upstream.headers.get(key);
      if (value) responseHeaders.set(key, value);
    }
    responseHeaders.set("Cache-Control", "private, no-store");
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return NextResponse.json({ error: "tunnel_unavailable" }, { status: 502 });
  }
}
