#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPLING_DIR="$ROOT_DIR/appling"
cd "$APPLING_DIR"

if [[ ! -d "$APPLING_DIR/node_modules" ]]; then
  echo "==> Installing appling dependencies"
  npm install
fi

# Choose build flavor: app.cjs | app.staging.cjs | app.dev.cjs
APP_FILE="${APP_FILE:-app.dev.cjs}"
APP_ENTRY="$APPLING_DIR/$APP_FILE"

if [[ ! -f "$APP_ENTRY" ]]; then
  echo "ERROR: App entry file not found: $APP_ENTRY"
  exit 1
fi

echo "==> Building macOS .app (arm64) with ${APP_FILE}"
"$ROOT_DIR/node_modules/.bin/bare-build" \
  --identifier "com.pears.pass" \
  --host=darwin-arm64 \
  --icon lib/icons/darwin/icon.png \
  "$APP_ENTRY"

echo "==> Locating generated .app"
APP_PATH="$(find "$ROOT_DIR" -type d -name "*.app" -not -path "*/node_modules/*" | head -n 1)"
if [[ -z "${APP_PATH}" ]]; then
  echo "ERROR: No .app found after build"
  exit 1
fi
echo "Found app: $APP_PATH"

echo "==> Creating DMG"
"$ROOT_DIR/node_modules/.bin/create-dmg" --no-version-in-filename --no-code-sign "$APP_PATH"

echo "==> Renaming DMG to CI-like name"
VERSION="$(node -p "require('$ROOT_DIR/package.json').version")"
RAW_DMG="$(find . -maxdepth 1 -type f -name "*.dmg" | head -n 1)"
if [[ -z "${RAW_DMG}" ]]; then
  echo "ERROR: No .dmg found after create-dmg"
  exit 1
fi

OUT_DMG="PearPass-Desktop-MacOS-arm64-v${VERSION}.dmg"
mv "$RAW_DMG" "$OUT_DMG"

echo "Done"
echo "DMG: $PWD/$OUT_DMG"
