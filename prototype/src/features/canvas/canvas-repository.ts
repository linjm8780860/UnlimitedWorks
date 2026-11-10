import type {
  CanvasDocument,
  CanvasEdge,
  CanvasNode,
  CanvasWorkspace,
} from '@/lib/types';

const DB_NAME = 'unlimited-works-canvas';
const DB_VERSION = 1;
const STORE_NAME = 'workspaces';
const WORKSPACE_KEY = 'default';

type StoredWorkspace = {
  key: string;
  workspace: CanvasWorkspace;
  updatedAt: number;
};

let writeChain = Promise.resolve();

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('Failed to open canvas database'));
  });
}

function isCanvasNode(value: unknown): value is CanvasNode {
  if (!value || typeof value !== 'object') return false;
  const node = value as Partial<CanvasNode>;
  return (
    typeof node.id === 'string' &&
    typeof node.type === 'string' &&
    typeof node.title === 'string' &&
    typeof node.x === 'number' &&
    typeof node.y === 'number' &&
    typeof node.width === 'number' &&
    typeof node.height === 'number' &&
    typeof node.prompt === 'string' &&
    typeof node.content === 'string' &&
    typeof node.model === 'string' &&
    typeof node.status === 'string' &&
    typeof node.fixedText === 'boolean' &&
    typeof node.createdAt === 'number'
  );
}

function isCanvasEdge(value: unknown): value is CanvasEdge {
  if (!value || typeof value !== 'object') return false;
  const edge = value as Partial<CanvasEdge>;
  return (
    typeof edge.id === 'string' &&
    typeof edge.from === 'string' &&
    typeof edge.to === 'string'
  );
}

function isCanvasDocument(value: unknown): value is CanvasDocument {
  if (!value || typeof value !== 'object') return false;
  const document = value as Partial<CanvasDocument>;
  return (
    typeof document.id === 'string' &&
    typeof document.name === 'string' &&
    typeof document.updatedAt === 'number' &&
    Array.isArray(document.nodes) &&
    document.nodes.every(isCanvasNode) &&
    Array.isArray(document.edges) &&
    document.edges.every(isCanvasEdge) &&
    !!document.viewport &&
    typeof document.viewport.x === 'number' &&
    typeof document.viewport.y === 'number' &&
    typeof document.viewport.zoom === 'number'
  );
}

function isCanvasWorkspace(value: unknown): value is CanvasWorkspace {
  if (!value || typeof value !== 'object') return false;
  const workspace = value as Partial<CanvasWorkspace>;
  return (
    typeof workspace.activeDocumentId === 'string' &&
    Array.isArray(workspace.documents) &&
    workspace.documents.length > 0 &&
    workspace.documents.every(isCanvasDocument)
  );
}

function readLegacyWorkspace() {
  try {
    const serialized = window.localStorage.getItem('uw-next-canvas-workspace');
    if (serialized) {
      const workspace = JSON.parse(serialized) as unknown;
      if (isCanvasWorkspace(workspace)) return workspace;
    }

    const legacyDocument = window.localStorage.getItem('uw-next-canvas-document');
    if (!legacyDocument) return null;
    const document = JSON.parse(legacyDocument) as unknown;
    if (!isCanvasDocument(document)) return null;
    return {
      documents: [{ ...document, updatedAt: Date.now() }],
      activeDocumentId: document.id,
    };
  } catch {
    return null;
  }
}

async function writeWorkspace(workspace: CanvasWorkspace) {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      transaction.objectStore(STORE_NAME).put({
        key: WORKSPACE_KEY,
        workspace,
        updatedAt: Date.now(),
      } satisfies StoredWorkspace);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error('Failed to save canvas workspace'));
    });
  } finally {
    database.close();
  }
}

export async function loadCanvasWorkspace() {
  const database = await openDatabase();
  try {
    const stored = await new Promise<StoredWorkspace | undefined>(
      (resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, 'readonly');
        const request = transaction.objectStore(STORE_NAME).get(WORKSPACE_KEY);
        request.onsuccess = () =>
          resolve(request.result as StoredWorkspace | undefined);
        request.onerror = () =>
          reject(request.error ?? new Error('Failed to load canvas workspace'));
      },
    );
    return stored?.workspace && isCanvasWorkspace(stored.workspace)
      ? stored.workspace
      : null;
  } finally {
    database.close();
  }
}

export function saveCanvasWorkspace(workspace: CanvasWorkspace) {
  writeChain = writeChain
    .catch(() => undefined)
    .then(() => writeWorkspace(workspace));
  return writeChain;
}

export async function loadOrMigrateCanvasWorkspace() {
  const stored = await loadCanvasWorkspace();
  if (stored) return stored;
  const legacy = readLegacyWorkspace();
  if (!legacy) return null;
  await saveCanvasWorkspace(legacy);
  return legacy;
}
