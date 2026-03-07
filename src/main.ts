import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import SimulationWorker from './simulationWorker?worker&inline';
import './styles.css';
import 'katex/dist/katex.min.css';
import legalMarkdown from '../docs/LEGAL.md?raw';
import manualMarkdown from '../docs/Manual.md?raw';
import modelsMarkdown from '../docs/Models.md?raw';
import MarkdownIt from 'markdown-it';
import texmath from 'markdown-it-texmath';
import katex from 'katex';
import { jsPDF } from 'jspdf';
import { DEFAULT_WORKSPACE } from './defaults';
import { exportReportsCsv, exportSitesKml, exportWorkspaceJson, parseSitesKml, parseWorkspaceJson } from './io';
import { loadWorkspace, saveWorkspace } from './storage';
import type {
  AntennaModel,
  AntennaPattern,
  Polarization,
  PropagationModel,
  PropagationModelType,
  RadioSink,
  RadioSource,
  ResultRun,
  SimulationQueueItem,
  SimulationResultRow,
  Site,
  TabId,
  WorkspaceSnapshot
} from './types';

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'radios', label: 'Radios' },
  { id: 'antennas', label: 'Antennas' },
  { id: 'propagation', label: 'Propagation Models' },
  { id: 'sites', label: 'Sites' },
  { id: 'simulation', label: 'Simulation' },
  { id: 'reports', label: 'Results' },
  { id: 'report', label: 'Report' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'help', label: 'Help' },
  { id: 'legal', label: 'Legal' }
];

const propagationParameterDefaults: Record<PropagationModelType, Record<string, number>> = {
  'Free Space': { additionalLossDb: 0 },
  'Two-Ray': { groundReflectionCoefficient: -1 },
  'Knife-Edge': { obstacleHeightM: 10, d1Km: 1, d2Km: 1 },
  'Ground Wave': { conductivitySPerM: 0.005, dielectricConstant: 15 },
  Ionospheric: { criticalFrequencyMHz: 5, incidenceAngleDeg: 30 },
  'Log-Distance': { pathLossExponent: 3, referenceDistanceM: 1, referenceLossDb: 40 },
  'Effective Earth Radius': { kFactor: 1.333333 },
  Troposcatter: { constantA: 120 }
};

const SITE_COLOR_OPTIONS = [
  { label: 'Red', value: '#dc2626' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Yellow', value: '#eab308' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Purple', value: '#7c3aed' },
  { label: 'Black', value: '#000000' },
  { label: 'White', value: '#ffffff' }
] as const;

const propagationParameterMeta: Record<
  PropagationModelType,
  Record<string, { label: string; symbol: string; units?: string; description: string }>
> = {
  'Free Space': {
    additionalLossDb: {
      label: 'Additional Loss',
      symbol: 'L_{add}',
      units: 'dB',
      description: 'Extra path loss term added on top of FSPL.'
    }
  },
  'Two-Ray': {
    groundReflectionCoefficient: {
      label: 'Ground Reflection Coefficient',
      symbol: '\\Gamma',
      description: 'Reflection coefficient for the ground-reflected path.'
    }
  },
  'Knife-Edge': {
    obstacleHeightM: { label: 'Obstacle Height', symbol: 'h', units: 'm', description: 'Effective knife-edge obstruction height.' },
    d1Km: { label: 'Tx-to-Obstacle Distance', symbol: 'd_1', units: 'km', description: 'Distance from transmitter to obstacle.' },
    d2Km: { label: 'Obstacle-to-Rx Distance', symbol: 'd_2', units: 'km', description: 'Distance from obstacle to receiver.' }
  },
  'Ground Wave': {
    conductivitySPerM: {
      label: 'Ground Conductivity',
      symbol: '\\sigma',
      units: 'S/m',
      description: 'Ground conductivity of the propagation surface.'
    },
    dielectricConstant: { label: 'Relative Permittivity', symbol: '\\epsilon_r', description: 'Ground relative dielectric constant.' }
  },
  Ionospheric: {
    criticalFrequencyMHz: { label: 'Critical Frequency', symbol: 'f_c', units: 'MHz', description: 'Ionospheric critical frequency used in secant law.' },
    incidenceAngleDeg: { label: 'Incidence Angle', symbol: '\\theta', units: 'deg', description: 'Wave incidence angle into the ionosphere.' }
  },
  'Log-Distance': {
    pathLossExponent: { label: 'Path Loss Exponent', symbol: 'n', description: 'Environment-dependent log-distance exponent.' },
    referenceDistanceM: { label: 'Reference Distance', symbol: 'd_0', units: 'm', description: 'Reference distance for anchor loss.' },
    referenceLossDb: { label: 'Reference Loss', symbol: '\\mathrm{PL}(d_0)', units: 'dB', description: 'Path loss at the reference distance.' }
  },
  'Effective Earth Radius': {
    kFactor: { label: 'Effective Earth Radius Factor', symbol: 'k', description: 'Effective Earth radius factor for refraction model.' }
  },
  Troposcatter: {
    constantA: { label: 'Empirical Constant', symbol: 'A', units: 'dB', description: 'Empirical constant in troposcatter loss model.' }
  }
};

const modelGuideMarkdown = new MarkdownIt({ html: false, linkify: true, typographer: false }).use(texmath, {
  engine: katex,
  delimiters: 'dollars',
  katexOptions: { throwOnError: false, strict: 'ignore' }
});

const RESULT_FIELD_OPTIONS: Array<{ id: string; label: string; value: (row: SimulationResultRow) => string }> = [
  { id: 'transmitterSiteName', label: 'Transmitter Site Name', value: (row) => row.transmitterSiteName },
  { id: 'transmitterCoordinates', label: 'Transmitter Coordinates', value: (row) => row.transmitterCoordinates },
  { id: 'transmitterRadio', label: 'Transmitter Radio', value: (row) => row.transmitterRadio },
  { id: 'frequencyMHz', label: 'Frequency (MHz)', value: (row) => row.frequencyMHz.toFixed(3) },
  { id: 'bandwidthKHz', label: 'Bandwidth (kHz)', value: (row) => row.bandwidthKHz.toFixed(3) },
  { id: 'receiverSiteName', label: 'Receiver Site Name', value: (row) => row.receiverSiteName },
  { id: 'receiverCoordinates', label: 'Receiver Coordinates', value: (row) => row.receiverCoordinates },
  { id: 'receiverRadio', label: 'Receiver Radio', value: (row) => row.receiverRadio },
  { id: 'transmitterEirpDensity', label: 'Transmitter EIRP Density', value: (row) => row.transmitterEirpDensityDbmPerHz.toFixed(2) },
  { id: 'distance', label: 'Distance', value: (row) => formatDistance(row.distanceKm) },
  { id: 'propagationLosses', label: 'Propagation Losses', value: (row) => `${row.propagationLossesDb.toFixed(2)} dB` },
  { id: 'incidentRfDensity', label: 'Incident RF Power Density', value: (row) => formatPowerDensity(row.incidentRfPowerDensityDbmPerHz) },
  { id: 'incidentField', label: 'Incident Electric Field', value: (row) => `${row.incidentElectricFieldVm.toExponential(3)} V/m` },
  { id: 'signalPower', label: 'Signal Power Into Receiver', value: (row) => formatPowerDensity(row.availablePowerDensityAtAntennaDbmPerHz) },
  { id: 'receiverNoiseFloor', label: 'Receiver Noise Floor', value: (row) => formatPowerDensity(row.receiverNoiseFloorDensityDbmPerHz) },
  { id: 'snr', label: 'SNR in Receiver', value: (row) => `${row.snrDb.toFixed(2)} dB` },
  { id: 'usableLink', label: 'Useable Link', value: (row) => row.usableLink },
  { id: 'warnings', label: 'Warnings', value: (row) => row.warnings.join('; ') || 'None' }
];

interface ProgressState {
  running: boolean;
  completed: number;
  total: number;
  message: string;
}

interface WorkerQueueItem {
  queueItemId: string;
  txSite: Site;
  sourceRadio: RadioSource;
  txAntenna: AntennaModel;
  propagationModel: PropagationModel;
  rxSite: Site;
  receiverRadio: RadioSink;
  rxAntenna: AntennaModel;
}

interface SimulationWorkerInput {
  items: WorkerQueueItem[];
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

let selectedTab: TabId = 'welcome';
let workspace: WorkspaceSnapshot = structuredClone(DEFAULT_WORKSPACE);
let activePropagationType: PropagationModelType = 'Free Space';
let map: maplibregl.Map | null = null;
let mapMarkers: maplibregl.Marker[] = [];
let pendingClickMarker: maplibregl.Marker | null = null;
let selectedSiteId = '';
let selectedSimulationTxSiteId = '';
let selectedSimulationSourceRadioId = '';
let selectedSimulationTxAntennaId = '';
let selectedPropagationModelId = '';
let selectedSimulationRxSiteId = '';
let selectedSimulationReceiverRadioId = '';
let selectedSimulationRxAntennaId = '';
let mapCenter: [number, number] | null = null;
let mapZoom = 4;
let mapPaneWidthPx: number | null = null;
let sitePaneWidthPx: number | null = null;
let progress: ProgressState = { running: false, completed: 0, total: 0, message: 'Idle' };
let focusedReportQueueItemId = '';
let selectedResultRunId = '';
let reportIncludeMap = true;
let reportIncludeTxRadio = true;
let reportIncludeTxAntenna = true;
let reportIncludePropagationModel = true;
let reportIncludeRxAntenna = true;
let reportIncludeRxRadio = true;
let selectedReportFieldIds = new Set<string>(RESULT_FIELD_OPTIONS.map((entry) => entry.id));

const app = requireAppRoot();

void init();

async function init(): Promise<void> {
  workspace = await loadWorkspace();
  workspace = normalizeWorkspace(workspace);
  ensureSelectionDefaults();
  applyTheme();
  render();
}

function render(): void {
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
    case 'welcome':
      return renderWelcomeTab();
    case 'sites':
      return renderSitesTab();
    case 'simulation':
      return renderSimulationTab();
    case 'radios':
      return renderRadiosTab();
    case 'antennas':
      return renderAntennasTab();
    case 'propagation':
      return renderPropagationTab();
    case 'reports':
      return renderReportsTab();
    case 'report':
      return renderReportBuilderTab();
    case 'preferences':
      return renderPreferencesTab();
    case 'help':
      return renderHelpTab();
    case 'legal':
      return renderLegalTab();
    default:
      return '<h2>RF Ranger</h2>';
  }
}

function renderWelcomeTab(): string {
  return `
    <div class="splash">
      <div class="splash__card">
        <img src="/RF_Ranger.png" alt="RF Ranger" class="splash__logo" />
        <h1>RF Ranger</h1>
        <p class="splash__subtitle">Radio experimentation planning toolkit</p>
      </div>
    </div>
  `;
}

function renderSitesTab(): string {
  const selectedSite = workspace.sites.find((site) => site.id === selectedSiteId) ?? null;
  const hasCustomColor = selectedSite ? !SITE_COLOR_OPTIONS.some((entry) => entry.value === selectedSite.pinColor) : false;
  const colorOptions = [
    ...SITE_COLOR_OPTIONS.map(
      (entry) => `<option value="${entry.value}" ${selectedSite?.pinColor === entry.value ? 'selected' : ''}>${entry.label}</option>`
    ),
    ...(hasCustomColor && selectedSite ? [`<option value="${selectedSite.pinColor}" selected>Custom (${selectedSite.pinColor})</option>`] : [])
  ].join('');
  const siteRows = workspace.sites
    .map((site) => {
      const selectedClass = site.id === selectedSiteId ? ' class="focus-row"' : '';
      return `<tr${selectedClass}>
        <td><span class="site-color-chip" style="background:${escapeHtml(site.pinColor)}"></span>${escapeHtml(site.name)}</td>
        <td>${site.latitude.toFixed(6)}, ${site.longitude.toFixed(6)}</td>
        <td>${escapeHtml(site.comments || '')}</td>
        <td><button data-select-site="${site.id}">Select</button> <button data-delete-site="${site.id}">Delete</button></td>
      </tr>`;
    })
    .join('');

  return `
    <h2>Sites</h2>
    <div class="map-layout">
      <section class="panel map-panel">
        <div id="map-canvas"></div>
      </section>
      <div id="map-resizer" class="map-resizer" role="separator" aria-orientation="vertical" aria-label="Resize map panel"></div>
      <aside class="panel stack map-controls map-controls--right">
        <h3>Site Properties</h3>
        <label>Name<input id="site-name" value="${escapeHtml(selectedSite?.name ?? '')}" placeholder="Site name" /></label>
        <label>Pin Color
          <select id="site-color">${colorOptions}</select>
        </label>
        <label>Latitude<input id="site-lat" type="number" step="0.000001" value="${selectedSite ? selectedSite.latitude : ''}" /></label>
        <label>Longitude<input id="site-lon" type="number" step="0.000001" value="${selectedSite ? selectedSite.longitude : ''}" /></label>
        <label>Comments<textarea id="site-comments" rows="4" placeholder="Notes about this site">${escapeHtml(selectedSite?.comments ?? '')}</textarea></label>
        <div class="action-row">
          <button id="add-site-coord">Add Site (Coordinates)</button>
          <button id="update-site" ${selectedSite ? '' : 'disabled'}>Update Selected</button>
          <button id="delete-selected-site" ${selectedSite ? '' : 'disabled'}>Delete Selected</button>
        </div>
        <label>Address Search
          <input id="geocode-input" placeholder="Address" />
        </label>
        <button id="geocode-site">Geocode Address</button>
        <button id="add-site-address">Geocode + Add Site</button>
        <div class="action-row">
          <button id="export-kml">Export KML</button>
          <label class="import-label">Import KML<input id="import-kml" type="file" accept=".kml,application/vnd.google-earth.kml+xml" /></label>
        </div>
      </aside>
    </div>
    <section class="panel">
      <h3>Defined Sites</h3>
      <table>
        <thead><tr><th>Name</th><th>Coordinates</th><th>Comments</th><th>Actions</th></tr></thead>
        <tbody>${siteRows || '<tr><td colspan="4">No sites yet.</td></tr>'}</tbody>
      </table>
      <p class="muted">Click the map to place a temporary X preview, then add or update a site.</p>
    </section>
  `;
}

function renderSimulationTab(): string {
  const txSiteOptions = workspace.sites
    .map((site) => `<option value="${site.id}" ${site.id === selectedSimulationTxSiteId ? 'selected' : ''}>${escapeHtml(site.name)}</option>`)
    .join('');
  const sourceRadioOptions = workspace.sources
    .map((source) => `<option value="${source.id}" ${source.id === selectedSimulationSourceRadioId ? 'selected' : ''}>${escapeHtml(source.name)}</option>`)
    .join('');
  const txAntennaOptions = workspace.antennas
    .map((antenna) => `<option value="${antenna.id}" ${antenna.id === selectedSimulationTxAntennaId ? 'selected' : ''}>${escapeHtml(antenna.name)}</option>`)
    .join('');
  const propagationOptions = workspace.propagationModels
    .map(
      (model) =>
        `<option value="${model.id}" ${model.id === selectedPropagationModelId ? 'selected' : ''}>${escapeHtml(model.name)} (${model.modelType})</option>`
    )
    .join('');
  const rxSiteOptions = workspace.sites
    .map((site) => `<option value="${site.id}" ${site.id === selectedSimulationRxSiteId ? 'selected' : ''}>${escapeHtml(site.name)}</option>`)
    .join('');
  const receiverRadioOptions = workspace.sinks
    .map((sink) => `<option value="${sink.id}" ${sink.id === selectedSimulationReceiverRadioId ? 'selected' : ''}>${escapeHtml(sink.name)}</option>`)
    .join('');
  const rxAntennaOptions = workspace.antennas
    .map((antenna) => `<option value="${antenna.id}" ${antenna.id === selectedSimulationRxAntennaId ? 'selected' : ''}>${escapeHtml(antenna.name)}</option>`)
    .join('');

  const queueRows = workspace.simulationQueue
    .map((item) => {
      const txSiteName = workspace.sites.find((site) => site.id === item.txSiteId)?.name ?? '[missing site]';
      const sourceName = workspace.sources.find((source) => source.id === item.sourceRadioId)?.name ?? '[missing source]';
      const modelName = workspace.propagationModels.find((model) => model.id === item.propagationModelId)?.name ?? '[missing model]';
      const rxSiteName = workspace.sites.find((site) => site.id === item.rxSiteId)?.name ?? '[missing site]';
      const receiverName = workspace.sinks.find((sink) => sink.id === item.receiverRadioId)?.name ?? '[missing receiver]';
      const txAntennaName = workspace.antennas.find((antenna) => antenna.id === item.txAntennaId)?.name ?? '[missing tx antenna]';
      const rxAntennaName = workspace.antennas.find((antenna) => antenna.id === item.rxAntennaId)?.name ?? '[missing rx antenna]';
      return `
      <div class="sim-columns sim-columns--queue">
        <div>${escapeHtml(txSiteName)}</div>
        <div>${escapeHtml(sourceName)}</div>
        <div>${escapeHtml(modelName)}</div>
        <div>${escapeHtml(rxSiteName)}</div>
        <div>${escapeHtml(receiverName)}</div>
      </div>`;
    })
    .join('');

  const queueAntennaRows = workspace.simulationQueue
    .map((item) => {
      const txAntennaName = workspace.antennas.find((antenna) => antenna.id === item.txAntennaId)?.name ?? '[missing tx antenna]';
      const rxAntennaName = workspace.antennas.find((antenna) => antenna.id === item.rxAntennaId)?.name ?? '[missing rx antenna]';
      return `
      <div class="sim-columns sim-columns--queue sim-columns--aux">
        <div>${escapeHtml(txAntennaName)}</div>
        <div></div>
        <div></div>
        <div></div>
        <div>${escapeHtml(rxAntennaName)} <button data-remove-queue="${item.id}">Remove</button></div>
      </div>`;
    })
    .join('');

  const percent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return `
    <h2>Simulation</h2>
    <section class="panel simulation-section">
      <h3>Define Simulation</h3>
      <div class="sim-columns sim-columns--header">
        <div>Transmitter Site</div>
        <div>Source Radio</div>
        <div>Propagation Model</div>
        <div>Receiver Site</div>
        <div>Receiver Radio</div>
      </div>
      <div class="sim-columns">
        <label><select id="sim-tx-site">${txSiteOptions || '<option value="">No sites available</option>'}</select></label>
        <label><select id="sim-source-radio">${sourceRadioOptions || '<option value="">No source radios available</option>'}</select></label>
        <label><select id="sim-propagation">${propagationOptions || '<option value="">No propagation models available</option>'}</select></label>
        <label><select id="sim-rx-site">${rxSiteOptions || '<option value="">No sites available</option>'}</select></label>
        <label><select id="sim-receiver-radio">${receiverRadioOptions || '<option value="">No receiver radios available</option>'}</select></label>
      </div>
      <div class="sim-columns sim-columns--header">
        <div>TX Antenna</div>
        <div></div>
        <div></div>
        <div></div>
        <div>RX Antenna</div>
      </div>
      <div class="sim-columns sim-columns--aux">
        <label><select id="sim-tx-antenna">${txAntennaOptions || '<option value="">No antennas available</option>'}</select></label>
        <div></div>
        <div></div>
        <div></div>
        <label><select id="sim-rx-antenna">${rxAntennaOptions || '<option value="">No antennas available</option>'}</select></label>
      </div>
      <div class="action-row">
        <button id="add-to-queue" class="primary-btn">Add to Simulation Queue</button>
      </div>
    </section>

    <section class="panel simulation-section">
      <h3>Simulation Queue</h3>
      <div class="sim-columns sim-columns--header">
        <div>Transmitter Site</div>
        <div>Source Radio</div>
        <div>Propagation Model</div>
        <div>Receiver Site</div>
        <div>Receiver Radio</div>
      </div>
      <div class="sim-columns sim-columns--header sim-columns--aux">
        <div>TX Antenna</div>
        <div></div>
        <div></div>
        <div></div>
        <div>RX Antenna</div>
      </div>
      ${queueRows || '<p class="muted">Queue is empty.</p>'}
      ${queueAntennaRows}
      <div class="action-row">
        <button id="launch-simulations" class="primary-btn" ${progress.running || !workspace.simulationQueue.length ? 'disabled' : ''}>Launch Simulations</button>
      </div>
      <div class="progress-wrap">
        <div>Progress: ${progress.message}</div>
        <progress value="${progress.completed}" max="${Math.max(progress.total, 1)}"></progress>
        <div>${percent}%</div>
      </div>
    </section>
  `;
}

function renderReportsTab(): string {
  const selectedRun = workspace.reportHistory.find((run) => run.id === selectedResultRunId) ?? workspace.reportHistory[0] ?? null;
  const rows = (selectedRun?.rows ?? workspace.reportLatest)
    .map((row) => {
      const highlighted = row.queueItemId === focusedReportQueueItemId ? ' class="focus-row"' : '';
      return `<tr${highlighted}>
        <td>${escapeHtml(row.transmitterSiteName)}</td>
        <td>${escapeHtml(row.transmitterCoordinates)}</td>
        <td>${escapeHtml(row.transmitterRadio)}</td>
        <td>${row.frequencyMHz.toFixed(3)}</td>
        <td>${row.bandwidthKHz.toFixed(3)}</td>
        <td>${escapeHtml(row.receiverSiteName)}</td>
        <td>${escapeHtml(row.receiverCoordinates)}</td>
        <td>${escapeHtml(row.receiverRadio)}</td>
        <td>${formatPowerDensity(row.transmitterEirpDensityDbmPerHz)}</td>
        <td>${formatDistance(row.distanceKm)}</td>
        <td>${row.propagationLossesDb.toFixed(2)} dB</td>
        <td>${formatPowerDensity(row.incidentRfPowerDensityDbmPerHz)}</td>
        <td>${row.incidentElectricFieldVm.toExponential(3)} V/m</td>
        <td>${formatPowerDensity(row.availablePowerDensityAtAntennaDbmPerHz)}</td>
        <td>${formatPowerDensity(row.receiverNoiseFloorDensityDbmPerHz)}</td>
        <td>${row.snrDb.toFixed(2)} dB</td>
        <td>${row.usableLink}</td>
        <td>${escapeHtml(row.warnings.join('; '))}</td>
        <td><button data-jump-site="${row.rxSiteId}">Site</button></td>
      </tr>`;
    })
    .join('');

  const runRows = workspace.reportHistory
    .map((run, index) => {
      const selectedClass = run.id === selectedRun?.id ? ' class="focus-row"' : '';
      const stamp = new Date(run.createdAtIso).toLocaleString();
      return `<tr${selectedClass}>
        <td>${index + 1}</td>
        <td>${escapeHtml(stamp)}</td>
        <td>${run.rows.length}</td>
        <td>
          <button data-select-result-run="${run.id}">View</button>
          <button data-delete-result-run="${run.id}">Remove</button>
        </td>
      </tr>`;
    })
    .join('');

  return `
    <h2>Results</h2>
    <section class="panel">
      <div class="action-row">
        <button id="export-csv">Export CSV</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Transmitter Site Name</th>
            <th>Transmitter Coordinates</th>
            <th>Transmitter Radio</th>
            <th>Frequency (MHz)</th>
            <th>Bandwidth (kHz)</th>
            <th>Receiver Site Name</th>
            <th>Receiver Coordinates</th>
            <th>Receiver Radio</th>
            <th>Transmitter EIRP Density</th>
            <th>Distance</th>
            <th>Propagation Losses</th>
            <th>Incident RF Power Density</th>
            <th>Incident Electric Field</th>
            <th>Signal Power Into Receiver</th>
            <th>Receiver Noise Floor</th>
            <th>SNR in Receiver</th>
            <th>Useable Link</th>
            <th>Warnings</th>
            <th>Jump</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="19">No result data. Launch simulations from the Simulation tab.</td></tr>'}</tbody>
      </table>
    </section>
    <section class="panel">
      <div class="action-row">
        <h3>Buffered Results Queue</h3>
        <button id="clear-all-results" ${workspace.reportHistory.length ? '' : 'disabled'}>Clear All</button>
      </div>
      <table>
        <thead><tr><th>#</th><th>Run Time</th><th>Rows</th><th>Actions</th></tr></thead>
        <tbody>${runRows || '<tr><td colspan="4">No buffered results yet.</td></tr>'}</tbody>
      </table>
    </section>
  `;
}

function renderReportBuilderTab(): string {
  const activeRun = workspace.reportHistory.find((run) => run.id === selectedResultRunId) ?? workspace.reportHistory[0] ?? null;
  const runOptions = workspace.reportHistory
    .map((run, index) => {
      const stamp = new Date(run.createdAtIso).toLocaleString();
      return `<option value="${run.id}" ${run.id === activeRun?.id ? 'selected' : ''}>Run ${index + 1} - ${escapeHtml(stamp)} (${run.rows.length} rows)</option>`;
    })
    .join('');

  const resultFieldChecks = RESULT_FIELD_OPTIONS.map((field) => {
    const checked = selectedReportFieldIds.has(field.id) ? 'checked' : '';
    return `<label class="inline-check"><input type="checkbox" data-report-field="${field.id}" ${checked}/> ${escapeHtml(field.label)}</label>`;
  }).join('');

  return `
    <h2>Report</h2>
    <section class="panel stack">
      <label>Result Run
        <select id="report-run-select">${runOptions || '<option value="">No results available</option>'}</select>
      </label>
      <label class="inline-check"><input id="report-include-map" type="checkbox" ${reportIncludeMap ? 'checked' : ''}/> Include current map view render</label>
      <label class="inline-check"><input id="report-include-tx-radio" type="checkbox" ${reportIncludeTxRadio ? 'checked' : ''}/> Include TX Radio Information</label>
      <label class="inline-check"><input id="report-include-tx-antenna" type="checkbox" ${reportIncludeTxAntenna ? 'checked' : ''}/> Include TX Antenna Information</label>
      <label class="inline-check"><input id="report-include-propagation" type="checkbox" ${reportIncludePropagationModel ? 'checked' : ''}/> Include Propagation Model Information</label>
      <label class="inline-check"><input id="report-include-rx-antenna" type="checkbox" ${reportIncludeRxAntenna ? 'checked' : ''}/> Include RX Antenna Information</label>
      <label class="inline-check"><input id="report-include-rx-radio" type="checkbox" ${reportIncludeRxRadio ? 'checked' : ''}/> Include RX Radio Information</label>
      <fieldset class="param-grid">
        <legend>Simulation Result Fields</legend>
        ${resultFieldChecks}
      </fieldset>
      <div class="action-row">
        <button id="report-select-all-fields">Select All Fields</button>
        <button id="report-clear-fields">Clear Fields</button>
        <button id="generate-pdf" class="primary-btn">Generate PDF</button>
      </div>
      <p class="muted">Sections are rendered sequentially in the generated PDF with headers and selected content.</p>
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

function renderLegalTab(): string {
  const legal = renderManualWithToc(legalMarkdown);
  return `
    <h2>Legal</h2>
    <section class="panel manual">
      <div class="manual__toc">
        <h3>Contents</h3>
        ${legal.tocHtml}
      </div>
      <div class="manual__body">${legal.bodyHtml}</div>
    </section>
  `;
}

function renderRadiosTab(): string {
  const sourceRows = workspace.sources
    .map(
      (source) => `
      <tr>
        <td>${escapeHtml(source.name)}</td>
        <td>${escapeHtml(source.comments || '')}</td>
        <td>${source.txPowerDbm}</td>
        <td>${source.carrierFrequencyMHz}</td>
        <td>${(source.bandwidthHz / 1000).toFixed(3)}</td>
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
        <td>${escapeHtml(sink.comments || '')}</td>
        <td>${sink.carrierFrequencyMHz}</td>
        <td>${(sink.bandwidthHz / 1000).toFixed(3)}</td>
        <td>${sink.environmentNoiseTemperatureK}</td>
        <td>${sink.noiseFigureDb}</td>
        <td>${sink.requiredSnrDb}</td>
        <td><button data-edit-sink="${sink.id}">Edit</button> <button data-delete-sink="${sink.id}">Delete</button></td>
      </tr>`
    )
    .join('');

  return `
    <h2>Radios</h2>
    <section class="panel">
      <h3>Add Source</h3>
      <form id="add-source-form" class="grid-form">
        <label>Name<input name="name" placeholder="e.g. Base TX" required /></label>
        <label>Comments<textarea name="comments" rows="2" placeholder="Source notes"></textarea></label>
        <label>TX Power (dBm)<input name="txPowerDbm" type="number" step="0.1" required /></label>
        <label>Carrier Frequency (MHz)<input name="carrierFrequencyMHz" type="number" step="0.001" required /></label>
        <label>Bandwidth (kHz)<input name="bandwidthKHz" type="number" step="0.001" required /></label>
        <label>Noise Figure (dB)<input name="noiseFigureDb" type="number" step="0.1" required /></label>
        <button class="primary-btn" type="submit">Add Source</button>
      </form>
    </section>
    <section class="panel">
      <h3>Sources</h3>
      <table>
        <thead><tr><th>Name</th><th>Comments</th><th>TX Power (dBm)</th><th>Freq (MHz)</th><th>BW (kHz)</th><th>NF (dB)</th><th>Actions</th></tr></thead>
        <tbody>${sourceRows || '<tr><td colspan="7">No sources yet.</td></tr>'}</tbody>
      </table>
    </section>
    <section class="panel">
      <h3>Add Sink</h3>
      <form id="add-sink-form" class="grid-form">
        <label>Name<input name="name" placeholder="e.g. Remote RX 1" required /></label>
        <label>Comments<textarea name="comments" rows="2" placeholder="Receiver notes"></textarea></label>
        <label>Carrier Frequency (MHz)<input name="carrierFrequencyMHz" type="number" step="0.001" required /></label>
        <label>Bandwidth (kHz)<input name="bandwidthKHz" type="number" step="0.001" required /></label>
        <label>Environment Noise Temperature (K)<input name="environmentNoiseTemperatureK" type="number" step="1" value="300" required /></label>
        <label>Noise Figure (dB)<input name="noiseFigureDb" type="number" step="0.1" value="10" required /></label>
        <label>Required SNR (dB)<input name="requiredSnrDb" type="number" step="0.1" value="15" required /></label>
        <button class="primary-btn" type="submit">Add Sink</button>
      </form>
    </section>
    <section class="panel">
      <h3>Sinks</h3>
      <table>
        <thead><tr><th>Name</th><th>Comments</th><th>Freq (MHz)</th><th>BW (kHz)</th><th>Env Temp (K)</th><th>NF (dB)</th><th>Req SNR (dB)</th><th>Actions</th></tr></thead>
        <tbody>${sinkRows || '<tr><td colspan="8">No sinks yet.</td></tr>'}</tbody>
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
        <td>${escapeHtml(antenna.comments || '')}</td>
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
        <textarea name="comments" rows="2" placeholder="Antenna notes"></textarea>
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
        <thead><tr><th>Name</th><th>Comments</th><th>Height</th><th>Azimuth</th><th>Tilt</th><th>Pol</th><th>Pattern</th><th>Gain</th><th>Actions</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="9">No antennas yet.</td></tr>'}</tbody>
      </table>
    </section>
  `;
}

function renderPropagationTab(): string {
  const modelTypeOptions = Object.keys(propagationParameterDefaults)
    .map((modelType) => `<option value="${modelType}" ${modelType === activePropagationType ? 'selected' : ''}>${modelType}</option>`)
    .join('');

  const parameterInputs = Object.entries(propagationParameterDefaults[activePropagationType])
    .map(([key, value]) => {
      const meta = propagationParameterMeta[activePropagationType]?.[key];
      const units = meta?.units ? `, ${escapeHtml(meta.units)}` : '';
      const symbol = meta ? renderMathInline(meta.symbol) : '';
      const header = meta
        ? `${escapeHtml(meta.label)} <span class="field-symbol">(${symbol}${units})</span>`
        : escapeHtml(prettyLabel(key));
      const description = meta?.description ? `<small class="field-help">${escapeHtml(meta.description)}</small>` : '';
      return `<label>${header}<input data-prop-param="${key}" type="number" step="0.0001" value="${value}" />${description}</label>`;
    })
    .join('');

  const rows = workspace.propagationModels
    .map(
      (model) => `
      <tr>
        <td>${escapeHtml(model.name)}</td>
        <td>${escapeHtml(model.comments || '')}</td>
        <td>${model.modelType}</td>
        <td><code>${escapeHtml(JSON.stringify(model.parameters))}</code></td>
        <td><button data-edit-prop="${model.id}">Edit</button> <button data-delete-prop="${model.id}">Delete</button></td>
      </tr>`
    )
    .join('');

  const setupGuide = renderModelGuideHtml(extractPropagationModelSection(activePropagationType, modelsMarkdown));

  return `
    <h2>Propagation Models</h2>
    <section class="panel propagation-layout">
      <div>
        <h3>Add Propagation Model</h3>
        <form id="add-prop-form" class="stack">
          <input name="name" placeholder="Preset Name" required />
          <label>Comments<textarea name="comments" rows="3" placeholder="Model setup notes"></textarea></label>
          <label>Model Type
            <select name="modelType" id="prop-model-type">${modelTypeOptions}</select>
          </label>
          <fieldset class="param-grid">
            <legend>Model Parameters</legend>
            ${parameterInputs}
          </fieldset>
          <button class="primary-btn" type="submit">Add Model</button>
        </form>
      </div>
      <aside class="propagation-guide">
        <h3>Model Setup Guide</h3>
        <div class="manual__body">${setupGuide}</div>
      </aside>
    </section>
    <section class="panel">
      <h3>Known Propagation Models</h3>
      <table>
        <thead><tr><th>Name</th><th>Comments</th><th>Type</th><th>Parameters</th><th>Actions</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="5">No propagation models yet.</td></tr>'}</tbody>
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
  if (selectedTab === 'simulation') {
    wireSimulationEvents();
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
  if (selectedTab === 'sites') {
    wireSitesEvents();
  }
  if (selectedTab === 'reports') {
    wireReportsEvents();
  }
  if (selectedTab === 'report') {
    wireReportBuilderEvents();
  }
}

function wireSitesEvents(): void {
  const layout = document.querySelector<HTMLDivElement>('.map-layout');
  if (layout && mapPaneWidthPx) {
    layout.style.setProperty('--map-pane-width', `${mapPaneWidthPx}px`);
  }
  if (layout && sitePaneWidthPx) {
    layout.style.setProperty('--pin-pane-width', `${sitePaneWidthPx}px`);
  }

  const resizer = document.querySelector<HTMLDivElement>('#map-resizer');
  if (layout && resizer) {
    wireMapResizer(layout, resizer);
  }

  document.querySelector<HTMLButtonElement>('#add-site-coord')?.addEventListener('click', async () => {
    await addSiteFromForm();
  });

  document.querySelector<HTMLButtonElement>('#update-site')?.addEventListener('click', async () => {
    await updateSelectedSiteFromForm();
  });

  document.querySelector<HTMLButtonElement>('#delete-selected-site')?.addEventListener('click', async () => {
    if (!selectedSiteId) {
      return;
    }
    workspace.sites = workspace.sites.filter((site) => site.id !== selectedSiteId);
    selectedSiteId = workspace.sites[0]?.id ?? '';
    await saveWorkspace(workspace);
    captureMapViewport();
    ensureSelectionDefaults();
    render();
  });

  document.querySelector<HTMLButtonElement>('#geocode-site')?.addEventListener('click', async () => {
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
    const latInput = document.querySelector<HTMLInputElement>('#site-lat');
    const lonInput = document.querySelector<HTMLInputElement>('#site-lon');
    if (latInput && lonInput) {
      latInput.value = String(result.lat);
      lonInput.value = String(result.lon);
    }
    map?.flyTo({ center: [result.lon, result.lat], zoom: 12 });
  });

  document.querySelector<HTMLButtonElement>('#add-site-address')?.addEventListener('click', async () => {
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
    const latInput = document.querySelector<HTMLInputElement>('#site-lat');
    const lonInput = document.querySelector<HTMLInputElement>('#site-lon');
    if (latInput && lonInput) {
      latInput.value = String(result.lat);
      lonInput.value = String(result.lon);
    }
    await addSiteFromForm();
    map?.flyTo({ center: [result.lon, result.lat], zoom: 12 });
  });

  document.querySelector<HTMLButtonElement>('#export-kml')?.addEventListener('click', () => {
    exportSitesKml(workspace.sites);
  });

  document.querySelector<HTMLInputElement>('#import-kml')?.addEventListener('change', async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    const sites = await parseSitesKml(file);
    workspace.sites.push(...sites);
    if (!selectedSiteId) {
      selectedSiteId = sites[0]?.id ?? '';
    }
    await saveWorkspace(workspace);
    captureMapViewport();
    ensureSelectionDefaults();
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-delete-site]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deleteSite ?? '';
      workspace.sites = workspace.sites.filter((site) => site.id !== id);
      if (selectedSiteId === id) {
        selectedSiteId = workspace.sites[0]?.id ?? '';
      }
      await saveWorkspace(workspace);
      captureMapViewport();
      ensureSelectionDefaults();
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-select-site]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedSiteId = button.dataset.selectSite ?? '';
      render();
    });
  });

  initMap();
}

function wireSimulationEvents(): void {
  const txSiteSelect = document.querySelector<HTMLSelectElement>('#sim-tx-site');
  const sourceRadioSelect = document.querySelector<HTMLSelectElement>('#sim-source-radio');
  const txAntennaSelect = document.querySelector<HTMLSelectElement>('#sim-tx-antenna');
  const propagationSelect = document.querySelector<HTMLSelectElement>('#sim-propagation');
  const rxSiteSelect = document.querySelector<HTMLSelectElement>('#sim-rx-site');
  const receiverRadioSelect = document.querySelector<HTMLSelectElement>('#sim-receiver-radio');
  const rxAntennaSelect = document.querySelector<HTMLSelectElement>('#sim-rx-antenna');

  txSiteSelect?.addEventListener('change', () => {
    selectedSimulationTxSiteId = txSiteSelect.value;
  });
  sourceRadioSelect?.addEventListener('change', () => {
    selectedSimulationSourceRadioId = sourceRadioSelect.value;
  });
  txAntennaSelect?.addEventListener('change', () => {
    selectedSimulationTxAntennaId = txAntennaSelect.value;
  });
  propagationSelect?.addEventListener('change', () => {
    selectedPropagationModelId = propagationSelect.value;
  });
  rxSiteSelect?.addEventListener('change', () => {
    selectedSimulationRxSiteId = rxSiteSelect.value;
  });
  receiverRadioSelect?.addEventListener('change', () => {
    selectedSimulationReceiverRadioId = receiverRadioSelect.value;
  });
  rxAntennaSelect?.addEventListener('change', () => {
    selectedSimulationRxAntennaId = rxAntennaSelect.value;
  });

  document.querySelector<HTMLButtonElement>('#add-to-queue')?.addEventListener('click', async () => {
    await addSimulationQueueItem();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-remove-queue]').forEach((button) => {
    button.addEventListener('click', async () => {
      workspace.simulationQueue = workspace.simulationQueue.filter((item) => item.id !== button.dataset.removeQueue);
      await saveWorkspace(workspace);
      render();
    });
  });

  document.querySelector<HTMLButtonElement>('#launch-simulations')?.addEventListener('click', async () => {
    await runSimulationQueue();
  });
}

function wireReportsEvents(): void {
  const selectedRun = workspace.reportHistory.find((run) => run.id === selectedResultRunId) ?? workspace.reportHistory[0] ?? null;
  const rows = selectedRun?.rows ?? workspace.reportLatest;

  document.querySelector<HTMLButtonElement>('#export-csv')?.addEventListener('click', () => {
    exportReportsCsv(rows);
  });

  document.querySelectorAll<HTMLButtonElement>('[data-jump-site]').forEach((button) => {
    button.addEventListener('click', () => {
      const siteId = button.dataset.jumpSite ?? '';
      selectedSiteId = siteId;
      selectedTab = 'sites';
      render();
      const site = workspace.sites.find((entry) => entry.id === siteId);
      if (site && map) {
        map.flyTo({ center: [site.longitude, site.latitude], zoom: 13 });
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-select-result-run]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedResultRunId = button.dataset.selectResultRun ?? '';
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-delete-result-run]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deleteResultRun ?? '';
      workspace.reportHistory = workspace.reportHistory.filter((run) => run.id !== id);
      if (selectedResultRunId === id) {
        selectedResultRunId = workspace.reportHistory[0]?.id ?? '';
      }
      workspace.reportLatest = workspace.reportHistory[0]?.rows ?? [];
      await saveWorkspace(workspace);
      render();
    });
  });

  document.querySelector<HTMLButtonElement>('#clear-all-results')?.addEventListener('click', async () => {
    workspace.reportHistory = [];
    workspace.reportLatest = [];
    selectedResultRunId = '';
    await saveWorkspace(workspace);
    render();
  });
}

function wireReportBuilderEvents(): void {
  const runSelect = document.querySelector<HTMLSelectElement>('#report-run-select');
  runSelect?.addEventListener('change', () => {
    selectedResultRunId = runSelect.value;
  });

  document.querySelectorAll<HTMLInputElement>('[data-report-field]').forEach((input) => {
    input.addEventListener('change', () => {
      const fieldId = input.dataset.reportField ?? '';
      if (!fieldId) {
        return;
      }
      if (input.checked) {
        selectedReportFieldIds.add(fieldId);
      } else {
        selectedReportFieldIds.delete(fieldId);
      }
    });
  });

  document.querySelector<HTMLButtonElement>('#report-select-all-fields')?.addEventListener('click', () => {
    selectedReportFieldIds = new Set<string>(RESULT_FIELD_OPTIONS.map((entry) => entry.id));
    render();
  });

  document.querySelector<HTMLButtonElement>('#report-clear-fields')?.addEventListener('click', () => {
    selectedReportFieldIds = new Set<string>();
    render();
  });

  const bindToggle = (id: string, setter: (checked: boolean) => void) => {
    const input = document.querySelector<HTMLInputElement>(id);
    input?.addEventListener('change', () => setter(input.checked));
  };

  bindToggle('#report-include-map', (checked) => {
    reportIncludeMap = checked;
  });
  bindToggle('#report-include-tx-radio', (checked) => {
    reportIncludeTxRadio = checked;
  });
  bindToggle('#report-include-tx-antenna', (checked) => {
    reportIncludeTxAntenna = checked;
  });
  bindToggle('#report-include-propagation', (checked) => {
    reportIncludePropagationModel = checked;
  });
  bindToggle('#report-include-rx-antenna', (checked) => {
    reportIncludeRxAntenna = checked;
  });
  bindToggle('#report-include-rx-radio', (checked) => {
    reportIncludeRxRadio = checked;
  });

  document.querySelector<HTMLButtonElement>('#generate-pdf')?.addEventListener('click', async () => {
    await generatePdfReport();
  });
}

async function generatePdfReport(): Promise<void> {
  const activeRun = workspace.reportHistory.find((run) => run.id === selectedResultRunId) ?? workspace.reportHistory[0] ?? null;
  if (!activeRun) {
    alert('No results available to generate a report.');
    return;
  }

  const selectedFields = RESULT_FIELD_OPTIONS.filter((field) => selectedReportFieldIds.has(field.id));
  if (!selectedFields.length) {
    alert('Select at least one simulation results field for the report.');
    return;
  }

  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let y = margin;

  const writeHeader = (title: string) => {
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(title, margin, y);
    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  };

  const writeWrapped = (text: string) => {
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    for (const line of lines) {
      if (y > pageHeight - 40) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 12;
    }
  };

  writeHeader('RF Ranger Test Report');
  writeWrapped(`Generated: ${new Date().toLocaleString()}`);
  writeWrapped(`Result Run Time: ${new Date(activeRun.createdAtIso).toLocaleString()}`);
  y += 8;

  if (reportIncludeMap) {
    writeHeader('Map View Render');
    const mapDataUrl = captureMapSnapshot();
    if (mapDataUrl) {
      const imageWidth = pageWidth - margin * 2;
      const imageHeight = Math.min(220, imageWidth * 0.6);
      if (y + imageHeight > pageHeight - 40) {
        doc.addPage();
        y = margin;
      }
      doc.addImage(mapDataUrl, 'PNG', margin, y, imageWidth, imageHeight);
      y += imageHeight + 10;
    } else {
      writeWrapped('Map capture unavailable in this browser context. Open the Sites tab first, then regenerate.');
    }
    y += 8;
  }

  writeHeader('Simulation Results');
  activeRun.rows.forEach((row, index) => {
    writeWrapped(`Row ${index + 1}`);
    for (const field of selectedFields) {
      writeWrapped(`- ${field.label}: ${field.value(row)}`);
    }
    y += 6;
  });

  if (reportIncludeTxRadio) {
    writeHeader('TX Radio Information');
    const txRadios = uniqueBy(activeRun.rows.map((row) => row.transmitterRadio));
    txRadios.forEach((radioName) => {
      const entry = workspace.sources.find((source) => source.name === radioName);
      if (!entry) {
        writeWrapped(`- ${radioName}`);
        return;
      }
      writeWrapped(`- ${entry.name}: ${entry.txPowerDbm} dBm, ${entry.carrierFrequencyMHz} MHz, ${(entry.bandwidthHz / 1000).toFixed(3)} kHz`);
    });
  }

  if (reportIncludeTxAntenna) {
    writeHeader('TX Antenna Information');
    const txAntennaIds = uniqueBy(
      activeRun.rows.map((row) => {
        const queueItem = workspace.simulationQueue.find((item) => item.id === row.queueItemId);
        return queueItem?.txAntennaId ?? '';
      })
    ).filter(Boolean);
    if (!txAntennaIds.length) {
      writeWrapped('No linked TX antenna metadata found for this result run.');
    } else {
      txAntennaIds.forEach((antennaId) => {
        const antenna = workspace.antennas.find((entry) => entry.id === antennaId);
        if (!antenna) {
          return;
        }
        writeWrapped(`- ${antenna.name}: ${antenna.pattern}, ${antenna.heightM} m, az ${antenna.azimuthDeg} deg, tilt ${antenna.tiltDeg} deg`);
      });
    }
  }

  if (reportIncludePropagationModel) {
    writeHeader('Propagation Model Information');
    const modelIds = uniqueBy(
      activeRun.rows.map((row) => {
        const queueItem = workspace.simulationQueue.find((item) => item.id === row.queueItemId);
        return queueItem?.propagationModelId ?? '';
      })
    ).filter(Boolean);
    if (!modelIds.length) {
      writeWrapped('No linked propagation model metadata found for this result run.');
    } else {
      modelIds.forEach((modelId) => {
        const model = workspace.propagationModels.find((entry) => entry.id === modelId);
        if (!model) {
          return;
        }
        writeWrapped(`- ${model.name} (${model.modelType}): ${JSON.stringify(model.parameters)}`);
      });
    }
  }

  if (reportIncludeRxAntenna) {
    writeHeader('RX Antenna Information');
    const rxAntennaIds = uniqueBy(
      activeRun.rows.map((row) => {
        const queueItem = workspace.simulationQueue.find((item) => item.id === row.queueItemId);
        return queueItem?.rxAntennaId ?? '';
      })
    ).filter(Boolean);
    if (!rxAntennaIds.length) {
      writeWrapped('No linked RX antenna metadata found for this result run.');
    } else {
      rxAntennaIds.forEach((antennaId) => {
        const antenna = workspace.antennas.find((entry) => entry.id === antennaId);
        if (!antenna) {
          return;
        }
        writeWrapped(`- ${antenna.name}: ${antenna.pattern}, ${antenna.heightM} m, az ${antenna.azimuthDeg} deg, tilt ${antenna.tiltDeg} deg`);
      });
    }
  }

  if (reportIncludeRxRadio) {
    writeHeader('RX Radio Information');
    const rxRadios = uniqueBy(activeRun.rows.map((row) => row.receiverRadio));
    rxRadios.forEach((radioName) => {
      const entry = workspace.sinks.find((sink) => sink.name === radioName);
      if (!entry) {
        writeWrapped(`- ${radioName}`);
        return;
      }
      writeWrapped(
        `- ${entry.name}: ${entry.carrierFrequencyMHz} MHz, ${(entry.bandwidthHz / 1000).toFixed(3)} kHz, NF ${entry.noiseFigureDb} dB, Req SNR ${entry.requiredSnrDb} dB`
      );
    });
  }

  const stamp = new Date().toISOString().replaceAll(':', '-');
  doc.save(`rf-ranger-report-${stamp}.pdf`);
}

function captureMapSnapshot(): string | null {
  if (!map) {
    return null;
  }
  try {
    const canvas = map.getCanvas();
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

async function addSimulationQueueItem(): Promise<void> {
  if (
    !selectedSimulationTxSiteId ||
    !selectedSimulationSourceRadioId ||
    !selectedSimulationTxAntennaId ||
    !selectedPropagationModelId ||
    !selectedSimulationRxSiteId ||
    !selectedSimulationReceiverRadioId ||
    !selectedSimulationRxAntennaId
  ) {
    alert('Select all simulation fields before adding to queue.');
    return;
  }

  const item: SimulationQueueItem = {
    id: uid(),
    txSiteId: selectedSimulationTxSiteId,
    sourceRadioId: selectedSimulationSourceRadioId,
    txAntennaId: selectedSimulationTxAntennaId,
    propagationModelId: selectedPropagationModelId,
    rxSiteId: selectedSimulationRxSiteId,
    receiverRadioId: selectedSimulationReceiverRadioId,
    rxAntennaId: selectedSimulationRxAntennaId
  };

  workspace.simulationQueue.push(item);
  await saveWorkspace(workspace);
  render();
}

async function runSimulationQueue(): Promise<void> {
  const resolved = workspace.simulationQueue
    .map((item) => {
      const txSite = workspace.sites.find((site) => site.id === item.txSiteId);
      const sourceRadio = workspace.sources.find((source) => source.id === item.sourceRadioId);
      const txAntenna = workspace.antennas.find((antenna) => antenna.id === item.txAntennaId);
      const propagationModel = workspace.propagationModels.find((model) => model.id === item.propagationModelId);
      const rxSite = workspace.sites.find((site) => site.id === item.rxSiteId);
      const receiverRadio = workspace.sinks.find((sink) => sink.id === item.receiverRadioId);
      const rxAntenna = workspace.antennas.find((antenna) => antenna.id === item.rxAntennaId);

      if (!txSite || !sourceRadio || !txAntenna || !propagationModel || !rxSite || !receiverRadio || !rxAntenna) {
        return null;
      }

      return {
        queueItemId: item.id,
        txSite,
        sourceRadio,
        txAntenna,
        propagationModel,
        rxSite,
        receiverRadio,
        rxAntenna
      } satisfies WorkerQueueItem;
    })
    .filter((item): item is WorkerQueueItem => item !== null);

  if (!resolved.length) {
    alert('Simulation queue contains no valid items.');
    return;
  }

  progress = { running: true, completed: 0, total: resolved.length, message: 'Starting' };
  render();

  const worker = new SimulationWorker();
  const input: SimulationWorkerInput = { items: resolved };

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
      const resultRun: ResultRun = {
        id: uid(),
        createdAtIso: new Date().toISOString(),
        rows: event.data.rows
      };
      workspace.reportLatest = event.data.rows;
      workspace.reportHistory.unshift(resultRun);
      selectedResultRunId = resultRun.id;
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

async function addSiteFromForm(): Promise<void> {
  const nameInput = document.querySelector<HTMLInputElement>('#site-name');
  const colorInput = document.querySelector<HTMLInputElement>('#site-color');
  const commentsInput = document.querySelector<HTMLTextAreaElement>('#site-comments');
  const latInput = document.querySelector<HTMLInputElement>('#site-lat');
  const lonInput = document.querySelector<HTMLInputElement>('#site-lon');

  const lat = Number.parseFloat(latInput?.value ?? '');
  const lon = Number.parseFloat(lonInput?.value ?? '');
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    alert('Provide valid latitude and longitude.');
    return;
  }

  const site: Site = {
    id: uid(),
    name: nameInput?.value.trim() || `Site ${workspace.sites.length + 1}`,
    comments: commentsInput?.value.trim() || '',
    latitude: lat,
    longitude: lon,
    pinColor: colorInput?.value || '#2563eb'
  };
  workspace.sites.push(site);
  selectedSiteId = site.id;
  if (pendingClickMarker) {
    pendingClickMarker.remove();
    pendingClickMarker = null;
  }
  ensureSelectionDefaults();
  await saveWorkspace(workspace);
  captureMapViewport();
  render();
}

async function updateSelectedSiteFromForm(): Promise<void> {
  if (!selectedSiteId) {
    return;
  }

  const site = workspace.sites.find((entry) => entry.id === selectedSiteId);
  if (!site) {
    return;
  }

  const nameInput = document.querySelector<HTMLInputElement>('#site-name');
  const colorInput = document.querySelector<HTMLInputElement>('#site-color');
  const commentsInput = document.querySelector<HTMLTextAreaElement>('#site-comments');
  const latInput = document.querySelector<HTMLInputElement>('#site-lat');
  const lonInput = document.querySelector<HTMLInputElement>('#site-lon');

  const lat = Number.parseFloat(latInput?.value ?? '');
  const lon = Number.parseFloat(lonInput?.value ?? '');
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    alert('Provide valid latitude and longitude.');
    return;
  }

  site.name = nameInput?.value.trim() || site.name;
  site.comments = commentsInput?.value.trim() || '';
  site.pinColor = colorInput?.value || site.pinColor;
  site.latitude = lat;
  site.longitude = lon;
  if (pendingClickMarker) {
    pendingClickMarker.remove();
    pendingClickMarker = null;
  }

  await saveWorkspace(workspace);
  captureMapViewport();
  render();
}

function initMap(): void {
  const mapCanvas = document.querySelector<HTMLDivElement>('#map-canvas');
  if (!mapCanvas) {
    return;
  }

  if (map) {
    map.remove();
    map = null;
  }

  const selectedSite = workspace.sites.find((site) => site.id === selectedSiteId);
  const initialCenter: [number, number] = mapCenter ?? (selectedSite ? [selectedSite.longitude, selectedSite.latitude] : [-98.5795, 39.8283]);

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
    center: initialCenter,
    zoom: mapZoom
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');

  map.on('click', (event) => {
    const lat = Number.parseFloat(event.lngLat.lat.toFixed(6));
    const lon = Number.parseFloat(event.lngLat.lng.toFixed(6));
    const latInput = document.querySelector<HTMLInputElement>('#site-lat');
    const lonInput = document.querySelector<HTMLInputElement>('#site-lon');
    if (latInput && lonInput) {
      latInput.value = String(lat);
      lonInput.value = String(lon);
    }
    renderPendingClickMarker(lat, lon);
  });

  map.on('moveend', () => {
    if (!map) {
      return;
    }
    const center = map.getCenter();
    mapCenter = [center.lng, center.lat];
    mapZoom = map.getZoom();
  });

  map.on('load', () => {
    map?.resize();
  });
  requestAnimationFrame(() => map?.resize());

  for (const marker of mapMarkers) {
    marker.remove();
  }

  mapMarkers = workspace.sites.map((site) => {
    const element = document.createElement('div');
    element.className = 'site-marker';
    element.innerHTML = `<span class="site-marker__dot" style="background:${escapeHtml(site.pinColor)}"></span><span class="site-marker__label">${escapeHtml(site.name)}</span>`;
    const marker = new maplibregl.Marker({ element }).setLngLat([site.longitude, site.latitude]).setPopup(
      new maplibregl.Popup().setHTML(
        `<strong>${escapeHtml(site.name)}</strong>${site.comments ? `<div class="muted">${escapeHtml(site.comments)}</div>` : ''}`
      )
    );
    marker.addTo(map as maplibregl.Map);
    marker.getElement().addEventListener('click', () => {
      selectedSiteId = site.id;
      render();
    });
    marker.getElement().addEventListener('mouseenter', () => marker.togglePopup());
    marker.getElement().addEventListener('mouseleave', () => marker.getPopup()?.remove());
    return marker;
  });

  const selectedForPending = workspace.sites.find((site) => site.id === selectedSiteId);
  if (selectedForPending) {
    renderPendingClickMarker(selectedForPending.latitude, selectedForPending.longitude);
  } else if (pendingClickMarker) {
    pendingClickMarker.remove();
    pendingClickMarker = null;
  }
}

function renderPendingClickMarker(lat: number, lon: number): void {
  if (!map) {
    return;
  }
  if (pendingClickMarker) {
    pendingClickMarker.remove();
    pendingClickMarker = null;
  }
  const element = document.createElement('div');
  element.className = 'pending-site-marker';
  element.textContent = '×';
  pendingClickMarker = new maplibregl.Marker({ element }).setLngLat([lon, lat]).addTo(map);
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
      comments: String(data.get('comments') ?? '').trim(),
      txPowerDbm: toNumber(data.get('txPowerDbm')),
      carrierFrequencyMHz: toNumber(data.get('carrierFrequencyMHz')),
      bandwidthHz: toNumber(data.get('bandwidthKHz')) * 1000,
      noiseFigureDb: toNumber(data.get('noiseFigureDb'))
    };
    workspace.sources.push(source);
    ensureSelectionDefaults();
    await saveWorkspace(workspace);
    render();
  });

  const sinkForm = document.querySelector<HTMLFormElement>('#add-sink-form');
  sinkForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(sinkForm);
    const sink: RadioSink = {
      id: uid(),
      name: String(data.get('name') ?? ''),
      comments: String(data.get('comments') ?? '').trim(),
      carrierFrequencyMHz: toNumber(data.get('carrierFrequencyMHz')),
      bandwidthHz: toNumber(data.get('bandwidthKHz')) * 1000,
      environmentNoiseTemperatureK: toNumber(data.get('environmentNoiseTemperatureK') ?? '300') || 300,
      noiseFigureDb: toNumber(data.get('noiseFigureDb') ?? '10') || 10,
      requiredSnrDb: toNumber(data.get('requiredSnrDb') ?? '15') || 15
    };
    workspace.sinks.push(sink);
    ensureSelectionDefaults();
    await saveWorkspace(workspace);
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-delete-source]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deleteSource;
      workspace.sources = workspace.sources.filter((source) => source.id !== id);
      await saveWorkspace(workspace);
      ensureSelectionDefaults();
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-delete-sink]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deleteSink;
      workspace.sinks = workspace.sinks.filter((sink) => sink.id !== id);
      await saveWorkspace(workspace);
      ensureSelectionDefaults();
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
      const comments = prompt('Source Comments', source.comments ?? '');
      source.comments = comments ?? source.comments ?? '';
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
      const comments = prompt('Sink Comments', sink.comments ?? '');
      sink.comments = comments ?? sink.comments ?? '';
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
      comments: String(data.get('comments') ?? '').trim(),
      heightM: toNumber(data.get('heightM')),
      azimuthDeg: toNumber(data.get('azimuthDeg')),
      tiltDeg: toNumber(data.get('tiltDeg')),
      polarization: String(data.get('polarization')) as Polarization,
      pattern: String(data.get('pattern')) as AntennaPattern,
      gainOverrideDb: rawGain ? Number.parseFloat(rawGain) : undefined
    };
    workspace.antennas.push(antenna);
    await saveWorkspace(workspace);
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-delete-antenna]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deleteAntenna;
      workspace.antennas = workspace.antennas.filter((entry) => entry.id !== id);
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
      const comments = prompt('Antenna Comments', antenna.comments ?? '');
      antenna.comments = comments ?? antenna.comments ?? '';
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
      comments: String(data.get('comments') ?? '').trim(),
      modelType: modelTypeValue,
      parameters: Object.fromEntries(parameterEntries)
    };

    workspace.propagationModels.push(model);
    ensureSelectionDefaults();
    await saveWorkspace(workspace);
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-delete-prop]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deleteProp;
      workspace.propagationModels = workspace.propagationModels.filter((entry) => entry.id !== id);
      ensureSelectionDefaults();
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
      const comments = prompt('Propagation Model Comments', model.comments ?? '');
      model.comments = comments ?? model.comments ?? '';
      await saveWorkspace(workspace);
      render();
    });
  });
}

function wirePreferencesEvents(): void {
  const theme = document.querySelector<HTMLSelectElement>('#pref-theme');
  const powerUnit = document.querySelector<HTMLSelectElement>('#pref-power-unit');
  const distanceUnit = document.querySelector<HTMLSelectElement>('#pref-distance-unit');
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

  exportButton?.addEventListener('click', () => {
    exportWorkspaceJson(workspace);
  });

  importInput?.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) {
      return;
    }
    try {
      workspace = normalizeWorkspace(await parseWorkspaceJson(file));
      await saveWorkspace(workspace);
      applyTheme();
      ensureSelectionDefaults();
      render();
    } catch (error) {
      alert(`Import failed: ${String(error)}`);
    }
  });
}

function normalizeWorkspace(raw: WorkspaceSnapshot): WorkspaceSnapshot {
  const work = raw as unknown as {
    schemaVersion?: number;
    sources?: Array<RadioSource & { comments?: string }>;
    sinks?: Array<RadioSink & { environmentNoiseTemperatureK?: number; noiseFigureDb?: number; requiredSnrDb?: number }>;
    antennas?: Array<AntennaModel & { comments?: string }>;
    propagationModels?: Array<PropagationModel & { comments?: string }>;
    sites?: Site[];
    pins?: Array<{
      id: string;
      name: string;
      latitude: number;
      longitude: number;
      kind?: 'source' | 'sink';
    }>;
    simulationQueue?: Array<SimulationQueueItem & { txAntennaId?: string; rxAntennaId?: string }>;
    preferences?: WorkspaceSnapshot['preferences'];
    reportHistory?: Array<{ id?: string; createdAtIso?: string; rows?: Array<Partial<SimulationResultRow> & { sinkPinId?: string }> }>;
    reportLatest?: Array<Partial<SimulationResultRow> & { sinkPinId?: string }>;
  };

  const preferences = {
    theme: work.preferences?.theme ?? DEFAULT_WORKSPACE.preferences.theme,
    powerUnit: work.preferences?.powerUnit ?? DEFAULT_WORKSPACE.preferences.powerUnit,
    distanceUnit: work.preferences?.distanceUnit ?? DEFAULT_WORKSPACE.preferences.distanceUnit
  };

  const sinks = (work.sinks ?? []).map((sink) => ({
    ...sink,
    comments: sink.comments ?? '',
    environmentNoiseTemperatureK: sink.environmentNoiseTemperatureK ?? 300,
    noiseFigureDb: sink.noiseFigureDb ?? 10,
    requiredSnrDb: sink.requiredSnrDb ?? 15
  }));

  const sources = (work.sources ?? []).map((source) => ({
    ...source,
    comments: source.comments ?? ''
  }));

  const antennas = (work.antennas ?? []).map((antenna) => ({
    ...antenna,
    comments: antenna.comments ?? ''
  }));

  const propagationModels = (work.propagationModels ?? []).map((model) => ({
    ...model,
    comments: model.comments ?? ''
  }));

  let sites: Site[] = [];
  if (Array.isArray(work.sites)) {
    sites = work.sites
      .filter((site) => Number.isFinite(site.latitude) && Number.isFinite(site.longitude))
      .map((site, index) => ({
        ...site,
        id: site.id || uid(),
        name: site.name || `Site ${index + 1}`,
        comments: site.comments ?? '',
        pinColor: site.pinColor || '#2563eb'
      }));
  } else if (Array.isArray(work.pins)) {
    sites = work.pins
      .filter((pin) => Number.isFinite(pin.latitude) && Number.isFinite(pin.longitude))
      .map((pin, index) => ({
        id: pin.id || uid(),
        name: pin.name || `Site ${index + 1}`,
        comments: '',
        latitude: pin.latitude,
        longitude: pin.longitude,
        pinColor: pin.kind === 'source' ? '#dc2626' : '#2563eb'
      }));
  }

  const normalizeResultRows = (rows: Array<Partial<SimulationResultRow> & { sinkPinId?: string }>): SimulationResultRow[] =>
    rows.map((row) => ({
    queueItemId: row.queueItemId ?? row.sinkPinId ?? '',
    txSiteId: row.txSiteId ?? '',
    rxSiteId: row.rxSiteId ?? '',
    transmitterSiteName: row.transmitterSiteName ?? row.sourceName ?? 'Unknown TX Site',
    transmitterCoordinates: row.transmitterCoordinates ?? '',
    transmitterRadio: row.transmitterRadio ?? 'Unknown TX Radio',
    frequencyMHz: row.frequencyMHz ?? 0,
    bandwidthKHz: row.bandwidthKHz ?? 0,
    receiverSiteName: row.receiverSiteName ?? row.sinkName ?? 'Unknown RX Site',
    receiverCoordinates: row.receiverCoordinates ?? '',
    receiverRadio: row.receiverRadio ?? 'Unknown RX Radio',
    sourceName: row.sourceName ?? 'Unknown Source',
    sinkName: row.sinkName ?? 'Unknown Sink',
    transmitterEirpDensityDbmPerHz: row.transmitterEirpDensityDbmPerHz ?? 0,
    distanceKm: row.distanceKm ?? 0,
    propagationLossesDb: row.propagationLossesDb ?? 0,
    incidentRfPowerDensityDbmPerHz: row.incidentRfPowerDensityDbmPerHz ?? 0,
    incidentElectricFieldVm: row.incidentElectricFieldVm ?? 0,
    availablePowerDensityAtAntennaDbmPerHz: row.availablePowerDensityAtAntennaDbmPerHz ?? 0,
    receiverNoiseFloorDensityDbmPerHz: row.receiverNoiseFloorDensityDbmPerHz ?? 0,
    snrDb: row.snrDb ?? 0,
    usableLink: row.usableLink === 'Y' ? ('Y' as const) : ('N' as const),
    warnings: row.warnings ?? []
    }));

  const reportLatest = normalizeResultRows(work.reportLatest ?? []);
  const reportHistory: ResultRun[] =
    work.reportHistory?.map((run) => ({
      id: run.id ?? uid(),
      createdAtIso: run.createdAtIso ?? new Date().toISOString(),
      rows: normalizeResultRows(run.rows ?? [])
    })) ?? [];

  if (!reportHistory.length && reportLatest.length) {
    reportHistory.push({
      id: uid(),
      createdAtIso: new Date().toISOString(),
      rows: reportLatest
    });
  }

  const simulationQueue = (work.simulationQueue ?? []).map((item) => ({
    ...item,
    txAntennaId: item.txAntennaId ?? '',
    rxAntennaId: item.rxAntennaId ?? ''
  }));

  return {
    schemaVersion: 1,
    sources,
    sinks,
    antennas,
    propagationModels,
    sites,
    simulationQueue,
    preferences,
    reportLatest,
    reportHistory
  };
}

function ensureSelectionDefaults(): void {
  if (!workspace.sites.some((entry) => entry.id === selectedSiteId)) {
    selectedSiteId = workspace.sites[0]?.id ?? '';
  }
  if (!workspace.sites.some((entry) => entry.id === selectedSimulationTxSiteId)) {
    selectedSimulationTxSiteId = workspace.sites[0]?.id ?? '';
  }
  if (!workspace.sites.some((entry) => entry.id === selectedSimulationRxSiteId)) {
    selectedSimulationRxSiteId = workspace.sites[0]?.id ?? '';
  }
  if (!workspace.sources.some((entry) => entry.id === selectedSimulationSourceRadioId)) {
    selectedSimulationSourceRadioId = workspace.sources[0]?.id ?? '';
  }
  if (!workspace.sinks.some((entry) => entry.id === selectedSimulationReceiverRadioId)) {
    selectedSimulationReceiverRadioId = workspace.sinks[0]?.id ?? '';
  }
  if (!workspace.antennas.some((entry) => entry.id === selectedSimulationTxAntennaId)) {
    selectedSimulationTxAntennaId = workspace.antennas[0]?.id ?? '';
  }
  if (!workspace.antennas.some((entry) => entry.id === selectedSimulationRxAntennaId)) {
    selectedSimulationRxAntennaId = workspace.antennas[0]?.id ?? '';
  }
  if (!workspace.propagationModels.some((entry) => entry.id === selectedPropagationModelId)) {
    selectedPropagationModelId = workspace.propagationModels[0]?.id ?? '';
  }
  if (!workspace.reportHistory.some((entry) => entry.id === selectedResultRunId)) {
    selectedResultRunId = workspace.reportHistory[0]?.id ?? '';
  }
}

function captureMapViewport(): void {
  if (!map) {
    return;
  }
  const center = map.getCenter();
  mapCenter = [center.lng, center.lat];
  mapZoom = map.getZoom();
}

function wireMapResizer(layout: HTMLDivElement, resizer: HTMLDivElement): void {
  const onMove = (event: PointerEvent) => {
    const rect = layout.getBoundingClientRect();
    const minWidth = 320;
    const maxWidth = rect.width - 340;
    const next = Math.max(minWidth, Math.min(maxWidth, event.clientX - rect.left));
    mapPaneWidthPx = next;
    sitePaneWidthPx = Math.max(300, Math.min(560, Math.round(next * 0.55)));
    layout.style.setProperty('--map-pane-width', `${next}px`);
    layout.style.setProperty('--pin-pane-width', `${sitePaneWidthPx}px`);
    map?.resize();
  };

  const onUp = () => {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
  };

  resizer.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  });
}

function applyTheme(): void {
  document.documentElement.dataset.theme = workspace.preferences.theme;
}

function formatPowerDensity(dbmPerHz: number): string {
  if (workspace.preferences.powerUnit === 'dBW') {
    return `${(dbmPerHz - 30).toFixed(2)} dBW/Hz`;
  }
  return `${dbmPerHz.toFixed(2)} dBm/Hz`;
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

function renderMarkdownSection(markdown: string): string {
  return renderManualWithToc(markdown).bodyHtml;
}

function renderModelGuideHtml(markdown: string): string {
  const normalized = markdown.replace(/\n\[\n([\s\S]*?)\n\]\n/g, (_match, body: string) => `\n\n$$\n${body.trim()}\n$$\n\n`);
  return modelGuideMarkdown.render(normalized);
}

function renderMathInline(latex: string): string {
  return katex.renderToString(latex, { throwOnError: false, strict: 'ignore', displayMode: false });
}

function extractPropagationModelSection(modelType: PropagationModelType, markdown: string): string {
  const lines = markdown.split('\n');
  const headingNeedles: Record<PropagationModelType, string[]> = {
    'Free Space': ['free-space path loss', 'free space path loss'],
    'Two-Ray': ['two-ray ground reflection'],
    'Knife-Edge': ['knife-edge diffraction', 'knife-edge'],
    'Ground Wave': ['ground-wave propagation', 'ground wave propagation'],
    Ionospheric: ['ionospheric skywave', 'ionospheric'],
    'Log-Distance': ['log-distance path loss', 'log-distance'],
    'Effective Earth Radius': ['effective earth radius', 'atmospheric refraction'],
    Troposcatter: ['troposcatter model', 'troposcatter']
  };

  const topHeadingIndexes: number[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith('# ')) {
      topHeadingIndexes.push(i);
    }
  }

  const needles = headingNeedles[modelType].map((needle) => needle.toLowerCase());
  const matchIndex = topHeadingIndexes.find((index) => {
    const headingText = lines[index].slice(2).trim().toLowerCase();
    return needles.some((needle) => headingText.includes(needle));
  });

  if (matchIndex == null) {
    return `# ${modelType}\n\nNo setup text found in docs/Models.md for this model type yet.`;
  }

  const headingPosition = topHeadingIndexes.indexOf(matchIndex);
  const endIndex = headingPosition >= 0 && headingPosition < topHeadingIndexes.length - 1 ? topHeadingIndexes[headingPosition + 1] : lines.length;
  return lines.slice(matchIndex, endIndex).join('\n').trim();
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

function uniqueBy(values: string[]): string[] {
  return Array.from(new Set(values));
}

function escapeHtml(raw: string): string {
  return raw
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function requireAppRoot(): HTMLDivElement {
  const found = document.querySelector<HTMLDivElement>('#app');
  if (!found) {
    throw new Error('App root not found');
  }
  return found;
}

render();
