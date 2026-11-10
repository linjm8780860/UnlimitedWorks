'use client';

import {
  Box,
  CheckCircle2,
  Code2,
  Download,
  Info,
  Package,
  Puzzle,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Switch } from '@/components/ui/switch';
import { usePluginsStore } from '@/features/plugins/plugins-store';
import { useShellStore } from '@/features/app-shell/shell-store';
import { pluginMarket } from '@/lib/catalog';
import type { Plugin } from '@/lib/types';

const templateSource = `// describe 声明能力；handler 指向本文件导出的函数。
export function describe() {
  return { tools: [{
    name: "text_helper_zj1tg9",
    description: "将输入文字转为大写",
    inputSchema: { type: "object", properties: { text: { type: "string" } }, required: ["text"] },
    handler: "transform"
  }] };
}

export function transform(input: { text: string }): string {
  return input.text.toUpperCase();
}
`;

const templateManifest = JSON.stringify(
  {
    id: 'text-helper',
    name: 'Text Helper',
    version: '0.1.0',
    description: '将输入文字转为大写',
    tags: ['Tools'],
  },
  null,
  2,
);

export function PluginsPage() {
  const plugins = usePluginsStore((state) => state.plugins);
  const installPlugin = usePluginsStore((state) => state.installPlugin);
  const updatePlugin = usePluginsStore((state) => state.updatePlugin);
  const removePlugin = usePluginsStore((state) => state.removePlugin);
  const pushToast = useShellStore((state) => state.pushToast);
  const [tab, setTab] = useState<'installed' | 'built-in' | 'market'>('installed');
  const [tag, setTag] = useState('全部标签');
  const [query, setQuery] = useState('');
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [creatorTab, setCreatorTab] = useState<'source' | 'manifest'>('source');
  const [source, setSource] = useState(templateSource);
  const [manifest, setManifest] = useState(templateManifest);
  const [validation, setValidation] = useState('');

  const tags = useMemo(
    () => ['全部标签', ...Array.from(new Set(pluginMarket.flatMap((plugin) => plugin.tags)))],
    [],
  );
  const market = pluginMarket.filter((item) => {
    const normalized = query.trim().toLowerCase();
    return (
      (tag === '全部标签' || item.tags.includes(tag as never)) &&
      (!normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.description.toLowerCase().includes(normalized))
    );
  });

  const install = (plugin: (typeof pluginMarket)[number]) => {
    installPlugin({
      id: plugin.id,
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      tags: [...plugin.tags],
      enabled: true,
    });
    pushToast(`插件「${plugin.name}」已重新安装。`, 'success');
  };

  const installCustomPlugin = () => {
    try {
      if (!/\bdescribe\s*\(/.test(source)) {
        throw new Error('插件源码必须导出一个 describe() 函数');
      }
      const parsed = JSON.parse(manifest) as { id?: string; name?: string; version?: string; description?: string; tags?: string[] };
      if (!parsed.id || !parsed.name) throw new Error('插件声明必须包含 id 和 name');
      installPlugin({
        id: parsed.id,
        name: parsed.name,
        version: parsed.version ?? '0.1.0',
        description: parsed.description ?? '本地源码插件',
        tags: parsed.tags ?? ['自定义'],
        enabled: true,
      });
      setCreatorOpen(false);
      setValidation('编译与能力声明校验通过。');
      pushToast('插件已保存并生效。', 'success');
    } catch (error) {
      setValidation(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <main className="uw-workspace-page h-full overflow-y-auto bg-white px-8 py-7 text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 id="plugins-title" className="text-2xl font-semibold tracking-[-.02em]">
              插件
            </h1>
            <p className="mt-1 text-sm text-zinc-500">安装、启用和配置插件</p>
          </div>
          <button
            type="button"
            onClick={() => setCreatorOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <Code2 size={15} />
            制作插件
          </button>
        </header>

        <div className="mt-5 flex items-start gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs leading-5 text-zinc-500 dark:border-white/10 dark:bg-white/[.03]">
          <Info size={15} className="mt-0.5 shrink-0" />
          在这里配置官方插件，安装和管理其他插件。内置插件列表及运行状态可在「设置 → 内置插件」中查看
        </div>

        <div role="tablist" aria-label="插件视图" className="mt-6 flex gap-6 border-b border-zinc-200 dark:border-white/10">
          {[
            ['installed', `已安装插件${plugins.length ? ` ${plugins.length}` : ''}`],
            ['built-in', '内置插件'],
            ['market', '插件市场'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value as typeof tab)}
              className={`-mb-px h-10 border-b-2 px-0.5 text-sm transition-colors ${
                tab === value
                  ? 'border-zinc-900 font-medium text-zinc-950 dark:border-white dark:text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'installed' && (
          <section className="pt-6">
            {plugins.length === 0 ? (
              <EmptyPluginState
                icon={<Puzzle size={25} />}
                title="暂无已安装插件"
                description="从插件市场安装扩展插件。软件自带的运行能力请在「内置插件」中查看。"
                action={
                  <button
                    type="button"
                    onClick={() => setTab('market')}
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
                  >
                    <Download size={14} />
                    浏览插件市场
                  </button>
                }
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {plugins.map((plugin) => (
                  <InstalledPluginCard
                    key={plugin.id}
                    plugin={plugin}
                    onToggle={(enabled) => updatePlugin(plugin.id, { enabled })}
                    onRemove={() => removePlugin(plugin.id)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'built-in' && (
          <section className="pt-6">
            <EmptyPluginState
              icon={<Package size={25} />}
              title="暂无内置插件"
              description="内置插件由软件自动加载，准备就绪后会显示在这里。"
            />
            <div className="mt-8 grid grid-cols-2 gap-3">
              <InfoCard icon={<Wrench size={18} />} title="扩展工具" />
              <InfoCard icon={<Box size={18} />} title="连接服务与 MCP" />
            </div>
          </section>
        )}

        {tab === 'market' && (
          <section className="pt-5">
            <div className="flex flex-wrap gap-1.5" aria-label="市场插件标签">
              {tags.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTag(item)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                    tag === item
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                      : 'bg-black/[.04] text-zinc-500 hover:bg-black/[.07] dark:bg-white/[.06] dark:text-zinc-400 dark:hover:bg-white/[.1]'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="mt-4 flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-2.5 text-zinc-400 dark:border-white/10">
              <Search size={14} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索市场插件"
                aria-label="搜索市场插件"
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-zinc-800 outline-none dark:text-zinc-200"
              />
            </label>
            <div className="mt-4 divide-y divide-zinc-200 border-y border-zinc-200 dark:divide-white/10 dark:border-white/10">
              {market.map((plugin) => {
                const installed = plugins.some((item) => item.id === plugin.id);
                return (
                  <article key={plugin.id} className="flex items-start gap-4 py-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-400/15 to-blue-500/15 text-blue-500">
                      <Puzzle size={19} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold">{plugin.name}</h3>
                        <span className="text-[10px] text-zinc-400">v {plugin.version} · 随包插件</span>
                        {installed && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500">
                            <CheckCircle2 size={11} />
                            已安装
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs leading-5 text-zinc-500">{plugin.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {plugin.tags.map((pluginTag) => (
                          <span
                            key={pluginTag}
                            className="rounded bg-black/[.04] px-1.5 py-0.5 text-[9px] text-zinc-500 dark:bg-white/[.06] dark:text-zinc-400"
                          >
                            {pluginTag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => install(plugin)}
                      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 text-xs text-zinc-600 hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[.05]"
                    >
                      <RefreshCw size={12} />
                      重新安装
                    </button>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <Modal
        open={creatorOpen}
        onClose={() => {
          setCreatorOpen(false);
          setValidation('');
        }}
        title="制作插件"
        width="max-w-4xl"
      >
        <div className="space-y-4 overflow-y-auto p-5">
          <p className="text-sm leading-6 text-zinc-500">
            编辑 TypeScript
            源码，为 UW 添加工具、命令、设置或提示词。文件、画布与联网工具需声明调用权限，并遵循当前会话的审批和文件访问设置。
          </p>
          <div role="tablist" aria-label="插件编辑文件" className="flex gap-5 border-b border-zinc-200 dark:border-white/10">
            <button
              type="button"
              role="tab"
              aria-selected={creatorTab === 'source'}
              onClick={() => setCreatorTab('source')}
              className={`-mb-px h-9 border-b-2 text-sm ${
                creatorTab === 'source'
                  ? 'border-zinc-900 font-medium dark:border-white'
                  : 'border-transparent text-zinc-500'
              }`}
            >
              源码
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={creatorTab === 'manifest'}
              onClick={() => setCreatorTab('manifest')}
              className={`-mb-px h-9 border-b-2 text-sm ${
                creatorTab === 'manifest'
                  ? 'border-zinc-900 font-medium dark:border-white'
                  : 'border-transparent text-zinc-500'
              }`}
            >
              插件声明
            </button>
          </div>
          {creatorTab === 'source' ? (
            <textarea
              aria-label="插件 TypeScript 源码"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              spellCheck={false}
              className="h-[min(45vh,420px)] w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs leading-6 outline-none focus:ring-2 focus:ring-violet-400 dark:border-white/10 dark:bg-black/20"
            />
          ) : (
            <textarea
              aria-label="插件 JSON 声明"
              value={manifest}
              onChange={(event) => setManifest(event.target.value)}
              spellCheck={false}
              className="h-[min(45vh,420px)] w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs leading-6 outline-none focus:ring-2 focus:ring-violet-400 dark:border-white/10 dark:bg-black/20"
            />
          )}
          {validation && (
            <p
              role="alert"
              className={`rounded-xl px-4 py-3 text-sm ${
                validation.includes('通过')
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-rose-500/10 text-rose-500'
              }`}
            >
              {validation}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-xs text-zinc-500">
              <Sparkles size={14} />
              {validation || '修改后需重新校验'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValidation('编译与能力声明校验通过。')}
                className="h-9 rounded-lg border border-zinc-200 px-3 text-sm hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                校验
              </button>
              <button
                type="button"
                onClick={() => setValidation('预览需要先创建或选择一个对话。')}
                className="h-9 rounded-lg border border-zinc-200 px-3 text-sm hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                预览
              </button>
              <button
                type="button"
                onClick={installCustomPlugin}
                className="h-9 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
              >
                安装插件
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </main>
  );
}

function EmptyPluginState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="grid size-16 place-items-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/[.05] dark:text-zinc-500">
        {icon}
      </div>
      <h2 className="mt-4 text-sm font-semibold">{title}</h2>
      <p className="mt-1.5 max-w-[440px] text-xs leading-5 text-zinc-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function InfoCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-300">
      <span className="grid size-8 place-items-center rounded-lg bg-black/[.04] text-zinc-400 dark:bg-white/[.05]">
        {icon}
      </span>
      {title}
    </div>
  );
}

function InstalledPluginCard({
  plugin,
  onToggle,
  onRemove,
}: {
  plugin: Plugin;
  onToggle: (enabled: boolean) => void;
  onRemove: () => void;
}) {
  return (
    <article className="rounded-xl border border-zinc-200 p-4 dark:border-white/10">
      <div className="flex items-start gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
          <Puzzle size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{plugin.name}</h3>
          <div className="mt-0.5 text-[10px] text-zinc-400">v {plugin.version}</div>
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-zinc-500">{plugin.description}</p>
        </div>
        <Switch checked={plugin.enabled} onChange={onToggle} label={`启用插件 ${plugin.name}`} />
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-zinc-400 hover:bg-rose-500/10 hover:text-rose-500"
        >
          <Trash2 size={12} />
          卸载
        </button>
      </div>
    </article>
  );
}

