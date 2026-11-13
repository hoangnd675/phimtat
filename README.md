# Universal Media Downloader API

Private API backend for an iOS Share Sheet shortcut. This project is a resolver/proxy layer; it does not scrape social platforms itself. Media extraction is delegated to a self-hosted Cobalt-compatible service.

## Features
- POST `/api/resolve`: resolve a supported media URL to a secure HTTPS download URL.
- Video quality presets: 2160p, 1440p, 1080p, 720p, 480p, 360p.
- Audio mode: requests MP3 at 192 kbps from the extractor.
- Picker responses: normalizes multi-item photo/media responses.
- Bearer-token authentication and no-store responses.
- GET `/api/health`: deployment/configuration status (does not expose secrets).

## Required environment variables
- `API_TOKEN`: long random secret used by the iOS Shortcut as `Authorization: Bearer <token>`.
- `COBALT_API_URL`: URL of your own Cobalt-compatible API endpoint (for example, a self-hosted instance endpoint). Do not use an untrusted public instance for private media.
- `COBALT_API_KEY`: optional upstream API key, sent as `Authorization: Api-Key ...`.

Do not commit secrets to GitHub. Configure them in Vercel Project → Settings → Environment Variables, then redeploy.

## API

`POST /api/resolve`

Headers:
```
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json
```

Video:
```json
{ "url": "https://example.com/video", "mode": "video", "quality": "1080" }
```

YouTube audio:
```json
{ "url": "https://www.youtube.com/watch?v=...", "mode": "audio" }
```

Image/multi-item:
```json
{ "url": "https://example.com/post", "mode": "image" }
```

Successful single-item response:
```json
{ "status": "ready", "title": "media", "mode": "video", "quality": "1080", "downloadUrl": "https://..." }
```

Multi-item response:
```json
{ "status": "picker", "title": "media", "items": [{ "label": "Image 1", "url": "https://...", "type": "photo" }] }
```

## iOS Shortcut flow
1. Accept URLs from Share Sheet; if input is empty, get Clipboard.
2. Ask for mode: Video / Audio / Images.
3. Ask for quality for video.
4. Get Contents of URL → POST `https://YOUR-DEPLOYMENT/api/resolve` with the JSON body above and Bearer token header.
5. If `status=picker`, choose an item; otherwise use `downloadUrl`.
6. Ask where to save: Photos or Files. Use Save to Photo Album for image/video; Save File for audio/other files.
7. For YouTube audio, save the returned MP3 to Files.

## Important limitations
- The extractor must be deployed and configured separately. Vercel hosts the private API gateway, not the media extraction engine.
- Source sites can change their protections at any time. Some content may require public access or be unavailable due to region, login, DRM, age restrictions, or platform terms.
- Respect copyright, privacy, and each platform's terms. This tool is not intended to bypass DRM or access private content.
- An iCloud Shortcut share link can only be created by exporting the shortcut from Apple Shortcuts on an Apple device. This repository provides the API and implementation contract; it cannot mint an iCloud link on your behalf.
