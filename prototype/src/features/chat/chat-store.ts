'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createId } from '@/lib/id';
import type {
  AccessMode,
  AgentMode,
  ChatMessage,
  Conversation,
  ReasoningLevel,
} from '@/lib/types';
import { migrateLegacyChatStore } from '@/features/shared/legacy-migration';

migrateLegacyChatStore();

type ChatState = {
  conversations: Conversation[];
  activeConversationId: string | null;
  agentMode: AgentMode;
  accessMode: AccessMode;
  reasoning: ReasoningLevel;
  selectedModel: string;
  setActiveConversationId: (id: string | null) => void;
  createConversation: (title?: string, projectId?: string) => Conversation;
  updateConversation: (id: string, patch: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  addMessage: (conversationId: string, role: ChatMessage['role'], content: string) => void;
  setAgentMode: (mode: AgentMode) => void;
  setAccessMode: (mode: AccessMode) => void;
  setReasoning: (level: ReasoningLevel) => void;
  setSelectedModel: (model: string) => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [],
      activeConversationId: null,
      agentMode: 'standard',
      accessMode: 'view',
      reasoning: 'medium',
      selectedModel: 'DeepSeek Flash',
      setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
      createConversation: (title = '新对话', projectId) => {
        const now = Date.now();
        const conversation: Conversation = {
          id: createId('conversation'),
          title,
          projectId,
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: conversation.id,
        }));
        return conversation;
      },
      updateConversation: (id, patch) =>
        set((state) => ({
          conversations: state.conversations.map((item) =>
            item.id === id ? { ...item, ...patch, updatedAt: Date.now() } : item,
          ),
        })),
      removeConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((item) => item.id !== id),
          activeConversationId:
            state.activeConversationId === id ? null : state.activeConversationId,
        })),
      addMessage: (conversationId, role, content) => {
        const message: ChatMessage = {
          id: createId('message'),
          role,
          content,
          createdAt: Date.now(),
        };
        set((state) => ({
          conversations: state.conversations.map((item) =>
            item.id === conversationId
              ? {
                  ...item,
                  messages: [...item.messages, message],
                  updatedAt: Date.now(),
                }
              : item,
          ),
        }));
      },
      setAgentMode: (agentMode) => set({ agentMode }),
      setAccessMode: (accessMode) => set({ accessMode }),
      setReasoning: (reasoning) => set({ reasoning }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),
    }),
    {
      name: 'uw-next-chat-domain',
      version: 2,
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
        agentMode: state.agentMode,
        accessMode: state.accessMode,
        reasoning: state.reasoning,
        selectedModel: state.selectedModel,
      }),
    },
  ),
);

export function getActiveConversation(state: ChatState) {
  return state.conversations.find((item) => item.id === state.activeConversationId);
}

