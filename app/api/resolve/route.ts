import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

type Mode = "video" | "audio" | "image";
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

function authorized(req: NextRequest): boolean {
  const expected = process.env.API_TOKEN;
  const supplied = req.headers.get("authorization")?.replace(/^Bearer\\s+/i, "") ?? "";
  if (!expected || !supplied || supplied.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ supplied.charCodeAt(i);
  return mismatch === 0;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return json({ error: "unauthorized", message: "Missing or invalid API token." }, 401);
  const endpoint = process.env.COBALT_INTERNAL_URL ?? process.env.COBALT_API_URL;
  if (!endpoint) return json({ error: "extractor_not_configured", message: "The private Cobalt extractor service is not connected yet." }, 503);

  let body: { url?: string; mode?: Mode; quality?: string };
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  const inputUrl = body.url?.trim();
  if (!inputUrl || inputUrl.length > 4096) return json({ error: "invalid_url", message: "Provide a media URL." }, 400);
  let parsed: URL;
  try { parsed = new URL(inputUrl); } catch { return json({ error: "invalid_url" }, 400); }
  if (!["http:", "https:"].includes(parsed.protocol)) return json({ error: "invalid_url_protocol" }, 400);

  const mode: Mode = body.mode === "audio" || body.mode === "image" ? body.mode : "video";
  const allowedQualities = new Set(["2160", "1440", "1080", "720", "480", "360"]);
  const quality = allowedQualities.has(body.quality ?? "") ? body.quality! : "1080";
  const payload: Record<string, unknown> = { url: inputUrl, downloadMode: mode === "audio" ? "audio" : "auto", filenameStyle: "basic" };
  if (mode === "audio") { payload.audioFormat = "mp3"; payload.audioBitrate = "320"; }
  if (mode === "video") payload.videoQuality = quality;

  try {
    const headers: Record<string, string> = { "Accept": "application/json", "Content-Type": "application/json" };
    if (process.env.COBALT_API_KEY) headers.Authorization = `Api-Key ${process.env.COBALT_API_KEY}`;
    const upstream = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(payload), signal: AbortSignal.timeout(50000), cache: "no-store" });
    const data = await upstream.json().catch(() => null) as Record<string, any> | null;
    if (!upstream.ok) return json({ error: "extractor_error", status: upstream.status, detail: data?.error?.code ?? data?.text ?? "Extractor request failed." }, 502);
    if (!data) return json({ error: "invalid_extractor_response" }, 502);
    if (data.status === "error") return json({ error: "media_unavailable", detail: data.error?.code ?? data.text ?? "The source could not be processed." }, 422);
    if (data.status === "picker" && Array.isArray(data.picker)) {
      const items = data.picker.filter((x: any) => typeof x?.url === "string" && /^https:\\/\\//i.test(x.url)).map((x: any, i: number) => ({ label: x.type === "photo" ? `Image ${i + 1}` : `Media ${i + 1}`, url: x.url, type: x.type ?? "media", thumbnail: x.thumb ?? null }));
      return json({ status: "picker", title: data.filename ?? "media", items });
    }
    const resultUrl = typeof data.url === "string" ? data.url : null;
    if (!resultUrl || !/^https:\\/\\//i.test(resultUrl)) return json({ error: "no_download_url", detail: "Extractor did not return a secure HTTPS media URL." }, 502);
    return json({ status: "ready", title: data.filename ?? "media", mode, quality: mode === "video" ? quality : undefined, downloadUrl: resultUrl, expires: data.expires ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upstream error";
    return json({ error: "extractor_unreachable", detail: message }, 502);
  }
}
