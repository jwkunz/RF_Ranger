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
VERSION_TAG="${VERSION//./_}"
HTML_PATH="build/RF_Ranger_v${VERSION_TAG}_single_file.html"

rm -rf build
mkdir -p build

npm ci
npm run build

python3 - "$PWD" "$HTML_PATH" <<'PY'
import base64
import mimetypes
import pathlib
import sys

root = pathlib.Path(sys.argv[1])
output = pathlib.Path(sys.argv[2])
html = (root / "dist" / "index.html").read_text(encoding="utf-8")
logo = root / "RF_Ranger.png"
mime_type, _ = mimetypes.guess_type(logo.name)
mime_type = mime_type or "application/octet-stream"
encoded = base64.b64encode(logo.read_bytes()).decode("ascii")
data_url = f"data:{mime_type};base64,{encoded}"
html = html.replace('/RF_Ranger.png', data_url)
output.write_text(html, encoding="utf-8")
PY

echo "Built release artifact: ${HTML_PATH}"
