# RF Ranger Manual

## 1. Startup
On launch, RF Ranger displays a splash screen with project branding.

## 2. Tab Overview
- **Sites**: Define named geographic sites (coordinates/address) and pin color.
- **Sites**: Define named geographic sites (coordinates/address) and pin color, and save viewport snapshots for reporting.
- **Radios**: Manage source/sink radio definitions.
- **Antennas**: Manage antenna models.
- **Propagation Models**: Manage model presets.
- **Simulation**: Build queue entries (TX site/radio, propagation model, RX site/radio) and launch simulations.
- **Results**: View buffered simulation results as a multi-run table, select visible runs via queue checkboxes, and export visible rows to CSV.
- **Report**: Generate a downloadable PDF report from selected result run content using an include-tree of categories/fields.
- **Preferences**: Change theme and units.
- **Preferences**: Change theme and units, manage license status, and install/remove license files.
- **Help**: Read this manual.
- **Legal**: Review licenses, dependencies, and remote-communication disclosures.

## 3. Typical Workflow
1. Define radio sources/sinks in Radios.
2. Define antenna models in Antennas.
3. Define propagation presets.
4. Define sites in Sites by map click, coordinates, or geocoding.
5. In Simulation, add one or more queue rows selecting TX site/source radio/TX antenna/propagation model/RX site/receiver radio/RX antenna.
6. Launch Simulations.
6. Review output in Results and export CSV if needed.
7. In Sites, use `Save Site View` to store map snapshots if needed for reports.
8. In Results, check the runs you want visible; the top table and CSV export use those visible runs.
9. In Report, review the read-only visible run list, set include-tree options, and generate one PDF page per visible run.

## 4. Data Management
- State is auto-saved to browser IndexedDB.
- Export workspace JSON for backup.
- Import JSON to restore workspace.
- Export/import sites with KML.

## 5. Licensing
- RF Ranger runs in `Read-Only Mode` unless a valid license is installed.
- To request a license, email `numerius.engineering@gmail.com` and include your machine fingerprint from:
  - `Preferences` -> `License Management` -> `Machine Fingerprint`
- To install a license:
  1. Open `Preferences`.
  2. In `License Management`, choose `Install License`.
  3. Select the provided `.json`/`.license.json` file.
  4. Confirm status changes to `Valid`.
- In read-only mode:
  - Viewing tabs and exporting existing data is allowed.
  - Add/edit/delete/import/simulation actions are blocked.

## 6. Warnings and Validation
- Frequency mismatch is allowed but shown as warning.
- Useable link depends on required SNR threshold checks.
