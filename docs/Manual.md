# RF Ranger Manual

## 1. Startup
On launch, RF Ranger displays a splash screen with project branding and legal notice.

## 2. Tab Overview
- **Map View**: Place sink pins and run simulations.
- **Radios**: Manage source/sink radio definitions.
- **Antennas**: Manage antenna models.
- **Propagation Models**: Manage model presets.
- **Reports**: View latest simulation results and export CSV.
- **Preferences**: Change theme and units.
- **Help**: Read this manual.

## 3. Typical Workflow
1. Define radio sources/sinks in Radios.
2. Define antenna models in Antennas.
3. Define propagation presets.
4. Place sink pins in Map View and bind each pin to sink radio and antenna.
5. Select TX source/antenna/model and run Calculate.
6. Review output in Reports and export CSV if needed.

## 4. Data Management
- State is auto-saved to browser IndexedDB.
- Export workspace JSON for backup.
- Import JSON to restore workspace.
- Export/import pins with KML.

## 5. Warnings and Validation
- Frequency mismatch is allowed but shown as warning.
- Useable link depends on both sensitivity and SNR threshold checks.
