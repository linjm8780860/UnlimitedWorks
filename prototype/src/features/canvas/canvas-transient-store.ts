'use client';

import { create } from 'zustand';
import type { CanvasNode } from '@/lib/types';

export type CanvasNodeGeometry = Partial<
  Pick<CanvasNode, 'x' | 'y' | 'width' | 'height'>
>;

type CanvasTransientState = {
  geometryByNodeId: Record<string, CanvasNodeGeometry>;
  guides: { x?: number; y?: number };
  setGeometry: (id: string, geometry: CanvasNodeGeometry) => void;
  setDragFrame: (
    id: string,
    geometry: CanvasNodeGeometry,
    guides: { x?: number; y?: number },
  ) => void;
  clearGeometry: (id: string) => void;
  clearGuides: () => void;
  reset: () => void;
};

const emptyGuides = {};

export const useCanvasTransientStore = create<CanvasTransientState>((set) => ({
  geometryByNodeId: {},
  guides: emptyGuides,
  setGeometry: (id, geometry) =>
    set((state) => ({
      geometryByNodeId: {
        ...state.geometryByNodeId,
        [id]: {
          ...state.geometryByNodeId[id],
          ...geometry,
        },
      },
    })),
  setDragFrame: (id, geometry, guides) =>
    set((state) => ({
      geometryByNodeId: {
        ...state.geometryByNodeId,
        [id]: {
          ...state.geometryByNodeId[id],
          ...geometry,
        },
      },
      guides,
    })),
  clearGeometry: (id) =>
    set((state) => {
      if (!(id in state.geometryByNodeId)) return state;
      const geometryByNodeId = { ...state.geometryByNodeId };
      delete geometryByNodeId[id];
      return { geometryByNodeId };
    }),
  clearGuides: () => set({ guides: emptyGuides }),
  reset: () => set({ geometryByNodeId: {}, guides: emptyGuides }),
}));
