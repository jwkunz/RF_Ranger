#!/usr/bin/env bash
set -euo pipefail

if [[ -n "${1:-}" ]]; then
  VERSION="$1"
elif [[ -n "${GITHUB_REF_NAME:-}" ]]; then
  VERSION="${GITHUB_REF_NAME#v}"
else
  VERSION="$(cat VERSION)"
fi

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid version format: $VERSION"
  exit 1
fi

ARTIFACT_NAME="rf-ranger-v${VERSION}"
WORK_DIR="build/${ARTIFACT_NAME}"
ZIP_PATH="build/${ARTIFACT_NAME}.zip"

rm -rf build
mkdir -p "$WORK_DIR"

npm ci
npm run build

cp -r dist/* "$WORK_DIR/"
cp VERSION "$WORK_DIR/VERSION"
cp docs/LEGAL.md "$WORK_DIR/LEGAL.md"
cp docs/Manual.md "$WORK_DIR/Manual.md"
if [[ -f scripts/keys/license-public.spki.base64url.txt ]] || [[ -f scripts/keys/license-private.pkcs8.pem ]]; then
  mkdir -p "$WORK_DIR/license-keys"
  [[ -f scripts/keys/license-public.spki.base64url.txt ]] && cp scripts/keys/license-public.spki.base64url.txt "$WORK_DIR/license-keys/"
  [[ -f scripts/keys/license-private.pkcs8.pem ]] && cp scripts/keys/license-private.pkcs8.pem "$WORK_DIR/license-keys/"
fi

(
  cd build
  zip -r "${ARTIFACT_NAME}.zip" "${ARTIFACT_NAME}" >/dev/null
)

echo "Built release artifact: ${ZIP_PATH}"
