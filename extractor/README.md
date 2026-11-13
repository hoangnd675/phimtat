# Cobalt extractor service

This directory is deployed as a standalone Vercel Container Function from `Dockerfile.vercel`.

## Runtime secrets
Configure these in the Vercel project `universal-media-downloader-extractor`:
- `API_URL`: the stable public URL of this extractor, with a trailing slash.
- `COBALT_API_KEY`: UUIDv4 API key shared only with the Next.js gateway.

At startup, `start.sh` writes the Cobalt key database to `/app/keys.json` with restrictive permissions and then starts the official Cobalt process. The key database is generated at runtime and is not committed to Git.

Cobalt API authentication is mandatory (`API_AUTH_REQUIRED=1`). The gateway sends `Authorization: Api-Key <COBALT_API_KEY>`.

The Cobalt service must be deployed at its stable project domain because Cobalt uses `API_URL` to create temporary download tunnel URLs.
