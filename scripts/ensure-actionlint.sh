#!/usr/bin/env bash
# Installs the pinned actionlint binary into .bin/ if it isn't there yet.
# Wraps the vendored, official download-actionlint.bash (rhysd/actionlint)
# so `bun run lint:actions` behaves identically locally and in CI.
set -euo pipefail

ACTIONLINT_VERSION="1.7.12"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN_DIR="$ROOT_DIR/.bin"
BIN="$BIN_DIR/actionlint"

if [ -x "$BIN" ] && "$BIN" -version | grep -q "^${ACTIONLINT_VERSION}$"; then
  exit 0
fi

mkdir -p "$BIN_DIR"
bash "$ROOT_DIR/scripts/download-actionlint.bash" "$ACTIONLINT_VERSION" "$BIN_DIR"
