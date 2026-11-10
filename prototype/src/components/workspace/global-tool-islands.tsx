'use client';

import {
  CheckCircle2,
  CircleHelp,
  Download,
  FolderOpen,
  Image as ImageIcon,
  Link2,
  Map as MapIcon,
  MessageSquare,
  MousePointer2,
  Package,
  Plus,
  Save,
  Scissors,
  Settings2,
  Sparkles,
  X,
  ZoomIn,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useShellStore } from '@/features/app-shell/shell-store';
import { useAssetStore } from '@/features/assets/asset-store';
import { createAssetFromFile } from '@/features/assets/asset-service';
import { useChatStore } from '@/features/chat/chat-store';
import { useChatSender } from '@/features/chat/chat-service';
import { useSettingsStore } from '@/features/settings/settings-store';
import { useWorkspaceStore } from '@/features/workspace/workspace-store';

type GlobalPanel = 'assets' | 'chat' | 'projects' | 'save' | null;

export function GlobalToolIslands() {
  const pathname = usePathname();
  const router = useRouter();
  const assets = useAssetStore((state) => state.assets);
  const addAsset = useAssetStore((state) => state.addAsset);
  const projects = useWorkspaceStore((state) => state.projects);
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const createConversation = useChatStore((state) => state.createConversation);
  const pushToast = useShellStore((state) => state.pushToast);
  const sendMessage = useChatSender();
  const [panel, setPanel] = useState<GlobalPanel>(null);
  const [chatDraft, setChatDraft] = useState('');

  if (pathname.startsWith('/canvas')) return null;

  const conversation = conversations.find((item) => item.id === activeConversationId);

  const addAssetFile = async (file: File) => {
    try {
      const asset = await createAssetFromFile(file);
      await addAsset(asset);
      pushToast(`资源「${file.name}」已加入资产库。`, 'success');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : String(error), 'error', '资源过大');
    }
  };

  const sendGlobalChat = async () => {
    const prompt = chatDraft.trim();
    if (!prompt) return;
    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = createConversation(prompt.slice(0, 24) || '全局对话').id;
    }
    setChatDraft('');
    await sendMessage({
      conversationId,
      prompt,
      history: conversation?.messages ?? [],
      systemPrompt: '你是 Unlimited Works 全局创作助手，请直接给出可执行建议。',
      localFallback:
        '当前没有配置 API 密钥，已使用本地模拟回复。请在设置中填写 API 配置以调用真实模型。',
    });
  };

  const exportWorkspace = () => {
    const settings = useSettingsStore.getState();
    const blob = new Blob(
      [
        JSON.stringify(
          {
            projects,
            conversations,
            assets,
            settings: {
              ...settings,
              globalApiKey: settings.includeSecrets ? settings.globalApiKey : '',
              cloudinaryApiSecret: settings.includeSecrets
                ? settings.cloudinaryApiSecret
                : '',
            },
            exportedAt: new Date().toISOString(),
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement('a');
    anchor.href = url;
    anchor.download = 'unlimited-works-workspace.json';
    anchor.click();
    URL.revokeObjectURL(url);
    pushToast('工作区数据已导出。', 'success');
  };

  return (
    <>
      <div
        className="pointer-events-none fixed top-10 z-[100] flex min-w-[188px] items-center gap-1.5 rounded-full border border-zinc-200 bg-white/95 px-2.5 py-1 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1b1b1d]/95"
        style={{ left: 'calc(var(--uw-sidebar-width) + 12px)' }}
      >
        <img src="/logo_dark.ico" alt="" className="size-8" />
        <div className="pointer-events-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => router.push('/canvas')}
            className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-sm text-zinc-500 hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/5 dark:hover:text-zinc-200"
          >
            <span className="size-2 rounded-full bg-orange-400" />
            未命名
          </button>
          <button
            type="button"
            aria-label="新建标签页"
            title="新建标签页"
            onClick={() => router.push('/canvas')}
            className="grid size-8 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div
        className="fixed top-[183px] z-[88] hidden items-center gap-1 md:flex"
        style={{
          left: 'calc(var(--uw-sidebar-width) + (100vw - var(--uw-sidebar-width)) / 2 + 216px)',
        }}
      >
        <button
          type="button"
          aria-label="剪辑"
          title="剪辑"
          onClick={() => router.push('/canvas')}
          className="grid size-7 place-items-center rounded-full border border-transparent text-zinc-500 hover:border-zinc-200 hover:bg-black/5 hover:text-zinc-900 dark:hover:border-white/10 dark:hover:bg-white/[.06] dark:hover:text-white"
        >
          <Scissors size={13} />
        </button>
        <button
          type="button"
          aria-label="Asset ID / 资产管理"
          title="Asset ID / 资产管理"
          onClick={() => setPanel(panel === 'assets' ? null : 'assets')}
          className="grid size-7 place-items-center rounded-full border border-transparent text-zinc-500 hover:border-zinc-200 hover:bg-black/5 hover:text-zinc-900 dark:hover:border-white/10 dark:hover:bg-white/[.06] dark:hover:text-white"
        >
          <ImageIcon size={13} />
        </button>
      </div>

      <div
        className="fixed top-1/2 z-[90] flex -translate-y-1/2 flex-col items-center gap-1 rounded-full border border-zinc-200 bg-white/95 px-1.5 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1b1b1d]/95"
        style={{ left: 'calc(var(--uw-sidebar-width) + 24px)' }}
      >
        <GlobalToolButton
          title="资产"
          active={panel === 'assets'}
          icon={<Package size={20} />}
          onClick={() => setPanel(panel === 'assets' ? null : 'assets')}
        />
        <GlobalToolButton
          title="AI 对话"
          active={panel === 'chat'}
          icon={<MessageSquare size={20} />}
          onClick={() => setPanel(panel === 'chat' ? null : 'chat')}
        />
        <GlobalToolButton
          title="工程管理"
          active={panel === 'projects'}
          icon={<Settings2 size={20} />}
          onClick={() => setPanel(panel === 'projects' ? null : 'projects')}
        />
        <GlobalToolButton
          title="保存/导出"
          active={panel === 'save'}
          icon={<Save size={20} />}
          onClick={() => setPanel(panel === 'save' ? null : 'save')}
        />
      </div>

      <div
        className="absolute bottom-4 z-[95] flex items-center gap-1 rounded-full border border-zinc-200 bg-white/95 px-1.5 py-1 shadow-island backdrop-blur-xl dark:border-white/10 dark:bg-[#1b1b1d]/95"
        style={{ left: 'calc(var(--uw-sidebar-width) + 23px)' }}
      >
        <button
          type="button"
          title="显示/隐藏小地图"
          className="grid size-6 place-items-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
        >
          <MapIcon size={13} />
        </button>
        <button
          type="button"
          aria-label="隐藏节点连线"
          className="grid size-6 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <MousePointer2 size={13} />
        </button>
        <div className="h-4 w-px bg-zinc-200 dark:bg-white/10" />
        <button
          type="button"
          title="重置缩放"
          onClick={() => router.push('/canvas')}
          className="h-6 rounded-full px-2 font-mono text-xs font-semibold text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
        >
          100%
        </button>
        <button
          type="button"
          title="聚焦全部"
          onClick={() => router.push('/canvas')}
          className="grid size-6 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <ZoomIn size={13} />
        </button>
        <div className="h-4 w-px bg-zinc-200 dark:bg-white/10" />
        <button
          type="button"
          title="帮助"
          onClick={() => {
            setPanel(null);
            router.push('/canvas');
          }}
          className="grid size-6 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <CircleHelp size={13} />
        </button>
      </div>

      {panel === 'assets' && (
        <GlobalPanelShell title="资产库" onClose={() => setPanel(null)}>
          <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-white/10">
            <span className="text-xs font-medium">资产</span>
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[10px] text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10">
              <Plus size={12} />
              添加资源
              <input
                type="file"
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void addAssetFile(file);
                  event.target.value = '';
                }}
              />
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {assets.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-xs text-zinc-500">
                <Package size={26} className="mb-2 text-zinc-300 dark:text-zinc-600" />
                暂无资产
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="overflow-hidden rounded-lg border border-zinc-200 dark:border-white/10"
                  >
                    <div className="flex aspect-square items-center justify-center bg-zinc-100 dark:bg-white/[.04]">
                      {asset.kind === 'image' ? (
                        <img src={asset.dataUrl} alt={asset.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImageIcon size={22} className="text-zinc-400" />
                      )}
                    </div>
                    <div className="truncate px-2 py-1.5 text-[10px]">{asset.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlobalPanelShell>
      )}

      {panel === 'chat' && (
        <GlobalPanelShell title="Unlimited Works Copilot" onClose={() => setPanel(null)} side="right">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {!conversation?.messages.length ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Sparkles size={24} className="text-violet-500" />
                <h3 className="mt-3 text-sm font-semibold">今天一起创作点什么？</h3>
                <p className="mt-1 text-[11px] text-zinc-500">全局对话会在所有页面保持。</p>
              </div>
            ) : (
              conversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-xl px-3 py-2 text-xs leading-5 ${
                    message.role === 'user'
                      ? 'ml-10 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'mr-10 border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[.04] dark:text-zinc-300'
                  }`}
                >
                  {message.content}
                </div>
              ))
            )}
          </div>
          <div className="border-t border-zinc-200 p-2 dark:border-white/10">
            <textarea
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                  event.preventDefault();
                  void sendGlobalChat();
                }
              }}
              placeholder="随心输入"
              className="h-20 w-full resize-none rounded-xl border border-zinc-200 bg-white p-3 text-xs outline-none dark:border-white/10 dark:bg-white/[.04]"
            />
            <button
              type="button"
              onClick={() => void sendGlobalChat()}
              className="mt-2 h-8 w-full rounded-lg bg-zinc-900 text-xs font-medium text-white dark:bg-white dark:text-zinc-900"
            >
              发送
            </button>
          </div>
        </GlobalPanelShell>
      )}

      {panel === 'projects' && (
        <div
          className="absolute top-1/2 z-[110] w-[240px] -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#1b1b1d]"
          style={{ left: 'calc(var(--uw-sidebar-width) + 98px)' }}
        >
          <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
            工程管理
          </div>
          <button
            type="button"
            onClick={() => router.push('/canvas')}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/[.06]"
          >
            <Plus size={14} />
            创建工程
          </button>
          <button
            type="button"
            onClick={() => router.push('/projects')}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/[.06]"
          >
            <FolderOpen size={14} />
            打开工程
          </button>
          <div className="my-1 h-px bg-black/5 dark:bg-white/10" />
          {projects.slice(0, 5).map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => router.push(`/canvas?project=${encodeURIComponent(project.id)}`)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-black/5 dark:hover:bg-white/[.06]"
            >
              <FolderOpen size={13} className="shrink-0 text-zinc-400" />
              <span className="truncate">{project.name}</span>
              <CheckCircle2 size={12} className="ml-auto text-emerald-500" />
            </button>
          ))}
        </div>
      )}

      {panel === 'save' && (
        <div
          className="absolute top-[56%] z-[110] w-[220px] -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#1b1b1d]"
          style={{ left: 'calc(var(--uw-sidebar-width) + 98px)' }}
        >
          <button
            type="button"
            onClick={() => router.push('/canvas')}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/[.06]"
          >
            <Save size={14} />
            打开画布工程
          </button>
          <button
            type="button"
            onClick={exportWorkspace}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/[.06]"
          >
            <Download size={14} />
            导出工作区
          </button>
          <button
            type="button"
            onClick={() => router.push('/canvas')}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/[.06]"
          >
            <Link2 size={14} />
            画布连接
          </button>
        </div>
      )}

      <button
        type="button"
        aria-label="展开 UW Agent ChatPanel"
        onClick={() => setPanel(panel === 'chat' ? null : 'chat')}
        className="fixed bottom-4 right-6 z-[108] flex size-11 items-center justify-center overflow-hidden rounded-full border border-zinc-600/50 bg-zinc-800 p-1 text-white shadow-xl transition-all hover:border-zinc-500"
      >
        <img src="/logo_dark.ico" alt="" className="size-8 rounded-full object-contain" />
      </button>
    </>
  );
}

function GlobalToolButton({
  title,
  icon,
  active,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={onClick}
      className={`grid size-10 place-items-center rounded-full border transition-all active:scale-[.92] ${
        active
          ? 'border-zinc-300 bg-zinc-100 text-zinc-900 dark:border-white/15 dark:bg-white/10 dark:text-white'
          : 'border-transparent text-zinc-500 hover:border-zinc-200 hover:bg-black/5 hover:text-zinc-900 dark:hover:border-white/10 dark:hover:bg-white/[.06] dark:hover:text-white'
      }`}
    >
      {icon}
    </button>
  );
}

function GlobalPanelShell({
  title,
  side = 'left',
  onClose,
  children,
}: {
  title: string;
  side?: 'left' | 'right';
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <aside
      data-global-panel={side}
      className={`absolute top-[90px] z-[105] flex h-[min(620px,calc(100%-130px))] w-[360px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1b1b1d]/95 ${
        side === 'right' ? 'right-4' : ''
      }`}
      style={side === 'left' ? { left: 'calc(var(--uw-sidebar-width) + 86px)' } : undefined}
    >
      <header className="flex h-11 shrink-0 items-center border-b border-zinc-200 px-3 dark:border-white/10">
        <span className="text-xs font-semibold">{title}</span>
        <button
          type="button"
          aria-label={`关闭${title}`}
          onClick={onClose}
          className="ml-auto grid size-7 place-items-center rounded-lg text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X size={14} />
        </button>
      </header>
      {children}
    </aside>
  );
}

