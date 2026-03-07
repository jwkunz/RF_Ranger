import type { SimulationResultRow, Site, WorkspaceSnapshot } from './types';

export function exportWorkspaceJson(workspace: WorkspaceSnapshot): void {
  const json = JSON.stringify(workspace, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'rf-ranger-workspace.json';
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function parseWorkspaceJson(file: File): Promise<WorkspaceSnapshot> {
  const raw = await file.text();
  const parsed = JSON.parse(raw) as WorkspaceSnapshot;
  if (parsed.schemaVersion !== 1) {
    throw new Error('Unsupported workspace schema version');
  }
  return parsed;
}

export function exportSitesKml(sites: Site[]): void {
  const placemarks = sites
    .map(
      (site) => `
    <Placemark>
      <name>${escapeXml(site.name)}</name>
      <ExtendedData>
        <Data name="pinColor"><value>${escapeXml(site.pinColor)}</value></Data>
      </ExtendedData>
      <Point><coordinates>${site.longitude},${site.latitude},0</coordinates></Point>
    </Placemark>`
    )
    .join('');

  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>${placemarks}
  </Document>
</kml>`;

  const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'rf-ranger-sites.kml';
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function parseSitesKml(file: File): Promise<Site[]> {
  const raw = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, 'text/xml');
  const placemarks = Array.from(doc.getElementsByTagName('Placemark'));

  return placemarks
    .map((placemark, index): Site | null => {
      const name = placemark.getElementsByTagName('name')[0]?.textContent?.trim() || `Imported Site ${index + 1}`;
      const coordsRaw = placemark.getElementsByTagName('coordinates')[0]?.textContent?.trim() || '';
      const [lonRaw, latRaw] = coordsRaw.split(',');
      const latitude = Number.parseFloat(latRaw);
      const longitude = Number.parseFloat(lonRaw);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      const site: Site = {
        id: crypto.randomUUID(),
        name,
        comments: '',
        latitude,
        longitude,
        pinColor: findExtendedDataValue(placemark, 'pinColor') || '#2563eb'
      };
      return site;
    })
    .filter((site): site is Site => site !== null);
}

export function exportReportsCsv(rows: SimulationResultRow[]): void {
  const header = [
    'Transmitter Site Name',
    'Transmitter Coordinates',
    'Transmitter Radio',
    'Frequency (MHz)',
    'Bandwidth (kHz)',
    'Receiver Site Name',
    'Receiver Coordinates',
    'Receiver Radio',
    'Transmitter EIRP',
    'Transmitter EIRP Density',
    'Distance',
    'Propagation Losses',
    'Power Density at Receive Antenna',
    'Electric Field Density at Receive Antenna',
    'Power Density Into Receiver',
    'Receiver Noise Floor',
    'SNR in Receiver',
    'Useable Link'
  ];
  const lines = rows.map((row) =>
    [
      row.transmitterSiteName,
      row.transmitterCoordinates,
      row.transmitterRadio,
      row.frequencyMHz.toString(),
      row.bandwidthKHz.toString(),
      row.receiverSiteName,
      row.receiverCoordinates,
      row.receiverRadio,
      row.transmitterEirpDbm.toString(),
      row.transmitterEirpDensityDbmPerHz.toString(),
      row.distanceKm.toString(),
      row.propagationLossesDb.toString(),
      row.incidentRfPowerDensityDbmPerHz.toString(),
      row.incidentElectricFieldVm.toString(),
      row.availablePowerDensityAtAntennaDbmPerHz.toString(),
      row.receiverNoiseFloorDensityDbmPerHz.toString(),
      row.snrDb.toString(),
      row.usableLink
    ]
      .map((value) => csvEscape(value))
      .join(',')
  );

  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'rf-ranger-results.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvEscape(value: string): string {
  if (!value.includes(',') && !value.includes('"') && !value.includes('\n')) {
    return value;
  }
  return `"${value.replaceAll('"', '""')}"`;
}

function findExtendedDataValue(placemark: Element, key: string): string | undefined {
  const dataElements = Array.from(placemark.getElementsByTagName('Data'));
  const target = dataElements.find((dataNode) => dataNode.getAttribute('name') === key);
  return target?.getElementsByTagName('value')[0]?.textContent?.trim();
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
