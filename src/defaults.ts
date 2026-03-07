import type { WorkspaceSnapshot } from './types';

export const DEFAULT_WORKSPACE: WorkspaceSnapshot = {
  schemaVersion: 1,
  sources: [],
  sinks: [],
  antennas: [],
  propagationModels: [],
  sites: [],
  simulationQueue: [],
  preferences: {
    theme: 'dark',
    powerUnit: 'dBm',
    distanceUnit: 'km'
  },
  reportLatest: [],
  reportHistory: [],
  savedSiteViews: []
};
