import type { AssetItem } from '@/lib/types';

const DB_NAME = 'unlimited-works-assets';
const DB_VERSION = 1;
const STORE_NAME = 'assets';
let mutationChain = Promise.resolve();

function enqueueMutation(action: () => Promise<void>) {
  mutationChain = mutationChain.catch(() => undefined).then(action);
  return mutationChain;
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open asset database'));
  });
}

export async function listAssets() {
  await mutationChain.catch(() => undefined);
  const database = await openDatabase();
  try {
    return await new Promise<AssetItem[]>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readonly');
      const request = transaction.objectStore(STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result as AssetItem[]);
      request.onerror = () => reject(request.error ?? new Error('Failed to list assets'));
    });
  } finally {
    database.close();
  }
}

export function putAsset(asset: AssetItem) {
  return enqueueMutation(async () => {
    const database = await openDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).put(asset);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(transaction.error ?? new Error('Failed to store asset'));
      });
    } finally {
      database.close();
    }
  });
}

export function deleteAsset(id: string) {
  return enqueueMutation(async () => {
    const database = await openDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).delete(id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(transaction.error ?? new Error('Failed to delete asset'));
      });
    } finally {
      database.close();
    }
  });
}

export async function importLegacyAssets() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('uw-next-assets');
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AssetItem[];
    if (!Array.isArray(parsed)) return [];
    await Promise.all(parsed.map((asset) => putAsset(asset)));
    return parsed;
  } catch {
    return [];
  }
}

