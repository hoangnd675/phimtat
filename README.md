# Universal Media Downloader

A private iOS Share Sheet downloader built from a Next.js API gateway and a self-hosted Cobalt extractor.

## Features
- Share Sheet and clipboard URL intake.
- Video quality presets: 2160p, 1440p, 1080p, 720p, 480p, 360p.
- YouTube audio extraction to MP3 at 320 kbps (when the source provides it).
- Multi-image/media picker responses.
- Shortcut save flow for Photos or Files.
- Private resolver API protected by a bearer token.
- Separate Cobalt container protected by its own API key.

## Vercel projects
- Gateway: `universal-media-downloader-private` (Next.js, GitHub-linked).
- Extractor: `universal-media-downloader-extractor` (Cobalt container, repository root directory `extractor`).

## Environment variables

Gateway project:
- `API_TOKEN`: secret bearer token used by the iOS Shortcut.
- `COBALT_API_URL`: public base URL of the dedicated extractor project.
- `COBALT_API_KEY`: secret UUIDv4 API key shared with the extractor.

Extractor project:
- `API_URL`: its public base URL, including trailing slash.
- `COBALT_API_KEY`: same UUIDv4 key as the gateway.

The extractor generates its `keys.json` file at container startup from the secret environment variable. No API key is committed to the repository. The extractor requires API-key authentication.

## API
`POST /api/resolve` with `Authorization: Bearer <API_TOKEN>` and JSON:
- Video: `{"url":"https://...","mode":"video","quality":"1080"}`
- Audio: `{"url":"https://youtube.com/watch?v=...","mode":"audio"}`
- Images: `{"url":"https://...","mode":"image"}`

The response is either `{"status":"ready","downloadUrl":"https://..."}` or `{"status":"picker","items":[...]}`.

## Shortcut flow
1. Receive URL from Share Sheet; if empty, read Clipboard.
2. Ask for Video / Audio / Images.
3. Ask for quality when Video is selected.
4. POST to the gateway `/api/resolve` with the bearer token.
5. If the response is `picker`, choose one item; otherwise use `downloadUrl`.
6. Ask save destination: Photos or Files; save MP3 to Files.

## Notes
- Source availability varies; login-only, private, DRM-protected, region-restricted, or removed content may not be available.
- Respect copyright and platform terms.
- An iCloud Shortcut share link must be exported from Apple Shortcuts on an Apple device. The server cannot create an iCloud share URL on its own.
