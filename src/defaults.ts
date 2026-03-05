import type { WorkspaceSnapshot } from './types';

export const DEFAULT_WORKSPACE: WorkspaceSnapshot = {
  schemaVersion: 1,
  sources: [],
  sinks: [],
  antennas: [],
  propagationModels: [],
  pins: [],
  preferences: {
    theme: 'dark',
    powerUnit: 'dBm',
    distanceUnit: 'km',
    snrThresholdDb: 10
  },
  reportLatest: []
};
