# Legal

## Legal Notice
Copyright 2026 Numerius Engineering LLC. Distributed under terms of the MIT License.

## MIT License
MIT License

Copyright (c) 2026 Numerius Engineering LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Commercial License Access
- Distribution model: customer receives a release ZIP and a separate signed license file.
- A valid signed license file is required for full functionality. Without a valid license, the application runs in read-only mode.
- To obtain or reissue a license, contact: `numerius.engineering@gmail.com`
- License files are customer-specific and must not be redistributed outside the licensed organization.

## Runtime and Build Dependencies
The dependency inventory below is generated from the current installed `node_modules` and package metadata (`package-lock.json` + package manifests).

Notes:
- `UNKNOWN` indicates the package did not expose a SPDX `license` field in this install snapshot.
- Several `@esbuild/*` and `@rollup/*` entries are platform-specific optional binaries for other operating systems/architectures.

### Dependency License Inventory
- @esbuild/aix-ppc64: UNKNOWN
- @esbuild/android-arm: UNKNOWN
- @esbuild/android-arm64: UNKNOWN
- @esbuild/android-x64: UNKNOWN
- @esbuild/darwin-arm64: UNKNOWN
- @esbuild/darwin-x64: UNKNOWN
- @esbuild/freebsd-arm64: UNKNOWN
- @esbuild/freebsd-x64: UNKNOWN
- @esbuild/linux-arm: UNKNOWN
- @esbuild/linux-arm64: UNKNOWN
- @esbuild/linux-ia32: UNKNOWN
- @esbuild/linux-loong64: UNKNOWN
- @esbuild/linux-mips64el: UNKNOWN
- @esbuild/linux-ppc64: UNKNOWN
- @esbuild/linux-riscv64: UNKNOWN
- @esbuild/linux-s390x: UNKNOWN
- @esbuild/linux-x64: MIT
- @esbuild/netbsd-x64: UNKNOWN
- @esbuild/openbsd-x64: UNKNOWN
- @esbuild/sunos-x64: UNKNOWN
- @esbuild/win32-arm64: UNKNOWN
- @esbuild/win32-ia32: UNKNOWN
- @esbuild/win32-x64: UNKNOWN
- @mapbox/geojson-rewind: ISC
- @mapbox/jsonlint-lines-primitives: UNKNOWN
- @mapbox/point-geometry: ISC
- @mapbox/tiny-sdf: BSD-2-Clause
- @mapbox/unitbezier: BSD-2-Clause
- @mapbox/vector-tile: BSD-3-Clause
- @mapbox/whoots-js: ISC
- @maplibre/maplibre-gl-style-spec: ISC
- @maplibre/maplibre-gl-style-spec/node_modules/quickselect: ISC
- @rollup/rollup-android-arm-eabi: UNKNOWN
- @rollup/rollup-android-arm64: UNKNOWN
- @rollup/rollup-darwin-arm64: UNKNOWN
- @rollup/rollup-darwin-x64: UNKNOWN
- @rollup/rollup-freebsd-arm64: UNKNOWN
- @rollup/rollup-freebsd-x64: UNKNOWN
- @rollup/rollup-linux-arm-gnueabihf: UNKNOWN
- @rollup/rollup-linux-arm-musleabihf: UNKNOWN
- @rollup/rollup-linux-arm64-gnu: UNKNOWN
- @rollup/rollup-linux-arm64-musl: UNKNOWN
- @rollup/rollup-linux-loong64-gnu: UNKNOWN
- @rollup/rollup-linux-loong64-musl: UNKNOWN
- @rollup/rollup-linux-ppc64-gnu: UNKNOWN
- @rollup/rollup-linux-ppc64-musl: UNKNOWN
- @rollup/rollup-linux-riscv64-gnu: UNKNOWN
- @rollup/rollup-linux-riscv64-musl: UNKNOWN
- @rollup/rollup-linux-s390x-gnu: UNKNOWN
- @rollup/rollup-linux-x64-gnu: MIT
- @rollup/rollup-linux-x64-musl: MIT
- @rollup/rollup-openbsd-x64: UNKNOWN
- @rollup/rollup-openharmony-arm64: UNKNOWN
- @rollup/rollup-win32-arm64-msvc: UNKNOWN
- @rollup/rollup-win32-ia32-msvc: UNKNOWN
- @rollup/rollup-win32-x64-gnu: UNKNOWN
- @rollup/rollup-win32-x64-msvc: UNKNOWN
- @types/estree: MIT
- @types/geojson: MIT
- @types/geojson-vt: MIT
- @types/mapbox__point-geometry: MIT
- @types/mapbox__vector-tile: MIT
- @types/pbf: MIT
- @types/supercluster: MIT
- braces: MIT
- earcut: ISC
- esbuild: MIT
- fill-range: MIT
- fsevents: UNKNOWN
- geojson-vt: ISC
- get-stream: MIT
- gl-matrix: MIT
- global-prefix: MIT
- ieee754: BSD-3-Clause
- ini: ISC
- is-number: MIT
- isexe: BlueOak-1.0.0
- json-stringify-pretty-compact: MIT
- kdbush: ISC
- kind-of: MIT
- maplibre-gl: BSD-3-Clause
- micromatch: MIT
- minimist: MIT
- murmurhash-js: MIT
- nanoid: MIT
- pbf: BSD-3-Clause
- picocolors: ISC
- picomatch: MIT
- postcss: MIT
- potpack: ISC
- protocol-buffers-schema: MIT
- quickselect: ISC
- resolve-protobuf-schema: MIT
- rollup: MIT
- rw: BSD-3-Clause
- source-map-js: BSD-3-Clause
- supercluster: ISC
- tinyqueue: ISC
- to-regex-range: MIT
- typescript: Apache-2.0
- vite: MIT
- vite-plugin-singlefile: MIT
- vt-pbf: MIT
- which: ISC

## Compliance Obligations Checklist
The items below describe obligations that apply to this project based on current dependency and service choices.

### 1) MIT Distribution Requirement (Project License)
- Include this project's MIT copyright and permission notice in distributed copies.
- Keep disclaimer language intact ("AS IS", no warranty).

### 2) Third-Party OSS Notices
- Preserve attribution and license terms for bundled dependencies (MIT/BSD/ISC/Apache-2.0/BlueOak families in current inventory).
- Keep `docs/LEGAL.md` (or equivalent NOTICE/THIRD_PARTY_LICENSES artifact) in release packages.
- Resolve `UNKNOWN` entries before release sign-off by verifying package license files in `node_modules` or upstream package repositories.

### 3) Map Tile and Data Attribution (Runtime UI)
This app currently uses:
- OpenStreetMap tiles (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`)
- OpenTopoMap tiles (`https://{a,b,c}.tile.opentopomap.org/{z}/{x}/{y}.png`)
- CyclOSM tiles (`https://{a,b,c}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png`)

Required actions:
- Display visible attribution while map layers are used.
- Include OpenStreetMap attribution and data-license reference:
  - "© OpenStreetMap contributors"
  - Open Database License (ODbL): `https://www.openstreetmap.org/copyright`
- For OpenTopoMap, include provider attribution as required by OpenTopoMap and its published credits/about page.
- For CyclOSM, include provider attribution as required by CyclOSM plus OpenStreetMap contributor attribution.

### 4) Nominatim Geocoding Usage Policy
This app uses Nominatim (`https://nominatim.openstreetmap.org/search`) for address lookup.

Required actions:
- Follow the public Nominatim usage policy:
  - no abusive or bulk geocoding against the public endpoint,
  - identify requests appropriately (browser referer/user-agent context),
  - comply with server-side rate and acceptable-use guidance.
- If usage grows beyond policy limits, migrate to a self-hosted or commercial geocoding service.

### 5) Remote Communication Disclosure
No Numerius backend is used in normal runtime. Network calls are limited to:
- map tile retrieval from third-party tile servers,
- geocoding requests to Nominatim.

## Telemetry and Data Collection
The application does not include analytics SDKs or telemetry beacons in its runtime code path.

Data behavior summary:
- Workspace data is stored locally in browser IndexedDB.
- User-triggered exports (JSON, KML, CSV) are generated locally in-browser.
- The app does not automatically transmit workspace contents to a Numerius-owned remote service.

## GitHub Release Automation (Development Infrastructure)
Repository CI/CD may communicate with GitHub Actions and npm registries during build/release workflows. These are development pipeline operations, not in-browser end-user telemetry.

## Policy Reference Links
- OpenStreetMap Copyright / Attribution: `https://www.openstreetmap.org/copyright`
- OSMF Tile Usage Policy: `https://operations.osmfoundation.org/policies/tiles/`
- OSMF Nominatim Usage Policy: `https://operations.osmfoundation.org/policies/nominatim/`
- OpenTopoMap: `https://opentopomap.org/about`
- CyclOSM: `https://www.cyclosm.org/`
