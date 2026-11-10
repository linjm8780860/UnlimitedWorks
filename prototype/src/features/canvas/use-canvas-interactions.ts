'use client';

import type { RefObject } from 'react';
import type { CanvasDocument } from '@/lib/types';
import { useCanvasKeyboard } from './use-canvas-keyboard';
import { useCanvasNodeInteractions } from './use-canvas-node-interactions';
import { useCanvasSelectionCommands } from './use-canvas-selection-commands';
import { useCanvasViewportInteractions } from './use-canvas-viewport-interactions';
import type { SetCanvasDocument } from './use-canvas-documents';

type CanvasInteractionOptions = {
  document: CanvasDocument;
  setDocument: SetCanvasDocument;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  surfaceRef: RefObject<HTMLDivElement | null>;
  recordCurrentDocument: () => void;
  historyPausedRef: RefObject<boolean>;
  undoDocument: () => void;
  redoDocument: () => void;
  onHelp: () => void;
};

export function useCanvasInteractions(options: CanvasInteractionOptions) {
  const selection = useCanvasSelectionCommands(options);
  const viewport = useCanvasViewportInteractions(options);
  const nodes = useCanvasNodeInteractions(options);

  useCanvasKeyboard({
    ...options,
    ...selection,
    ...viewport,
  });

  return {
    ...selection,
    ...viewport,
    ...nodes,
  };
}
