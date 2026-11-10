'use client';

import { useCallback } from 'react';
import { useChatStore } from './chat-store';
import { useSettingsStore } from '@/features/settings/settings-store';
import { useShellStore } from '@/features/app-shell/shell-store';
import { chatModels } from '@/lib/catalog';
import { requestChatCompletion } from '@/lib/api';

export function resolveChatRuntimeConfig(selectedModel: string) {
  const settings = useSettingsStore.getState();
  const model = chatModels.find((item) => item.name === selectedModel) ?? chatModels[0];
  const override = model ? settings.modelOverrides[model.id] : undefined;
  return {
    model,
    baseUrl: override?.url || settings.globalBaseUrl,
    apiKey: override?.key || settings.globalApiKey,
    modelName: override?.modelName || model?.modelName || selectedModel,
  };
}

export function useChatSender() {
  const addMessage = useChatStore((state) => state.addMessage);
  const pushToast = useShellStore((state) => state.pushToast);

  return useCallback(
    async ({
      conversationId,
      prompt,
      displayPrompt,
      systemPrompt,
      history = [],
      localFallback,
      notify = false,
    }: {
      conversationId: string;
      prompt: string;
      displayPrompt?: string;
      systemPrompt: string;
      history?: Array<{ role: 'user' | 'assistant'; content: string }>;
      localFallback: string;
      notify?: boolean;
    }) => {
      const chatState = useChatStore.getState();
      const { apiKey, baseUrl, modelName } = resolveChatRuntimeConfig(
        chatState.selectedModel,
      );
      addMessage(conversationId, 'user', displayPrompt ?? prompt);
      if (!apiKey.trim()) {
        addMessage(conversationId, 'assistant', localFallback);
        return { content: localFallback, simulated: true };
      }
      try {
        if (notify) pushToast(`正在调用 ${chatState.selectedModel}…`, 'default');
        const content = await requestChatCompletion({
          baseUrl,
          apiKey,
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: prompt },
          ],
        });
        addMessage(conversationId, 'assistant', content);
        return { content, simulated: false };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        addMessage(conversationId, 'assistant', `模型请求失败：${message}`);
        pushToast(message, 'error', '模型请求失败');
        return { content: message, simulated: false, error: message };
      }
    },
    [addMessage, pushToast],
  );
}

