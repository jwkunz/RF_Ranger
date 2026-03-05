import type { AntennaModel, MapPin, PropagationModel, RadioSink, RadioSource, SimulationResultRow } from './types';

interface SimulationInput {
  sourceLabel: string;
  source: RadioSource;
  txAntenna: AntennaModel;
  fallbackRxAntenna: AntennaModel;
  propagationModel: PropagationModel;
  sinks: Array<{ pin: MapPin; sink: RadioSink; sinkAntenna: AntennaModel | null }>;
  txLatitude: number;
  txLongitude: number;
}

interface ProgressMessage {
  type: 'progress';
  completed: number;
  total: number;
}

interface CompleteMessage {
  type: 'complete';
  rows: SimulationResultRow[];
}

interface ErrorMessage {
  type: 'error';
  message: string;
}

self.onmessage = (event: MessageEvent<SimulationInput>) => {
  try {
    const input = event.data;
    const rows: SimulationResultRow[] = [];
    const total = input.sinks.length;

    for (let i = 0; i < total; i += 1) {
      const sinkDef = input.sinks[i];
      const rxAntenna = sinkDef.sinkAntenna ?? input.fallbackRxAntenna;

      const distanceKm = haversineKm(input.txLatitude, input.txLongitude, sinkDef.pin.latitude, sinkDef.pin.longitude);
      const frequencyMHz = input.source.carrierFrequencyMHz;
      const txGain = antennaGainDb(input.txAntenna);
      const rxGain = antennaGainDb(rxAntenna);

      const baseFsplDb = 20 * Math.log10(Math.max(distanceKm, 0.001)) + 20 * Math.log10(Math.max(frequencyMHz, 0.001)) + 32.44;
      const extraLossDb = modelLossAdjustmentDb(input.propagationModel, distanceKm, frequencyMHz);
      const totalPathLossDb = baseFsplDb + extraLossDb;
      const transmitterEirpDbm = input.source.txPowerDbm + txGain;

      const incidentRfPowerDbm = transmitterEirpDbm - totalPathLossDb;
      const availablePowerAtAntennaDbm = incidentRfPowerDbm + rxGain;

      const noiseFloorDbm = thermalNoiseDbm(
        sinkDef.sink.environmentNoiseTemperatureK ?? 300,
        sinkDef.sink.bandwidthHz,
        sinkDef.sink.noiseFigureDb ?? 10
      );
      const snrDb = availablePowerAtAntennaDbm - noiseFloorDbm;
      const thresholdDbm = noiseFloorDbm + (sinkDef.sink.requiredSnrDb ?? 15);

      const usable = availablePowerAtAntennaDbm >= thresholdDbm ? 'Y' : 'N';

      const warnings: string[] = [];
      if (Math.abs(sinkDef.sink.carrierFrequencyMHz - input.source.carrierFrequencyMHz) > 0.001) {
        warnings.push('Frequency mismatch between source and sink');
      }

      const txPowerWatts = dbmToWatts(input.source.txPowerDbm);
      const effectiveTxLinear = txPowerWatts * Math.pow(10, txGain / 10);
      const distanceMeters = Math.max(distanceKm * 1000, 1);
      const incidentElectricFieldVm = Math.sqrt((30 * effectiveTxLinear) / (distanceMeters * distanceMeters));

      rows.push({
        sinkPinId: sinkDef.pin.id,
        sourceName: input.sourceLabel,
        sinkName: sinkDef.pin.name,
        transmitterEirpDbm,
        distanceKm,
        propagationLossesDb: totalPathLossDb,
        incidentRfPowerDbm,
        incidentElectricFieldVm,
        availablePowerAtAntennaDbm,
        snrDb,
        usableLink: usable,
        warnings
      });

      const progressMessage: ProgressMessage = { type: 'progress', completed: i + 1, total };
      self.postMessage(progressMessage);
    }

    const complete: CompleteMessage = { type: 'complete', rows };
    self.postMessage(complete);
  } catch (error) {
    const message: ErrorMessage = { type: 'error', message: String(error) };
    self.postMessage(message);
  }
};

function modelLossAdjustmentDb(model: PropagationModel, distanceKm: number, frequencyMHz: number): number {
  const p = model.parameters;

  switch (model.modelType) {
    case 'Free Space':
      return p.additionalLossDb ?? 0;
    case 'Two-Ray': {
      const txHeight = p.txHeightM ?? 10;
      const rxHeight = p.rxHeightM ?? 2;
      const breakKm = ((4 * txHeight * rxHeight) / 0.3) / 1000;
      return distanceKm > breakKm ? 10 * Math.log10(Math.max(distanceKm / Math.max(breakKm, 0.001), 1)) * 2 : 0;
    }
    case 'Knife-Edge': {
      const h = p.obstacleHeightM ?? 10;
      const d1 = Math.max(p.d1Km ?? distanceKm / 2, 0.001) * 1000;
      const d2 = Math.max(p.d2Km ?? distanceKm / 2, 0.001) * 1000;
      const lambda = 300 / Math.max(frequencyMHz, 0.001);
      const nu = h * Math.sqrt((2 * (d1 + d2)) / (lambda * d1 * d2));
      return 6.9 + 20 * Math.log10(Math.sqrt((nu - 0.1) ** 2 + 1) + nu - 0.1);
    }
    case 'Ground Wave': {
      const conductivity = p.conductivitySPerM ?? 0.005;
      const dielectric = p.dielectricConstant ?? 15;
      return (distanceKm / 10) * (1 / Math.max(conductivity, 0.0001)) * 0.01 + (30 / Math.max(dielectric, 1));
    }
    case 'Ionospheric': {
      const fc = p.criticalFrequencyMHz ?? 5;
      const thetaDeg = p.incidenceAngleDeg ?? 30;
      const muFactor = fc / Math.cos((thetaDeg * Math.PI) / 180);
      return Math.max(0, Math.abs(frequencyMHz - muFactor));
    }
    case 'Log-Distance': {
      const n = p.pathLossExponent ?? 3;
      const d0m = p.referenceDistanceM ?? 1;
      const pl0 = p.referenceLossDb ?? 40;
      const d = Math.max(distanceKm * 1000, d0m);
      return pl0 + 10 * n * Math.log10(d / d0m);
    }
    case 'Effective Earth Radius': {
      const k = p.kFactor ?? 1.333333;
      const nominal = 1.333333;
      return ((nominal - k) / nominal) * 6;
    }
    case 'Troposcatter': {
      const A = p.constantA ?? 120;
      return A + 30 * Math.log10(Math.max(distanceKm, 0.001)) + 10 * Math.log10(Math.max(frequencyMHz, 0.001));
    }
    default:
      return 0;
  }
}

function dbmToWatts(dbm: number): number {
  return Math.pow(10, (dbm - 30) / 10);
}

function thermalNoiseDbm(temperatureK: number, bandwidthHz: number, noiseFigureDb: number): number {
  const t0 = 290;
  const noiseFactor = Math.pow(10, noiseFigureDb / 10);
  const receiverEquivalentTempK = t0 * Math.max(noiseFactor - 1, 0);
  const boltzmann = 1.380649e-23;
  const noiseWatts = boltzmann * Math.max(temperatureK + receiverEquivalentTempK, 1) * Math.max(bandwidthHz, 1);
  return 10 * Math.log10(noiseWatts * 1000);
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function antennaGainDb(antenna: AntennaModel): number {
  if (antenna.gainOverrideDb != null) {
    return antenna.gainOverrideDb;
  }

  switch (antenna.pattern) {
    case 'Omnidirectional':
      return 2.15;
    case 'Vertical Dipole':
      return 2.15;
    case 'Vertical Monopole':
      return 5.15;
    case 'Horizontal Dipole':
      return 2.15;
    case 'Horn':
      return 15;
    default:
      return 0;
  }
}
