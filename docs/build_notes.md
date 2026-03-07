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

## M15 - Radios Form Labeling + kHz Bandwidth Input
- Date: 2026-03-05
- Version: 0.16.0
- Completed:
  - Added explicit field labels with units on Radios source/sink entry forms.
  - Changed source and sink bandwidth inputs from Hz to kHz in the UI.
  - Added conversion from kHz input to stored/calculated Hz internally.
  - Updated radios tables to display bandwidth in kHz for readability.
- Known Issues / Next Focus:
  - Optional: add inline validation ranges/tooltips for each radios parameter.
- Commit: this commit (`milestone(M15): radios labels and khz bandwidth v0.16.0`)

## M16 - Map Click Mode Panel Binding Fix
- Date: 2026-03-05
- Version: 0.17.0
- Completed:
  - Fixed Map View click mode panel so switching between TX source and RX sink reconfigures relevant entry fields.
  - Added TX source/antenna binding controls when "Set TX Source" mode is selected.
  - Kept RX sink radio/antenna controls when "Add RX Sink" mode is selected.
  - Updated coordinate action button labels to match selected mode.
  - Ensured map click in TX mode updates TX coordinates and re-renders immediately.
- Known Issues / Next Focus:
  - Optional: hide pin-name field in TX mode to reduce clutter.
- Commit: this commit (`milestone(M16): map click mode panel binding fix v0.17.0`)

## M17 - Map Source Binding + Resizable Pane + Viewport Stability
- Date: 2026-03-05
- Version: 0.18.0
- Completed:
  - Fixed TX source binding reliability in Map View by enforcing valid default source/antenna selections.
  - Added draggable vertical resizer between map pane and right-side panel for screen-size adjustment.
  - Preserved map viewport (center/zoom) across pin add/delete/import operations.
  - Removed initial/default green TX marker from map rendering.
  - Prevented zoom reset behavior after adding pins by restoring map state on re-render.
- Known Issues / Next Focus:
  - Optional: persist resizer width preference in local workspace settings.
- Commit: this commit (`milestone(M17): map source/resizer/viewport fix v0.18.0`)

## M18 - Add Pins Pane Refactor (Source/Sink Tabs)
- Date: 2026-03-05
- Version: 0.19.0
- Completed:
  - Refactored Add Pins pane into two internal tabs: `Add RX Sink` and `Add TX Source`.
  - Unified pane field labels to `Radio` and `Antenna` and made behavior tab-driven.
  - Updated map pin model to typed pins (`source`/`sink`) with shared radio/antenna references.
  - Updated KML import/export to include pin type and new radio/antenna keys, with legacy sink-key compatibility.
  - Updated Defined Pins table to list all pins and show each pin type (Source/Sink).
  - Updated marker colors: source pins are red, sink pins are blue.
  - Improved map/pane resizing coupling so Add Pins pane width expands proportionally with map width drag.
- Known Issues / Next Focus:
  - Optional: persist pane sub-tab and pane widths in workspace preferences.
- Commit: this commit (`milestone(M18): add-pins pane source/sink refactor v0.19.0`)

## M19 - Report Column Expansion and Source Labeling
- Date: 2026-03-05
- Version: 0.20.0
- Completed:
  - Added `Source` label column adjacent to `Sink` in Reports.
  - Added `Transmitter EIRP` report field and column.
  - Added `Propagation Losses` report field and column.
  - Reordered report columns to: Source, Sink, Transmitter EIRP, Distance, Propagation Losses, then existing downstream fields.
  - Renamed report column label from `SNR` to `SNR in Receiver`.
  - Updated CSV export to match the new report column schema and order.
- Known Issues / Next Focus:
  - Optional: add unit toggles for propagation loss display precision.
- Commit: this commit (`milestone(M19): report eirp/loss/source updates v0.20.0`)

## M20 - Simulation Source Pin Selection + Receiver Noise Temperature Model
- Date: 2026-03-05
- Version: 0.21.0
- Completed:
  - Updated Simulation tab to select source via source-pin dropdown from Map View definitions.
  - Simulation now derives TX radio, TX antenna, and TX coordinates directly from selected source pin.
  - Report source label now uses selected source pin name.
  - Updated noise floor model to use `k_b * (T_env + T_recv) * BW`.
  - Implemented `T_recv` derivation from noise figure: `T_recv = T0 * (F - 1)` with `F = 10^(NF/10)` and `T0 = 290K`.
- Known Issues / Next Focus:
  - Optional: expose computed `T_recv` and total noise temperature in Reports for transparency.
- Commit: this commit (`milestone(M20): source pin sim + noise temp model v0.21.0`)

## M21 - Spectral Density Simulation and Noise Floor Density Reporting
- Date: 2026-03-05
- Version: 0.22.0
- Completed:
  - Converted simulation power-domain calculations to spectral density domain (`dBm/Hz`).
  - Updated report values to density equivalents for transmitter EIRP, incident RF, and available power at antenna.
  - Added `Receiver Noise Floor` column after available power at antenna (reported as density).
  - Kept SNR computation as dB difference between received power density and noise floor density.
  - Updated CSV export schema/headers to match density-based report fields.
- Known Issues / Next Focus:
  - Optional: add explicit units in table headers (e.g. `dBm/Hz`) for every density field.
- Commit: this commit (`milestone(M21): spectral-density simulation/report v0.22.0`)

## M22 - Sites/Simulation Queue Refactor
- Date: 2026-03-07
- Version: 0.23.0
- Completed:
  - Refactored `Map View` into `Sites` tab with site-only scope (name, coordinates, pin color).
  - Added site list below map and right-side site property editor driven by selected site.
  - Updated map interactions to populate coordinates on click and support geocode + add/update flows.
  - Switched KML import/export from pin schema to site schema.
  - Reworked Simulation tab into five-column definition + queued runs with `Add to Simulation Queue` and `Launch Simulations`.
  - Updated worker execution model to batch-run queued simulations and report progress/results per queue item.
  - Updated Reports jump actions to navigate back to receiver site in Sites tab.
  - Added workspace migration logic to convert legacy `pins` data to `sites` for existing stored workspaces.
- Known Issues / Next Focus:
  - Antenna models are currently not explicitly selected per queue row; consider adding per-row TX/RX antenna binding in a future milestone.
- Commit: this commit (`milestone(M22): sites and queued simulations refactor v0.23.0`)

## M23 - Report Metadata Columns (TX/RX Site+Radio Context)
- Date: 2026-03-07
- Version: 0.24.0
- Completed:
  - Added report columns for transmitter and receiver context:
    - Transmitter Site Name
    - Transmitter Coordinates
    - Transmitter Radio
    - Frequency (MHz)
    - Bandwidth (kHz)
    - Receiver Site Name
    - Receiver Coordinates
    - Receiver Radio
  - Updated simulation worker outputs to populate the new report metadata fields.
  - Updated CSV export schema to include the new columns.
  - Added backward-compatible normalization defaults so older saved report rows still load.
- Known Issues / Next Focus:
  - Optional: add sort/filter controls in Reports for large simulation queues.
- Commit: this commit (`milestone(M23): report tx-rx metadata columns v0.24.0`)

## M24 - Propagation Model Contextual Setup Pane
- Date: 2026-03-07
- Version: 0.25.0
- Completed:
  - Added a right-side guidance pane to the Propagation Models tab.
  - Wired model dropdown selection to load the corresponding section text from `docs/Models.md`.
  - Added model-to-section matching logic for all supported propagation model types.
  - Reused markdown rendering pipeline so section headers/body are displayed for setup guidance while selecting parameters.
  - Added responsive layout styling so the guidance pane stacks below the form on narrow screens.
- Known Issues / Next Focus:
  - Table/math markdown in the guidance content is currently displayed as plain text lines; optional future enhancement is richer markdown rendering.
- Commit: this commit (`milestone(M24): propagation model setup guidance pane v0.25.0`)

## M25 - Propagation Guide Markdown + LaTeX Rendering
- Date: 2026-03-07
- Version: 0.26.0
- Completed:
  - Added markdown rendering engine for propagation model setup guidance content.
  - Added LaTeX math rendering support in the propagation guide pane using KaTeX.
  - Normalized bracket-style display-math blocks from `docs/Models.md` into renderable math delimiters.
  - Included KaTeX stylesheet in app bundle for proper equation formatting.
  - Added required package type support for strict TypeScript checks.
- Known Issues / Next Focus:
  - Single-file output size increased significantly due to bundled markdown/math rendering dependencies.
- Commit: this commit (`milestone(M25): render propagation guide markdown+latex v0.26.0`)

## M26 - Models.md Math Delimiter Normalization
- Date: 2026-03-07
- Version: 0.27.0
- Completed:
  - Updated `docs/Models.md` display equations from bracket blocks to standard `$$...$$` delimiters.
  - Converted non-rendered inline symbol annotations to inline math (`$...$`) for consistency.
  - Verified propagation guide panel still renders directly from `docs/Models.md` as the single source of truth.
- Known Issues / Next Focus:
  - Optional: further normalize plain-text engineering expressions in prose into inline math for full consistency.
- Commit: this commit (`milestone(M26): normalize models markdown math delimiters v0.27.0`)

## M27 - Propagation Parameter Label/Symbol Alignment
- Date: 2026-03-07
- Version: 0.28.0
- Completed:
  - Added propagation parameter metadata for all supported models, including engineering label, symbol, units, and setup hint text.
  - Updated Propagation Model entry panel to show parameter labels matching `docs/Models.md` symbols (e.g., `Γ`, `f_c`, `θ`, `n`, `k`, `d_1`, `d_2`).
  - Preserved existing internal parameter keys used by the simulation engine to avoid behavior regressions.
  - Added inline field-help styling for parameter guidance.
- Known Issues / Next Focus:
  - Optional: render symbols with full math typography in form labels, not just unicode/plain text.
- Commit: this commit (`milestone(M27): align propagation parameter symbols v0.28.0`)
