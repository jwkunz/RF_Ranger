# RF Ranger Requirements

## Product Goal
RF Ranger is a browser-based RF experimentation planning tool for modeling radio links between named sites and independently managed radio equipment.

## Core UX
- Startup splash screen with prominent project logo (`RF_Ranger.png`).
- Exclusive top tabs:
  - Welcome
  - Radios
  - Antennas
  - Propagation Models
  - Sites
  - Simulation
  - Results
  - Report
  - Preferences
  - Help
  - Legal
- Sites tab scope:
  - Define sites only (name, coordinates, pin color).
  - Add/update sites by map click, coordinate entry, or address geocoding.
  - List all sites below map; selecting a site populates right-side property editor.
  - Allow saving rendered site-map viewport snapshots into a removable/clearable queue.
- Simulation tab scope:
  - Five-column simulation definition:
    - Transmitter Site
    - Source Radio
    - Propagation Model
    - Receiver Site
    - Receiver Radio
  - Add each definition to a simulation queue.
  - Launch all queued simulations as a batch.
- Results tab shows buffered simulation queue runs; user can remove individual runs or clear all.
- Report tab generates downloadable PDF reports from selected result run data.
- Report tab can include a selected saved site-view snapshot section.

## Persistence and Data Exchange
- Persistent browser storage via IndexedDB.
- Full workspace JSON export/import.
- KML import/export for sites.
- CSV export for selected result run.
- PDF report generation with user-selectable sections and result fields.

## Simulation Rules
- Simulations are queued and executed in batch.
- Each queue row independently binds:
  - TX site + source radio + TX antenna
  - propagation model
  - RX site + receiver radio + RX antenna
- Frequency mismatch allowed with warning.
- Useable Link is `Y` only if available signal density meets required SNR threshold.
- Propagation models requiring TX/RX heights derive those values from selected antenna heights in Simulation.

## Models
- Antenna patterns: Omnidirectional, Vertical Dipole, Vertical Monopole, Horizontal Dipole, Horn.
- Propagation models implemented from `docs/Models.md`:
  - Free Space
  - Two-Ray
  - Knife-Edge
  - Ground Wave
  - Ionospheric
  - Log-Distance
  - Effective Earth Radius
  - Troposcatter
- No terrain API dependency in v1; manual analytic inputs only.

## Preferences
- Theme: light/dark.
- Power units: dBm/dBW.
- Distance units: km/m/miles/feet.

## Help and Legal
- Help tab renders `docs/Manual.md`.
- Legal tab renders `docs/LEGAL.md`.

## Packaging and Release
- Development: maintainable multi-file web app.
- Release: single-file HTML deliverable.
- GitHub release workflow runs from `main` tag `vX.Y.Z`.
