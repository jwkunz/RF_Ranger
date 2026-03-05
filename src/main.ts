import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import './styles.css';
import legalMarkdown from '../docs/LEGAL.md?raw';
import manualMarkdown from '../docs/Manual.md?raw';
import { DEFAULT_WORKSPACE } from './defaults';
import { exportPinsKml, exportReportsCsv, exportWorkspaceJson, parsePinsKml, parseWorkspaceJson } from './io';
import { loadWorkspace, saveWorkspace } from './storage';
import type {
  AntennaModel,
  AntennaPattern,
  Polarization,
  PropagationModel,
  PropagationModelType,
  RadioSink,
  RadioSource,
  SimulationResultRow,
  TabId,
  WorkspaceSnapshot
} from './types';

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'map', label: 'Map View' },
  { id: 'radios', label: 'Radios' },
  { id: 'antennas', label: 'Antennas' },
  { id: 'propagation', label: 'Propagation Models' },
  { id: 'reports', label: 'Reports' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'help', label: 'Help' }
];

const propagationParameterDefaults: Record<PropagationModelType, Record<string, number>> = {
  'Free Space': { additionalLossDb: 0 },
  'Two-Ray': { groundReflectionCoefficient: -1, txHeightM: 10, rxHeightM: 2 },
  'Knife-Edge': { obstacleHeightM: 10, d1Km: 1, d2Km: 1 },
  'Ground Wave': { conductivitySPerM: 0.005, dielectricConstant: 15 },
  Ionospheric: { criticalFrequencyMHz: 5, incidenceAngleDeg: 30 },
  'Log-Distance': { pathLossExponent: 3, referenceDistanceM: 1, referenceLossDb: 40 },
  'Effective Earth Radius': { kFactor: 1.333333, txHeightM: 20, rxHeightM: 5 },
  Troposcatter: { constantA: 120 }
};

interface ProgressState {
  running: boolean;
  completed: number;
  total: number;
  message: string;
}

interface SimulationWorkerInput {
  source: RadioSource;
  txAntenna: AntennaModel;
  fallbackRxAntenna: AntennaModel;
  propagationModel: PropagationModel;
  sinks: Array<{ pin: WorkspaceSnapshot['pins'][number]; sink: RadioSink; sinkAntenna: AntennaModel | null }>;
  txLatitude: number;
  txLongitude: number;
  snrThresholdDb: number;
}

interface SimulationProgressMessage {
  type: 'progress';
  completed: number;
  total: number;
}

interface SimulationCompleteMessage {
  type: 'complete';
  rows: SimulationResultRow[];
}

interface SimulationErrorMessage {
  type: 'error';
  message: string;
}

type SimulationWorkerMessage = SimulationProgressMessage | SimulationCompleteMessage | SimulationErrorMessage;

let selectedTab: TabId = 'map';
let splashDismissed = false;
let workspace: WorkspaceSnapshot = structuredClone(DEFAULT_WORKSPACE);
let activePropagationType: PropagationModelType = 'Free Space';
let map: maplibregl.Map | null = null;
let mapMarkers: maplibregl.Marker[] = [];
let selectedSourceId = '';
let selectedTxAntennaId = '';
let selectedPropagationModelId = '';
let selectedRxAntennaId = '';
let txLatitude = 39.8283;
let txLongitude = -98.5795;
let progress: ProgressState = { running: false, completed: 0, total: 0, message: 'Idle' };
let focusedReportPinId = '';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('App root not found');
}

void init();

async function init(): Promise<void> {
  workspace = await loadWorkspace();
  selectedSourceId = workspace.sources[0]?.id ?? '';
  selectedTxAntennaId = workspace.antennas[0]?.id ?? '';
  selectedPropagationModelId = workspace.propagationModels[0]?.id ?? '';
  selectedRxAntennaId = workspace.antennas[0]?.id ?? '';
  applyTheme();
  render();
}

function render(): void {
  if (!splashDismissed) {
    app.innerHTML = `
      <div class="splash">
        <div class="splash__card">
          <img src="/RF_Ranger.png" alt="RF Ranger" class="splash__logo" />
          <h1>RF Ranger</h1>
          <p class="splash__subtitle">Radio experimentation planning toolkit</p>
          <button id="enter-app" class="primary-btn">Enter Application</button>
          <footer class="splash__legal">${escapeHtml(legalMarkdown).replace(/\n/g, '<br/>')}</footer>
        </div>
      </div>
    `;

    const enterButton = document.querySelector<HTMLButtonElement>('#enter-app');
    enterButton?.addEventListener('click', () => {
      splashDismissed = true;
      render();
    });
    return;
  }

  const tabButtons = tabs
    .map(
      (tab) =>
        `<button data-tab="${tab.id}" class="tab-btn ${selectedTab === tab.id ? 'tab-btn--active' : ''}">${tab.label}</button>`
    )
    .join('');

  app.innerHTML = `
    <div class="shell">
      <header class="tabs">${tabButtons}</header>
      <main class="tab-content">${renderTabContent(selectedTab)}</main>
    </div>
  `;

  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedTab = button.dataset.tab as TabId;
      render();
    });
  });

  wireTabEvents();
}

function renderTabContent(tabId: TabId): string {
  switch (tabId) {
    case 'map':
      return renderMapTab();
    case 'radios':
      return renderRadiosTab();
    case 'antennas':
      return renderAntennasTab();
    case 'propagation':
      return renderPropagationTab();
    case 'reports':
      return renderReportsTab();
    case 'preferences':
      return renderPreferencesTab();
    case 'help':
      return renderHelpTab();
    default:
      return '<h2>RF Ranger</h2>';
  }
}

function renderMapTab(): string {
  const sourceOptions = workspace.sources
    .map((source) => `<option value="${source.id}" ${source.id === selectedSourceId ? 'selected' : ''}>${escapeHtml(source.name)}</option>`)
    .join('');
  const antennaOptions = workspace.antennas
    .map((antenna) => `<option value="${antenna.id}" ${antenna.id === selectedTxAntennaId ? 'selected' : ''}>${escapeHtml(antenna.name)}</option>`)
    .join('');
  const propagationOptions = workspace.propagationModels
    .map(
      (model) =>
        `<option value="${model.id}" ${model.id === selectedPropagationModelId ? 'selected' : ''}>${escapeHtml(model.name)} (${model.modelType})</option>`
    )
    .join('');
  const sinkOptions = workspace.sinks.map((sink) => `<option value="${sink.id}">${escapeHtml(sink.name)}</option>`).join('');

  const pinRows = workspace.pins
    .map((pin) => {
      const sink = workspace.sinks.find((entry) => entry.id === pin.sinkRadioId);
      const antenna = workspace.antennas.find((entry) => entry.id === pin.sinkAntennaId);
      const reportLink = workspace.reportLatest.some((row) => row.sinkPinId === pin.id)
        ? `<button data-jump-report="${pin.id}" title="Jump to report">🔗</button>`
        : '';
      return `<tr>
        <td>${escapeHtml(pin.name)}</td>
        <td>${pin.latitude.toFixed(6)}, ${pin.longitude.toFixed(6)}</td>
        <td>${escapeHtml(sink?.name ?? 'unknown')}</td>
        <td>${escapeHtml(antenna?.name ?? 'unknown')}</td>
        <td>${reportLink} <button data-delete-pin="${pin.id}">Delete</button></td>
      </tr>`;
    })
    .join('');

  const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return `
    <h2>Map View</h2>
    <div class="map-layout">
      <aside class="panel stack map-controls">
        <h3>Simulation Inputs</h3>
        <label>TX Latitude<input id="tx-lat" type="number" step="0.000001" value="${txLatitude}" /></label>
        <label>TX Longitude<input id="tx-lon" type="number" step="0.000001" value="${txLongitude}" /></label>
        <label>TX Power Model (Source)
          <select id="map-source-select">${sourceOptions || '<option value="">No source available</option>'}</select>
        </label>
        <label>TX Antenna Gain Model
          <select id="map-tx-antenna-select">${antennaOptions || '<option value="">No antenna available</option>'}</select>
        </label>
        <label>Propagation Loss Model
          <select id="map-propagation-select">${propagationOptions || '<option value="">No model available</option>'}</select>
        </label>
        <label>RX Antenna Gain Model
          <select id="map-rx-antenna-select">${antennaOptions || '<option value="">No antenna available</option>'}</select>
        </label>
        <button id="map-calc" class="primary-btn" ${progress.running ? 'disabled' : ''}>Calculate</button>
        <div class="progress-wrap">
          <div>Progress: ${progress.message}</div>
          <progress value="${progress.completed}" max="${Math.max(progress.total, 1)}"></progress>
          <div>${percent}%</div>
        </div>
        <h3>Add Sink Pin</h3>
        <label>Pin Name<input id="pin-name" placeholder="Sink name" /></label>
        <label>Bind Sink Radio
          <select id="pin-sink-select">${sinkOptions || '<option value="">No sink radio available</option>'}</select>
        </label>
        <label>Bind Sink Antenna
          <select id="pin-antenna-select">${antennaOptions || '<option value="">No antenna available</option>'}</select>
        </label>
        <label>Latitude<input id="pin-lat" type="number" step="0.000001" /></label>
        <label>Longitude<input id="pin-lon" type="number" step="0.000001" /></label>
        <button id="add-pin-coord">Add Pin (Coordinates)</button>
        <label>Address Search
          <input id="geocode-input" placeholder="Address" />
        </label>
        <button id="add-pin-address">Geocode + Add Pin</button>
        <div class="action-row">
          <button id="export-kml">Export KML</button>
          <label class="import-label">Import KML<input id="import-kml" type="file" accept=".kml,application/vnd.google-earth.kml+xml" /></label>
        </div>
      </aside>
      <section class="panel map-panel">
        <div id="map-canvas"></div>
      </section>
    </div>
    <section class="panel">
      <h3>Defined Sink Pins</h3>
      <table>
        <thead><tr><th>Name</th><th>Coordinates</th><th>Sink Radio</th><th>Sink Antenna</th><th>Actions</th></tr></thead>
        <tbody>${pinRows || '<tr><td colspan="5">No sink pins yet.</td></tr>'}</tbody>
      </table>
      <p class="muted">Tip: Click on the map to set coordinate fields, then add pin with required sink bindings.</p>
    </section>
  `;
}

function renderReportsTab(): string {
  const rows = workspace.reportLatest
    .map((row) => {
      const highlighted = row.sinkPinId === focusedReportPinId ? ' class="focus-row"' : '';
      return `<tr${highlighted}>
        <td>${escapeHtml(row.sinkName)}</td>
        <td>${formatDistance(row.distanceKm)}</td>
        <td>${formatPower(row.incidentRfPowerDbm)}</td>
        <td>${row.incidentElectricFieldVm.toExponential(3)} V/m</td>
        <td>${formatPower(row.availablePowerAtAntennaDbm)}</td>
        <td>${row.snrDb.toFixed(2)} dB</td>
        <td>${row.usableLink}</td>
        <td>${escapeHtml(row.warnings.join('; '))}</td>
        <td><button data-jump-pin="${row.sinkPinId}">Map</button></td>
      </tr>`;
    })
    .join('');

  return `
    <h2>Reports</h2>
    <section class="panel">
      <div class="action-row">
        <button id="export-csv">Export CSV</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Sink</th>
            <th>Distance</th>
            <th>Incident RF Power</th>
            <th>Incident Electric Field</th>
            <th>Available Power at Antenna</th>
            <th>SNR</th>
            <th>Useable Link</th>
            <th>Warnings</th>
            <th>Jump</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="9">No report data. Run Calculate in Map View.</td></tr>'}</tbody>
      </table>
    </section>
  `;
}

function renderHelpTab(): string {
  const manual = renderManualWithToc(manualMarkdown);
  return `
    <h2>Help</h2>
    <section class="panel manual">
      <div class="manual__toc">
        <h3>Contents</h3>
        ${manual.tocHtml}
      </div>
      <div class="manual__body">${manual.bodyHtml}</div>
    </section>
  `;
}

function renderRadiosTab(): string {
  const sourceRows = workspace.sources
    .map(
      (source) => `
      <tr>
        <td>${escapeHtml(source.name)}</td>
        <td>${source.txPowerDbm}</td>
        <td>${source.carrierFrequencyMHz}</td>
        <td>${source.bandwidthHz}</td>
        <td>${source.noiseFigureDb}</td>
        <td><button data-edit-source="${source.id}">Edit</button> <button data-delete-source="${source.id}">Delete</button></td>
      </tr>`
    )
    .join('');

  const sinkRows = workspace.sinks
    .map(
      (sink) => `
      <tr>
        <td>${escapeHtml(sink.name)}</td>
        <td>${sink.receiverSensitivityDbm}</td>
        <td>${sink.carrierFrequencyMHz}</td>
        <td>${sink.bandwidthHz}</td>
        <td>${sink.noiseFigureDb}</td>
        <td>${sink.manualNoiseFloorDbm ?? 'auto'}</td>
        <td><button data-edit-sink="${sink.id}">Edit</button> <button data-delete-sink="${sink.id}">Delete</button></td>
      </tr>`
    )
    .join('');

  return `
    <h2>Radios</h2>
    <section class="panel">
      <h3>Add Source</h3>
      <form id="add-source-form" class="grid-form">
        <input name="name" placeholder="Name" required />
        <input name="txPowerDbm" type="number" step="0.1" placeholder="TX Power (dBm)" required />
        <input name="carrierFrequencyMHz" type="number" step="0.001" placeholder="Carrier Frequency (MHz)" required />
        <input name="bandwidthHz" type="number" step="1" placeholder="Bandwidth (Hz)" required />
        <input name="noiseFigureDb" type="number" step="0.1" placeholder="Noise Figure (dB)" required />
        <button class="primary-btn" type="submit">Add Source</button>
      </form>
    </section>
    <section class="panel">
      <h3>Sources</h3>
      <table>
        <thead><tr><th>Name</th><th>TX Power</th><th>Freq (MHz)</th><th>BW (Hz)</th><th>NF (dB)</th><th>Actions</th></tr></thead>
        <tbody>${sourceRows || '<tr><td colspan="6">No sources yet.</td></tr>'}</tbody>
      </table>
    </section>
    <section class="panel">
      <h3>Add Sink</h3>
      <form id="add-sink-form" class="grid-form">
        <input name="name" placeholder="Name" required />
        <input name="receiverSensitivityDbm" type="number" step="0.1" placeholder="Receiver Sensitivity (dBm)" required />
        <input name="carrierFrequencyMHz" type="number" step="0.001" placeholder="Carrier Frequency (MHz)" required />
        <input name="bandwidthHz" type="number" step="1" placeholder="Bandwidth (Hz)" required />
        <input name="noiseFigureDb" type="number" step="0.1" placeholder="Noise Figure (dB)" required />
        <input name="manualNoiseFloorDbm" type="number" step="0.1" placeholder="Manual Noise Floor (optional)" />
        <button class="primary-btn" type="submit">Add Sink</button>
      </form>
    </section>
    <section class="panel">
      <h3>Sinks</h3>
      <table>
        <thead><tr><th>Name</th><th>Sensitivity</th><th>Freq (MHz)</th><th>BW (Hz)</th><th>NF (dB)</th><th>Noise Floor</th><th>Actions</th></tr></thead>
        <tbody>${sinkRows || '<tr><td colspan="7">No sinks yet.</td></tr>'}</tbody>
      </table>
    </section>
  `;
}

function renderAntennasTab(): string {
  const rows = workspace.antennas
    .map(
      (antenna) => `
      <tr>
        <td>${escapeHtml(antenna.name)}</td>
        <td>${antenna.heightM}</td>
        <td>${antenna.azimuthDeg}</td>
        <td>${antenna.tiltDeg}</td>
        <td>${antenna.polarization}</td>
        <td>${antenna.pattern}</td>
        <td>${antenna.gainOverrideDb ?? 'default'}</td>
        <td><button data-edit-antenna="${antenna.id}">Edit</button> <button data-delete-antenna="${antenna.id}">Delete</button></td>
      </tr>`
    )
    .join('');

  return `
    <h2>Antennas</h2>
    <section class="panel">
      <h3>Add Antenna</h3>
      <form id="add-antenna-form" class="grid-form">
        <input name="name" placeholder="Name" required />
        <input name="heightM" type="number" step="0.1" placeholder="Height (m)" required />
        <input name="azimuthDeg" type="number" step="0.1" placeholder="Azimuth (deg)" required />
        <input name="tiltDeg" type="number" step="0.1" placeholder="Tilt (deg)" required />
        <select name="polarization">
          <option>Vertical</option>
          <option>Horizontal</option>
          <option>Circular</option>
        </select>
        <select name="pattern">
          <option>Omnidirectional</option>
          <option>Vertical Dipole</option>
          <option>Vertical Monopole</option>
          <option>Horizontal Dipole</option>
          <option>Horn</option>
        </select>
        <input name="gainOverrideDb" type="number" step="0.1" placeholder="Gain Override (optional)" />
        <button class="primary-btn" type="submit">Add Antenna</button>
      </form>
    </section>
    <section class="panel">
      <h3>Known Antennas</h3>
      <table>
        <thead><tr><th>Name</th><th>Height</th><th>Azimuth</th><th>Tilt</th><th>Pol</th><th>Pattern</th><th>Gain</th><th>Actions</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="8">No antennas yet.</td></tr>'}</tbody>
      </table>
    </section>
  `;
}

function renderPropagationTab(): string {
  const modelTypeOptions = Object.keys(propagationParameterDefaults)
    .map((modelType) => `<option value="${modelType}" ${modelType === activePropagationType ? 'selected' : ''}>${modelType}</option>`)
    .join('');

  const parameterInputs = Object.entries(propagationParameterDefaults[activePropagationType])
    .map(
      ([key, value]) =>
        `<label>${prettyLabel(key)}<input data-prop-param="${key}" type="number" step="0.0001" value="${value}" /></label>`
    )
    .join('');

  const rows = workspace.propagationModels
    .map(
      (model) => `
      <tr>
        <td>${escapeHtml(model.name)}</td>
        <td>${model.modelType}</td>
        <td><code>${escapeHtml(JSON.stringify(model.parameters))}</code></td>
        <td><button data-edit-prop="${model.id}">Edit</button> <button data-delete-prop="${model.id}">Delete</button></td>
      </tr>`
    )
    .join('');

  return `
    <h2>Propagation Models</h2>
    <section class="panel">
      <h3>Add Propagation Model</h3>
      <form id="add-prop-form" class="stack">
        <input name="name" placeholder="Preset Name" required />
        <label>Model Type
          <select name="modelType" id="prop-model-type">${modelTypeOptions}</select>
        </label>
        <fieldset class="param-grid">
          <legend>Model Parameters</legend>
          ${parameterInputs}
        </fieldset>
        <button class="primary-btn" type="submit">Add Model</button>
      </form>
    </section>
    <section class="panel">
      <h3>Known Propagation Models</h3>
      <table>
        <thead><tr><th>Name</th><th>Type</th><th>Parameters</th><th>Actions</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="4">No propagation models yet.</td></tr>'}</tbody>
      </table>
    </section>
  `;
}

function renderPreferencesTab(): string {
  return `
    <h2>Preferences</h2>
    <div class="stack panel">
      <label>Theme
        <select id="pref-theme">
          <option value="light" ${workspace.preferences.theme === 'light' ? 'selected' : ''}>Light</option>
          <option value="dark" ${workspace.preferences.theme === 'dark' ? 'selected' : ''}>Dark</option>
        </select>
      </label>
      <label>Power Unit
        <select id="pref-power-unit">
          <option value="dBm" ${workspace.preferences.powerUnit === 'dBm' ? 'selected' : ''}>dBm</option>
          <option value="dBW" ${workspace.preferences.powerUnit === 'dBW' ? 'selected' : ''}>dBW</option>
        </select>
      </label>
      <label>Distance Unit
        <select id="pref-distance-unit">
          <option value="km" ${workspace.preferences.distanceUnit === 'km' ? 'selected' : ''}>km</option>
          <option value="m" ${workspace.preferences.distanceUnit === 'm' ? 'selected' : ''}>m</option>
          <option value="miles" ${workspace.preferences.distanceUnit === 'miles' ? 'selected' : ''}>miles</option>
          <option value="feet" ${workspace.preferences.distanceUnit === 'feet' ? 'selected' : ''}>feet</option>
        </select>
      </label>
      <label>SNR Threshold (dB)
        <input id="pref-snr" type="number" value="${workspace.preferences.snrThresholdDb}" step="0.1" />
      </label>
      <div class="action-row">
        <button id="export-json" class="primary-btn">Export Workspace JSON</button>
        <label class="import-label">Import Workspace JSON<input id="import-json" type="file" accept="application/json,.json" /></label>
      </div>
    </div>
  `;
}

function wireTabEvents(): void {
  if (selectedTab === 'preferences') {
    wirePreferencesEvents();
  }
  if (selectedTab === 'radios') {
    wireRadiosEvents();
  }
  if (selectedTab === 'antennas') {
    wireAntennaEvents();
  }
  if (selectedTab === 'propagation') {
    wirePropagationEvents();
  }
  if (selectedTab === 'map') {
    wireMapEvents();
  }
  if (selectedTab === 'reports') {
    wireReportsEvents();
  }
}

function wireMapEvents(): void {
  const sourceSelect = document.querySelector<HTMLSelectElement>('#map-source-select');
  const txAntennaSelect = document.querySelector<HTMLSelectElement>('#map-tx-antenna-select');
  const propagationSelect = document.querySelector<HTMLSelectElement>('#map-propagation-select');
  const rxAntennaSelect = document.querySelector<HTMLSelectElement>('#map-rx-antenna-select');

  sourceSelect?.addEventListener('change', () => {
    selectedSourceId = sourceSelect.value;
  });
  txAntennaSelect?.addEventListener('change', () => {
    selectedTxAntennaId = txAntennaSelect.value;
  });
  propagationSelect?.addEventListener('change', () => {
    selectedPropagationModelId = propagationSelect.value;
  });
  rxAntennaSelect?.addEventListener('change', () => {
    selectedRxAntennaId = rxAntennaSelect.value;
  });

  document.querySelector<HTMLButtonElement>('#add-pin-coord')?.addEventListener('click', async () => {
    await addPinFromForm();
  });

  document.querySelector<HTMLButtonElement>('#add-pin-address')?.addEventListener('click', async () => {
    const input = document.querySelector<HTMLInputElement>('#geocode-input');
    if (!input?.value.trim()) {
      alert('Enter an address first.');
      return;
    }
    const result = await geocodeAddress(input.value.trim());
    if (!result) {
      alert('Address not found.');
      return;
    }
    const latInput = document.querySelector<HTMLInputElement>('#pin-lat');
    const lonInput = document.querySelector<HTMLInputElement>('#pin-lon');
    if (latInput && lonInput) {
      latInput.value = String(result.lat);
      lonInput.value = String(result.lon);
    }
    await addPinFromForm();
    map?.flyTo({ center: [result.lon, result.lat], zoom: 12 });
  });

  document.querySelector<HTMLButtonElement>('#export-kml')?.addEventListener('click', () => {
    exportPinsKml(workspace.pins);
  });

  document.querySelector<HTMLInputElement>('#import-kml')?.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    const pins = await parsePinsKml(file);
    const valid = pins.filter((pin) => pin.sinkRadioId && pin.sinkAntennaId);
    workspace.pins.push(...valid);
    await saveWorkspace(workspace);
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-delete-pin]').forEach((button) => {
    button.addEventListener('click', async () => {
      workspace.pins = workspace.pins.filter((pin) => pin.id !== button.dataset.deletePin);
      await saveWorkspace(workspace);
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-jump-report]').forEach((button) => {
    button.addEventListener('click', () => {
      focusedReportPinId = button.dataset.jumpReport ?? '';
      selectedTab = 'reports';
      render();
    });
  });

  document.querySelector<HTMLButtonElement>('#map-calc')?.addEventListener('click', async () => {
    await runSimulation();
  });

  const txLatInput = document.querySelector<HTMLInputElement>('#tx-lat');
  const txLonInput = document.querySelector<HTMLInputElement>('#tx-lon');
  txLatInput?.addEventListener('change', () => {
    txLatitude = Number.parseFloat(txLatInput.value);
  });
  txLonInput?.addEventListener('change', () => {
    txLongitude = Number.parseFloat(txLonInput.value);
  });

  initMap();
}

function wireReportsEvents(): void {
  document.querySelector<HTMLButtonElement>('#export-csv')?.addEventListener('click', () => {
    exportReportsCsv(workspace.reportLatest);
  });

  document.querySelectorAll<HTMLButtonElement>('[data-jump-pin]').forEach((button) => {
    button.addEventListener('click', () => {
      const pinId = button.dataset.jumpPin ?? '';
      const pin = workspace.pins.find((entry) => entry.id === pinId);
      selectedTab = 'map';
      render();
      if (pin && map) {
        map.flyTo({ center: [pin.longitude, pin.latitude], zoom: 13 });
      }
    });
  });
}

async function runSimulation(): Promise<void> {
  const source = workspace.sources.find((entry) => entry.id === selectedSourceId);
  const txAntenna = workspace.antennas.find((entry) => entry.id === selectedTxAntennaId);
  const propagationModel = workspace.propagationModels.find((entry) => entry.id === selectedPropagationModelId);
  const fallbackRxAntenna = workspace.antennas.find((entry) => entry.id === selectedRxAntennaId);

  if (!source || !txAntenna || !propagationModel || !fallbackRxAntenna) {
    alert('Select source, TX antenna, propagation model, and RX antenna before calculation.');
    return;
  }

  const sinks = workspace.pins
    .map((pin) => {
      const sink = workspace.sinks.find((entry) => entry.id === pin.sinkRadioId);
      if (!sink) {
        return null;
      }
      const sinkAntenna = workspace.antennas.find((entry) => entry.id === pin.sinkAntennaId) ?? null;
      return { pin, sink, sinkAntenna };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  if (!sinks.length) {
    alert('Add sink pins bound to valid sink radios before calculation.');
    return;
  }

  progress = { running: true, completed: 0, total: sinks.length, message: 'Starting' };
  render();

  const worker = new Worker(new URL('./simulationWorker.ts', import.meta.url), { type: 'module' });

  const input: SimulationWorkerInput = {
    source,
    txAntenna,
    fallbackRxAntenna,
    propagationModel,
    sinks,
    txLatitude,
    txLongitude,
    snrThresholdDb: workspace.preferences.snrThresholdDb
  };

  worker.onmessage = async (event: MessageEvent<SimulationWorkerMessage>) => {
    if (event.data.type === 'progress') {
      progress = {
        running: true,
        completed: event.data.completed,
        total: event.data.total,
        message: `Processed ${event.data.completed}/${event.data.total}`
      };
      render();
      return;
    }

    if (event.data.type === 'complete') {
      workspace.reportLatest = event.data.rows;
      await saveWorkspace(workspace);
      progress = { running: false, completed: event.data.rows.length, total: event.data.rows.length, message: 'Complete' };
      worker.terminate();
      selectedTab = 'reports';
      render();
      return;
    }

    if (event.data.type === 'error') {
      progress = { running: false, completed: 0, total: 0, message: 'Error' };
      worker.terminate();
      alert(`Simulation failed: ${event.data.message}`);
      render();
    }
  };

  worker.postMessage(input);
}

async function addPinFromForm(): Promise<void> {
  const nameInput = document.querySelector<HTMLInputElement>('#pin-name');
  const sinkSelect = document.querySelector<HTMLSelectElement>('#pin-sink-select');
  const antennaSelect = document.querySelector<HTMLSelectElement>('#pin-antenna-select');
  const latInput = document.querySelector<HTMLInputElement>('#pin-lat');
  const lonInput = document.querySelector<HTMLInputElement>('#pin-lon');

  const sinkRadioId = sinkSelect?.value || '';
  const sinkAntennaId = antennaSelect?.value || '';
  if (!sinkRadioId || !sinkAntennaId) {
    alert('Pin requires bound sink radio and sink antenna.');
    return;
  }

  const lat = Number.parseFloat(latInput?.value ?? '');
  const lon = Number.parseFloat(lonInput?.value ?? '');
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    alert('Provide valid latitude and longitude.');
    return;
  }

  workspace.pins.push({
    id: uid(),
    name: nameInput?.value.trim() || `Sink ${workspace.pins.length + 1}`,
    latitude: lat,
    longitude: lon,
    sinkRadioId,
    sinkAntennaId
  });

  await saveWorkspace(workspace);
  render();
}

function initMap(): void {
  const mapCanvas = document.querySelector<HTMLDivElement>('#map-canvas');
  if (!mapCanvas) {
    return;
  }

  if (!map) {
    map = new maplibregl.Map({
      container: mapCanvas,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors'
          }
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
      },
      center: [txLongitude, txLatitude],
      zoom: 4
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.on('click', (event) => {
      const latInput = document.querySelector<HTMLInputElement>('#pin-lat');
      const lonInput = document.querySelector<HTMLInputElement>('#pin-lon');
      if (latInput && lonInput) {
        latInput.value = event.lngLat.lat.toFixed(6);
        lonInput.value = event.lngLat.lng.toFixed(6);
      }
    });
  } else {
    map.resize();
  }

  for (const marker of mapMarkers) {
    marker.remove();
  }
  mapMarkers = workspace.pins.map((pin) => {
    const marker = new maplibregl.Marker({ color: '#dc2626' }).setLngLat([pin.longitude, pin.latitude]).setPopup(
      new maplibregl.Popup().setHTML(`<strong>${escapeHtml(pin.name)}</strong>`)
    );
    marker.addTo(map as maplibregl.Map);
    return marker;
  });

  const txMarker = new maplibregl.Marker({ color: '#16a34a' })
    .setLngLat([txLongitude, txLatitude])
    .setPopup(new maplibregl.Popup().setHTML('<strong>TX Source</strong>'));
  txMarker.addTo(map as maplibregl.Map);
  mapMarkers.push(txMarker);
}

async function geocodeAddress(query: string): Promise<{ lat: number; lon: number } | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as Array<{ lat: string; lon: string }>;
  if (!payload.length) {
    return null;
  }

  return {
    lat: Number.parseFloat(payload[0].lat),
    lon: Number.parseFloat(payload[0].lon)
  };
}

function wireRadiosEvents(): void {
  const sourceForm = document.querySelector<HTMLFormElement>('#add-source-form');
  sourceForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(sourceForm);
    const source: RadioSource = {
      id: uid(),
      name: String(data.get('name') ?? ''),
      txPowerDbm: toNumber(data.get('txPowerDbm')),
      carrierFrequencyMHz: toNumber(data.get('carrierFrequencyMHz')),
      bandwidthHz: toNumber(data.get('bandwidthHz')),
      noiseFigureDb: toNumber(data.get('noiseFigureDb'))
    };
    workspace.sources.push(source);
    selectedSourceId ||= source.id;
    await saveWorkspace(workspace);
    render();
  });

  const sinkForm = document.querySelector<HTMLFormElement>('#add-sink-form');
  sinkForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(sinkForm);
    const manualNoiseFloor = String(data.get('manualNoiseFloorDbm') ?? '').trim();
    const sink: RadioSink = {
      id: uid(),
      name: String(data.get('name') ?? ''),
      receiverSensitivityDbm: toNumber(data.get('receiverSensitivityDbm')),
      carrierFrequencyMHz: toNumber(data.get('carrierFrequencyMHz')),
      bandwidthHz: toNumber(data.get('bandwidthHz')),
      noiseFigureDb: toNumber(data.get('noiseFigureDb')),
      manualNoiseFloorDbm: manualNoiseFloor ? Number.parseFloat(manualNoiseFloor) : undefined
    };
    workspace.sinks.push(sink);
    await saveWorkspace(workspace);
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-delete-source]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deleteSource;
      workspace.sources = workspace.sources.filter((source) => source.id !== id);
      if (selectedSourceId === id) {
        selectedSourceId = workspace.sources[0]?.id ?? '';
      }
      await saveWorkspace(workspace);
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-delete-sink]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deleteSink;
      workspace.sinks = workspace.sinks.filter((sink) => sink.id !== id);
      await saveWorkspace(workspace);
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-edit-source]').forEach((button) => {
    button.addEventListener('click', async () => {
      const source = workspace.sources.find((entry) => entry.id === button.dataset.editSource);
      if (!source) {
        return;
      }
      const name = prompt('Source Name', source.name);
      if (!name) {
        return;
      }
      source.name = name;
      await saveWorkspace(workspace);
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-edit-sink]').forEach((button) => {
    button.addEventListener('click', async () => {
      const sink = workspace.sinks.find((entry) => entry.id === button.dataset.editSink);
      if (!sink) {
        return;
      }
      const name = prompt('Sink Name', sink.name);
      if (!name) {
        return;
      }
      sink.name = name;
      await saveWorkspace(workspace);
      render();
    });
  });
}

function wireAntennaEvents(): void {
  const form = document.querySelector<HTMLFormElement>('#add-antenna-form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const rawGain = String(data.get('gainOverrideDb') ?? '').trim();
    const antenna: AntennaModel = {
      id: uid(),
      name: String(data.get('name') ?? ''),
      heightM: toNumber(data.get('heightM')),
      azimuthDeg: toNumber(data.get('azimuthDeg')),
      tiltDeg: toNumber(data.get('tiltDeg')),
      polarization: String(data.get('polarization')) as Polarization,
      pattern: String(data.get('pattern')) as AntennaPattern,
      gainOverrideDb: rawGain ? Number.parseFloat(rawGain) : undefined
    };
    workspace.antennas.push(antenna);
    selectedTxAntennaId ||= antenna.id;
    selectedRxAntennaId ||= antenna.id;
    await saveWorkspace(workspace);
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-delete-antenna]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deleteAntenna;
      workspace.antennas = workspace.antennas.filter((entry) => entry.id !== id);
      if (selectedTxAntennaId === id) {
        selectedTxAntennaId = workspace.antennas[0]?.id ?? '';
      }
      if (selectedRxAntennaId === id) {
        selectedRxAntennaId = workspace.antennas[0]?.id ?? '';
      }
      await saveWorkspace(workspace);
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-edit-antenna]').forEach((button) => {
    button.addEventListener('click', async () => {
      const antenna = workspace.antennas.find((entry) => entry.id === button.dataset.editAntenna);
      if (!antenna) {
        return;
      }
      const name = prompt('Antenna Name', antenna.name);
      if (!name) {
        return;
      }
      antenna.name = name;
      await saveWorkspace(workspace);
      render();
    });
  });
}

function wirePropagationEvents(): void {
  const modelType = document.querySelector<HTMLSelectElement>('#prop-model-type');
  modelType?.addEventListener('change', () => {
    activePropagationType = modelType.value as PropagationModelType;
    render();
  });

  const form = document.querySelector<HTMLFormElement>('#add-prop-form');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const modelTypeValue = String(data.get('modelType')) as PropagationModelType;
    const parameterEntries = Array.from(document.querySelectorAll<HTMLInputElement>('[data-prop-param]')).map((input) => [
      String(input.dataset.propParam),
      Number.parseFloat(input.value)
    ]);

    const model: PropagationModel = {
      id: uid(),
      name: String(data.get('name') ?? ''),
      modelType: modelTypeValue,
      parameters: Object.fromEntries(parameterEntries)
    };

    workspace.propagationModels.push(model);
    selectedPropagationModelId ||= model.id;
    await saveWorkspace(workspace);
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-delete-prop]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deleteProp;
      workspace.propagationModels = workspace.propagationModels.filter((entry) => entry.id !== id);
      if (selectedPropagationModelId === id) {
        selectedPropagationModelId = workspace.propagationModels[0]?.id ?? '';
      }
      await saveWorkspace(workspace);
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-edit-prop]').forEach((button) => {
    button.addEventListener('click', async () => {
      const model = workspace.propagationModels.find((entry) => entry.id === button.dataset.editProp);
      if (!model) {
        return;
      }
      const name = prompt('Propagation preset name', model.name);
      if (!name) {
        return;
      }
      model.name = name;
      await saveWorkspace(workspace);
      render();
    });
  });
}

function wirePreferencesEvents(): void {
  const theme = document.querySelector<HTMLSelectElement>('#pref-theme');
  const powerUnit = document.querySelector<HTMLSelectElement>('#pref-power-unit');
  const distanceUnit = document.querySelector<HTMLSelectElement>('#pref-distance-unit');
  const snr = document.querySelector<HTMLInputElement>('#pref-snr');
  const exportButton = document.querySelector<HTMLButtonElement>('#export-json');
  const importInput = document.querySelector<HTMLInputElement>('#import-json');

  theme?.addEventListener('change', async () => {
    workspace.preferences.theme = theme.value as WorkspaceSnapshot['preferences']['theme'];
    applyTheme();
    await saveWorkspace(workspace);
  });

  powerUnit?.addEventListener('change', async () => {
    workspace.preferences.powerUnit = powerUnit.value as WorkspaceSnapshot['preferences']['powerUnit'];
    await saveWorkspace(workspace);
  });

  distanceUnit?.addEventListener('change', async () => {
    workspace.preferences.distanceUnit = distanceUnit.value as WorkspaceSnapshot['preferences']['distanceUnit'];
    await saveWorkspace(workspace);
  });

  snr?.addEventListener('change', async () => {
    const value = Number.parseFloat(snr.value);
    if (Number.isFinite(value)) {
      workspace.preferences.snrThresholdDb = value;
      await saveWorkspace(workspace);
    }
  });

  exportButton?.addEventListener('click', () => {
    exportWorkspaceJson(workspace);
  });

  importInput?.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) {
      return;
    }
    try {
      workspace = await parseWorkspaceJson(file);
      await saveWorkspace(workspace);
      applyTheme();
      render();
    } catch (error) {
      alert(`Import failed: ${String(error)}`);
    }
  });
}

function applyTheme(): void {
  document.documentElement.dataset.theme = workspace.preferences.theme;
}

function formatPower(dbm: number): string {
  if (workspace.preferences.powerUnit === 'dBW') {
    return `${(dbm - 30).toFixed(2)} dBW`;
  }
  return `${dbm.toFixed(2)} dBm`;
}

function formatDistance(km: number): string {
  switch (workspace.preferences.distanceUnit) {
    case 'm':
      return `${(km * 1000).toFixed(2)} m`;
    case 'miles':
      return `${(km * 0.621371).toFixed(3)} miles`;
    case 'feet':
      return `${(km * 3280.84).toFixed(2)} ft`;
    case 'km':
    default:
      return `${km.toFixed(3)} km`;
  }
}

function renderManualWithToc(markdown: string): { tocHtml: string; bodyHtml: string } {
  const lines = markdown.split('\n');
  const headings: Array<{ level: number; text: string; slug: string }> = [];
  const body: string[] = [];
  let inList = false;

  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (inList) {
        body.push('</ul>');
        inList = false;
      }
      const text = line.slice(4).trim();
      const slug = slugify(text);
      headings.push({ level: 3, text, slug });
      body.push(`<h3 id="${slug}">${escapeHtml(text)}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) {
        body.push('</ul>');
        inList = false;
      }
      const text = line.slice(3).trim();
      const slug = slugify(text);
      headings.push({ level: 2, text, slug });
      body.push(`<h2 id="${slug}">${escapeHtml(text)}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      if (inList) {
        body.push('</ul>');
        inList = false;
      }
      const text = line.slice(2).trim();
      const slug = slugify(text);
      headings.push({ level: 1, text, slug });
      body.push(`<h1 id="${slug}">${escapeHtml(text)}</h1>`);
      continue;
    }
    if (line.startsWith('- ')) {
      if (!inList) {
        body.push('<ul>');
        inList = true;
      }
      body.push(`<li>${escapeHtml(line.slice(2).trim())}</li>`);
      continue;
    }

    if (inList) {
      body.push('</ul>');
      inList = false;
    }

    if (line.trim()) {
      body.push(`<p>${escapeHtml(line.trim())}</p>`);
    }
  }

  if (inList) {
    body.push('</ul>');
  }

  const tocItems = headings
    .filter((heading) => heading.level <= 3)
    .map((heading) => `<li class="toc-level-${heading.level}"><a href="#${heading.slug}">${escapeHtml(heading.text)}</a></li>`)
    .join('');

  return {
    tocHtml: `<ul>${tocItems}</ul>`,
    bodyHtml: body.join('\n')
  };
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function toNumber(value: FormDataEntryValue | null): number {
  return Number.parseFloat(String(value ?? '0'));
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function prettyLabel(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function escapeHtml(raw: string): string {
  return raw
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

render();
