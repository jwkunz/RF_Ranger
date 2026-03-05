import type { MapPin, WorkspaceSnapshot } from './types';

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

export function exportPinsKml(pins: MapPin[]): void {
  const placemarks = pins
    .map(
      (pin) => `
    <Placemark>
      <name>${escapeXml(pin.name)}</name>
      <ExtendedData>
        <Data name="sinkRadioId"><value>${escapeXml(pin.sinkRadioId)}</value></Data>
        <Data name="sinkAntennaId"><value>${escapeXml(pin.sinkAntennaId)}</value></Data>
      </ExtendedData>
      <Point><coordinates>${pin.longitude},${pin.latitude},0</coordinates></Point>
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
  anchor.download = 'rf-ranger-pins.kml';
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function parsePinsKml(file: File): Promise<MapPin[]> {
  const raw = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, 'text/xml');
  const placemarks = Array.from(doc.getElementsByTagName('Placemark'));

  return placemarks.map((placemark, index) => {
    const name = placemark.getElementsByTagName('name')[0]?.textContent?.trim() || `Imported Sink ${index + 1}`;
    const coordsRaw = placemark.getElementsByTagName('coordinates')[0]?.textContent?.trim() || '';
    const [lonRaw, latRaw] = coordsRaw.split(',');
    const sinkRadioId = findExtendedDataValue(placemark, 'sinkRadioId') || '';
    const sinkAntennaId = findExtendedDataValue(placemark, 'sinkAntennaId') || '';

    return {
      id: crypto.randomUUID(),
      name,
      latitude: Number.parseFloat(latRaw),
      longitude: Number.parseFloat(lonRaw),
      sinkRadioId,
      sinkAntennaId
    };
  });
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
