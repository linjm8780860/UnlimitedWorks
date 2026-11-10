'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { AssetItem, CanvasNode } from '@/lib/types';
import { executeCanvasNode } from './canvas-node-executors';

type CanvasNodeRunnerOptions = {
  selectedModel: string;
  updateNode: (id: string, patch: Partial<CanvasNode>) => void;
  addAsset: (asset: AssetItem) => Promise<void>;
  pushToast: (
    message: string,
    tone?: 'default' | 'success' | 'error',
    title?: string,
  ) => void;
};

export function useCanvasNodeRunner({
  selectedModel,
  updateNode,
  addAsset,
  pushToast,
}: CanvasNodeRunnerOptions) {
  const controllersRef = useRef(new Map<string, AbortController>());

  useEffect(() => {
    const controllers = controllersRef.current;
    return () => {
      for (const controller of controllers.values()) controller.abort();
      controllers.clear();
    };
  }, []);

  return useCallback(
    async (node: CanvasNode) => {
      controllersRef.current.get(node.id)?.abort();
      const controller = new AbortController();
      controllersRef.current.set(node.id, controller);
      updateNode(node.id, { status: 'running' });

      try {
        const result = await executeCanvasNode({
          node,
          selectedModel,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (result.asset) await addAsset(result.asset);
        updateNode(node.id, {
          status: 'complete',
          content: result.content,
          ...(result.asset ? { assetId: result.asset.id } : {}),
        });
        if (result.toast) {
          pushToast(result.toast, 'success', result.toastTitle);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : String(error);
        updateNode(node.id, {
          status: 'error',
          content: `生成失败：${message}`,
        });
        pushToast(message, 'error', `${node.title}执行失败`);
      } finally {
        if (controllersRef.current.get(node.id) === controller) {
          controllersRef.current.delete(node.id);
        }
      }
    },
    [addAsset, pushToast, selectedModel, updateNode],
  );
}
