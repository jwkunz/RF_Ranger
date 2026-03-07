# RF Ranger Manual

## 1. Startup
On launch, RF Ranger displays a splash screen with project branding and legal notice.

## 2. Tab Overview
- **Sites**: Define named geographic sites (coordinates/address) and pin color.
- **Radios**: Manage source/sink radio definitions.
- **Antennas**: Manage antenna models.
- **Propagation Models**: Manage model presets.
- **Simulation**: Build queue entries (TX site/radio, propagation model, RX site/radio) and launch simulations.
- **Results**: View buffered simulation results, select/remove runs, and export CSV.
- **Preferences**: Change theme and units.
- **Help**: Read this manual.
- **Legal**: Review licenses, dependencies, and remote-communication disclosures.

## 3. Typical Workflow
1. Define radio sources/sinks in Radios.
2. Define antenna models in Antennas.
3. Define propagation presets.
4. Define sites in Sites by map click, coordinates, or geocoding.
5. In Simulation, add one or more queue rows selecting TX site/source radio/propagation model/RX site/receiver radio.
6. Launch Simulations.
6. Review output in Results and export CSV if needed.

## 4. Data Management
- State is auto-saved to browser IndexedDB.
- Export workspace JSON for backup.
- Import JSON to restore workspace.
- Export/import sites with KML.

## 5. Warnings and Validation
- Frequency mismatch is allowed but shown as warning.
- Useable link depends on required SNR threshold checks.
