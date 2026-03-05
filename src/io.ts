import type { WorkspaceSnapshot } from './types';

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
