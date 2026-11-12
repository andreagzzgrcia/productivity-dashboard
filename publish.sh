#!/usr/bin/env bash
# Deploy the Productivity Dashboard to your Cloudflare Worker (Wrangler).
# Requires a local wrangler login, a filled-in wrangler.toml (from the example),
# and a `.secret` file with the private URL path (chmod 600).
# Never commit `.secret` or wrangler.toml.
set -euo pipefail
cd "$(dirname "$0")"
if [[ ! -f .secret ]]; then
  echo "ERROR: missing .secret (the private URL path). Create it with a long random string and chmod 600." >&2
  exit 2
fi
if [[ ! -f wrangler.toml ]]; then
  echo "ERROR: missing wrangler.toml. Copy wrangler.toml.example and fill in your KV namespace id." >&2
  exit 2
fi
wrangler deploy
# If the Worker secret SECRET is not set yet:
#   wrangler secret put SECRET < .secret
