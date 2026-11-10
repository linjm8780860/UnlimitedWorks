'use client';

import {
  ArrowUp,
  Bot,
  Brain,
  ChevronDown,
  FileUp,
  FolderOpen,
  Paperclip,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import {
  accessModeCopy,
  agentModeCopy,
  reasoningCopy,
} from '@/features/chat/chat-constants';
import { MenuItem, Popover } from '@/components/ui/popover';
import { chatModels, chatProviders } from '@/lib/catalog';
import type { AgentMode, AccessMode, ReasoningLevel } from '@/lib/types';
import { useChatStore } from '@/features/chat/chat-store';
import { useWorkspaceStore } from '@/features/workspace/workspace-store';
import { useShellStore } from '@/features/app-shell/shell-store';

const providerIcons: Record<string, string> = {
  DeepSeek: '/icons/providers/deepseek.svg',
  OpenAI: '/icons/providers/openai.svg',
  Google: '/icons/providers/google.svg',
  ByteDance: '/icons/providers/volcengine.svg',
  Kimi: '/icons/providers/kimi.svg',
  Anthropic: '/icons/providers/claude.svg',
  Xiaomi: '/icons/providers/xiaomimimo.svg',
  xAI: '/icons/providers/grok.svg',
};

const suggestions = [
  '体验 Plan 模式一起设计故事',
  '梳理这个项目的创作脉络',
  '讲清这个项目的创作思路',
  '帮我按我的风格继续创作',
];

export function Composer({
  value,
  onChange,
  onSend,
  onOpenSkills,
  disabled = false,
  compact = false,
  placeholder = '随心输入',
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onOpenSkills?: () => void;
  disabled?: boolean;
  compact?: boolean;
  placeholder?: string;
}) {
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const selectedWorkspaceId = useWorkspaceStore((state) => state.selectedWorkspaceId);
  const setSelectedWorkspaceId = useWorkspaceStore(
    (state) => state.setSelectedWorkspaceId,
  );
  const projects = useWorkspaceStore((state) => state.projects);
  const agentMode = useChatStore((state) => state.agentMode);
  const setAgentMode = useChatStore((state) => state.setAgentMode);
  const accessMode = useChatStore((state) => state.accessMode);
  const setAccessMode = useChatStore((state) => state.setAccessMode);
  const reasoning = useChatStore((state) => state.reasoning);
  const setReasoning = useChatStore((state) => state.setReasoning);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const setSelectedModel = useChatStore((state) => state.setSelectedModel);
  const openWorkspaceDialog = useShellStore((state) => state.openWorkspaceDialog);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [accessOpen, setAccessOpen] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [providerTab, setProviderTab] = useState(
    chatProviders.find((provider) => provider.models.some((model) => model.name === selectedModel))
      ?.provider ?? chatProviders[0]?.provider,
  );
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId);
  const selectedProject = projects.find((project) => project.id === selectedWorkspaceId);
  const modeCopy = agentModeCopy[agentMode];
  const provider = chatProviders.find((item) => item.provider === providerTab) ?? chatProviders[0];
  const currentSuggestion = suggestions[suggestionIndex % suggestions.length];
  const sendDisabled = disabled || !value.trim();

  const providerCounts = useMemo(
    () =>
      chatProviders.map((item) => ({
        provider: item.provider,
        count: item.models.length,
      })),
    [],
  );

  const applySuggestion = () => {
    setSuggestionIndex((current) => (current + 1) % suggestions.length);
    onChange(currentSuggestion);
    textareaRef.current?.focus();
  };

  return (
    <div className={compact ? 'w-full' : 'w-full'}>
      <div className={`flex min-w-0 items-center gap-2 px-1 ${compact ? 'mb-1.5' : 'mb-2'}`}>
        <Popover
          open={workspaceOpen}
          onClose={() => setWorkspaceOpen(false)}
          className="w-[248px]"
          trigger={
            <button
              type="button"
              title="选择工作区"
              aria-expanded={workspaceOpen}
              onClick={() => setWorkspaceOpen((current) => !current)}
              className="inline-flex h-7 min-w-0 max-w-[220px] items-center gap-1 rounded-lg px-2 text-[13px] font-medium leading-5 text-zinc-700 transition-colors hover:bg-black/[.05] dark:text-zinc-200 dark:hover:bg-white/[.10]"
            >
              <span className="truncate">{selectedWorkspace?.name ?? selectedProject?.name ?? '未选择工作区'}</span>
              <ChevronDown size={13} className="shrink-0 opacity-55" />
            </button>
          }
        >
          <div className="px-2.5 pb-2 pt-1">
            <div className="text-xs font-semibold">选择工作区</div>
            <div className="mt-0.5 text-[11px] text-zinc-500">Agent 的文件访问范围会限制在工作区内。</div>
          </div>
          {workspaces.length === 0 && (
            <div className="px-2.5 py-2 text-xs text-zinc-500">
              还没有工作区，先添加一个工程目录。
            </div>
          )}
          {workspaces.map((workspace) => (
            <MenuItem
              key={workspace.id}
              title={workspace.name}
              description={workspace.path}
              selected={selectedWorkspaceId === workspace.id}
              icon={<FolderOpen size={15} />}
              onClick={() => {
                setSelectedWorkspaceId(workspace.id);
                setWorkspaceOpen(false);
              }}
            />
          ))}
          <MenuItem
            title="添加工作区…"
            icon={<Paperclip size={15} />}
            onClick={() => {
              setWorkspaceOpen(false);
              openWorkspaceDialog();
            }}
          />
        </Popover>

        <Popover
          open={modeOpen}
          onClose={() => setModeOpen(false)}
          className="w-[372px]"
          trigger={
            <button
              type="button"
              title={modeCopy.description}
              aria-expanded={modeOpen}
              onClick={() => setModeOpen((current) => !current)}
              className="inline-flex h-7 min-w-0 max-w-[200px] items-center gap-1 rounded-lg px-2 text-[13px] font-medium leading-5 text-zinc-700 transition-colors hover:bg-black/[.05] dark:text-zinc-200 dark:hover:bg-white/[.10]"
            >
              <span className="truncate">{modeCopy.label}</span>
              <ChevronDown size={13} className="shrink-0 opacity-55" />
            </button>
          }
        >
          <div className="px-2.5 pb-1.5 pt-1 text-[11px] text-zinc-500">
            选择 Agent 的工具和工作方式
          </div>
          {(Object.keys(agentModeCopy) as AgentMode[]).map((mode) => (
            <MenuItem
              key={mode}
              title={
                <>
                  {agentModeCopy[mode].label}
                  {mode === 'standard' && (
                    <span className="text-[10px] font-normal text-blue-500">新任务默认</span>
                  )}
                </>
              }
              description={agentModeCopy[mode].description}
              selected={agentMode === mode}
              icon={<Bot size={16} />}
              onClick={() => {
                setAgentMode(mode);
                setModeOpen(false);
              }}
            />
          ))}
          <div className="my-1.5 h-px bg-black/5 dark:bg-white/10" />
          <MenuItem title="设为新任务默认" icon={<Sparkles size={15} />} />
          <div className="px-2.5 pb-1 pt-1 text-[10px] text-zinc-400">
            本任务的 Agent 预设，在任务开始时确定
          </div>
        </Popover>
      </div>

      <div className="rounded-[24px] bg-zinc-100 p-1 dark:bg-white/[.06]">
        <div className="relative rounded-2xl border border-zinc-200 bg-white text-zinc-900 shadow-[0_5px_10px_rgba(0,0,0,0.06)] dark:border-white/10 dark:bg-[#1a1a1c] dark:text-zinc-100">
          <div
            role="separator"
            aria-label="调节输入区高度"
            className="absolute inset-x-3 top-0 z-10 h-3 -translate-y-1/2 cursor-row-resize touch-none select-none"
          />
          <div className="relative">
            {!value && (
              <button
                type="button"
                aria-label={`使用创作建议：${currentSuggestion}`}
                onClick={applySuggestion}
                className="absolute left-3 top-3 max-w-[calc(100%-24px)] truncate text-left text-sm font-normal leading-5 tracking-tight text-zinc-400 transition-colors hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-white/80"
              >
                {currentSuggestion}
                <span className="ml-0.5 animate-pulse">_</span>
              </button>
            )}
            <textarea
              ref={textareaRef}
              aria-label="消息输入"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !sendDisabled) {
                  event.preventDefault();
                  onSend();
                }
              }}
              placeholder={value ? placeholder : ''}
              className={`block w-full resize-none bg-transparent px-3 pt-3 text-sm leading-5 outline-none placeholder:text-zinc-400 ${
                compact ? 'h-[86px]' : 'h-[72px]'
              }`}
            />
          </div>
          <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 px-2 pb-2">
            <div className="flex min-w-0 items-center gap-1">
              <Popover
                open={contextOpen}
                onClose={() => setContextOpen(false)}
                className="w-[180px]"
                trigger={
                  <button
                    type="button"
                    title="添加上下文"
                    aria-expanded={contextOpen}
                    onClick={() => setContextOpen((current) => !current)}
                    className="grid h-[26px] w-[26px] place-items-center rounded-full text-zinc-500 hover:bg-black/[.06] dark:hover:bg-white/[0.08]"
                  >
                    <Paperclip size={14} />
                  </button>
                }
              >
                <MenuItem
                  title="上传附件"
                  icon={<FileUp size={15} />}
                  onClick={() => {
                    setContextOpen(false);
                    fileRef.current?.click();
                  }}
                />
                <MenuItem
                  title="技能"
                  icon={<Sparkles size={15} />}
                  onClick={() => {
                    setContextOpen(false);
                    onOpenSkills?.();
                  }}
                />
              </Popover>
              <input
                ref={fileRef}
                type="file"
                aria-label="上传创作附件"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    onChange(`${value}${value ? ' ' : ''}[附件：${file.name}]`);
                  }
                  event.target.value = '';
                }}
              />
              <Popover
                open={accessOpen}
                onClose={() => setAccessOpen(false)}
                className="w-[190px]"
                trigger={
                  <button
                    type="button"
                    aria-label={`访问模式，当前：${accessModeCopy[accessMode]}`}
                    onClick={() => setAccessOpen((current) => !current)}
                    className="flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] text-zinc-500 transition-colors hover:bg-black/[.06] hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.07] dark:hover:text-zinc-100"
                  >
                    <ShieldCheck size={13} />
                    {accessModeCopy[accessMode]}
                  </button>
                }
              >
                {(Object.keys(accessModeCopy) as AccessMode[]).map((mode) => (
                  <MenuItem
                    key={mode}
                    title={accessModeCopy[mode]}
                    selected={accessMode === mode}
                    onClick={() => {
                      setAccessMode(mode);
                      setAccessOpen(false);
                    }}
                  />
                ))}
              </Popover>
              <Popover
                open={reasoningOpen}
                onClose={() => setReasoningOpen(false)}
                className="w-[160px]"
                trigger={
                  <button
                    type="button"
                    title="思考强度"
                    onClick={() => setReasoningOpen((current) => !current)}
                    className="flex h-7 items-center gap-1 rounded-md px-2 text-[11px] text-zinc-500 hover:bg-black/[.06] hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.07] dark:hover:text-zinc-200"
                  >
                    <Brain size={13} />
                    {reasoningCopy[reasoning]}
                  </button>
                }
              >
                {(Object.keys(reasoningCopy) as ReasoningLevel[]).map((level) => (
                  <MenuItem
                    key={level}
                    title={reasoningCopy[level]}
                    selected={reasoning === level}
                    onClick={() => {
                      setReasoning(level);
                      setReasoningOpen(false);
                    }}
                  />
                ))}
              </Popover>
            </div>
            <div className="flex min-w-0 items-center gap-1">
              <Popover
                open={modelOpen}
                onClose={() => setModelOpen(false)}
                align="right"
                className="w-[440px] p-0"
                trigger={
                  <button
                    type="button"
                    title="选择模型"
                    aria-expanded={modelOpen}
                    onClick={() => setModelOpen((current) => !current)}
                    className="flex h-7 max-w-[min(360px,45cqw)] items-center gap-1 rounded-full px-2 text-[13px] font-medium leading-5 text-zinc-500 hover:bg-black/[.06] hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/[0.07] dark:hover:text-zinc-200"
                  >
                    <span className="max-w-[180px] truncate">{selectedModel}</span>
                    <ChevronDown size={13} className="shrink-0 opacity-55" />
                  </button>
                }
              >
                <div className="grid max-h-[460px] grid-cols-[140px_1fr] overflow-hidden">
                  <div className="max-h-[460px] overflow-y-auto border-r border-zinc-200/70 p-1.5 dark:border-white/10">
                    {providerCounts.map((item) => (
                      <button
                        key={item.provider}
                        type="button"
                        onClick={() => setProviderTab(item.provider)}
                        className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors ${
                          providerTab === item.provider
                            ? 'bg-black/[.06] text-zinc-950 dark:bg-white/10 dark:text-white'
                            : 'text-zinc-500 hover:bg-black/[.04] dark:hover:bg-white/[.05]'
                        }`}
                      >
                        {providerIcons[item.provider] ? (
                          <img
                            src={providerIcons[item.provider]}
                            alt=""
                            className="size-4 object-contain"
                          />
                        ) : (
                          <Bot size={14} />
                        )}
                        <span className="min-w-0 flex-1 truncate">{item.provider}</span>
                        <span className="text-[10px] text-zinc-400">{item.count}</span>
                      </button>
                    ))}
                  </div>
                  <div className="max-h-[460px] overflow-y-auto p-1.5">
                    {provider?.models.map((model) => (
                      <MenuItem
                        key={model.id}
                        title={model.name}
                        description={`${model.provider} · ${model.modelName}`}
                        selected={selectedModel === model.name}
                        onClick={() => {
                          setSelectedModel(model.name);
                          setModelOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="border-t border-zinc-200/70 px-2.5 py-2 text-[10px] text-zinc-400 dark:border-white/10">
                  共 {chatModels.length} 个可用文本模型
                </div>
              </Popover>
              <button
                type="button"
                aria-label="发送"
                title={
                  !selectedWorkspace && !selectedProject ? '发送前选择项目文件夹' : undefined
                }
                disabled={sendDisabled}
                onClick={onSend}
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${
                  sendDisabled
                    ? 'cursor-not-allowed bg-black/10 text-white/45 opacity-40 dark:bg-white/10'
                    : 'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200'
                }`}
              >
                <ArrowUp size={15} />
              </button>
            </div>
          </div>
        </div>
        {!compact && (
        <div className="flex flex-wrap items-center gap-1 px-1 pt-1">
          <button
            type="button"
            onClick={onOpenSkills}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-zinc-500 transition-colors hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5"
          >
            <Sparkles size={14} />
            探索技能
          </button>
          <span className="ml-auto truncate px-2 text-[11px] text-zinc-400">
            {selectedWorkspace || selectedProject ? '' : '发送前选择项目文件夹'}
          </span>
        </div>
        )}
      </div>
    </div>
  );
}

