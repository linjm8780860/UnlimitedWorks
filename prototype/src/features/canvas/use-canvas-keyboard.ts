'use client';

import { useEffect } from 'react';
import type { CanvasDocument } from '@/lib/types';

type CanvasKeyboardOptions = {
  document: CanvasDocument;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  deleteSelection: (ids?: string[]) => void;
  copySelection: () => void;
  pasteSelection: () => void;
  cutSelection: () => void;
  duplicateSelected: (includeConnections?: boolean) => void;
  alignSelection: (axis: 'left') => void;
  normalizeSelectedSize: () => void;
  focusSelection: () => void;
  autoArrangeSelection: () => void;
  selectConnected: (all: boolean) => void;
  undoDocument: () => void;
  redoDocument: () => void;
  onHelp: () => void;
};

function isEditableTarget(target: EventTarget | null) {
  const element = target as HTMLElement | null;
  return (
    element?.tagName === 'INPUT' ||
    element?.tagName === 'TEXTAREA' ||
    element?.isContentEditable === true
  );
}

export function useCanvasKeyboard({
  document,
  selectedIds,
  setSelectedIds,
  deleteSelection,
  copySelection,
  pasteSelection,
  cutSelection,
  duplicateSelected,
  alignSelection,
  normalizeSelectedSize,
  focusSelection,
  autoArrangeSelection,
  selectConnected,
  undoDocument,
  redoDocument,
  onHelp,
}: CanvasKeyboardOptions) {
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const cmd = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (
        event.key === 'Delete' ||
        event.key === 'Backspace' ||
        (!cmd && key === 'x')
      ) {
        event.preventDefault();
        deleteSelection(selectedIds);
        return;
      }
      if (cmd && key === 'a') {
        event.preventDefault();
        setSelectedIds(document.nodes.map((node) => node.id));
      }
      if (cmd && key === 'c') {
        event.preventDefault();
        copySelection();
      }
      if (cmd && key === 'v') {
        event.preventDefault();
        pasteSelection();
      }
      if (cmd && key === 'x') {
        event.preventDefault();
        cutSelection();
      }
      if ((cmd && key === 'd') || (!cmd && event.shiftKey && key === 'd')) {
        event.preventDefault();
        duplicateSelected(!event.shiftKey);
      }
      if (cmd && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) redoDocument();
        else undoDocument();
      }
      if (event.altKey && key === 'a') {
        event.preventDefault();
        alignSelection('left');
      }
      if (event.altKey && key === 's') {
        event.preventDefault();
        normalizeSelectedSize();
      }
      if (!cmd && !event.altKey && key === 'f') {
        event.preventDefault();
        focusSelection();
      }
      if (!cmd && !event.altKey && key === 'q') {
        event.preventDefault();
        autoArrangeSelection();
      }
      if (!cmd && !event.altKey && key === 'l') {
        event.preventDefault();
        selectConnected(false);
      }
      if (cmd && key === 'l') {
        event.preventDefault();
        selectConnected(true);
      }
      if (event.key === '?') onHelp();
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [
    alignSelection,
    autoArrangeSelection,
    copySelection,
    cutSelection,
    deleteSelection,
    document.nodes,
    duplicateSelected,
    focusSelection,
    normalizeSelectedSize,
    onHelp,
    pasteSelection,
    redoDocument,
    selectConnected,
    selectedIds,
    setSelectedIds,
    undoDocument,
  ]);
}
