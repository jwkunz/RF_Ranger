import { DEFAULT_WORKSPACE } from './defaults';
import type { WorkspaceSnapshot } from './types';

const DB_NAME = 'rf-ranger';
const STORE_NAME = 'workspace';
const KEY = 'active';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadWorkspace(): Promise<WorkspaceSnapshot> {
  const db = await openDb();
  const value = await new Promise<WorkspaceSnapshot | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(KEY);
    req.onsuccess = () => resolve(req.result as WorkspaceSnapshot | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();

  if (!value || value.schemaVersion !== 1) {
    return structuredClone(DEFAULT_WORKSPACE);
  }

  return value;
}

export async function saveWorkspace(workspace: WorkspaceSnapshot): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(workspace, KEY);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
  db.close();
}
