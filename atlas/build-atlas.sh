#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="$ROOT/.atlas-build/source"
ARCHIVE="$ROOT/.atlas-build/upstream.tar.gz"
cd "$ROOT"
mkdir -p "$ROOT/.atlas-build"

# Only this generated build directory is replaced; never load provider settings.
rm -rf "$SOURCE"
mkdir -p "$SOURCE"
UPSTREAM_URL="$(node -e 'console.log(JSON.parse(require("fs").readFileSync("upstream-pin.json", "utf8")).archiveUrl)')"
curl --fail --location --retry 3 --silent --show-error "$UPSTREAM_URL" -o "$ARCHIVE"
node verify-artifact.mjs archive "$ARCHIVE"
tar -xzf "$ARCHIVE" --strip-components=1 \
  --exclude='*/.git*' --exclude='*/docs/*' --exclude='*/screenshots/*' \
  --exclude='*/test/*' --exclude='*/tests/*' --exclude='*/e2e/*' \
  --exclude='*/server/*' --exclude='*/dev/*' \
  -C "$SOURCE"
rm "$ARCHIVE"
node verify-artifact.mjs lock "$SOURCE/package-lock.json"
node verify-artifact.mjs branding "$ROOT/branding.patch"
node "$ROOT/apply-branding.mjs" "$SOURCE"
node "$ROOT/apply-hosted-scope.mjs" "$SOURCE"
node "$ROOT/test-hosted-boot.mjs" "$SOURCE"
node --test "$ROOT/../lib/atlas-voice/token.test.js"
cp "$ROOT/vite.visual.config.mjs" "$SOURCE/vite.visual.config.mjs"

(
  cd "$SOURCE"
  # The upstream install hooks and Puppeteer browser download are unnecessary.
  # Locked dependencies are installed without executing provider/setup scripts.
  PUPPETEER_SKIP_DOWNLOAD=1 npm ci --ignore-scripts --no-audit --no-fund
  node node_modules/vite/bin/vite.js build --config vite.visual.config.mjs
)

# The upstream Cesium plugin can log a copy failure but exit successfully.
# A separate byte comparison makes any incomplete output fail this build.
node verify-output.mjs "$SOURCE" "$SOURCE/dist"
rm -rf "$ROOT/dist"
mv "$SOURCE/dist" "$ROOT/dist"
echo 'Verified Atlas frontend is ready in dist/. No provider server was built or started.'
