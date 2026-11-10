'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import type { CanvasDocument, CanvasNode } from '@/lib/types';
import { useSettingsStore } from '@/features/settings/settings-store';
import type { SetCanvasDocument } from './use-canvas-documents';

export type CanvasMenuPosition = {
  x: number;
  y: number;
  worldX: number;
  worldY: number;
};

export type CanvasSelectionBox = {
  startX: number;
  startY: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type CanvasViewportOptions = {
  document: CanvasDocument;
  setDocument: SetCanvasDocument;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  surfaceRef: RefObject<HTMLDivElement | null>;
};

type PanState = {
  startX: number;
  startY: number;
  viewX: number;
  viewY: number;
};

export function useCanvasViewportInteractions({
  document,
  setDocument,
  selectedIds,
  setSelectedIds,
  surfaceRef,
}: CanvasViewportOptions) {
  const wheelMode = useSettingsStore((state) => state.wheelMode);
  const zoomSensitivity = useSettingsStore((state) => state.zoomSensitivity);
  const spacePan = useSettingsStore((state) => state.spacePan);
  const [menuAt, setMenuAt] = useState<CanvasMenuPosition | null>(null);
  const [selectionBox, setSelectionBox] = useState<CanvasSelectionBox | null>(null);
  const [panning, setPanning] = useState(false);
  const spacePressedRef = useRef(false);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.code === 'Space') spacePressedRef.current = true;
    };
    const keyup = (event: KeyboardEvent) => {
      if (event.code === 'Space') spacePressedRef.current = false;
    };
    const blur = () => {
      spacePressedRef.current = false;
    };
    window.addEventListener('keydown', keydown);
    window.addEventListener('keyup', keyup);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', blur);
    };
  }, []);

  const closeMenu = useCallback(() => setMenuAt(null), []);

  const resetZoom = useCallback(() => {
    setDocument(
      (current) => ({
        ...current,
        viewport: { ...current.viewport, zoom: 1 },
      }),
      { recordHistory: false },
    );
  }, [setDocument]);

  const fitNodesInView = useCallback(
    (nodes: CanvasNode[], maxZoom: number) => {
      if (nodes.length === 0) {
        resetZoom();
        return;
      }
      const minX = Math.min(...nodes.map((node) => node.x));
      const minY = Math.min(...nodes.map((node) => node.y));
      const maxX = Math.max(...nodes.map((node) => node.x + node.width));
      const maxY = Math.max(...nodes.map((node) => node.y + node.height));
      const rect = surfaceRef.current?.getBoundingClientRect();
      if (!rect) return;
      const zoom = Math.min(
        maxZoom,
        Math.max(
          0.2,
          Math.min(
            rect.width / (maxX - minX + 240),
            rect.height / (maxY - minY + 240),
          ),
        ),
      );
      setDocument(
        (current) => ({
          ...current,
          viewport: {
            zoom,
            x: rect.width / 2 - ((minX + maxX) / 2) * zoom,
            y: rect.height / 2 - ((minY + maxY) / 2) * zoom,
          },
        }),
        { recordHistory: false },
      );
    },
    [resetZoom, setDocument, surfaceRef],
  );

  const focusSelection = useCallback(() => {
    const selectedNodes = document.nodes.filter((node) =>
      selectedIds.includes(node.id),
    );
    fitNodesInView(selectedNodes.length ? selectedNodes : document.nodes, 1.35);
  }, [document.nodes, fitNodesInView, selectedIds]);

  const fitView = useCallback(() => {
    fitNodesInView(document.nodes, 1.2);
  }, [document.nodes, fitNodesInView]);

  const zoomBy = useCallback(
    (delta: number) => {
      setDocument(
        (current) => ({
          ...current,
          viewport: {
            ...current.viewport,
            zoom: Math.max(0.2, Math.min(2.5, current.viewport.zoom + delta)),
          },
        }),
        { recordHistory: false },
      );
    },
    [setDocument],
  );

  const onSurfacePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const wantsPan =
        event.button === 1 ||
        event.button === 2 ||
        (event.button === 0 && spacePan && spacePressedRef.current);
      if (event.button !== 0 && !wantsPan) return;
      if (menuAt) setMenuAt(null);
      const rect = surfaceRef.current?.getBoundingClientRect();
      if (!rect) return;
      const startX = event.clientX - rect.left;
      const startY = event.clientY - rect.top;

      if (wantsPan) {
        event.preventDefault();
        const pan: PanState = {
          startX,
          startY,
          viewX: document.viewport.x,
          viewY: document.viewport.y,
        };
        setPanning(true);
        const move = (moveEvent: PointerEvent) => {
          const dx = moveEvent.clientX - rect.left - pan.startX;
          const dy = moveEvent.clientY - rect.top - pan.startY;
          setDocument(
            (current) => ({
              ...current,
              viewport: {
                ...current.viewport,
                x: pan.viewX + dx,
                y: pan.viewY + dy,
              },
            }),
            { recordHistory: false },
          );
        };
        const up = () => {
          setPanning(false);
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        return;
      }

      if (
        event.target === event.currentTarget ||
        (event.target as HTMLElement).closest('.uw-canvas-world')
      ) {
        setSelectedIds([]);
      }
      let dragBox = { startX, startY, x: startX, y: startY, width: 0, height: 0 };
      setSelectionBox(dragBox);
      const move = (moveEvent: PointerEvent) => {
        const x = moveEvent.clientX - rect.left;
        const y = moveEvent.clientY - rect.top;
        dragBox = {
          startX,
          startY,
          x: Math.min(startX, x),
          y: Math.min(startY, y),
          width: Math.abs(x - startX),
          height: Math.abs(y - startY),
        };
        setSelectionBox(dragBox);
      };
      const up = () => {
        if (dragBox.width > 8 && dragBox.height > 8) {
          const worldLeft =
            (dragBox.x - document.viewport.x) / document.viewport.zoom;
          const worldTop =
            (dragBox.y - document.viewport.y) / document.viewport.zoom;
          const worldRight =
            (dragBox.x + dragBox.width - document.viewport.x) /
            document.viewport.zoom;
          const worldBottom =
            (dragBox.y + dragBox.height - document.viewport.y) /
            document.viewport.zoom;
          const hit = document.nodes
            .filter(
              (node) =>
                node.x < worldRight &&
                node.x + node.width > worldLeft &&
                node.y < worldBottom &&
                node.y + node.height > worldTop,
            )
            .map((node) => node.id);
          if (hit.length) setSelectedIds(hit);
        }
        setSelectionBox(null);
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    },
    [
      document.nodes,
      document.viewport.x,
      document.viewport.y,
      document.viewport.zoom,
      menuAt,
      setDocument,
      setSelectedIds,
      spacePan,
      surfaceRef,
    ],
  );

  const onDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const rect = surfaceRef.current?.getBoundingClientRect();
      if (!rect) return;
      const screenX = event.clientX - rect.left;
      const screenY = event.clientY - rect.top;
      setMenuAt({
        x: screenX,
        y: screenY,
        worldX: (screenX - document.viewport.x) / document.viewport.zoom,
        worldY: (screenY - document.viewport.y) / document.viewport.zoom,
      });
    },
    [document.viewport.x, document.viewport.y, document.viewport.zoom, surfaceRef],
  );

  const onWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey || wheelMode === 'zoom') {
        const rect = surfaceRef.current?.getBoundingClientRect();
        if (!rect) return;
        const px = event.clientX - rect.left;
        const py = event.clientY - rect.top;
        const factor = Math.exp(-event.deltaY * 0.0016 * zoomSensitivity);
        setDocument(
          (current) => {
            const nextZoom = Math.max(
              0.18,
              Math.min(2.5, current.viewport.zoom * factor),
            );
            const worldX = (px - current.viewport.x) / current.viewport.zoom;
            const worldY = (py - current.viewport.y) / current.viewport.zoom;
            return {
              ...current,
              viewport: {
                zoom: nextZoom,
                x: px - worldX * nextZoom,
                y: py - worldY * nextZoom,
              },
            };
          },
          { recordHistory: false },
        );
      } else if (wheelMode === 'pan') {
        setDocument(
          (current) => ({
            ...current,
            viewport: {
              ...current.viewport,
              x:
                current.viewport.x +
                (event.shiftKey ? -event.deltaY : -event.deltaX),
              y: current.viewport.y + (event.shiftKey ? 0 : -event.deltaY),
            },
          }),
          { recordHistory: false },
        );
      }
    },
    [setDocument, surfaceRef, wheelMode, zoomSensitivity],
  );

  const onContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  return {
    menuAt,
    closeMenu,
    selectionBox,
    panning,
    onSurfacePointerDown,
    onDoubleClick,
    onWheel,
    onContextMenu,
    resetZoom,
    fitView,
    zoomBy,
    focusSelection,
  };
}
