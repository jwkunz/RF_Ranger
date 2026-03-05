# RF Ranger Development Plan

## Milestones

1. M0 Foundation Docs -> 0.1.0
2. M1 App Shell + Splash + Tabs -> 0.2.0
3. M2 Domain Types + Persistence + Import/Export Core -> 0.3.0
4. M3 CRUD Tabs -> 0.4.0
5. M4 Map View + KML + Geocoding -> 0.5.0
6. M5 Simulation + Reports -> 0.6.0
7. M6 Preferences + Help + Polish -> 0.7.0
8. M7 Release Automation -> 0.8.0

## Engineering Approach
- TypeScript browser application with modular services.
- IndexedDB for persistent state.
- Worker-based simulation for responsive UI.
- Build pipeline outputs a single-file release artifact.

## Acceptance Gates
- Splash and legal content shown on every launch.
- Tab UI and CRUD flows function.
- Simulation computes expected report fields with progress feedback.
- Import/export features (JSON, KML, CSV) work.
- Release workflow builds and publishes zip artifact from tagged commit on `main`.
