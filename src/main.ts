import './styles.css';
import legalMarkdown from '../docs/LEGAL.md?raw';

type TabId =
  | 'map'
  | 'radios'
  | 'antennas'
  | 'propagation'
  | 'reports'
  | 'preferences'
  | 'help';

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

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('App root not found');
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
      const tabId = button.dataset.tab as TabId;
      selectedTab = tabId;
      render();
    });
  });
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
      return '<h2>Preferences</h2><p>Theme and unit options are in progress.</p>';
    case 'help':
      return '<h2>Help</h2><p>Manual rendering will be added in a later milestone.</p>';
    default:
      return '<h2>RF Ranger</h2>';
  }
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
