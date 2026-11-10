'use client';

import {
  useCallback,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react';
import { createId } from '@/lib/id';
import type { CanvasDocument, CanvasNode } from '@/lib/types';
import { snapNodePosition } from './geometry';
import type { SetCanvasDocument } from './use-canvas-documents';
import { useCanvasTransientStore } from './canvas-transient-store';

type CanvasNodeInteractionOptions = {
  document: CanvasDocument;
  setDocument: SetCanvasDocument;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  recordCurrentDocument: () => void;
  historyPausedRef: RefObject<boolean>;
};

type DragState = {
  nodeId: string;
  startX: number;
  startY: number;
  nodeX: number;
  nodeY: number;
  finalX: number;
  finalY: number;
  moved: boolean;
};

type ResizeState = {
  nodeId: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
  edge: 'right' | 'bottom' | 'corner';
  finalWidth: number;
  finalHeight: number;
  moved: boolean;
};

export function useCanvasNodeInteractions({
  document,
  setDocument,
  selectedIds,
  setSelectedIds,
  recordCurrentDocument,
  historyPausedRef,
}: CanvasNodeInteractionOptions) {
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const startNodeDrag = useCallback(
    (event: ReactPointerEvent, node: CanvasNode) => {
      event.stopPropagation();
      setSelectedIds(
        event.shiftKey ? Array.from(new Set([...selectedIds, node.id])) : [node.id],
      );
      const drag: DragState = {
        nodeId: node.id,
        startX: event.clientX,
        startY: event.clientY,
        nodeX: node.x,
        nodeY: node.y,
        finalX: node.x,
        finalY: node.y,
        moved: false,
      };
      const transient = useCanvasTransientStore.getState();
      transient.clearGeometry(node.id);
      transient.clearGuides();
      const move = (moveEvent: PointerEvent) => {
        if (!drag.moved) {
          recordCurrentDocument();
          historyPausedRef.current = true;
          drag.moved = true;
        }
        const dx = (moveEvent.clientX - drag.startX) / document.viewport.zoom;
        const dy = (moveEvent.clientY - drag.startY) / document.viewport.zoom;
        const moving = document.nodes.find((item) => item.id === drag.nodeId);
        const snapped = moving
          ? snapNodePosition({
              moving,
              proposedX: drag.nodeX + dx,
              proposedY: drag.nodeY + dy,
              otherNodes: document.nodes,
              zoom: document.viewport.zoom,
            })
          : {
              x: drag.nodeX + dx,
              y: drag.nodeY + dy,
              guideX: undefined,
              guideY: undefined,
            };
        drag.finalX = snapped.x;
        drag.finalY = snapped.y;
        transient.setDragFrame(
          drag.nodeId,
          { x: snapped.x, y: snapped.y },
          { x: snapped.guideX, y: snapped.guideY },
        );
      };
      const finish = () => {
        if (drag.moved) {
          setDocument(
            (current) => ({
              ...current,
              nodes: current.nodes.map((item) =>
                item.id === drag.nodeId
                  ? { ...item, x: drag.finalX, y: drag.finalY }
                  : item,
              ),
              updatedAt: Date.now(),
            }),
            { recordHistory: false },
          );
          window.requestAnimationFrame(() => {
            transient.clearGeometry(drag.nodeId);
          });
        } else {
          transient.clearGeometry(drag.nodeId);
        }
        transient.clearGuides();
        historyPausedRef.current = false;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', finish);
        window.removeEventListener('pointercancel', finish);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', finish);
      window.addEventListener('pointercancel', finish);
    },
    [
      document.nodes,
      document.viewport.zoom,
      historyPausedRef,
      recordCurrentDocument,
      selectedIds,
      setDocument,
      setSelectedIds,
    ],
  );

  const startNodeResize = useCallback(
    (
      event: ReactPointerEvent,
      node: CanvasNode,
      edge: 'right' | 'bottom' | 'corner',
    ) => {
      event.stopPropagation();
      const resize: ResizeState = {
        nodeId: node.id,
        startX: event.clientX,
        startY: event.clientY,
        width: node.width,
        height: node.height,
        edge,
        finalWidth: node.width,
        finalHeight: node.height,
        moved: false,
      };
      const transient = useCanvasTransientStore.getState();
      transient.clearGeometry(node.id);
      const move = (moveEvent: PointerEvent) => {
        if (!resize.moved) {
          recordCurrentDocument();
          historyPausedRef.current = true;
          resize.moved = true;
        }
        const dx = (moveEvent.clientX - resize.startX) / document.viewport.zoom;
        const dy = (moveEvent.clientY - resize.startY) / document.viewport.zoom;
        resize.finalWidth = Math.max(
          220,
          resize.width + (resize.edge === 'bottom' ? 0 : dx),
        );
        resize.finalHeight = Math.max(
          140,
          resize.height + (resize.edge === 'right' ? 0 : dy),
        );
        transient.setGeometry(resize.nodeId, {
          width: resize.finalWidth,
          height: resize.finalHeight,
        });
      };
      const finish = () => {
        if (resize.moved) {
          setDocument(
            (current) => ({
              ...current,
              nodes: current.nodes.map((item) =>
                item.id === resize.nodeId
                  ? {
                      ...item,
                      width: resize.finalWidth,
                      height: resize.finalHeight,
                    }
                  : item,
              ),
              updatedAt: Date.now(),
            }),
            { recordHistory: false },
          );
          window.requestAnimationFrame(() => {
            transient.clearGeometry(resize.nodeId);
          });
        } else {
          transient.clearGeometry(resize.nodeId);
        }
        historyPausedRef.current = false;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', finish);
        window.removeEventListener('pointercancel', finish);
      };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', finish);
      window.addEventListener('pointercancel', finish);
    },
    [
      document.viewport.zoom,
      historyPausedRef,
      recordCurrentDocument,
      setDocument,
    ],
  );

  const connectTo = useCallback(
    (targetId: string) => {
      if (!connectingFrom || connectingFrom === targetId) {
        setConnectingFrom(null);
        return;
      }
      setDocument((current) => ({
        ...current,
        edges: current.edges.some(
          (edge) => edge.from === connectingFrom && edge.to === targetId,
        )
          ? current.edges
          : [
              ...current.edges,
              { id: createId('edge'), from: connectingFrom, to: targetId },
            ],
        updatedAt: Date.now(),
      }));
      setConnectingFrom(null);
    },
    [connectingFrom, setDocument],
  );

  return {
    connectingFrom,
    setConnectingFrom,
    startNodeDrag,
    startNodeResize,
    connectTo,
  };
}
