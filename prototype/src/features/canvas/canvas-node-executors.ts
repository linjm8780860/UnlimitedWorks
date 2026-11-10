import { imageModels } from '@/lib/catalog';
import { requestChatCompletion, requestImageGeneration } from '@/lib/api';
import { createId } from '@/lib/id';
import type { AssetItem, CanvasNode, CanvasNodeType } from '@/lib/types';
import { resolveChatRuntimeConfig } from '@/features/chat/chat-service';
import { useSettingsStore } from '@/features/settings/settings-store';

export type CanvasNodeExecutionResult = {
  content: string;
  asset?: AssetItem;
  toast?: string;
  toastTitle?: string;
};

export type CanvasNodeExecutionContext = {
  node: CanvasNode;
  selectedModel: string;
  signal: AbortSignal;
};

type CanvasNodeExecutor = (
  context: CanvasNodeExecutionContext,
) => Promise<CanvasNodeExecutionResult | null>;

function abortError() {
  const error = new Error('Canvas node execution aborted');
  error.name = 'AbortError';
  return error;
}

function throwIfAborted(signal: AbortSignal) {
  if (signal.aborted) throw abortError();
}

function wait(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(abortError());
      return;
    }
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, milliseconds);
    const abort = () => {
      window.clearTimeout(timer);
      reject(abortError());
    };
    signal.addEventListener('abort', abort, { once: true });
  });
}

const executeTextNode: CanvasNodeExecutor = async ({
  node,
  selectedModel,
  signal,
}) => {
  if (node.fixedText && node.content.trim()) {
    return {
      content: node.content,
      toast: '固定文本保持不变。',
      toastTitle: node.title,
    };
  }

  const runtime = resolveChatRuntimeConfig(node.model || selectedModel);
  if (!runtime.apiKey.trim()) return null;

  const content = await requestChatCompletion(
    {
      baseUrl: runtime.baseUrl,
      apiKey: runtime.apiKey,
      model: runtime.modelName,
      messages: [
        {
          role: 'system',
          content:
            '你是 Unlimited Works 文本生成节点。直接输出节点结果，不要解释执行过程。',
        },
        {
          role: 'user',
          content: node.prompt || node.content || node.title,
        },
      ],
    },
    { signal },
  );
  throwIfAborted(signal);
  return {
    content,
    toast: `${node.title}执行完成。`,
  };
};

const executeImageNode: CanvasNodeExecutor = async ({ node, signal }) => {
  const settings = useSettingsStore.getState();
  const modelConfig =
    imageModels.find((model) => model.displayName === node.model) ??
    imageModels[0];
  const override = modelConfig
    ? settings.modelOverrides[modelConfig.id]
    : undefined;
  const apiKey = override?.key || settings.globalApiKey;
  if (!apiKey.trim()) return null;

  const imageUrl = await requestImageGeneration(
    {
      baseUrl: override?.url || settings.globalBaseUrl,
      apiKey,
      model: override?.modelName || modelConfig?.modelName || node.model,
      prompt: node.prompt || node.content || node.title,
    },
    { signal },
  );
  throwIfAborted(signal);
  const asset: AssetItem = {
    id: createId('asset'),
    name: `${node.title}-${Date.now()}.png`,
    kind: 'image',
    mimeType: 'image/png',
    dataUrl: imageUrl,
    size: 0,
    createdAt: Date.now(),
  };
  return {
    content: '图片生成完成',
    asset,
    toast: `${node.title}生成完成。`,
  };
};

const EXECUTORS: Partial<Record<CanvasNodeType, CanvasNodeExecutor>> = {
  text: executeTextNode,
  'image-gen': executeImageNode,
};

export async function executeCanvasNode({
  node,
  selectedModel,
  signal,
}: CanvasNodeExecutionContext) {
  const executor = EXECUTORS[node.type];
  const result = executor
    ? await executor({ node, selectedModel, signal })
    : null;
  if (result) return result;

  await wait(1100, signal);
  throwIfAborted(signal);
  return {
    content:
      node.type === 'text'
        ? node.prompt ||
          node.content ||
          '这是本地模拟生成的文本结果。配置 API 密钥后可调用真实模型。'
        : `${node.title}已完成模拟生成。`,
    toast: `${node.title}执行完成。`,
  } satisfies CanvasNodeExecutionResult;
}
