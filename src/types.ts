export type TabId =
  | 'welcome'
  | 'sites'
  | 'simulation'
  | 'radios'
  | 'antennas'
  | 'propagation'
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
  | 'Horn';

export type Polarization = 'Vertical' | 'Horizontal' | 'Circular';

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
  txPowerDbm: number;
  carrierFrequencyMHz: number;
  bandwidthHz: number;
  noiseFigureDb: number;
}

export interface RadioSink {
  id: string;
  name: string;
  carrierFrequencyMHz: number;
  bandwidthHz: number;
  environmentNoiseTemperatureK: number;
  noiseFigureDb: number;
  requiredSnrDb: number;
}

export interface AntennaModel {
  id: string;
  name: string;
  heightM: number;
  azimuthDeg: number;
  tiltDeg: number;
  polarization: Polarization;
  pattern: AntennaPattern;
  gainOverrideDb?: number;
}

export interface PropagationModel {
  id: string;
  name: string;
  modelType: PropagationModelType;
  parameters: Record<string, number>;
}

export interface Site {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  pinColor: string;
}

export interface SimulationQueueItem {
  id: string;
  txSiteId: string;
  sourceRadioId: string;
  propagationModelId: string;
  rxSiteId: string;
  receiverRadioId: string;
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
}
