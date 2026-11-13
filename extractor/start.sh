#!/bin/sh
set -eu

node -e '
const fs = require("node:fs");
const key = process.env.COBALT_API_KEY;
if (!key) throw new Error("COBALT_API_KEY is required");
const keys = {
  [key]: {
    name: "Universal Media Downloader Gateway",
    limit: "unlimited",
    allowedServices: "all"
  }
};
fs.writeFileSync("/app/keys.json", JSON.stringify(keys), { mode: 0o600 });
'

exec "$@"
