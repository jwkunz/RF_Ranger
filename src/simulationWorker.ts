import type { AntennaPattern, PropagationModel, RadioSink, RadioSource, SimulationResultRow, Site } from './types';

interface QueueSimulationInputItem {
  queueItemId: string;
  comments: string;
  txSite: Site;
  sourceRadio: RadioSource;
  txAntenna: { heightM: number; pattern: AntennaPattern; gainOverrideDb?: number };
  propagationModel: PropagationModel;
  rxSite: Site;
  receiverRadio: RadioSink;
  rxAntenna: { heightM: number; pattern: AntennaPattern; gainOverrideDb?: number };
}

interface SimulationInput {
  items: QueueSimulationInputItem[];
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
    const total = input.items.length;

    for (let i = 0; i < total; i += 1) {
      const item = input.items[i];
      const distanceKm = haversineKm(item.txSite.latitude, item.txSite.longitude, item.rxSite.latitude, item.rxSite.longitude);
      const frequencyMHz = item.sourceRadio.carrierFrequencyMHz;

      const baseFsplDb = 20 * Math.log10(Math.max(distanceKm, 0.001)) + 20 * Math.log10(Math.max(frequencyMHz, 0.001)) + 32.44;
      const extraLossDb = modelLossAdjustmentDb(
        item.propagationModel,
        distanceKm,
        frequencyMHz,
        item.txAntenna.heightM,
        item.rxAntenna.heightM
      );
      const totalPathLossDb = baseFsplDb + extraLossDb;

      const txGainDb = antennaGainDb(item.txAntenna.pattern, item.txAntenna.gainOverrideDb);
      const rxGainDb = antennaGainDb(item.rxAntenna.pattern, item.rxAntenna.gainOverrideDb);
      const transmitterEirpDbm = item.sourceRadio.txPowerDbm + txGainDb;
      const txPowerDensityDbmPerHz = item.sourceRadio.txPowerDbm - 10 * Math.log10(Math.max(item.sourceRadio.bandwidthHz, 1));
      const transmitterEirpDensityDbmPerHz = txPowerDensityDbmPerHz + txGainDb;

      const incidentRfPowerDensityDbmPerHz = transmitterEirpDensityDbmPerHz - totalPathLossDb;
      const availablePowerDensityAtAntennaDbmPerHz = incidentRfPowerDensityDbmPerHz + rxGainDb;

      const receiverNoiseFloorDensityDbmPerHz = thermalNoiseDensityDbmPerHz(
        item.receiverRadio.environmentNoiseTemperatureK ?? 300,
        item.receiverRadio.noiseFigureDb ?? 10
      );
      const snrDb = availablePowerDensityAtAntennaDbmPerHz - receiverNoiseFloorDensityDbmPerHz;
      const thresholdDbmPerHz = receiverNoiseFloorDensityDbmPerHz + (item.receiverRadio.requiredSnrDb ?? 15);
      const usable = availablePowerDensityAtAntennaDbmPerHz >= thresholdDbmPerHz ? 'Y' : 'N';

      const warnings: string[] = [];
      if (Math.abs(item.receiverRadio.carrierFrequencyMHz - item.sourceRadio.carrierFrequencyMHz) > 0.001) {
        warnings.push('Frequency mismatch between source and sink');
      }

      const txPowerWatts = dbmToWatts(item.sourceRadio.txPowerDbm);
      const distanceMeters = Math.max(distanceKm * 1000, 1);
      const incidentElectricFieldVm = Math.sqrt((30 * txPowerWatts) / (distanceMeters * distanceMeters));

      rows.push({
        queueItemId: item.queueItemId,
        txSiteId: item.txSite.id,
        rxSiteId: item.rxSite.id,
        transmitterSiteName: item.txSite.name,
        transmitterCoordinates: `${item.txSite.latitude.toFixed(6)}, ${item.txSite.longitude.toFixed(6)}`,
        transmitterRadio: item.sourceRadio.name,
        frequencyMHz: item.sourceRadio.carrierFrequencyMHz,
        bandwidthKHz: item.sourceRadio.bandwidthHz / 1000,
        receiverSiteName: item.rxSite.name,
        receiverCoordinates: `${item.rxSite.latitude.toFixed(6)}, ${item.rxSite.longitude.toFixed(6)}`,
        receiverRadio: item.receiverRadio.name,
        sourceName: `${item.txSite.name} / ${item.sourceRadio.name}`,
        sinkName: `${item.rxSite.name} / ${item.receiverRadio.name}`,
        simulationComments: item.comments ?? '',
        transmitterEirpDbm,
        transmitterEirpDensityDbmPerHz,
        distanceKm,
        propagationLossesDb: totalPathLossDb,
        incidentRfPowerDensityDbmPerHz,
        incidentElectricFieldVm,
        availablePowerDensityAtAntennaDbmPerHz,
        receiverNoiseFloorDensityDbmPerHz,
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

function modelLossAdjustmentDb(
  model: PropagationModel,
  distanceKm: number,
  frequencyMHz: number,
  txHeightM: number,
  rxHeightM: number
): number {
  const p = model.parameters;

  switch (model.modelType) {
    case 'Free Space':
      return p.additionalLossDb ?? 0;
    case 'Two-Ray': {
      const txHeight = Math.max(txHeightM, 0.1);
      const rxHeight = Math.max(rxHeightM, 0.1);
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
      const losKm = 3.57 * (Math.sqrt(Math.max(txHeightM, 0)) + Math.sqrt(Math.max(rxHeightM, 0)));
      const beyondLosPenalty = distanceKm > losKm ? (distanceKm - losKm) * 0.2 : 0;
      return ((nominal - k) / nominal) * 6 + beyondLosPenalty;
    }
    case 'Troposcatter': {
      const factor = p.constantA ?? 120;
      return factor + 30 * Math.log10(Math.max(distanceKm, 0.001)) + 10 * Math.log10(Math.max(frequencyMHz, 0.001));
    }
    default:
      return 0;
  }
}

function dbmToWatts(dbm: number): number {
  return Math.pow(10, (dbm - 30) / 10);
}

function thermalNoiseDensityDbmPerHz(temperatureK: number, noiseFigureDb: number): number {
  const t0 = 290;
  const noiseFactor = Math.pow(10, noiseFigureDb / 10);
  const receiverEquivalentTempK = t0 * Math.max(noiseFactor - 1, 0);
  const boltzmann = 1.380649e-23;
  const noiseWatts = boltzmann * Math.max(temperatureK + receiverEquivalentTempK, 1);
  return 10 * Math.log10(noiseWatts * 1000);
}

function antennaGainDb(pattern: AntennaPattern, gainOverrideDb?: number): number {
  if (typeof gainOverrideDb === 'number' && Number.isFinite(gainOverrideDb)) {
    return gainOverrideDb;
  }
  switch (pattern) {
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
