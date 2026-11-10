'use client';

import { useCallback, useRef } from 'react';
import { createId } from '@/lib/id';
import type { CanvasDocument, CanvasNode } from '@/lib/types';
import {
  alignNodePositions,
  arrangeNodePositions,
  type AlignmentAxis,
} from './geometry';
import type { SetCanvasDocument } from './use-canvas-documents';

type CanvasSelectionOptions = {
  document: CanvasDocument;
  setDocument: SetCanvasDocument;
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
};

export function useCanvasSelectionCommands({
  document,
  setDocument,
  selectedIds,
  setSelectedIds,
}: CanvasSelectionOptions) {
  const clipboardRef = useRef<{
    nodes: CanvasNode[];
    edges: CanvasDocument['edges'];
  }>({ nodes: [], edges: [] });
  const selectedNodes = document.nodes.filter((node) =>
    selectedIds.includes(node.id),
  );

  const deleteSelection = useCallback(
    (ids = selectedIds) => {
      if (ids.length === 0) return;
      setDocument((current) => ({
        ...current,
        updatedAt: Date.now(),
        nodes: current.nodes.filter((node) => !ids.includes(node.id)),
        edges: current.edges.filter(
          (edge) => !ids.includes(edge.from) && !ids.includes(edge.to),
        ),
      }));
      setSelectedIds([]);
    },
    [selectedIds, setDocument, setSelectedIds],
  );

  const deleteSelected = useCallback(() => {
    deleteSelection(selectedIds);
  }, [deleteSelection, selectedIds]);

  const copySelection = useCallback(() => {
    const nodes = document.nodes.filter((node) => selectedIds.includes(node.id));
    const edges = document.edges.filter(
      (edge) => selectedIds.includes(edge.from) && selectedIds.includes(edge.to),
    );
    clipboardRef.current = {
      nodes: structuredClone(nodes),
      edges: structuredClone(edges),
    };
  }, [document.edges, document.nodes, selectedIds]);

  const pasteSelection = useCallback(() => {
    const clipboard = clipboardRef.current;
    if (clipboard.nodes.length === 0) return;
    const idMap = new Map<string, string>();
    const nodes = clipboard.nodes.map((node, index) => {
      const id = createId('node');
      idMap.set(node.id, id);
      return {
        ...node,
        id,
        x: node.x + 36 + index * 6,
        y: node.y + 36 + index * 6,
        createdAt: Date.now(),
      };
    });
    const edges = clipboard.edges
      .map((edge) => ({
        ...edge,
        id: createId('edge'),
        from: idMap.get(edge.from) ?? '',
        to: idMap.get(edge.to) ?? '',
      }))
      .filter((edge) => edge.from && edge.to);
    setDocument((current) => ({
      ...current,
      nodes: [...current.nodes, ...nodes],
      edges: [...current.edges, ...edges],
      updatedAt: Date.now(),
    }));
    clipboardRef.current = { nodes, edges };
    setSelectedIds(nodes.map((node) => node.id));
  }, [setDocument, setSelectedIds]);

  const cutSelection = useCallback(() => {
    copySelection();
    deleteSelection(selectedIds);
  }, [copySelection, deleteSelection, selectedIds]);

  const duplicateSelected = useCallback(
    (includeConnections = true) => {
      if (selectedNodes.length === 0) return;
      const idMap = new Map<string, string>();
      const nodes = selectedNodes.map((node, index) => {
        const id = createId('node');
        idMap.set(node.id, id);
        return {
          ...node,
          id,
          x: node.x + 32 + index * 8,
          y: node.y + 32 + index * 8,
          createdAt: Date.now(),
        };
      });
      const edges = includeConnections
        ? document.edges
            .filter(
              (edge) =>
                selectedIds.includes(edge.from) && selectedIds.includes(edge.to),
            )
            .map((edge) => ({
              ...edge,
              id: createId('edge'),
              from: idMap.get(edge.from) ?? '',
              to: idMap.get(edge.to) ?? '',
            }))
            .filter((edge) => edge.from && edge.to)
        : [];
      setDocument((current) => ({
        ...current,
        nodes: [...current.nodes, ...nodes],
        edges: [...current.edges, ...edges],
        updatedAt: Date.now(),
      }));
      setSelectedIds(nodes.map((node) => node.id));
    },
    [document.edges, selectedIds, selectedNodes, setDocument, setSelectedIds],
  );

  const alignSelection = useCallback(
    (axis: AlignmentAxis) => {
      const positions = alignNodePositions(document.nodes, selectedIds, axis);
      if (positions.size === 0) return;
      setDocument((current) => ({
        ...current,
        nodes: current.nodes.map((node) => ({
          ...node,
          ...(positions.get(node.id) ?? {}),
        })),
        updatedAt: Date.now(),
      }));
    },
    [document.nodes, selectedIds, setDocument],
  );

  const normalizeSelectedSize = useCallback(() => {
    if (selectedNodes.length < 2) return;
    const reference = selectedNodes[0];
    setDocument((current) => ({
      ...current,
      nodes: current.nodes.map((node) =>
        selectedIds.includes(node.id)
          ? { ...node, width: reference.width, height: reference.height }
          : node,
      ),
      updatedAt: Date.now(),
    }));
  }, [selectedIds, selectedNodes, setDocument]);

  const autoArrangeSelection = useCallback(() => {
    const positions = arrangeNodePositions(document.nodes, selectedIds);
    if (positions.size === 0) return;
    setDocument((current) => ({
      ...current,
      nodes: current.nodes.map((node) => ({
        ...node,
        ...(positions.get(node.id) ?? {}),
      })),
      updatedAt: Date.now(),
    }));
  }, [document.nodes, selectedIds, setDocument]);

  const selectConnected = useCallback(
    (all: boolean) => {
      if (selectedIds.length === 0) return;
      const selected = new Set(selectedIds);
      let changed = true;
      while (changed) {
        changed = false;
        for (const edge of document.edges) {
          if (!selected.has(edge.from) && !selected.has(edge.to)) continue;
          if (!selected.has(edge.from)) {
            selected.add(edge.from);
            changed = true;
          }
          if (!selected.has(edge.to)) {
            selected.add(edge.to);
            changed = true;
          }
        }
        if (!all) break;
      }
      setSelectedIds(Array.from(selected));
    },
    [document.edges, selectedIds, setSelectedIds],
  );

  return {
    deleteSelection,
    deleteSelected,
    copySelection,
    pasteSelection,
    cutSelection,
    duplicateSelected,
    alignSelection,
    normalizeSelectedSize,
    autoArrangeSelection,
    selectConnected,
  };
}
