# RF Ranger Requirements

## Product Goal
RF Ranger is a browser-based RF experimentation planning tool for modeling radio links between one transmitter source and multiple receiver sinks.

## Core UX
- Startup splash screen with prominent project logo (`RF_Ranger.png`).
- Legal notice displayed at splash bottom from `docs/LEGAL.md`.
- Exclusive top tabs:
  - Map View
  - Radios
  - Antennas
  - Propagation Models
  - Reports
  - Preferences
  - Help

## Persistence and Data Exchange
- Persistent browser storage via IndexedDB.
- Full workspace JSON export/import.
- KML import/export for map pins (with sink bindings).
- CSV export for reports.

## Simulation Rules
- One active TX source per run.
- Each map sink pin is bound to a sink radio and sink antenna.
- Frequency mismatch allowed with warning.
- Useable Link is `Y` only if both conditions pass:
  - available RX power >= receiver sensitivity
  - SNR >= configured threshold (default 10 dB)

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
- Splash legal notice renders `docs/LEGAL.md`.

## Packaging and Release
- Development: maintainable multi-file web app.
- Release: single-file HTML deliverable.
- GitHub release workflow runs from `main` tag `vX.Y.Z`.
