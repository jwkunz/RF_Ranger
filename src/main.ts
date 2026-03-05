import './styles.css';
import legalMarkdown from '../docs/LEGAL.md?raw';
import { DEFAULT_WORKSPACE } from './defaults';
import { exportWorkspaceJson, parseWorkspaceJson } from './io';
import { loadWorkspace, saveWorkspace } from './storage';
import type {
  AntennaModel,
  AntennaPattern,
  Polarization,
  PropagationModel,
  PropagationModelType,
  RadioSink,
  RadioSource,
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

let selectedTab: TabId = 'map';
let splashDismissed = false;
let workspace: WorkspaceSnapshot = structuredClone(DEFAULT_WORKSPACE);
let activePropagationType: PropagationModelType = 'Free Space';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('App root not found');
}

void init();

async function init(): Promise<void> {
  workspace = await loadWorkspace();
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
      return '<h2>Map View</h2><p>Map and sink pin workflows are in progress.</p>';
    case 'radios':
      return renderRadiosTab();
    case 'antennas':
      return renderAntennasTab();
    case 'propagation':
      return renderPropagationTab();
    case 'reports':
      return '<h2>Reports</h2><p>Reports are generated from map simulations.</p>';
    case 'preferences':
      return renderPreferencesTab();
    case 'help':
      return '<h2>Help</h2><p>Manual rendering will be added in a later milestone.</p>';
    default:
      return '<h2>RF Ranger</h2>';
  }
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
    await saveWorkspace(workspace);
    render();
  });

  document.querySelectorAll<HTMLButtonElement>('[data-delete-prop]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deleteProp;
      workspace.propagationModels = workspace.propagationModels.filter((entry) => entry.id !== id);
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
