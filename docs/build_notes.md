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

## M28 - KaTeX Symbols in Propagation Input Labels
- Date: 2026-03-07
- Version: 0.29.0
- Completed:
  - Updated propagation input label symbols to render with KaTeX inline math in the form controls.
  - Converted symbol metadata to LaTeX-friendly forms (e.g., `\\Gamma`, `\\sigma`, `\\epsilon_r`, `\\theta`, `\\mathrm{PL}(d_0)`, `L_{add}`).
  - Kept parameter key names and simulation behavior unchanged.
  - Added small style adjustment for inline KaTeX sizing in labels.
- Known Issues / Next Focus:
  - Optional: render engineering units with math-mode formatting where appropriate.
- Commit: this commit (`milestone(M28): katex symbols in propagation labels v0.29.0`)

## M29 - Report Field Label Rename
- Date: 2026-03-07
- Version: 0.30.0
- Completed:
  - Renamed report output label from `Available Power Density at Antenna` to `Signal Power Into Receiver`.
  - Updated both Reports tab table header and CSV export header for consistent naming.
- Known Issues / Next Focus:
  - Optional: align remaining report labels with domain-specific glossary terms.
- Commit: this commit (`milestone(M29): rename report signal power label v0.30.0`)

## M30 - Sites UX + Cross-Entity Comments in Reports
- Date: 2026-03-07
- Version: 0.31.0
- Completed:
  - Added temporary click-preview marker (`×`) on the Sites map so users can verify placement before adding/updating a site.
  - Replaced freeform color picker with concise predefined palette (Red/Green/Blue/Yellow/Orange/Cyan/Purple/Black/White).
  - Updated site markers to show site names directly on map pins.
  - Added comments fields to Site, Source Radio, Receiver Radio, Antenna, and Propagation Model definitions.
  - Added site comment visibility on marker hover popup.
  - Added entity comment columns to simulation reports and CSV export (TX/RX site and radio + propagation model comments).
  - Added backward-compatible workspace normalization for new comments fields.
- Known Issues / Next Focus:
  - Antenna comments are now stored but not yet tied to per-run report rows because antenna selection is not currently part of the simulation queue model.
- Commit: this commit (`milestone(M30): sites ux and entity comments in reports v0.31.0`)

## M31 - Results Tab Buffering + Report Comment Rollback
- Date: 2026-03-07
- Version: 0.32.0
- Completed:
  - Removed entity comment columns from result output table and CSV export.
  - Renamed top tab label from `Reports` to `Results`.
  - Added buffered result-run history in workspace state instead of overwriting prior runs.
  - Results tab now shows active run table at top and buffered run queue at bottom.
  - Added per-run actions: `View`, `Remove`, and global `Clear All`.
  - Updated simulation completion flow to append new runs to result history and auto-select newest run.
  - Added backward-compatible migration from legacy `reportLatest`-only data to buffered result history.
  - Updated user docs terminology from Reports to Results.
- Known Issues / Next Focus:
  - Optional: add result-run naming/tagging and search/filter for large histories.
- Commit: this commit (`milestone(M31): results buffering and report comment rollback v0.32.0`)

## M32 - Report Tab and PDF Generator
- Date: 2026-03-07
- Version: 0.33.0
- Completed:
  - Added new `Report` tab with form-driven PDF generation.
  - Added include toggles (default enabled) for:
    - current map view render
    - TX radio information
    - TX antenna information
    - propagation model information
    - RX antenna information
    - RX radio information
  - Added selectable simulation-result field list (default all selected) with select-all/clear controls.
  - Implemented PDF output with section headers and sequential section layout.
  - Added result-run selector in Report tab to choose which buffered run to include.
  - Added `jspdf` dependency for client-side PDF creation.
- Known Issues / Next Focus:
  - Map image capture can fail in browser contexts where canvas export is restricted; report includes fallback note in that case.
- Commit: this commit (`milestone(M32): report tab pdf generator v0.33.0`)

## M33 - Antenna-Driven Height Inputs for Propagation
- Date: 2026-03-07
- Version: 0.34.0
- Completed:
  - Removed transmitter/receiver height fields from propagation model input forms for models that previously requested them.
  - Added TX and RX antenna selection into Simulation definition and queue items.
  - Updated simulation worker propagation calculations to use selected antenna heights for model behavior (not model-form height parameters).
  - Updated Effective Earth Radius handling to incorporate selected antenna heights in LOS/beyond-LOS loss shaping.
  - Added queue migration fallback for older saved simulation queue entries missing antenna bindings.
- Known Issues / Next Focus:
  - Optional: add explicit validation messaging for legacy queue rows that lack antenna bindings until user re-saves them.
- Commit: this commit (`milestone(M33): antenna-driven propagation heights v0.34.0`)

## M34 - Saved Site Views Queue + Report Inclusion
- Date: 2026-03-07
- Version: 0.35.0
- Completed:
  - Added `Save Site View` action in Sites tab to capture current map viewport render as an image snapshot.
  - Added saved site view queue in Sites tab with thumbnail preview, per-entry remove, selection, and clear-all controls.
  - Added persistent `savedSiteViews` workspace state with migration-safe normalization defaults.
  - Updated Report tab option from live map capture to include selected saved site view.
  - Added saved site view selector in Report tab for choosing snapshot to embed in PDF output.
- Known Issues / Next Focus:
  - Saved snapshots are stored as data URLs and can increase workspace size for large numbers of captures.
- Commit: this commit (`milestone(M34): saved site views and report integration v0.35.0`)

## M35 - Report Include Tree + Site View PDF Fix
- Date: 2026-03-07
- Version: 0.36.0
- Completed:
  - Reorganized Report tab controls into a tree view with Y/N checkboxes:
    - Simulation Runs
    - Site Views
    - Transmit Radio
    - Transmit Antenna
    - Propagation Model
    - Receiver Radio
    - Receiver Antenna
  - Added child-field selection under each top-level category, with parent-child checkbox sync behavior.
  - Updated PDF generation to include only the data selected in the include tree.
  - Improved saved site view PDF embedding by:
    - enabling map `preserveDrawingBuffer` for reliable capture
    - using JPEG snapshots and format-aware `addImage` handling
- Known Issues / Next Focus:
  - Single-file bundle size continues to grow as report generation features expand.
- Commit: this commit (`milestone(M35): report include tree and site-view pdf fix v0.36.0`)

## M36 - Multi-Run Visible Results + Report Pagination by Visible Runs
- Date: 2026-03-07
- Version: 0.37.0
- Completed:
  - Updated Results top pane to render a combined multi-row table across all checkbox-visible runs.
  - Added visibility checkbox per buffered run in Results queue pane.
  - Added queue actions for `Select All` and `Clear Selection` visibility control.
  - Updated CSV export to include all rows from currently visible runs.
  - Updated Report tab to remove run dropdown and replace with read-only visible run list from Results.
  - Updated report generation to create one unique PDF page per visible result run.
- Known Issues / Next Focus:
  - Very large visible run sets can produce large PDFs; optional future enhancement is per-page row limits/tables.
- Commit: this commit (`milestone(M36): visible-run results and report pagination v0.37.0`)

## M37 - Exact Site View Snapshot Capture
- Date: 2026-03-07
- Version: 0.38.0
- Completed:
  - Replaced map snapshot capture path with DOM-level capture of the map container to include overlays.
  - Saved Site View captures now include on-screen markers/pins and any visible popup/tooltips.
  - Added `html2canvas` dependency for reliable viewport screenshot capture.
- Known Issues / Next Focus:
  - If no tooltip/popup is currently visible on screen at capture time, it will not appear in the saved snapshot (WYSIWYG behavior).
- Commit: this commit (`milestone(M37): exact site view capture with overlays v0.38.0`)

## M38 - PNG Site Screenshot UX + X Marker Toggle
- Date: 2026-03-07
- Version: 0.39.0
- Completed:
  - Updated `Save Site View` to capture the live Sites map viewport and immediately download a PNG file (`site-view-<timestamp>.png`) at save time.
  - Persisted screenshot filename metadata with saved site views for consistent export naming.
  - Made `Save Site View` prominent at the top of the Sites property pane with larger primary-button styling.
  - Added `View X Marker` checkbox (default enabled) to control visibility of the temporary click marker without clearing selected coordinates.
- Known Issues / Next Focus:
  - Browser capture remains dependent on map tile CORS availability for PNG export success.
- Commit: this commit (`milestone(M38): site screenshot png save and x-marker controls v0.39.0`)

## M39 - TX EIRP Fielding + Result Label Updates + Single-Row Simulation Layout
- Date: 2026-03-07
- Version: 0.40.0
- Completed:
  - Removed TX noise figure from source radio schema and UI entry/table fields.
  - Updated simulation math to include antenna gain:
    - `Transmitter EIRP = TX Power + TX antenna gain`
    - `Transmitter EIRP Density = TX power density + TX antenna gain`
    - `Power Density Into Receiver = Power Density at Receive Antenna + RX antenna gain`
  - Added `Transmitter EIRP` column/field before `Transmitter EIRP Density` in Results and CSV export.
  - Renamed result labels:
    - `Signal Power Into Receiver` -> `Power Density Into Receiver`
    - `Incident RF Power Density` -> `Power Density at Receive Antenna`
    - `Incident Electric Field` -> `Electric Field Density at Receive Antenna`
  - Refactored Simulation tab define/queue layouts so TX/RX site/radio/antenna fields render on a single row.
- Known Issues / Next Focus:
  - Default antenna-pattern gains are currently fixed heuristics unless an override gain is provided.
- Commit: this commit (`milestone(M39): eirp reporting and single-row simulation layout v0.40.0`)

## M40 - Comments Reflow + Simulation Comment Reporting
- Date: 2026-03-07
- Version: 0.41.0
- Completed:
  - Moved radio and antenna comments fields to the far-right position in create forms and table display columns.
  - Added a `Comments` field to each Simulation definition line and persisted it in simulation queue entries.
  - Added simulation comments into simulation result rows and exposed `Simulation Comments` as a selectable field in the Report generator include tree.
  - Updated Simulation define/queue column layout to include a dedicated rightmost comments column.
- Known Issues / Next Focus:
  - Simulation queue comments are currently single-line text; optional future enhancement is expanded multiline notes.
- Commit: this commit (`milestone(M40): comments reflow and simulation comment reporting v0.41.0`)

## M41 - Guided Site View Capture + PNG Toggle + Base Map Layers
- Date: 2026-03-07
- Version: 0.42.0
- Completed:
  - Updated `Save Site View` to open a guided capture overlay on the map where users drag-select a specific region before saving.
  - Added cropped capture support so selected region is saved into cached site views instead of always capturing full viewport.
  - Added `Save View as PNG` checkbox (default off) next to `View X Marker`; controls whether captures are also downloaded to local filesystem.
  - Added selectable Sites map layers:
    - Street (OSM)
    - Topographic (OpenTopoMap)
    - Geographic (CyclOSM)
  - Map now initializes with the currently selected base layer.
- Known Issues / Next Focus:
  - Remote tile providers may have occasional availability/rate limits that affect map rendering.
- Commit: this commit (`milestone(M41): guided capture and selectable basemap layers v0.42.0`)

## M42 - Antenna Entry Labels
- Date: 2026-03-07
- Version: 0.43.0
- Completed:
  - Updated Antennas top entry panel to use explicit labels above each form field.
  - Added units in labels where applicable (height, azimuth, tilt, gain override).
  - Aligned Antennas form styling with label-based UI patterns used in other tabs.
- Known Issues / Next Focus:
  - None specific to this milestone.
- Commit: this commit (`milestone(M42): antenna form labels v0.43.0`)

## M43 - Simulation Queue Actions Column Fix
- Date: 2026-03-07
- Version: 0.44.0
- Completed:
  - Fixed Simulation Queue panel layout so `Comments` no longer shares a cell with the `Remove` button.
  - Added a dedicated `Actions` header/column in the queue section.
  - Updated queue grid column sizing to support separate comments and actions columns.
- Known Issues / Next Focus:
  - None specific to this milestone.
- Commit: this commit (`milestone(M43): simulation queue actions column fix v0.44.0`)

## M44 - Results Table Header Compaction + Unit Placement
- Date: 2026-03-07
- Version: 0.45.0
- Completed:
  - Updated Results table headers to use wrapped labels with a 3-line capped layout for narrower column footprint.
  - Moved units from row cell values into column headers in parenthesis.
  - Updated displayed row values to numeric-only formatting for power, power density, distance, propagation loss, electric field density, and SNR.
  - Kept unit conversions consistent with user preferences (power and distance) while removing unit suffixes from values.
- Known Issues / Next Focus:
  - Dense tables can still require horizontal scrolling on smaller screens.
- Commit: this commit (`milestone(M44): compact results headers and numeric-only values v0.45.0`)

## M45 - Simulation Queue Header/Grid Alignment Fix
- Date: 2026-03-07
- Version: 0.46.0
- Completed:
  - Fixed Simulation Queue header misalignment where `Actions` wrapped to a second row.
  - Added dedicated queue grid column class and applied it to both queue header and queue rows.
  - Ensured `Comments` and `Remove` button remain in distinct columns within the same row layout.
- Known Issues / Next Focus:
  - None specific to this milestone.
- Commit: this commit (`milestone(M45): simulation queue header alignment fix v0.46.0`)

## M46 - Results Header Line-Break Optimization
- Date: 2026-03-07
- Version: 0.47.0
- Completed:
  - Refined Results table header labels with shorter wording for dense columns.
  - Added explicit line-break structuring in header labels so long labels use the available 3-line header height more efficiently.
  - Preserved units in header labels while keeping row values numeric-only.
  - Updated header text rendering style to improve consistent multi-line readability.
- Known Issues / Next Focus:
  - Very narrow windows still require horizontal scrolling for full results visibility.
- Commit: this commit (`milestone(M46): optimize results header line wraps v0.47.0`)

## M47 - Results Header Full-Word Label Restore
- Date: 2026-03-07
- Version: 0.48.0
- Completed:
  - Restored Results table header labels to full words (removed abbreviations introduced in prior compacting pass).
  - Kept explicit multi-line header structuring and unit-in-header formatting.
  - Preserved numeric-only values in result rows.
- Known Issues / Next Focus:
  - None specific to this milestone.
- Commit: this commit (`milestone(M47): restore full-word results headers v0.48.0`)

## M48 - Simulation Queue Column Alignment Simplification
- Date: 2026-03-07
- Version: 0.49.0
- Completed:
  - Removed the separate `Actions` column from the Simulation Queue structured grid.
  - Aligned queue headers and queue row entries on a consistent 8-column grid.
  - Moved each `Remove` button outside the structured queue columns into a dedicated action row below each entry.
- Known Issues / Next Focus:
  - None specific to this milestone.
- Commit: this commit (`milestone(M48): simplify simulation queue alignment and actions v0.49.0`)

## M49 - 3D Directional Antenna Gain Integration
- Date: 2026-03-07
- Version: 0.50.0
- Completed:
  - Added directional TX/RX gain evaluation in simulation worker using both azimuth and elevation offsets from antenna boresight.
  - Added geometry calculations for:
    - initial bearing TX->RX and RX->TX
    - elevation look angles based on site separation and antenna heights
  - Replaced fixed pattern gain usage with directional gain pipeline:
    - boresight/base gain from pattern default or override
    - minus pattern attenuation from off-boresight azimuth/elevation
  - Implemented analytic 3D attenuation helpers for supported patterns:
    - Omnidirectional
    - Vertical Dipole
    - Vertical Monopole
    - Horizontal Dipole
    - Horn
- Known Issues / Next Focus:
  - Pattern expressions are currently encoded in worker logic; next milestone will add UI visualization and markdown equation pane for direct verification.
- Commit: this commit (`milestone(M49): integrate 3d directional antenna gain math v0.50.0`)

## M50 - Antenna Pattern Visualization + Equation Documentation Panel
- Date: 2026-03-07
- Version: 0.51.0
- Completed:
  - Added Antennas tab visualization panel with:
    - pattern type selector
    - elevation cut slider (`-90°` to `+90°`)
    - live circular polar azimuth cut plot (relative gain in dBr)
  - Added markdown + LaTeX documentation panel under the plot for each predefined antenna type:
    - Omnidirectional
    - Vertical Dipole
    - Vertical Monopole
    - Horizontal Dipole
    - Horn
  - Wired visualization to update live with selected pattern and elevation cut.
  - Synced Add Antenna form pattern dropdown to the visualization selector for faster validation while configuring antennas.
- Known Issues / Next Focus:
  - Results/report fields for directional offsets and effective gains are not yet exposed; planned for next milestone.
- Commit: this commit (`milestone(M50): antenna pattern visualization and docs panel v0.51.0`)

## M51 - Directional Geometry/Gain Result Field Exposure
- Date: 2026-03-07
- Version: 0.52.0
- Completed:
  - Added directional antenna geometry/gain outputs to simulation result model:
    - TX azimuth offset
    - TX elevation offset
    - RX azimuth offset
    - RX elevation offset
    - TX effective gain
    - RX effective gain
  - Populated these fields in the simulation worker from the 3D directional math pipeline.
  - Added these fields into the Results table.
  - Added these fields into CSV export output.
  - Added normalization defaults for backward compatibility when loading older saved workspaces.
- Known Issues / Next Focus:
  - Optional future refinement: allow user toggling visibility of advanced directional columns in Results.
- Commit: this commit (`milestone(M51): expose directional offsets and effective gains v0.52.0`)

## M52 - Antenna Tab 3-Column Refactor + Pattern Parameter Caching
- Date: 2026-03-07
- Version: 0.53.0
- Completed:
  - Refactored Antennas tab to a three-column layout:
    - Data Entry
    - Equations
    - Pattern Visualization
  - Added per-pattern parameter schema and parameter editor in the Data Entry column.
  - Updated antenna model storage to persist `patternParameters` so pattern-specific inputs are cached in workspace data.
  - Updated simulation worker directional gain calculations to consume cached pattern parameters (e.g., exponents, horn beamwidths).
  - Updated visualization panel to support selecting known antennas for plot rendering using their cached pattern type and parameters.
  - Added pattern equation markdown/LaTeX content aligned with implemented equations.
- Known Issues / Next Focus:
  - Bottom-equation-only view can be revisited if you want equations shown in just one place instead of both mid-column and reference section.
- Commit: this commit (`milestone(M52): antenna tab three-column parameterized model refactor v0.53.0`)

## M53 - Antenna Equation Panel Placement + Binding Adjustment
- Date: 2026-03-07
- Version: 0.54.0
- Completed:
  - Moved `Pattern Equation Reference` into the middle column of the Antennas 3-column layout.
  - Replaced the middle-column heading `Pattern Equations` with `Pattern Equation Reference`.
  - Removed duplicate bottom `Pattern Equation Reference` panel.
  - Bound middle-column equation content to the Add Antenna `Pattern` dropdown selection.
- Known Issues / Next Focus:
  - None specific to this milestone.
- Commit: this commit (`milestone(M53): antenna equation panel placement and binding v0.54.0`)

## M54 - Antenna Visualization Cut Mode Toggle
- Date: 2026-03-07
- Version: 0.55.0
- Completed:
  - Replaced visualization `Pattern Type` selector with `Cut Mode` selector:
    - `Azimuth Cut`
    - `Elevation Cut`
  - Updated plot generation to support both modes:
    - Azimuth Cut: gain vs azimuth at fixed elevation
    - Elevation Cut: gain vs elevation at fixed azimuth
  - Converted slider to a fixed-angle control whose label/range changes by mode:
    - `Fixed Elevation (deg)` for Azimuth Cut
    - `Fixed Azimuth (deg)` for Elevation Cut
  - Kept known-antenna selection support so visualization uses cached antenna pattern + parameters.
- Known Issues / Next Focus:
  - Optional future refinement: add explicit axis annotations for variable-angle domain in each cut mode.
- Commit: this commit (`milestone(M54): antenna visualization cut mode toggle v0.55.0`)

## M55 - Antenna Plot Draggable Marker Readout
- Date: 2026-03-07
- Version: 0.56.0
- Completed:
  - Added draggable marker interaction on antenna polar plot.
  - Marker now moves with pointer drag and updates per active cut mode constraints.
  - Added live marker readout showing variable-angle position and relative gain (dBr).
  - Added marker rendering and plot cursor affordance styling.
- Known Issues / Next Focus:
  - Optional future refinement: snap marker to configurable angular increments.
- Commit: this commit (`milestone(M55): add draggable marker readout to antenna plot v0.56.0`)

## M56 - Live Add-Pattern Preview + Validation Messaging
- Date: 2026-03-07
- Version: 0.57.0
- Completed:
  - Fixed visualization behavior for `Use Add Antenna Pattern` mode to use live draft values from the Add Antenna form.
  - Added real-time updates while editing pattern parameter inputs (without needing to save antenna).
  - Added inline validation error messaging in the visualization panel when draft pattern parameters are invalid/incomplete.
  - Kept known-antenna mode behavior intact and isolated from draft-form validation messaging.
- Known Issues / Next Focus:
  - Optional future enhancement: highlight specific invalid fields in the Add Antenna panel in addition to summary error text.
- Commit: this commit (`milestone(M56): live add-pattern preview and validation messaging v0.57.0`)

## M57 - Marker Angle Linear Slider Control
- Date: 2026-03-07
- Version: 0.58.0
- Completed:
  - Added a traditional linear slider control for `Marker Angle (deg)` in the Pattern Visualization panel.
  - Bound slider updates to marker movement/readout and plot refresh.
  - Synced marker slider bounds/value dynamically with current cut mode constraints.
  - Kept drag interaction and slider interaction synchronized both directions.
- Known Issues / Next Focus:
  - Optional: expose configurable angle-step size for marker slider and drag snapping.
- Commit: this commit (`milestone(M57): add marker angle linear slider control v0.58.0`)

## M58 - Peak Gain Semantics + Rectangular Horn Parameterization
- Date: 2026-03-07
- Version: 0.59.0
- Completed:
  - Reframed antenna gain model so each pattern is treated relative to a peak gain.
  - Renamed antenna gain input label to `Peak Gain (dBi)` and updated corresponding table/report wording.
  - Updated default peak gains:
    - Omnidirectional: `0 dBi`
    - Vertical Dipole: `1.6 dBi`
    - Horizontal Dipole: `1.6 dBi`
  - Updated Horn display naming to `Rectangular Horn`.
  - Replaced horn beamwidth parameters with geometric parameters:
    - `Horn Width A`
    - `Horn Length B`
  - Updated documentation/equation panel content for rectangular horn governing equations.
  - Updated simulation worker rectangular-horn attenuation to derive beamwidth from `A`, `B`, and operating frequency.
- Known Issues / Next Focus:
  - Optional refinement: expose rectangular horn efficiency factor in UI for direct aperture-gain tuning.
- Commit: this commit (`milestone(M58): peak gain semantics and rectangular horn parameters v0.59.0`)
