'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SetStateAction,
} from 'react';
import { createId } from '@/lib/id';
import type { CanvasDocument, CanvasWorkspace } from '@/lib/types';
import { useWorkspaceStore } from '@/features/workspace/workspace-store';
import {
  createDefaultCanvasDocument,
  createDefaultCanvasWorkspace,
} from './domain/canvas-document';
import { useSettingsStore } from '@/features/settings/settings-store';
import {
  loadOrMigrateCanvasWorkspace,
  saveCanvasWorkspace,
} from './canvas-repository';

export type SetCanvasDocument = (
  action: SetStateAction<CanvasDocument>,
  options?: { recordHistory?: boolean },
) => void;

export function useCanvasDocuments(projectId?: string) {
  const [canvasWorkspace, setCanvasWorkspace] = useState<CanvasWorkspace>(
    createDefaultCanvasWorkspace(),
  );
  const [hydrated, setHydrated] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const workspaceRef = useRef(canvasWorkspace);
  workspaceRef.current = canvasWorkspace;
  const projects = useWorkspaceStore((state) => state.projects);
  const maxUndoSteps = useSettingsStore((state) => state.maxUndoSteps);
  const historyRef = useRef(
    new Map<string, { undo: CanvasDocument[]; redo: CanvasDocument[] }>(),
  );
  const historyPausedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void loadOrMigrateCanvasWorkspace()
      .then((stored) => {
        if (!cancelled && stored) setCanvasWorkspace(stored);
      })
      .catch((error) => {
        if (!cancelled) {
          setPersistenceError(
            error instanceof Error ? error.message : String(error),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const timeout = window.setTimeout(() => {
      void saveCanvasWorkspace(canvasWorkspace)
        .then(() => setPersistenceError(null))
        .catch((error) =>
          setPersistenceError(
            error instanceof Error ? error.message : String(error),
          ),
        );
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [canvasWorkspace, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const flush = () => {
      void saveCanvasWorkspace(workspaceRef.current).catch((error) => {
        setPersistenceError(
          error instanceof Error ? error.message : String(error),
        );
      });
    };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, [hydrated]);

  const document =
    canvasWorkspace.documents.find((item) => item.id === canvasWorkspace.activeDocumentId) ??
    canvasWorkspace.documents[0] ??
    createDefaultCanvasDocument();
  const visibleDocuments = projectId
    ? canvasWorkspace.documents.filter((item) => item.projectId === projectId)
    : canvasWorkspace.documents.filter((item) => !item.projectId);
  const tabDocuments = visibleDocuments.length > 0 ? visibleDocuments : [document];

  const setDocument = useCallback<SetCanvasDocument>(
    (action, options) => {
      setCanvasWorkspace((current) => {
        const index = current.documents.findIndex(
          (item) => item.id === current.activeDocumentId,
        );
        if (index < 0) return current;
        const active = current.documents[index];
        const next = typeof action === 'function' ? action(active) : action;
        if (next === active) return current;
        if (!historyPausedRef.current && options?.recordHistory !== false) {
          const history = historyRef.current.get(active.id) ?? { undo: [], redo: [] };
          history.undo.push(structuredClone(active));
          history.undo = history.undo.slice(-Math.max(1, maxUndoSteps));
          history.redo = [];
          historyRef.current.set(active.id, history);
        }
        return {
          ...current,
          documents: current.documents.map((item, itemIndex) =>
            itemIndex === index ? next : item,
          ),
        };
      });
    },
    [maxUndoSteps, setCanvasWorkspace],
  );

  const recordCurrentDocument = useCallback(() => {
    const history = historyRef.current.get(document.id) ?? { undo: [], redo: [] };
    history.undo.push(structuredClone(document));
    history.undo = history.undo.slice(-Math.max(1, maxUndoSteps));
    history.redo = [];
    historyRef.current.set(document.id, history);
  }, [document, maxUndoSteps]);

  const createCanvasDocument = useCallback(() => {
    const next = createDefaultCanvasDocument();
    next.id = createId('canvas');
    next.projectId = projectId;
    next.name = projectId
      ? projects.find((project) => project.id === projectId)?.name ?? '项目画布'
      : `未命名 ${canvasWorkspace.documents.length + 1}`;
    setCanvasWorkspace((current) => ({
      documents: [...current.documents, next],
      activeDocumentId: next.id,
    }));
    return next;
  }, [
    canvasWorkspace.documents.length,
    projectId,
    projects,
    setCanvasWorkspace,
  ]);

  const closeCanvasDocument = useCallback(
    (id: string) => {
      setCanvasWorkspace((current) => {
        const remaining = current.documents.filter((item) => item.id !== id);
        if (remaining.length === 0) {
          const replacement = createDefaultCanvasDocument();
          replacement.id = createId('canvas');
          replacement.projectId = projectId;
          return { documents: [replacement], activeDocumentId: replacement.id };
        }
        return {
          documents: remaining,
          activeDocumentId:
            current.activeDocumentId === id ? remaining[0].id : current.activeDocumentId,
        };
      });
      historyRef.current.delete(id);
    },
    [projectId, setCanvasWorkspace],
  );

  const undoDocument = useCallback(() => {
    setCanvasWorkspace((current) => {
      const active = current.documents.find((item) => item.id === current.activeDocumentId);
      if (!active) return current;
      const history = historyRef.current.get(active.id);
      const previous = history?.undo.pop();
      if (!history || !previous) return current;
      history.redo.push(structuredClone(active));
      return {
        ...current,
        documents: current.documents.map((item) =>
          item.id === active.id ? previous : item,
        ),
      };
    });
  }, [setCanvasWorkspace]);

  const redoDocument = useCallback(() => {
    setCanvasWorkspace((current) => {
      const active = current.documents.find((item) => item.id === current.activeDocumentId);
      if (!active) return current;
      const history = historyRef.current.get(active.id);
      const next = history?.redo.pop();
      if (!history || !next) return current;
      history.undo.push(structuredClone(active));
      return {
        ...current,
        documents: current.documents.map((item) =>
          item.id === active.id ? next : item,
        ),
      };
    });
  }, [setCanvasWorkspace]);

  useEffect(() => {
    if (!projectId || !hydrated) return;
    setCanvasWorkspace((current) => {
      const projectDocuments = current.documents.filter(
        (item) => item.projectId === projectId,
      );
      if (projectDocuments.length > 0) {
        return projectDocuments.some((item) => item.id === current.activeDocumentId)
          ? current
          : { ...current, activeDocumentId: projectDocuments[0].id };
      }
      const next = createDefaultCanvasDocument();
      next.id = createId('canvas');
      next.projectId = projectId;
      next.name = projects.find((project) => project.id === projectId)?.name ?? '项目画布';
      return {
        documents: [...current.documents, next],
        activeDocumentId: next.id,
      };
    });
  }, [hydrated, projectId, projects, setCanvasWorkspace]);

  return {
    canvasWorkspace,
    setCanvasWorkspace,
    canvasHydrated: hydrated,
    canvasPersistenceError: persistenceError,
    document,
    tabDocuments,
    setDocument,
    createCanvasDocument,
    closeCanvasDocument,
    undoDocument,
    redoDocument,
    recordCurrentDocument,
    historyPausedRef,
  };
}

