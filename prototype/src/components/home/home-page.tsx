'use client';

import { FolderOpen, Orbit, Plus, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Composer } from '@/components/composer/composer';
import { useChatSender } from '@/features/chat/chat-service';
import { useChatStore } from '@/features/chat/chat-store';
import { useShellStore } from '@/features/app-shell/shell-store';
import { useWorkspaceStore } from '@/features/workspace/workspace-store';
import type { Project } from '@/lib/types';

export function HomePage() {
  const router = useRouter();
  const projects = useWorkspaceStore((state) => state.projects);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const selectedWorkspaceId = useWorkspaceStore((state) => state.selectedWorkspaceId);
  const createConversation = useChatStore((state) => state.createConversation);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversations = useChatStore((state) => state.conversations);
  const pushToast = useShellStore((state) => state.pushToast);
  const sendMessage = useChatSender();
  const [draft, setDraft] = useState('');
  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId,
  );
  const latestProject = useMemo(
    () => [...projects].sort((a, b) => b.updatedAt - a.updatedAt)[0],
    [projects],
  );
  const visibleProjects = projects.slice(0, 4);

  const send = async () => {
    if (!draft.trim()) return;
    const project = latestProject;
    const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId);
    if (!project && !selectedWorkspace) {
      pushToast('请先选择项目文件夹或创建本地项目。', 'error', '无法发送');
      return;
    }
    const prompt = draft.trim();
    let conversationId = activeConversation?.id;
    if (!conversationId) {
      const conversation = createConversation(prompt.slice(0, 28) || '新对话', project?.id);
      conversationId = conversation.id;
    }
    setDraft('');
    await sendMessage({
      conversationId,
      prompt,
      history: activeConversation?.messages ?? [],
      systemPrompt:
        '你是 Unlimited Works 的创意工作流助手。回答要具体、可执行，并优先给出节点化工作流、输入输出和下一步操作。',
      localFallback:
        '当前没有配置 API 密钥，因此本轮使用本地模拟回复。请在「设置 → API 配置」填写 Base URL 和密钥，之后对话将调用真实 OpenAI 兼容接口。',
      notify: true,
    });
  };

  return (
    <main className="uw-workspace-page uw-workspace-dots h-full overflow-y-auto bg-white px-5 pb-12 pt-12 text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100 sm:px-8">
      <div className="mx-auto flex w-full max-w-[780px] flex-col">
        <h1 className="mb-6 flex items-center justify-start gap-1.5 text-[28px] font-normal leading-9 tracking-[-1.4px] sm:text-[36px] sm:leading-[44px] sm:tracking-[-1.8px]">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center" aria-hidden="true">
            <Orbit size={36} strokeWidth={1.4} className="text-violet-500" />
          </span>
          今天要做点什么？
        </h1>

        <Composer
          value={draft}
          onChange={setDraft}
          onSend={send}
          onOpenSkills={() => router.push('/skills')}
        />

        {activeConversation && activeConversation.messages.length > 0 && (
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[.03]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold">{activeConversation.title}</div>
              <button
                type="button"
                onClick={() => router.push('/canvas')}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-black/5 dark:hover:bg-white/[.06]"
              >
                <RotateCw size={12} />
                继续到画布
              </button>
            </div>
            <div className="space-y-3">
              {activeConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-xl px-3.5 py-2.5 text-[13px] leading-6 ${
                    message.role === 'user'
                      ? 'ml-10 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'mr-10 border border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-white/10 dark:bg-white/[.04] dark:text-zinc-300'
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-4 flex flex-col gap-4">
          <h2 className="sr-only">最近项目</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => router.push('/projects?create=1')}
              className="flex aspect-square min-w-0 flex-col items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white p-2 text-sm text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-[#1d1d1d] dark:text-zinc-300 dark:hover:border-white/15 dark:hover:bg-[#222]"
            >
              <span className="grid size-12 place-items-center rounded-full bg-zinc-100 dark:bg-white/[.06]">
                <Plus size={24} />
              </span>
              新建项目
            </button>
            {visibleProjects.map((project) => (
              <ProjectTile key={project.id} project={project} />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => router.push('/projects?create=1')}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-100"
            >
              <FolderOpen size={14} />
              打开项目文件夹
            </button>
            <Link
              href="/projects"
              className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-100"
            >
              所有项目
            </Link>
          </div>
          <p className="text-xs text-zinc-500">
            {projects.length === 0
              ? '还没有项目，从新建项目开始，或打开已有文件夹。'
              : `最近更新了 ${projects.length} 个本地项目。`}
          </p>
        </section>
      </div>
    </main>
  );
}

function ProjectTile({ project }: { project: Project }) {
  return (
    <Link
      href={`/canvas?project=${encodeURIComponent(project.id)}`}
      className="flex aspect-square min-w-0 flex-col justify-between rounded-xl border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-[#1d1d1d] dark:hover:border-white/15 dark:hover:bg-[#222]"
    >
      <span className="grid size-11 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <FolderOpen size={21} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{project.name}</span>
        <span className="mt-1 block truncate text-[10px] text-zinc-400">{project.path}</span>
      </span>
    </Link>
  );
}

