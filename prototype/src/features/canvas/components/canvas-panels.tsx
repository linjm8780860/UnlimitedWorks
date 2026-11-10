'use client';

import {
  AudioLines,
  Box,
  Download,
  FileJson,
  FolderOpen,
  ListFilter,
  MessageSquare,
  Package,
  Plus,
  Save,
  Search,
  Settings2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Composer } from '@/components/composer/composer';
import type { AssetItem, CanvasDocument, Conversation } from '@/lib/types';

export function CanvasToolButton({
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
      title={title}
      aria-label={title}
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

export function Minimap({ document }: { document: CanvasDocument }) {
  if (document.nodes.length === 0) {
    return (
      <div className="relative h-[150px] w-[200px] overflow-hidden rounded-md bg-zinc-100 dark:bg-[#242427]">
        <div className="absolute inset-0 uw-minimap-grid opacity-60" />
        <div className="absolute left-1/2 top-1/2 size-10 -translate-x-1/2 -translate-y-1/2 rounded border border-zinc-400/40" />
      </div>
    );
  }
  const minX = Math.min(...document.nodes.map((node) => node.x), -200);
  const minY = Math.min(...document.nodes.map((node) => node.y), -200);
  const maxX = Math.max(...document.nodes.map((node) => node.x + node.width), 600);
  const maxY = Math.max(...document.nodes.map((node) => node.y + node.height), 400);
  const width = maxX - minX;
  const height = maxY - minY;
  return (
    <div className="relative h-[150px] w-[200px] overflow-hidden rounded-md bg-zinc-100 dark:bg-[#242427]">
      <div className="absolute inset-0 uw-minimap-grid opacity-60" />
      {document.nodes.map((node) => (
        <div
          key={node.id}
          className="absolute rounded-[2px] bg-zinc-500/60 dark:bg-zinc-300/60"
          style={{
            left: `${((node.x - minX) / width) * 100}%`,
            top: `${((node.y - minY) / height) * 100}%`,
            width: `${Math.max(3, (node.width / width) * 100)}%`,
            height: `${Math.max(3, (node.height / height) * 100)}%`,
          }}
        />
      ))}
      <div className="absolute left-[8%] top-[8%] h-[84%] w-[84%] rounded border border-zinc-500/50" />
    </div>
  );
}

export function AssetPanel({
  assets,
  onAdd,
  onClose,
}: {
  assets: AssetItem[];
  onAdd: (file: File) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'assets' | 'workflow'>('assets');
  const [kind, setKind] = useState('全部');
  const [search, setSearch] = useState('');
  const filteredAssets = assets.filter((asset) => {
    const kindMatches =
      kind === '全部' ||
      (kind === '图片' && asset.kind === 'image') ||
      (kind === '视频' && asset.kind === 'video') ||
      (kind === '音频' && asset.kind === 'audio') ||
      (kind === '3D' && asset.kind === '3d');
    return kindMatches && asset.name.toLowerCase().includes(search.trim().toLowerCase());
  });
  return (
    <aside className="absolute left-[86px] top-[90px] z-[105] flex h-[min(650px,calc(100%-120px))] w-[350px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1b1b1d]/95">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 px-3 dark:border-white/10">
        <div className="flex items-center gap-1">
          <TabButton active={tab === 'assets'} onClick={() => setTab('assets')}>
            资产
          </TabButton>
          <TabButton active={tab === 'workflow'} onClick={() => setTab('workflow')}>
            工作流
          </TabButton>
          <button type="button" className="rounded-md px-2 py-1.5 text-xs text-zinc-500">
            选择
          </button>
        </div>
        <div className="flex gap-1">
          <IconButton title="设置">
            <Settings2 size={14} />
          </IconButton>
          <IconButton title="关闭资产面板" onClick={onClose}>
            <X size={14} />
          </IconButton>
        </div>
      </div>
      <div className="flex items-center gap-1 border-b border-zinc-200 px-3 py-2 dark:border-white/10">
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-black/5 px-2.5 text-xs font-medium dark:bg-white/[.07]"
        >
          <FolderOpen size={13} />
          资产
        </button>
        <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs text-zinc-500 hover:bg-black/5 dark:hover:bg-white/[.06]">
          <Plus size={13} />
          添加资源
          <input
            type="file"
            accept="image/*,video/*,audio/*,.glb,.gltf,.obj,.fbx"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onAdd(file);
              event.target.value = '';
            }}
          />
        </label>
      </div>
      <div className="flex gap-1 border-b border-zinc-200 px-3 py-2 dark:border-white/10">
        {['全部', '图片', '视频', '音频', '3D'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setKind(item)}
            className={`rounded-md px-2 py-1 text-[11px] ${
              kind === item
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-500 hover:bg-black/5 dark:hover:bg-white/[.06]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {filteredAssets.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Package size={28} className="text-zinc-300 dark:text-zinc-600" />
            <p className="mt-3 text-xs text-zinc-500">
              暂无 {kind === '全部' ? '资产' : kind} 资产
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5 border-t border-zinc-200 p-2.5 dark:border-white/10">
        <label className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-lg border border-zinc-200 px-2 text-zinc-400 dark:border-white/10">
          <Search size={13} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="搜索资产..."
            className="h-full min-w-0 flex-1 bg-transparent text-xs text-zinc-700 outline-none dark:text-zinc-200"
          />
        </label>
        <IconButton title="筛选">
          <ListFilter size={14} />
        </IconButton>
      </div>
      <div className="flex items-center gap-2 border-t border-zinc-200 px-3 py-2 dark:border-white/10">
        <input
          type="range"
          min={20}
          max={100}
          defaultValue={100}
          className="min-w-0 flex-1 accent-zinc-900 dark:accent-white"
        />
        <span className="w-10 text-right text-[10px] text-zinc-500">100 %</span>
      </div>
    </aside>
  );
}

export function ProjectPanel({
  documentName,
  onClose,
  onCreate,
  onLoad,
}: {
  documentName: string;
  onClose: () => void;
  onCreate: () => void;
  onLoad: () => void;
}) {
  return (
    <div className="absolute left-[98px] top-[45%] z-[110] w-[220px] -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#1b1b1d]">
      <div className="px-2.5 pb-1.5 pt-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
        {documentName}
      </div>
      <MenuAction icon={<Plus size={14} />} onClick={onCreate}>
        创建工程
      </MenuAction>
      <MenuAction icon={<FolderOpen size={14} />} onClick={onLoad}>
        加载工程
      </MenuAction>
      <MenuAction icon={<X size={14} />} onClick={onClose} muted>
        关闭
      </MenuAction>
    </div>
  );
}

export function SavePanel({
  onSave,
  onSaveAll,
  onExport,
  onClose,
}: {
  onSave: () => void;
  onSaveAll: () => void;
  onExport: () => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute left-[98px] top-[56%] z-[110] w-[210px] -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#1b1b1d]">
      <MenuAction icon={<Save size={14} />} onClick={onSave}>
        保存工程
      </MenuAction>
      <MenuAction icon={<Download size={14} />} onClick={onSaveAll}>
        保存所有标签
      </MenuAction>
      <MenuAction icon={<FileJson size={14} />} onClick={onExport}>
        导出 JSON
      </MenuAction>
      <MenuAction icon={<X size={14} />} onClick={onClose} muted>
        关闭
      </MenuAction>
    </div>
  );
}

export function CopilotPanel({
  document,
  chatDraft,
  onChatDraft,
  onSend,
  historyOpen,
  onHistory,
  onClose,
  conversation,
}: {
  document: CanvasDocument;
  chatDraft: string;
  onChatDraft: (value: string) => void;
  onSend: () => void;
  historyOpen: boolean;
  onHistory: () => void;
  onClose: () => void;
  conversation: Conversation | undefined;
}) {
  return (
    <aside className="absolute right-4 top-[102px] z-[105] flex h-[min(550px,calc(100%-150px))] w-[min(598px,calc(100%-120px))] overflow-hidden rounded-2xl border border-zinc-200 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1b1b1d]/95">
      {historyOpen && (
        <div className="flex w-[190px] shrink-0 flex-col border-r border-zinc-200 bg-zinc-50/90 dark:border-white/10 dark:bg-white/[.025]">
          <div className="flex h-12 items-center justify-between border-b border-zinc-200 px-3 dark:border-white/10">
            <span className="text-xs font-medium">历史对话</span>
            <IconButton title="关闭历史对话" onClick={onHistory}>
              <X size={13} />
            </IconButton>
          </div>
          <div className="p-2">
            <button
              type="button"
              className="flex h-8 w-full items-center gap-2 rounded-lg px-2 text-xs text-zinc-500 hover:bg-black/5 dark:hover:bg-white/[.06]"
            >
              <Plus size={13} />
              新建对话
            </button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 text-center text-[11px] text-zinc-400">
            暂无历史对话
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200 px-3 dark:border-white/10">
          <img src="/logo_dark.ico" alt="" className="size-6" />
          <span className="text-xs font-semibold">Unlimited Works Copilot</span>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={onHistory}
              className="inline-flex h-7 items-center gap-1 rounded-lg px-2 text-[10px] text-zinc-500 hover:bg-black/5 dark:hover:bg-white/[.06]"
            >
              <MessageSquare size={12} />
              历史对话
            </button>
            <IconButton title="关闭" onClick={onClose}>
              <X size={14} />
            </IconButton>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          {!conversation || conversation.messages.length === 0 ? (
            <CopilotEmptyState document={document} onChatDraft={onChatDraft} />
          ) : (
            <div className="space-y-3">
              {conversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-xl px-3 py-2.5 text-xs leading-5 ${
                    message.role === 'user'
                      ? 'ml-10 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'mr-10 border border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/[.04] dark:text-zinc-300'
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-zinc-200 p-2 dark:border-white/10">
          <Composer
            compact
            value={chatDraft}
            onChange={onChatDraft}
            onSend={onSend}
            placeholder="随心输入"
          />
        </div>
      </div>
    </aside>
  );
}

function CopilotEmptyState({
  document,
  onChatDraft,
}: {
  document: CanvasDocument;
  onChatDraft: (value: string) => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <img src="/logo_dark.ico" alt="" className="size-10" />
      <div className="mt-3 text-xs font-medium">Hi!</div>
      <h2 className="mt-1 text-xl font-semibold">今天一起创作点什么？</h2>
      <div className="mt-7 grid w-full max-w-[420px] grid-cols-2 gap-2">
        {[
          ['把我的创作流程做成 Skill', '把发散、整理、生成和复盘做成流程。'],
          ['讲清这个项目的创作思路', '解释主题、画面选择和关键验证点。'],
        ].map(([title, description]) => (
          <button
            key={title}
            type="button"
            onClick={() => onChatDraft(title)}
            className="rounded-xl border border-zinc-200 p-3 text-left hover:bg-black/[.03] dark:border-white/10 dark:hover:bg-white/[.04]"
          >
            <div className="text-xs font-medium">{title}</div>
            <div className="mt-1 text-[10px] leading-4 text-zinc-500">{description}</div>
          </button>
        ))}
      </div>
      <button type="button" className="mt-3 text-[10px] text-zinc-400">
        换一组
      </button>
      <div className="mt-5 rounded-lg bg-black/[.03] px-3 py-2 text-[10px] text-zinc-500 dark:bg-white/[.04]">
        当前画布：{document.name} · {document.nodes.length} 个节点
      </div>
    </div>
  );
}

function AssetCard({ asset }: { asset: AssetItem }) {
  return (
    <article className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/[.03]">
      <div className="flex aspect-square items-center justify-center overflow-hidden bg-zinc-100 dark:bg-white/[.04]">
        {asset.kind === 'image' ? (
          <img src={asset.dataUrl} alt={asset.name} className="h-full w-full object-cover" />
        ) : asset.kind === 'video' ? (
          <video src={asset.dataUrl} muted className="h-full w-full object-cover" />
        ) : asset.kind === 'audio' ? (
          <AudioLines size={22} className="text-cyan-500" />
        ) : (
          <Box size={22} className="text-blue-500" />
        )}
      </div>
      <div className="px-2 py-1.5">
        <div className="truncate text-[10px] font-medium">{asset.name}</div>
        <div className="mt-0.5 text-[9px] text-zinc-400">
          {(asset.size / 1024).toFixed(0)} KB
        </div>
      </div>
    </article>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2 py-1.5 text-xs ${
        active ? 'bg-black/5 font-medium dark:bg-white/10' : 'text-zinc-500'
      }`}
    >
      {children}
    </button>
  );
}

function IconButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className="grid size-7 place-items-center rounded-md text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
    >
      {children}
    </button>
  );
}

function MenuAction({
  icon,
  onClick,
  children,
  muted = false,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/[.06] ${
        muted ? 'text-zinc-500' : ''
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

