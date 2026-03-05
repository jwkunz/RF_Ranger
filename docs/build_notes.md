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
