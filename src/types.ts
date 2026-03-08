export type TabId =
  | 'welcome'
  | 'sites'
  | 'simulation'
  | 'radios'
  | 'antennas'
  | 'propagation'
  | 'report'
  | 'reports'
  | 'preferences'
  | 'help'
  | 'legal';

export type PowerUnit = 'dBm' | 'dBW';
export type DistanceUnit = 'km' | 'm' | 'miles' | 'feet';
export type ThemeMode = 'light' | 'dark';

export type AntennaPattern =
  | 'Omnidirectional'
  | 'Vertical Dipole'
  | 'Vertical Monopole'
  | 'Horizontal Dipole'
  | 'Horn'
  | 'Custom CSV';

export interface AntennaPatternPoint {
  azimuthDeg: number;
  elevationDeg: number;
  gainDbi: number;
}

export type PropagationModelType =
  | 'Free Space'
  | 'Two-Ray'
  | 'Knife-Edge'
  | 'Ground Wave'
  | 'Ionospheric'
  | 'Log-Distance'
  | 'Effective Earth Radius'
  | 'Troposcatter';

export interface RadioSource {
  id: string;
  name: string;
  comments: string;
  txPowerDbm: number;
  carrierFrequencyMHz: number;
  bandwidthHz: number;
}

export interface RadioSink {
  id: string;
  name: string;
  comments: string;
  carrierFrequencyMHz: number;
  bandwidthHz: number;
  environmentNoiseTemperatureK: number;
  noiseFigureDb: number;
  requiredSnrDb: number;
}

export interface AntennaModel {
  id: string;
  name: string;
  comments: string;
  heightM: number;
  azimuthDeg: number;
  tiltDeg: number;
  pattern: AntennaPattern;
  patternParameters: Record<string, number>;
  customPatternPoints?: AntennaPatternPoint[];
  gainOverrideDb?: number;
}

export interface PropagationModel {
  id: string;
  name: string;
  comments: string;
  modelType: PropagationModelType;
  parameters: Record<string, number>;
}

export interface Site {
  id: string;
  name: string;
  comments: string;
  latitude: number;
  longitude: number;
  pinColor: string;
}

export interface SimulationQueueItem {
  id: string;
  txSiteId: string;
  sourceRadioId: string;
  txAntennaId: string;
  propagationModelId: string;
  rxSiteId: string;
  receiverRadioId: string;
  rxAntennaId: string;
  comments: string;
}

export interface SimulationResultRow {
  queueItemId: string;
  txSiteId: string;
  rxSiteId: string;
  transmitterSiteName: string;
  transmitterCoordinates: string;
  transmitterRadio: string;
  frequencyMHz: number;
  bandwidthKHz: number;
  receiverSiteName: string;
  receiverCoordinates: string;
  receiverRadio: string;
  sourceName: string;
  sinkName: string;
  simulationComments: string;
  txAzimuthOffsetDeg: number;
  txElevationOffsetDeg: number;
  rxAzimuthOffsetDeg: number;
  rxElevationOffsetDeg: number;
  txEffectiveGainDb: number;
  rxEffectiveGainDb: number;
  transmitterEirpDbm: number;
  transmitterEirpDensityDbmPerHz: number;
  distanceKm: number;
  propagationLossesDb: number;
  incidentRfPowerDensityDbmPerHz: number;
  incidentElectricFieldVm: number;
  availablePowerDensityAtAntennaDbmPerHz: number;
  receiverNoiseFloorDensityDbmPerHz: number;
  snrDb: number;
  usableLink: 'Y' | 'N';
  warnings: string[];
}

export interface ResultRun {
  id: string;
  createdAtIso: string;
  rows: SimulationResultRow[];
}

export interface SavedSiteView {
  id: string;
  createdAtIso: string;
  imageDataUrl: string;
  fileName: string;
}

export interface Preferences {
  theme: ThemeMode;
  powerUnit: PowerUnit;
  distanceUnit: DistanceUnit;
}

export interface WorkspaceSnapshot {
  schemaVersion: number;
  sources: RadioSource[];
  sinks: RadioSink[];
  antennas: AntennaModel[];
  propagationModels: PropagationModel[];
  sites: Site[];
  simulationQueue: SimulationQueueItem[];
  preferences: Preferences;
  reportLatest: SimulationResultRow[];
  reportHistory: ResultRun[];
  savedSiteViews: SavedSiteView[];
}
