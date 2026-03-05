import './styles.css';
import legalMarkdown from '../docs/LEGAL.md?raw';
import { DEFAULT_WORKSPACE } from './defaults';
import { exportWorkspaceJson, parseWorkspaceJson } from './io';
import { loadWorkspace, saveWorkspace } from './storage';
import type { TabId, WorkspaceSnapshot } from './types';

const tabs: Array<{ id: TabId; label: string }> = [
  { id: 'map', label: 'Map View' },
  { id: 'radios', label: 'Radios' },
  { id: 'antennas', label: 'Antennas' },
  { id: 'propagation', label: 'Propagation Models' },
  { id: 'reports', label: 'Reports' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'help', label: 'Help' }
];

let selectedTab: TabId = 'map';
let splashDismissed = false;
let workspace: WorkspaceSnapshot = structuredClone(DEFAULT_WORKSPACE);

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

  wirePreferencesEvents();
}

function renderTabContent(tabId: TabId): string {
  switch (tabId) {
    case 'map':
      return '<h2>Map View</h2><p>Map view is in progress.</p>';
    case 'radios':
      return '<h2>Radios</h2><p>Radio model editor is in progress.</p>';
    case 'antennas':
      return '<h2>Antennas</h2><p>Antenna model editor is in progress.</p>';
    case 'propagation':
      return '<h2>Propagation Models</h2><p>Propagation model editor is in progress.</p>';
    case 'reports':
      return '<h2>Reports</h2><p>Reports are generated from map simulations.</p>';
    case 'preferences':
      return `
        <h2>Preferences</h2>
        <div class="stack">
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
    case 'help':
      return '<h2>Help</h2><p>Manual rendering will be added in a later milestone.</p>';
    default:
      return '<h2>RF Ranger</h2>';
  }
}

function wirePreferencesEvents(): void {
  if (selectedTab !== 'preferences') {
    return;
  }

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
      const imported = await parseWorkspaceJson(file);
      workspace = imported;
      await saveWorkspace(workspace);
      applyTheme();
      render();
    } catch (error) {
      alert(`Import failed: ${String(error)}`);
    }
  });
}

function applyTheme(): void {
  const root = document.documentElement;
  root.dataset.theme = workspace.preferences.theme;
}

function escapeHtml(raw: string): string {
  return raw
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
