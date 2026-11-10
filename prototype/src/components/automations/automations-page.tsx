'use client';

import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Play,
  Plus,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { MenuItem, Popover } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { useAutomationsStore } from '@/features/automations/automations-store';
import { useSettingsStore } from '@/features/settings/settings-store';
import { useShellStore } from '@/features/app-shell/shell-store';
import type { AutomationType } from '@/lib/types';

const typeLabels: Record<AutomationType, string> = {
  once: 'N 秒后一次',
  interval: '固定间隔',
  daily: '每天定时',
  weekly: '每周定时',
  cron: 'cron 表达式',
};

const typePlaceholders: Record<AutomationType, string> = {
  once: '60',
  interval: '30m',
  daily: '09:00',
  weekly: '周一 09:00',
  cron: '0 9 * * 1-5',
};

export function AutomationsPage() {
  const automations = useAutomationsStore((state) => state.automations);
  const addAutomation = useAutomationsStore((state) => state.addAutomation);
  const updateAutomation = useAutomationsStore((state) => state.updateAutomation);
  const removeAutomation = useAutomationsStore((state) => state.removeAutomation);
  const requestCheck = useAutomationsStore((state) => state.requestCheck);
  const automationPollingEnabled = useSettingsStore(
    (state) => state.automationPollingEnabled,
  );
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const pushToast = useShellStore((state) => state.pushToast);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AutomationType>('daily');
  const [expression, setExpression] = useState('09:00');
  const [content, setContent] = useState('');
  const [typeOpen, setTypeOpen] = useState(false);

  const submit = () => {
    if (!title.trim() || !content.trim()) {
      pushToast('标题和任务内容不能为空。', 'error', '无法添加计划');
      return;
    }
    addAutomation({
      title: title.trim(),
      type,
      expression,
      content: content.trim(),
      enabled: true,
    });
    setTitle('');
    setContent('');
    pushToast('自动化计划已添加。', 'success');
  };

  return (
    <main className="uw-workspace-page h-full overflow-y-auto bg-white px-8 py-7 text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-start justify-between gap-5">
          <div>
            <h1 className="text-2xl font-semibold tracking-[-.02em]">自动化任务</h1>
            <p className="mt-1 text-sm text-zinc-500">按设定的时间或周期，在会话中自动执行任务。</p>
          </div>
          <label className="flex shrink-0 items-center gap-2.5 pt-2 text-xs text-zinc-500">
            启用轮询
            <Switch
              checked={automationPollingEnabled}
              onChange={(automationPollingEnabled) =>
                updateSettings({ automationPollingEnabled })
              }
              label="启用轮询"
            />
          </label>
        </header>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/[.025]">
          <h2 className="text-sm font-semibold">新建计划</h2>
          <div className="mt-4 grid gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs text-zinc-500">标题</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="标题"
                className="h-10 w-full rounded-lg border border-zinc-200 bg-transparent px-3 text-sm outline-none focus:border-zinc-400 dark:border-white/10 dark:focus:border-white/30"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className="mb-1.5 block text-xs text-zinc-500">类型</span>
                <Popover
                  open={typeOpen}
                  onClose={() => setTypeOpen(false)}
                  className="w-[220px]"
                  trigger={
                    <button
                      type="button"
                      aria-label="类型"
                      aria-expanded={typeOpen}
                      onClick={() => setTypeOpen((current) => !current)}
                      className="flex h-10 w-full items-center justify-between rounded-lg border border-zinc-200 px-3 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-300"
                    >
                      {typeLabels[type]}
                      <ChevronDown size={14} />
                    </button>
                  }
                >
                  {(Object.keys(typeLabels) as AutomationType[]).map((item) => (
                    <MenuItem
                      key={item}
                      title={typeLabels[item]}
                      selected={type === item}
                      onClick={() => {
                        setType(item);
                        setExpression(typePlaceholders[item]);
                        setTypeOpen(false);
                      }}
                    />
                  ))}
                </Popover>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs text-zinc-500">
                  {type === 'once'
                    ? '延迟（秒）'
                    : type === 'interval'
                      ? '间隔'
                      : type === 'cron'
                        ? 'cron 表达式'
                        : type === 'weekly'
                          ? '星期与时间'
                          : '时间（HH:mm）'}
                </span>
                <input
                  value={expression}
                  onChange={(event) => setExpression(event.target.value)}
                  placeholder={typePlaceholders[type]}
                  className="h-10 w-full rounded-lg border border-zinc-200 bg-transparent px-3 text-sm outline-none focus:border-zinc-400 dark:border-white/10 dark:focus:border-white/30"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs text-zinc-500">
                任务内容（到点送入会话的提示词）
              </span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="任务内容（到点送入会话的提示词）"
                className="h-28 w-full resize-none rounded-lg border border-zinc-200 bg-transparent p-3 text-sm leading-6 outline-none focus:border-zinc-400 dark:border-white/10 dark:focus:border-white/30"
              />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={submit}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
            >
              <Plus size={14} />
              添加计划
            </button>
            <button
              type="button"
              onClick={() => {
                const now = Date.now();
                automations.forEach((automation) =>
                  updateAutomation(automation.id, { lastCheckedAt: now }),
                );
                requestCheck();
                pushToast('已提交一次自动化检查。', 'success');
              }}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm text-zinc-600 hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[.05]"
            >
              <Play size={13} />
              立即检查一次
            </button>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">
              已排期 <span className="ml-1 text-zinc-400">{automations.length}</span> 条
            </h2>
          </div>
          {automations.length === 0 ? (
            <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-zinc-200 py-12 text-center dark:border-white/10">
              <div className="grid size-12 place-items-center rounded-xl bg-zinc-100 text-zinc-400 dark:bg-white/[.05] dark:text-zinc-500">
                <CalendarClock size={21} />
              </div>
              <p className="mt-3 max-w-[440px] text-xs leading-5 text-zinc-500">
                还没有计划。上面的表单会写入与插件相同的数据（localStorage），到点由插件轮询投递进会话。
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {automations.map((automation) => (
                <article
                  key={automation.id}
                  className="flex items-start gap-3 rounded-xl border border-zinc-200 p-4 dark:border-white/10"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-500">
                    <Clock3 size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold">{automation.title}</h3>
                      <span className="rounded bg-black/[.04] px-1.5 py-0.5 text-[9px] text-zinc-500 dark:bg-white/[.06]">
                        {typeLabels[automation.type]} · {automation.expression}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                      {automation.content}
                    </p>
                    {automation.lastCheckedAt && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-500">
                        <CheckCircle2 size={11} />
                        最近检查：{new Date(automation.lastCheckedAt).toLocaleTimeString('zh-CN')}
                      </div>
                    )}
                  </div>
                  <Switch
                    checked={automation.enabled}
                    onChange={(enabled) => updateAutomation(automation.id, { enabled })}
                    label={`启用自动化 ${automation.title}`}
                  />
                  <button
                    type="button"
                    aria-label={`删除自动化 ${automation.title}`}
                    onClick={() => removeAutomation(automation.id)}
                    className="grid size-8 place-items-center rounded-lg text-zinc-400 hover:bg-rose-500/10 hover:text-rose-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </article>
              ))}
            </div>
          )}
          <div className="mt-5 rounded-lg border border-zinc-200 px-3 py-2.5 text-[10px] text-zinc-500 dark:border-white/10">
            默认上限 20 条（可在「插件 → 自动化任务」调整）。
          </div>
        </section>
      </div>
    </main>
  );
}

