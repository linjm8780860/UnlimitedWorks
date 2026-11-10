'use client';

import {
  ArrowDownAZ,
  ChevronDown,
  Clock3,
  Folder,
  FolderOpen,
  Grid2X2,
  List,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useWorkspaceStore } from '@/features/workspace/workspace-store';
import { useShellStore } from '@/features/app-shell/shell-store';
import { MenuItem, Popover } from '@/components/ui/popover';
import { Modal } from '@/components/ui/modal';
import type { Project } from '@/lib/types';

export function ProjectsPage({ startCreating = false }: { startCreating?: boolean }) {
  const projects = useWorkspaceStore((state) => state.projects);
  const addProject = useWorkspaceStore((state) => state.addProject);
  const removeProject = useWorkspaceStore((state) => state.removeProject);
  const pushToast = useShellStore((state) => state.pushToast);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'recent' | 'oldest' | 'name'>('recent');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortOpen, setSortOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(startCreating);
  const [projectName, setProjectName] = useState('');
  const [projectPath, setProjectPath] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...projects]
      .filter(
        (project) =>
          !normalized ||
          project.name.toLowerCase().includes(normalized) ||
          project.path.toLowerCase().includes(normalized),
      )
      .sort((a, b) => {
        if (sort === 'name') return a.name.localeCompare(b.name, 'zh-CN');
        if (sort === 'oldest') return a.updatedAt - b.updatedAt;
        return b.updatedAt - a.updatedAt;
      });
  }, [projects, query, sort]);

  const createProject = () => {
    const name = projectName.trim();
    if (!name) {
      pushToast('项目名称不能为空。', 'error', '无法创建项目');
      return;
    }
    addProject(name, projectPath.trim());
    setCreateOpen(false);
    setProjectName('');
    setProjectPath('');
    pushToast(`已创建项目「${name}」`, 'success', '项目已保存');
  };

  const openDirectory = async () => {
    const picker = (
      window as Window & {
        showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<{
          name: string;
        }>;
      }
    ).showDirectoryPicker;
    if (!picker) {
      setCreateOpen(true);
      return;
    }
    try {
      const handle = await picker({ mode: 'readwrite' });
      const project = addProject(handle.name, handle.name);
      pushToast(`已打开文件夹「${project.name}」`, 'success');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      pushToast(error instanceof Error ? error.message : String(error), 'error', '打开文件夹失败');
    }
  };

  return (
    <main className="uw-workspace-page h-full overflow-y-auto bg-white px-8 py-7 text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100">
      <div className="mx-auto max-w-[1120px]">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-.02em]">项目</h1>
            <p className="mt-1 text-sm text-zinc-500">管理本地创作项目，所有数据保存在当前浏览器。</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus size={16} />
              新建项目
            </button>
            <button
              type="button"
              onClick={() => void openDirectory()}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-black/5 px-3 text-sm text-zinc-600 transition-colors hover:bg-black/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
            >
              <FolderOpen size={16} />
              打开文件夹
            </button>
          </div>
        </header>

        <div className="mt-7 flex flex-wrap items-center gap-2">
          <label className="flex h-10 min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-zinc-400 dark:border-white/10 dark:bg-white/[.04]">
            <Search size={15} />
            <input
              aria-label="搜索项目名称或路径"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索项目名称或路径"
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-200"
            />
          </label>
          <Popover
            open={sortOpen}
            onClose={() => setSortOpen(false)}
            align="right"
            className="w-[230px]"
            trigger={
              <button
                type="button"
                aria-label="项目排序"
                aria-expanded={sortOpen}
                onClick={() => setSortOpen((current) => !current)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs text-zinc-500 hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-400 dark:hover:bg-white/[.05]"
              >
                {sort === 'recent' ? <Clock3 size={14} /> : <ArrowDownAZ size={14} />}
                {sort === 'recent'
                  ? '最近打开：从新到旧'
                  : sort === 'oldest'
                    ? '最近打开：从旧到新'
                    : '项目名称'}
                <ChevronDown size={13} />
              </button>
            }
          >
            <MenuItem
              title="最近打开：从新到旧"
              selected={sort === 'recent'}
              onClick={() => {
                setSort('recent');
                setSortOpen(false);
              }}
            />
            <MenuItem
              title="最近打开：从旧到新"
              selected={sort === 'oldest'}
              onClick={() => {
                setSort('oldest');
                setSortOpen(false);
              }}
            />
            <MenuItem
              title="项目名称"
              selected={sort === 'name'}
              onClick={() => {
                setSort('name');
                setSortOpen(false);
              }}
            />
          </Popover>
          <div className="flex rounded-lg border border-zinc-200 p-1 dark:border-white/10">
            <button
              type="button"
              aria-label="网格视图"
              onClick={() => setView('grid')}
              className={`grid size-8 place-items-center rounded-md ${
                view === 'grid'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-400 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Grid2X2 size={15} />
            </button>
            <button
              type="button"
              aria-label="列表视图"
              onClick={() => setView('list')}
              className={`grid size-8 place-items-center rounded-md ${
                view === 'list'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-400 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <section className="mt-16 flex flex-col items-center justify-center text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/[.05] dark:text-zinc-500">
              <Folder size={28} />
            </div>
            <h2 className="mt-5 text-base font-semibold">
              {query ? '没有匹配的项目' : '还没有最近项目'}
            </h2>
            <p className="mt-2 max-w-[360px] text-sm leading-6 text-zinc-500">
              {query
                ? '换一个名称或路径继续搜索。'
                : '新建项目，或打开已有项目文件夹。你的创作保存在本地。'}
            </p>
          </section>
        ) : (
          <div
            className={
              view === 'grid'
                ? 'mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'
                : 'mt-7 overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10'
            }
          >
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                list={view === 'list'}
                onDelete={() => setDeleteTarget(project)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="新建项目"
        width="max-w-md"
      >
        <div className="space-y-4 p-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-zinc-500">项目名称</span>
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              autoFocus
              placeholder="例如：角色概念设计"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-white/10 dark:bg-white/[.04] dark:focus:border-white/30"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-zinc-500">本地路径</span>
            <input
              value={projectPath}
              onChange={(event) => setProjectPath(event.target.value)}
              placeholder="留空则使用默认路径"
              className="h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-white/10 dark:bg-white/[.04] dark:focus:border-white/30"
            />
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="h-9 rounded-lg px-3 text-sm text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
            >
              取消
            </button>
            <button
              type="button"
              onClick={createProject}
              className="h-9 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              创建项目
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="删除项目"
        width="max-w-sm"
      >
        <div className="p-5">
          <p className="text-sm leading-6 text-zinc-500">
            将删除「{deleteTarget?.name}」的本地项目记录，不会删除磁盘中的文件。
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="h-9 rounded-lg px-3 text-sm text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => {
                if (deleteTarget) removeProject(deleteTarget.id);
                setDeleteTarget(null);
                pushToast('项目记录已删除。', 'success');
              }}
              className="h-9 rounded-lg bg-rose-600 px-3 text-sm font-medium text-white hover:bg-rose-500"
            >
              删除
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}

function ProjectCard({
  project,
  list,
  onDelete,
}: {
  project: Project;
  list: boolean;
  onDelete: () => void;
}) {
  return (
    <article
      className={`group relative border-zinc-200 bg-white transition-colors hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[.025] dark:hover:bg-white/[.045] ${
        list
          ? 'flex h-16 items-center gap-3 border-b px-4 last:border-b-0'
          : 'rounded-xl border p-4'
      }`}
    >
      <Link
        href={`/canvas?project=${encodeURIComponent(project.id)}`}
        className={`min-w-0 flex-1 ${list ? 'flex items-center gap-3' : 'flex flex-col gap-5'}`}
      >
        <span
          className={`grid place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ${
            list ? 'size-9' : 'size-11'
          }`}
        >
          <FolderOpen size={list ? 17 : 20} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{project.name}</span>
          <span className="mt-1 block truncate text-[11px] text-zinc-400">{project.path}</span>
        </span>
      </Link>
      <span className="absolute right-3 top-3 text-[10px] text-zinc-400 group-hover:hidden">
        {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
      </span>
      <button
        type="button"
        aria-label={`管理项目 ${project.name}`}
        onClick={onDelete}
        className={`grid size-8 place-items-center rounded-lg text-zinc-400 opacity-0 transition-opacity hover:bg-black/5 hover:text-rose-500 group-hover:opacity-100 dark:hover:bg-white/10 ${
          list ? 'static' : 'absolute right-3 top-3'
        }`}
      >
        <Trash2 size={14} />
      </button>
    </article>
  );
}

