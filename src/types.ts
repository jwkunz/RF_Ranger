export type TabId =
  | 'welcome'
  | 'map'
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

export interface MapPin {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  kind: 'source' | 'sink';
  radioId: string;
  antennaId: string;
}

export interface SimulationResultRow {
  sinkPinId: string;
  sourceName: string;
  sinkName: string;
  transmitterEirpDbm: number;
  distanceKm: number;
  propagationLossesDb: number;
  incidentRfPowerDbm: number;
  incidentElectricFieldVm: number;
  availablePowerAtAntennaDbm: number;
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
  pins: MapPin[];
  preferences: Preferences;
  reportLatest: SimulationResultRow[];
}
