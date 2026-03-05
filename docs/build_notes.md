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
