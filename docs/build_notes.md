# Build Notes

## M0 - Foundation Docs
- Date: 2026-03-05
- Version: 0.1.0
- Completed:
  - Added initial requirements, development plan, manual, legal notice, and build notes.
  - Added VERSION file and initialized semver baseline.
- Known Issues / Next Focus:
  - Implement application shell, splash screen, and tab framework.
- Commit: this commit (`milestone(M0): foundation docs v0.1.0`)

## M1 - App Shell + Splash + Tabs
- Date: 2026-03-05
- Version: 0.2.0
- Completed:
  - Added initial web app shell (`index.html`, `src/main.ts`, `src/styles.css`).
  - Implemented startup splash with prominent logo (`RF_Ranger.png`).
  - Implemented legal notice rendering from `docs/LEGAL.md`.
  - Added exclusive top tab navigation including Help tab.
- Known Issues / Next Focus:
  - Implement domain models, persistence, and import/export.
  - Tooling validation pending because Node/npm is unavailable in current environment.
- Commit: this commit (`milestone(M1): app shell splash tabs v0.2.0`)

## M2 - Domain Types + Persistence + Import/Export Core
- Date: 2026-03-05
- Version: 0.3.0
- Completed:
  - Added typed core domain models and workspace schema.
  - Implemented IndexedDB load/save for persistent workspace state.
  - Added preferences persistence baseline.
  - Added workspace JSON export/import actions in Preferences.
- Known Issues / Next Focus:
  - Add full CRUD UI for radios, antennas, and propagation models.
- Commit: this commit (`milestone(M2): domain persistence io core v0.3.0`)

## M3 - CRUD Tabs (Radios/Antennas/Propagation Models)
- Date: 2026-03-05
- Version: 0.4.0
- Completed:
  - Implemented source/sink radio create, view, edit, and delete flows.
  - Implemented antenna create, view, edit, and delete flows.
  - Implemented propagation model CRUD with parameter editor forms for all 8 model types.
- Known Issues / Next Focus:
  - Add map integration, sink pin placement, and KML/geocoding.
- Commit: this commit (`milestone(M3): crud tabs v0.4.0`)

## M4 - Map View + Pin/KML + Geocoding
- Date: 2026-03-05
- Version: 0.5.0
- Completed:
  - Added Map View layout with model selectors and map workspace.
  - Integrated MapLibre + OSM tile style scaffolding.
  - Added sink pin creation from coordinates and Nominatim geocoding.
  - Enforced sink radio and sink antenna binding requirement for new pins.
  - Added KML export/import with sink bindings stored in `ExtendedData`.
- Known Issues / Next Focus:
  - Add simulation engine, progress, and reports integration.
- Commit: this commit (`milestone(M4): map pin kml geocoding v0.5.0`)

## M5 - Simulation Engine + Progress + Reports
- Date: 2026-03-05
- Version: 0.6.0
- Completed:
  - Added worker-based simulation engine with per-sink progress updates.
  - Implemented analytic calculations and reporting pipeline for all sink pins.
  - Added Useable Link decision logic using sensitivity + SNR threshold.
  - Added latest-run Reports table with map jump links.
  - Added CSV export for report data.
- Known Issues / Next Focus:
  - Improve manual rendering, UX polish, and finalize preferences/help behavior.
- Commit: this commit (`milestone(M5): simulation reports v0.6.0`)

## M6 - Preferences + Help Rendering + Polish
- Date: 2026-03-05
- Version: 0.7.0
- Completed:
  - Completed Help tab rendering from `docs/Manual.md`.
  - Added generated table of contents and section anchors for manual navigation.
  - Improved report/map UX with jump links and focused report highlighting.
  - Applied additional layout polish for responsive map and manual display.
- Known Issues / Next Focus:
  - Finalize release build automation scripts and GitHub workflow.
- Commit: this commit (`milestone(M6): preferences help polish v0.7.0`)

## M7 - Release Automation
- Date: 2026-03-05
- Version: 0.8.0
- Completed:
  - Added release build script at `scripts/build-release.sh`.
  - Added Vite single-file build configuration.
  - Added GitHub Actions workflow `.github/workflows/release.yml` for tagged releases from `main`.
  - Added standard project `.gitignore` entries for build outputs.
- Known Issues / Next Focus:
  - Validate full release build in an environment with Node/npm available.
- Commit: this commit (`milestone(M7): release automation v0.8.0`)

## M8 - Toolchain Validation + Single-File Hardening
- Date: 2026-03-05
- Version: 0.9.0
- Completed:
  - Added `package-lock.json` so `npm ci` works for local/CI reproducible installs.
  - Updated TypeScript target/lib to ES2021 to match runtime usage (`replaceAll`).
  - Refined app root typing to satisfy strict type-check.
  - Converted simulation worker to inline bundle mode so release output is truly single-file.
  - Validated `npm run check` and `npm run build` successfully.
- Known Issues / Next Focus:
  - Optional: refine simulation model fidelity and add automated tests.
- Commit: this commit (`milestone(M8): toolchain hardening single-file v0.9.0`)

## M9 - Release Script Validation
- Date: 2026-03-05
- Version: 0.10.0
- Completed:
  - Executed `scripts/build-release.sh 0.9.0` successfully.
  - Verified single-file web build output and zipped release artifact generation.
  - Confirmed artifact path: `build/rf-ranger-v0.9.0.zip`.
- Known Issues / Next Focus:
  - Optional: run tag-driven GitHub release workflow on remote.
- Commit: this commit (`milestone(M9): release script validation v0.10.0`)

## M10 - Map UX and Theming Fixes
- Date: 2026-03-05
- Version: 0.11.0
- Completed:
  - Changed default theme to dark mode for new workspaces.
  - Improved map consistency by fully re-initializing MapLibre instance on Map tab render.
  - Moved Add Pins controls to the right side of Map View.
  - Renamed labels: "Add Sink Pin" -> "Add Pins", "Defined Sink Pins" -> "Defined Pins".
  - Added click-on-map binding prompt to bind clicked location as source or sink.
  - Added session-scoped splash dismissal memory so refresh does not force title screen in same session.
- Known Issues / Next Focus:
  - Optional: replace prompt-based source/sink binding with modal UX.
- Commit: this commit (`milestone(M10): map ux and theme fixes v0.11.0`)

## M11 - Navigation Reorganization + Licensing Update
- Date: 2026-03-05
- Version: 0.12.0
- Completed:
  - Reorganized top tabs to: Welcome, Radios, Antennas, Propagation Models, Map View, Simulation, Reports, Preferences, Help.
  - Converted splash screen into persistent Welcome tab content.
  - Moved all simulation controls from Map View into a dedicated Simulation tab.
  - Simplified Map View layout to map + Add Pins panel.
  - Updated legal notice text to the requested copyright/MIT statement.
  - Added MIT license file at project root (`LICENSE`).
- Known Issues / Next Focus:
  - Optional: align docs language to reflect dedicated Simulation tab workflow.
- Commit: this commit (`milestone(M11): tabs simulation licensing v0.12.0`)

## M12 - Sink Noise Model Simplification + Click Mode Controls
- Date: 2026-03-05
- Version: 0.13.0
- Completed:
  - Replaced typed click prompt with radio-button click mode selection in Map View (source vs sink).
  - Updated map click behavior to use selected click mode directly.
  - Refactored sink model to remove sensitivity/manual-noise-floor confusion.
  - Sink definition now uses Environment Noise Temperature (K), Noise Figure (dB), and Required SNR (dB).
  - Removed global SNR threshold from Preferences.
  - Updated simulation math to compute thermal noise and per-sink signal threshold from sink parameters.
  - Added workspace normalization so older saved data gets compatible default sink fields.
- Known Issues / Next Focus:
  - Optional: add explicit threshold column in Reports for easier user interpretation.
- Commit: this commit (`milestone(M12): sink noise model + click mode controls v0.13.0`)

## M13 - Welcome and Map Label Cleanup
- Date: 2026-03-05
- Version: 0.14.0
- Completed:
  - Updated map click mode label from "Add Sink Pin" to "Add RX Sink".
  - Removed legal notice block from Welcome tab in preparation for dedicated Legal tab.
- Known Issues / Next Focus:
  - Add dedicated Legal tab and legal content rendering.
- Commit: this commit (`milestone(M13): welcome/map label cleanup v0.14.0`)

## M14 - Dedicated Legal Tab and Legal Disclosures
- Date: 2026-03-05
- Version: 0.15.0
- Completed:
  - Added `Legal` tab after `Help` in the top navigation.
  - Wired Legal tab content to load directly from `docs/LEGAL.md`.
  - Expanded `docs/LEGAL.md` to include MIT license text.
  - Added dependency/license inventory generated from installed package manifests.
  - Added remote communication disclosures (OSM tiles, Nominatim geocoding).
  - Added explicit telemetry/data-collection statement.
- Known Issues / Next Focus:
  - Optional: add automated script to regenerate dependency license list for each release.
- Commit: this commit (`milestone(M14): legal tab and disclosures v0.15.0`)
