'use client';

import {
  ChevronDown,
  FileArchive,
  FolderOpen,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  WandSparkles,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { MenuItem, Popover } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { useSkillsStore } from '@/features/skills/skills-store';
import { useShellStore } from '@/features/app-shell/shell-store';
import type { Skill } from '@/lib/types';

export function SkillsPage() {
  const skills = useSkillsStore((state) => state.skills);
  const addSkill = useSkillsStore((state) => state.addSkill);
  const updateSkill = useSkillsStore((state) => state.updateSkill);
  const removeSkill = useSkillsStore((state) => state.removeSkill);
  const restoreBuiltInSkills = useSkillsStore((state) => state.restoreBuiltInSkills);
  const pushToast = useShellStore((state) => state.pushToast);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'all' | Skill['source']>('all');
  const [status, setStatus] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [category, setCategory] = useState('全部分类');
  const [sourceOpen, setSourceOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [description, setDescription] = useState('');
  const [whenToUse, setWhenToUse] = useState('');
  const [content, setContent] = useState('');
  const [slash, setSlash] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(
    () => ['全部分类', ...Array.from(new Set(skills.map((skill) => skill.category)))],
    [skills],
  );

  const filtered = skills.filter((skill) => {
    const normalized = query.trim().toLowerCase();
    return (
      (!normalized ||
        skill.name.toLowerCase().includes(normalized) ||
        skill.description.toLowerCase().includes(normalized)) &&
      (source === 'all' || skill.source === source) &&
      (status === 'all' || (status === 'enabled' ? skill.enabled : !skill.enabled)) &&
      (category === '全部分类' || skill.category === category)
    );
  });

  const generatedSkill = `---\nname: ${skillName || 'my-skill'}\ndescription: ${description || '描述这个技能的能力'}\nwhen_to_use: ${whenToUse || '说明什么时候使用'}\nallow_implicit_invocation: ${slash}\n---\n\n${content || '# 工作流程\\n\\n在这里编写技能正文。'}`;

  const createSkill = () => {
    if (!/^[a-z0-9-]+$/.test(skillName)) {
      pushToast('技能名只能包含小写字母、数字和连字符。', 'error', '无法创建技能');
      return;
    }
    addSkill({
      name: skillName,
      description,
      whenToUse,
      content,
      source: 'global',
      category: '自定义',
      enabled: true,
      slash,
    });
    setWizardOpen(false);
    setInstallOpen(false);
    setSkillName('');
    setDescription('');
    setWhenToUse('');
    setContent('');
    pushToast(`技能「${skillName}」已创建。`, 'success');
  };

  const importDirectory = async () => {
    const picker = (
      window as Window & {
        showDirectoryPicker?: () => Promise<{
          name: string;
          getFileHandle: (name: string) => Promise<{ getFile: () => Promise<File> }>;
        }>;
      }
    ).showDirectoryPicker;
    if (!picker) {
      setWizardOpen(true);
      return;
    }
    try {
      const directory = await picker();
      const file = await (await directory.getFileHandle('skill.md')).getFile();
      const text = await file.text();
      const name = directory.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/^-+|-+$/g, '');
      if (!name) throw new Error('目录名不符合技能命名要求');
      addSkill({
        name,
        description: text.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? '本地目录技能',
        whenToUse: text.match(/^when_to_use:\s*(.+)$/m)?.[1]?.trim() ?? '',
        content: text,
        source: 'global',
        category: '导入',
        enabled: true,
        slash: true,
      });
      setInstallOpen(false);
      pushToast(`技能「${name}」已从本地目录安装。`, 'success');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      pushToast(error instanceof Error ? error.message : String(error), 'error', '安装失败');
    }
  };

  return (
    <main className="uw-workspace-page h-full overflow-y-auto bg-white px-8 py-7 text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-.02em]">技能</h1>
            <p className="mt-1 text-sm text-zinc-500">通过任务专用技能扩展 UW</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => pushToast('技能列表已刷新。', 'success')}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-600 hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[.05]"
            >
              <RefreshCw size={15} />
              刷新
            </button>
            <button
              type="button"
              onClick={() => setInstallOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Sparkles size={15} />
              安装技能
            </button>
          </div>
        </header>

        <section className="mt-7 border-t border-zinc-200 pt-5 dark:border-white/10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">
              已安装 <span className="ml-1 text-zinc-400">{skills.length}</span>
            </h2>
            <button
              type="button"
              onClick={() => {
                restoreBuiltInSkills();
                pushToast('已恢复程序内置技能。', 'success');
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-zinc-500 hover:bg-black/5 hover:text-zinc-900 dark:hover:bg-white/[.06] dark:hover:text-zinc-100"
            >
              <RefreshCw size={13} />
              恢复内置技能
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                  category === item
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                    : 'bg-black/[.04] text-zinc-500 hover:bg-black/[.07] dark:bg-white/[.06] dark:text-zinc-400 dark:hover:bg-white/[.1]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <label className="flex h-9 min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-zinc-200 px-2.5 text-zinc-400 dark:border-white/10">
              <Search size={14} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="搜索技能"
                placeholder="搜索技能"
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-zinc-800 outline-none dark:text-zinc-200"
              />
            </label>
            <Popover
              open={sourceOpen}
              onClose={() => setSourceOpen(false)}
              align="right"
              className="w-[180px]"
              trigger={
                <button
                  type="button"
                  aria-label="技能来源"
                  onClick={() => setSourceOpen((current) => !current)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-400"
                >
                  {source === 'all'
                    ? '全部来源'
                    : source === 'built-in'
                      ? '内置'
                      : source === 'global'
                        ? '全局自定义'
                        : '项目自定义'}
                  <ChevronDown size={12} />
                </button>
              }
            >
              {[
                ['all', '全部来源'],
                ['built-in', '内置'],
                ['global', '全局自定义'],
                ['project', '项目自定义'],
              ].map(([value, label]) => (
                <MenuItem
                  key={value}
                  title={label}
                  selected={source === value}
                  onClick={() => {
                    setSource(value as typeof source);
                    setSourceOpen(false);
                  }}
                />
              ))}
            </Popover>
            <Popover
              open={statusOpen}
              onClose={() => setStatusOpen(false)}
              align="right"
              className="w-[160px]"
              trigger={
                <button
                  type="button"
                  aria-label="技能启用状态"
                  onClick={() => setStatusOpen((current) => !current)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-400"
                >
                  {status === 'all' ? '全部状态' : status === 'enabled' ? '已启用' : '已停用'}
                  <ChevronDown size={12} />
                </button>
              }
            >
              {[
                ['all', '全部状态'],
                ['enabled', '已启用'],
                ['disabled', '已停用'],
              ].map(([value, label]) => (
                <MenuItem
                  key={value}
                  title={label}
                  selected={status === value}
                  onClick={() => {
                    setStatus(value as typeof status);
                    setStatusOpen(false);
                  }}
                />
              ))}
            </Popover>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-14 flex flex-col items-center text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/[.05] dark:text-zinc-500">
                <WandSparkles size={24} />
              </div>
              <h3 className="mt-4 text-sm font-semibold">还没有可用技能</h3>
              <p className="mt-1.5 text-xs text-zinc-500">安装自己的技能，或恢复程序内置技能。</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {filtered.map((skill) => (
                <article
                  key={skill.id}
                  className="group rounded-xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[.025]"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-violet-500">
                      <Sparkles size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold">{skill.name}</h3>
                        {skill.slash && (
                          <span className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500 dark:bg-white/10">
                            /
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                        {skill.description || skill.whenToUse}
                      </p>
                      <div className="mt-2 text-[10px] text-zinc-400">
                        {skill.source === 'built-in'
                          ? '内置'
                          : skill.source === 'global'
                            ? '全局自定义'
                            : '项目自定义'}{' '}
                        · {skill.category}
                      </div>
                    </div>
                    <Switch
                      checked={skill.enabled}
                      onChange={(checked) => updateSkill(skill.id, { enabled: checked })}
                      label={`启用技能 ${skill.name}`}
                    />
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      aria-label={`删除技能 ${skill.name}`}
                      onClick={() => removeSkill(skill.id)}
                      className="grid size-7 place-items-center rounded-md text-zinc-400 opacity-0 hover:bg-rose-500/10 hover:text-rose-500 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal
        open={installOpen}
        onClose={() => {
          setInstallOpen(false);
          setWizardOpen(false);
        }}
        title="安装技能"
        width="max-w-2xl"
      >
        <div className="p-5">
          {!wizardOpen ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <InstallMethod
                  icon={<FolderOpen size={20} />}
                  title="本地文件夹"
                  onClick={() => void importDirectory()}
                />
                <InstallMethod
                  icon={<FileArchive size={20} />}
                  title="文件导入"
                  onClick={() => fileRef.current?.click()}
                />
                <InstallMethod
                  icon={<WandSparkles size={20} />}
                  title="向导新建"
                  onClick={() => setWizardOpen(true)}
                />
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".md,text/markdown"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  const name = file.name.replace(/\.md$/i, '').toLowerCase().replace(/[^a-z0-9-]/g, '-');
                  addSkill({
                    name,
                    description: text.slice(0, 100),
                    whenToUse: '从 Markdown 文件导入',
                    content: text,
                    source: 'global',
                    category: '导入',
                    enabled: true,
                    slash: true,
                  });
                  setInstallOpen(false);
                  pushToast(`技能「${name}」已导入。`, 'success');
                  event.target.value = '';
                }}
              />
              <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[.03]">
                <div className="text-sm font-medium">技能目录要求</div>
                <p className="mt-1.5 text-xs leading-5 text-zinc-500">
                  顶层目录名将作为技能名，仅支持小写字母、数字和连字符。目录中需包含
                  <code className="mx-1 rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
                    skill.md
                  </code>
                  主文件，可附带子目录与资源文件。
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="技能名 (仅小写字母/数字/连字符)">
                  <input
                    value={skillName}
                    onChange={(event) => setSkillName(event.target.value.toLowerCase())}
                    placeholder="story-planning"
                    className="h-9 w-full rounded-lg border border-zinc-200 bg-transparent px-2.5 text-sm outline-none dark:border-white/10"
                  />
                </Field>
                <Field label="描述">
                  <input
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="一句话说明技能能力"
                    className="h-9 w-full rounded-lg border border-zinc-200 bg-transparent px-2.5 text-sm outline-none dark:border-white/10"
                  />
                </Field>
              </div>
              <Field label="使用场景 (when_to_use)">
                <input
                  value={whenToUse}
                  onChange={(event) => setWhenToUse(event.target.value)}
                  placeholder="用户提出什么需求时应使用"
                  className="h-9 w-full rounded-lg border border-zinc-200 bg-transparent px-2.5 text-sm outline-none dark:border-white/10"
                />
              </Field>
              <div className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-white/10">
                <span className="text-sm">允许用户通过 / 调用</span>
                <Switch checked={slash} onChange={setSlash} label="允许通过斜杠调用" />
              </div>
              <Field label="正文 (Markdown,可使用 {{file:rel/path}} 引用嵌套资源)">
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  className="h-44 w-full resize-none rounded-lg border border-zinc-200 bg-transparent p-3 font-mono text-xs leading-5 outline-none dark:border-white/10"
                  placeholder="# 工作流程&#10;&#10;..."
                />
              </Field>
              <button
                type="button"
                onClick={() => setPreviewOpen((current) => !current)}
                className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                <ChevronDown
                  size={13}
                  className={`transition-transform ${previewOpen ? 'rotate-180' : ''}`}
                />
                预览生成的 skill.md
              </button>
              {previewOpen && (
                <pre className="max-h-48 overflow-auto rounded-lg bg-zinc-950 p-3 text-[11px] leading-5 text-zinc-300">
                  {generatedSkill}
                </pre>
              )}
              <div className="flex justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setWizardOpen(false)}
                  className="h-9 rounded-lg px-3 text-sm text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
                >
                  返回
                </button>
                <button
                  type="button"
                  onClick={createSkill}
                  className="h-9 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
                >
                  创建技能
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </main>
  );
}

function InstallMethod({
  icon,
  title,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-28 flex-col items-center justify-center gap-3 rounded-xl border border-zinc-200 text-sm text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:border-white/20 dark:hover:bg-white/[.04]"
    >
      <span className="text-zinc-400">{icon}</span>
      {title}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

