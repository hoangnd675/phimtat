# Universal Media Downloader

Private iOS Share Sheet downloader backed by a Next.js API gateway and a private Cobalt processing service on Vercel Services.

## Features
- Share Sheet / clipboard URL input (implemented in the iOS Shortcut).
- Video quality selection: 2160p, 1440p, 1080p, 720p, 480p, 360p.
- YouTube audio extraction to MP3 (320 kbps requested from Cobalt).
- Multi-image/media picker responses.
- Save to Photos or Files from the iOS Shortcut.
- Private resolver endpoint protected by a bearer token.
- Cobalt extractor is an internal Vercel Service; only short-lived `/api/cobalt/tunnel` downloads are publicly routed.

## Vercel environment
- `API_TOKEN`: secret bearer token for the Shortcut.
- `API_URL`: public tunnel base URL, e.g. `https://universal-media-downloader-hoangnd675.vercel.app/api/cobalt/`.
- `COBALT_API_KEY`: optional if the internal Cobalt service is configured with API-key authentication. The default service binding is private.

The extractor is deployed from `extractor/Dockerfile.vercel` using the official `ghcr.io/imputnet/cobalt:11` image. The app calls it through the private `COBALT_INTERNAL_URL` service binding. The public proxy only permits the Cobalt `tunnel` endpoint, so the processing API itself is not exposed.

## API
`POST /api/resolve` with `Authorization: Bearer <API_TOKEN>` and JSON:
- Video: `{"url":"https://...","mode":"video","quality":"1080"}`
- Audio: `{"url":"https://youtube.com/watch?v=...","mode":"audio"}`
- Images: `{"url":"https://...","mode":"image"}`

The response is either `{"status":"ready","downloadUrl":"https://..."}` or `{"status":"picker","items":[...]}`.

## iOS Shortcut
1. Accept URL input from Share Sheet; otherwise use Clipboard.
2. Ask for Video / Audio / Images.
3. Ask for quality when Video is selected.
4. POST to `/api/resolve` with the bearer token.
5. If `status=picker`, ask which item to download; otherwise use `downloadUrl`.
6. Ask save destination: Photos or Files; save MP3 to Files.

## Notes
- Source availability varies. Some links may require login or be blocked by platform restrictions.
- Do not use this tool to bypass DRM or access private content without authorization.
- iCloud Shortcut sharing requires exporting the shortcut from Apple Shortcuts on an Apple device; the backend cannot create an iCloud share URL on its own.


## Deployment

Production Vercel project: `universal-media-downloader-private` (GitHub-linked deployment). Keep `API_TOKEN` and other credentials in Vercel Environment Variables only; never commit them.
