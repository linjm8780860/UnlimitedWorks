'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  Clock3,
  FolderOpen,
  House,
  LayoutDashboard,
  MessageSquare,
  Moon,
  Plus,
  Puzzle,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Sun,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Popover, MenuItem } from '@/components/ui/popover';
import { Modal } from '@/components/ui/modal';
import { useShellStore } from '@/features/app-shell/shell-store';
import { useWorkspaceStore } from '@/features/workspace/workspace-store';
import { useChatStore } from '@/features/chat/chat-store';

const navItems = [
  { href: '/', label: '首页', icon: House },
  { href: '/projects', label: '项目', icon: FolderOpen },
  { href: '/canvas', label: '画布', icon: LayoutDashboard },
  { href: '/skills', label: '技能', icon: Sparkles },
  { href: '/plugins', label: '插件', icon: Puzzle },
  { href: '/automations', label: '自动化任务', icon: Clock3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useShellStore((state) => state.theme);
  const toggleTheme = useShellStore((state) => state.toggleTheme);
  const sidebarCollapsed = useShellStore((state) => state.sidebarCollapsed);
  const sidebarWidth = useShellStore((state) => state.sidebarWidth);
  const setSidebarWidth = useShellStore((state) => state.setSidebarWidth);
  const openSettings = useShellStore((state) => state.openSettings);
  const workspaceDialogOpen = useShellStore((state) => state.workspaceDialogOpen);
  const openWorkspaceDialog = useShellStore((state) => state.openWorkspaceDialog);
  const closeWorkspaceDialog = useShellStore((state) => state.closeWorkspaceDialog);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const setSelectedWorkspaceId = useWorkspaceStore(
    (state) => state.setSelectedWorkspaceId,
  );
  const addWorkspace = useWorkspaceStore((state) => state.addWorkspace);
  const conversations = useChatStore((state) => state.conversations);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const setActiveConversationId = useChatStore(
    (state) => state.setActiveConversationId,
  );
  const createConversation = useChatStore((state) => state.createConversation);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [viewOpen, setViewOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspacePath, setWorkspacePath] = useState('');
  const [sortMode, setSortMode] = useState<'manual' | 'updated'>('manual');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(searchText.trim().toLowerCase()),
  );

  const onResizeStart = (event: React.PointerEvent) => {
    if (sidebarCollapsed) return;
    resizeRef.current = { startX: event.clientX, startWidth: sidebarWidth };
    const onMove = (moveEvent: PointerEvent) => {
      if (!resizeRef.current) return;
      const next = Math.max(
        160,
        Math.min(280, resizeRef.current.startWidth + moveEvent.clientX - resizeRef.current.startX),
      );
      setSidebarWidth(next);
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const submitWorkspace = () => {
    const name = workspaceName.trim();
    if (!name) return;
    addWorkspace(name, workspacePath.trim() || `~/UnlimitedWorks/${name}`);
    closeWorkspaceDialog();
    setWorkspaceName('');
    setWorkspacePath('');
  };

  const workspaceModal = (
    <Modal
      open={workspaceDialogOpen}
      onClose={closeWorkspaceDialog}
      title="添加工作区"
      width="max-w-md"
    >
      <div className="space-y-4 p-5">
        <label className="block">
          <span className="mb-1.5 block text-xs text-zinc-500">工作区名称</span>
          <input
            value={workspaceName}
            onChange={(event) => setWorkspaceName(event.target.value)}
            autoFocus
            placeholder="我的工作区"
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none dark:border-white/10 dark:bg-white/[.04]"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs text-zinc-500">工程目录</span>
          <input
            value={workspacePath}
            onChange={(event) => setWorkspacePath(event.target.value)}
            placeholder="~/UnlimitedWorks/我的工作区"
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none dark:border-white/10 dark:bg-white/[.04]"
          />
        </label>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={closeWorkspaceDialog}
            className="h-9 rounded-lg px-3 text-sm text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
          >
            取消
          </button>
          <button
            type="button"
            onClick={submitWorkspace}
            className="h-9 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
          >
            添加
          </button>
        </div>
      </div>
    </Modal>
  );

  if (sidebarCollapsed) {
    return (
      <>
      <aside
        id="workspace-sidebar"
        data-testid="workspace-sidebar"
        data-expanded="false"
        className="fixed bottom-0 left-0 top-8 z-[150] flex w-12 flex-col items-center border-r border-white/[.06] bg-[#141414] py-3 text-zinc-400 dark:border-white/[.06] dark:bg-[#141414] light:border-zinc-200 light:bg-white light:text-zinc-500"
      >
        <nav aria-label="主导航" className="flex flex-col gap-1">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              {...item}
              compact
              active={pathname === item.href}
            />
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <button
            type="button"
            aria-label={theme === 'dark' ? '当前深色主题，切换为浅色' : '当前浅色主题，切换为深色'}
            title={theme === 'dark' ? '切换为浅色' : '切换为深色'}
            onClick={toggleTheme}
            className="grid size-9 place-items-center rounded-lg hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/[.06] dark:hover:text-white"
          >
            {theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
          </button>
          <button
            type="button"
            aria-label="设置"
            title="设置"
            onClick={openSettings}
            className="grid size-9 place-items-center rounded-lg hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/[.06] dark:hover:text-white"
          >
            <Settings size={17} />
          </button>
        </div>
      </aside>
      {workspaceModal}
      </>
    );
  }

  return (
    <aside
      id="workspace-sidebar"
      data-testid="workspace-sidebar"
      data-expanded="true"
      className="fixed bottom-0 left-0 top-8 z-[150] flex flex-col border-r border-white/[.06] bg-[#141414] px-2 py-3 dark:border-white/[.06] dark:bg-[#141414] dark:text-zinc-200 light:border-zinc-200 light:bg-white light:text-zinc-800"
      style={{ width: sidebarWidth }}
    >
      <nav aria-label="主导航" className="flex flex-col gap-1">
        {navItems.map((item) => (
          <SidebarNavItem key={item.href} {...item} active={pathname === item.href} />
        ))}
      </nav>

      <div className="mt-2 flex min-h-0 flex-1 flex-col border-t border-white/[.06] pt-2 dark:border-white/[.06] light:border-zinc-200">
        <div className="flex items-center gap-0.5 px-1.5 pb-1">
          <span className="flex-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
            工作区
          </span>
          <button
            type="button"
            aria-label="搜索会话"
            onClick={() => setSearchOpen((current) => !current)}
            className="grid size-6 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/[.06] dark:hover:text-zinc-100"
          >
            <Search size={13} />
          </button>
          <Popover
            open={viewOpen}
            onClose={() => setViewOpen(false)}
            align="right"
            className="w-[190px]"
            trigger={
              <button
                type="button"
                aria-label="视图选项"
                aria-expanded={viewOpen}
                onClick={() => setViewOpen((current) => !current)}
                className="grid size-6 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/[.06] dark:hover:text-zinc-100"
              >
                <SlidersHorizontal size={13} />
              </button>
            }
          >
            <div className="px-2 pb-1 pt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              排序方式
            </div>
            <MenuItem
              title="手动排序"
              selected={sortMode === 'manual'}
              onClick={() => {
                setSortMode('manual');
                setViewOpen(false);
              }}
              trailing={sortMode === 'manual' ? <span>✓</span> : undefined}
            />
            <MenuItem
              title="最近更新"
              selected={sortMode === 'updated'}
              onClick={() => {
                setSortMode('updated');
                setViewOpen(false);
              }}
              trailing={sortMode === 'updated' ? <span>✓</span> : undefined}
            />
            <div className="my-1.5 h-px bg-black/5 dark:bg-white/10" />
            <MenuItem
              title="展开全部"
              onClick={() => {
                setCollapsedSections(new Set());
                setViewOpen(false);
              }}
            />
            <MenuItem
              title="折叠全部"
              onClick={() => {
                setCollapsedSections(new Set(workspaces.map((workspace) => workspace.id)));
                setViewOpen(false);
              }}
            />
            <div className="my-1.5 h-px bg-black/5 dark:bg-white/10" />
            <MenuItem title="只看当前工作区" trailing={<span className="text-zinc-400">⌘</span>} />
          </Popover>
          <button
            type="button"
            aria-label="添加工作区"
            title="添加工作区"
            onClick={openWorkspaceDialog}
            className="grid size-6 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/[.06] dark:hover:text-zinc-100"
          >
            <Plus size={13} />
          </button>
        </div>

        {searchOpen && (
          <div className="mb-1 px-1.5">
            <input
              aria-label="搜索会话名称"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="搜索会话名称"
              className="h-8 w-full rounded-lg border border-zinc-200 bg-white px-2 text-xs outline-none placeholder:text-zinc-400 focus:border-zinc-300 dark:border-white/10 dark:bg-white/[.05] dark:focus:border-white/20"
              autoFocus
            />
          </div>
        )}

        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-0.5 chat-panel-scrollbar">
          {workspaces.length === 0 ? (
            <div className="px-2.5 py-1 text-[11px] leading-4 text-zinc-500">
              用输入框上方的选择器添加工作区
            </div>
          ) : (
            workspaces.map((workspace) => {
              const isCollapsed = collapsedSections.has(workspace.id);
              const workspaceConversations = filteredConversations.filter(
                (conversation) => conversation.projectId === workspace.id,
              );
              return (
                <div key={workspace.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWorkspaceId(workspace.id);
                      setCollapsedSections((current) => {
                        const next = new Set(current);
                        if (next.has(workspace.id)) next.delete(workspace.id);
                        else next.add(workspace.id);
                        return next;
                      });
                    }}
                    className="flex h-8 w-full items-center gap-2 rounded-md px-1.5 text-left text-xs text-zinc-400 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/[.06] dark:hover:text-zinc-100"
                  >
                    <ChevronDown
                      size={12}
                      className={`transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                    />
                    <span className="min-w-0 flex-1 truncate">{workspace.name}</span>
                  </button>
                  {!isCollapsed && (
                    <div className="ml-3 border-l border-white/[.06] pl-1 dark:border-white/[.06] light:border-zinc-200">
                      {workspaceConversations.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            const conversation = createConversation('新对话', workspace.id);
                            router.push('/');
                            setActiveConversationId(conversation.id);
                          }}
                          className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[11px] text-zinc-500 hover:bg-black/5 dark:hover:bg-white/[.06]"
                        >
                          <MessageSquare size={12} />
                          新建对话
                        </button>
                      ) : (
                        workspaceConversations.map((conversation) => (
                          <button
                            type="button"
                            key={conversation.id}
                            onClick={() => {
                              setActiveConversationId(conversation.id);
                              router.push('/');
                            }}
                            className={`flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[11px] transition-colors ${
                              activeConversationId === conversation.id
                                ? 'bg-black/5 text-zinc-900 dark:bg-white/[.08] dark:text-white'
                                : 'text-zinc-500 hover:bg-black/5 hover:text-zinc-800 dark:hover:bg-white/[.06] dark:hover:text-zinc-200'
                            }`}
                          >
                            <MessageSquare size={12} />
                            <span className="truncate">{conversation.title}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-1 border-t border-white/[.06] pt-3 dark:border-white/[.06] light:border-zinc-200">
        <button
          type="button"
          aria-label={
            theme === 'dark' ? '当前深色主题，切换为浅色' : '当前浅色主题，切换为深色'
          }
          title={theme === 'dark' ? '当前深色主题，点击切换为浅色' : '当前浅色主题，点击切换为深色'}
          onClick={toggleTheme}
          className="flex h-9 w-full shrink-0 items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-zinc-400 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/[.06] dark:hover:text-zinc-100 light:text-zinc-500"
        >
          {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          <span>{theme === 'dark' ? '深色模式' : '浅色模式'}</span>
        </button>
        <button
          type="button"
          aria-label="设置"
          onClick={openSettings}
          className="flex h-9 w-full shrink-0 items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-zinc-400 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/[.06] dark:hover:text-zinc-100 light:text-zinc-500"
        >
          <Settings size={16} />
          <span>设置</span>
        </button>
      </div>

      <div
        role="separator"
        aria-label="调整侧栏宽度"
        onPointerDown={onResizeStart}
        className="absolute inset-y-0 -right-[3px] z-20 w-[6px] cursor-col-resize bg-transparent"
      />
      {workspaceModal}
    </aside>
  );
}

function SidebarNavItem({
  href,
  label,
  icon: Icon,
  active,
  compact = false,
}: {
  href: string;
  label: string;
  icon: typeof House;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={compact ? label : undefined}
      className={`flex h-9 shrink-0 items-center rounded-lg text-[13px] leading-normal transition-colors ${
        compact ? 'w-9 justify-center' : 'w-full gap-2.5 px-2.5'
      } ${
        active
          ? 'bg-black/[.06] text-zinc-950 dark:bg-white/[.09] dark:text-white light:bg-zinc-100'
          : 'text-zinc-400 hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/[.06] dark:hover:text-zinc-100 light:text-zinc-500'
      }`}
    >
      <Icon size={16} className="shrink-0" />
      {!compact && <span>{label}</span>}
    </Link>
  );
}

