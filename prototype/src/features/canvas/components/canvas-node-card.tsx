'use client';

import {
  AudioLines,
  Box,
  Check,
  ChevronDown,
  Clapperboard,
  Film,
  Image as ImageIcon,
  LoaderCircle,
  Lock,
  PanelTop,
  Play,
  Plus,
  Route,
  Settings2,
  Signpost,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { useState } from 'react';
import { audioModels, chatModels, imageModels, videoModels } from '@/lib/catalog';
import type { AssetItem, CanvasNode, CanvasNodeType } from '@/lib/types';
import { useCanvasTransientStore } from '../canvas-transient-store';

const iconByType: Record<CanvasNodeType, typeof Terminal> = {
  'image-input': ImageIcon,
  'video-input': Film,
  'audio-input': AudioLines,
  text: Terminal,
  'image-gen': ImageIcon,
  'video-gen': Clapperboard,
  'audio-gen': AudioLines,
  '3d-gen': Box,
  stage: Clapperboard,
  'named-route-decl': Route,
  'named-route-ref': Signpost,
  filmboard: PanelTop,
};

const textColorByType: Record<CanvasNodeType, string> = {
  'image-input': 'text-emerald-400',
  'video-input': 'text-violet-400',
  'audio-input': 'text-cyan-400',
  text: 'text-emerald-400',
  'image-gen': 'text-violet-400',
  'video-gen': 'text-rose-400',
  'audio-gen': 'text-cyan-400',
  '3d-gen': 'text-blue-400',
  stage: 'text-orange-400',
  'named-route-decl': 'text-indigo-400',
  'named-route-ref': 'text-purple-400',
  filmboard: 'text-amber-400',
};

const selectedRingByType: Record<CanvasNodeType, string> = {
  'image-input': 'border-emerald-500 ring-1 ring-emerald-500',
  'video-input': 'border-violet-500 ring-1 ring-violet-500',
  'audio-input': 'border-cyan-500 ring-1 ring-cyan-500',
  text: 'border-emerald-500 ring-1 ring-emerald-500',
  'image-gen': 'border-violet-500 ring-1 ring-violet-500',
  'video-gen': 'border-rose-500 ring-1 ring-rose-500',
  'audio-gen': 'border-cyan-500 ring-1 ring-cyan-500',
  '3d-gen': 'border-blue-500 ring-1 ring-blue-500',
  stage: 'border-orange-500 ring-1 ring-orange-500',
  'named-route-decl': 'border-indigo-500 ring-1 ring-indigo-500',
  'named-route-ref': 'border-purple-500 ring-1 ring-purple-500',
  filmboard: 'border-amber-500 ring-1 ring-amber-500',
};

const glowColorByType: Record<CanvasNodeType, string> = {
  'image-input': 'rgba(16,185,129,.24)',
  'video-input': 'rgba(139,92,246,.26)',
  'audio-input': 'rgba(6,182,212,.22)',
  text: 'rgba(16,185,129,.2)',
  'image-gen': 'rgba(139,92,246,.26)',
  'video-gen': 'rgba(244,63,94,.22)',
  'audio-gen': 'rgba(6,182,212,.22)',
  '3d-gen': 'rgba(59,130,246,.22)',
  stage: 'rgba(249,115,22,.22)',
  'named-route-decl': 'rgba(99,102,241,.22)',
  'named-route-ref': 'rgba(168,85,247,.22)',
  filmboard: 'rgba(245,158,11,.22)',
};

export type CanvasNodeCardProps = {
  node: CanvasNode;
  selected: boolean;
  showActions: boolean;
  connecting: boolean;
  onHeaderPointerDown: (event: React.PointerEvent) => void;
  onSelect: () => void;
  onUpdate: (patch: Partial<CanvasNode>) => void;
  onRun: () => void;
  onInputPort: () => void;
  onOutputPort: () => void;
  onResize: (event: React.PointerEvent, edge: 'right' | 'bottom' | 'corner') => void;
  assets: AssetItem[];
  onUploadAsset: (file: File) => void;
};

export function CanvasNodeCard({
  node,
  selected,
  showActions,
  connecting,
  onHeaderPointerDown,
  onSelect,
  onUpdate,
  onRun,
  onInputPort,
  onOutputPort,
  onResize,
  assets,
  onUploadAsset,
}: CanvasNodeCardProps) {
  const Icon = iconByType[node.type];
  const [editing, setEditing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const transientGeometry = useCanvasTransientStore(
    (state) => state.geometryByNodeId[node.id],
  );
  const asset = assets.find((item) => item.id === node.assetId);
  const modelOptions =
    node.type === 'image-gen' || node.type === 'image-input'
      ? imageModels.map((model) => model.displayName)
      : node.type === 'video-gen' || node.type === 'video-input'
        ? videoModels.map((model) => model.displayName)
        : node.type === 'audio-gen' || node.type === 'audio-input'
          ? audioModels.map((model) => model.displayName)
          : chatModels.map((model) => model.name);

  return (
    <div
      data-canvas-node-id={node.id}
      className="relative touch-none overflow-visible cursor-grab active:cursor-grabbing"
      style={{
        position: 'absolute',
        left: transientGeometry?.x ?? node.x,
        top: transientGeometry?.y ?? node.y,
        width: transientGeometry?.width ?? node.width,
        height: transientGeometry?.height ?? node.height,
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
        const target = event.target as HTMLElement;
        if (
          target.closest('button,input,textarea,select,a,label,[data-node-no-drag="1"]')
        ) {
          return;
        }
        onHeaderPointerDown(event);
      }}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      {selected && (
        <div
          className="pointer-events-none absolute -inset-0.5 -z-10 rounded-[14px] blur-[10px]"
          style={{ background: glowColorByType[node.type], transform: 'scale(1.05)' }}
        />
      )}

      <div
        className={`absolute -left-8 top-1/2 z-[60] grid size-6 -translate-y-1/2 place-items-center rounded-full border border-zinc-500 bg-black text-zinc-500 shadow-sm transition-colors hover:border-zinc-300 hover:text-white ${connecting ? 'ring-2 ring-violet-500' : ''}`}
        data-node-no-drag="1"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onInputPort();
        }}
        title="输入端口"
      >
        <Plus size={10} />
      </div>
      <div
        className={`absolute -right-8 top-1/2 z-[60] grid size-6 -translate-y-1/2 place-items-center rounded-full border border-zinc-500 bg-black text-purple-400 shadow-sm transition-colors hover:border-purple-400 hover:text-purple-300 ${connecting ? 'ring-2 ring-violet-500' : ''}`}
        data-node-no-drag="1"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onOutputPort();
        }}
        title="输出端口"
      >
        <Plus size={10} />
      </div>
      <div
        className="absolute -top-7 left-0 z-[70] flex cursor-grab items-center gap-2 select-none opacity-70 transition-opacity hover:opacity-100 active:cursor-grabbing"
        data-canvas-node-drag-handle={node.id}
        data-node-no-drag="1"
        onPointerDown={onHeaderPointerDown}
      >
        <Icon size={14} className={textColorByType[node.type]} />
        <span
          className="max-w-[220px] truncate text-[11px] font-bold tracking-wide text-white/90"
          onDoubleClick={(event) => {
            event.stopPropagation();
            const title = window.prompt('节点名称', node.title);
            if (title?.trim()) onUpdate({ title: title.trim() });
          }}
        >
          {node.title}
        </span>
      </div>
      <div
        className={`relative z-10 flex h-full w-full flex-col overflow-hidden rounded-xl border bg-white shadow-2xl dark:bg-[#141414] ${
          selected ? selectedRingByType[node.type] : 'border-zinc-200 dark:border-white/10'
        }`}
      >
        <NodeBody
          node={node}
          editing={editing}
          onEditing={setEditing}
          onUpdate={onUpdate}
          asset={asset}
          onUploadAsset={onUploadAsset}
        />
      </div>

      {selected && showActions && (
        <>
          <div
            data-node-no-drag="1"
            className="absolute -right-1 top-1/2 z-[90] h-10 w-2 -translate-y-1/2 cursor-ew-resize rounded-full bg-emerald-500/30 hover:bg-emerald-500/60"
            onPointerDown={(event) => onResize(event, 'right')}
          />
          <div
            data-node-no-drag="1"
            className="absolute -bottom-1 left-1/2 z-[90] h-2 w-10 -translate-x-1/2 cursor-ns-resize rounded-full bg-emerald-500/30 hover:bg-emerald-500/60"
            onPointerDown={(event) => onResize(event, 'bottom')}
          />
          <div
            data-node-no-drag="1"
            className="absolute bottom-1 right-1 z-[90] grid size-4 cursor-nwse-resize place-items-end p-0.5 text-zinc-500"
            onPointerDown={(event) => onResize(event, 'corner')}
          >
            <span className="block size-[6px] border-b-2 border-r-2 border-current" />
          </div>
        </>
      )}

      {selected && showActions && (
        <div
          data-node-no-drag="1"
          className="absolute left-1/2 top-full z-[80] mt-4 w-[360px] -translate-x-1/2 overflow-visible rounded-xl border border-zinc-200 bg-white/95 text-zinc-900 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1d1d20]/95 dark:text-zinc-100"
        >
          <div className="p-3">
            <textarea
              value={node.prompt}
              onChange={(event) => onUpdate({ prompt: event.target.value })}
              placeholder={
                node.type === 'text'
                  ? '在此输入文本生成提示词'
                  : "Type '/' for commands or ask AI..."
              }
              className="h-[82px] w-full resize-none rounded-lg border border-zinc-200 bg-zinc-50 p-2.5 text-xs leading-5 outline-none focus:border-zinc-300 dark:border-white/10 dark:bg-white/[.035]"
            />
          </div>
          {settingsOpen && (
            <div className="grid grid-cols-2 gap-2 border-t border-zinc-200 p-3 dark:border-white/10">
              <NodeSettingField
                label="节点名称"
                value={node.title}
                onChange={(value) => onUpdate({ title: value })}
              />
              <NodeSettingField
                label="模型"
                value={node.model}
                onChange={(value) => onUpdate({ model: value })}
              />
              <NodeSettingField
                label="宽度"
                value={String(Math.round(node.width))}
                inputMode="numeric"
                onChange={(value) => onUpdate({ width: Math.max(220, Number(value)) })}
              />
              <NodeSettingField
                label="高度"
                value={String(Math.round(node.height))}
                inputMode="numeric"
                onChange={(value) => onUpdate({ height: Math.max(140, Number(value)) })}
              />
            </div>
          )}
          <div className="flex h-[46px] items-center gap-2 rounded-b-xl border-t border-zinc-200 bg-zinc-50/80 px-3 dark:border-white/10 dark:bg-white/[.035]">
            <button
              type="button"
              onClick={() => {
                const index = modelOptions.indexOf(node.model);
                const next = modelOptions[(index + 1 + modelOptions.length) % modelOptions.length];
                if (next) onUpdate({ model: next });
              }}
              title="切换模型"
              className="inline-flex max-w-[155px] items-center gap-1 truncate rounded-full border border-zinc-200 bg-white px-2 py-1 text-[10px] text-zinc-600 dark:border-white/10 dark:bg-white/[.05] dark:text-zinc-300"
            >
              <Sparkles size={10} className="text-amber-500" />
              <span className="truncate">{node.model}</span>
              <ChevronDown size={10} />
            </button>
            {node.type === 'text' && (
              <button
                type="button"
                onClick={() => onUpdate({ fixedText: !node.fixedText })}
                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] ${
                  node.fixedText
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <Lock size={10} />
                固定文本
              </button>
            )}
            <button
              type="button"
              title="Prompt Tool 设置"
              onClick={() => setSettingsOpen((current) => !current)}
              className="ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <Settings2 size={11} />
              设置
            </button>
            <button
              type="button"
              className="inline-flex h-7 items-center gap-1 rounded-md bg-zinc-900 px-2.5 text-[10px] font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
              disabled={node.status === 'running'}
              onClick={onRun}
              title="运行节点"
            >
              {node.status === 'running' ? (
                <LoaderCircle size={11} className="animate-spin" />
              ) : (
                <Play size={10} />
              )}
              RUN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NodeSettingField({
  label,
  value,
  onChange,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: 'numeric';
}) {
  return (
    <label>
      <span className="mb-1 block text-[9px] text-zinc-500">{label}</span>
      <input
        aria-label={label}
        value={value}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 w-full rounded-md border border-zinc-200 bg-white px-2 text-[10px] dark:border-white/10 dark:bg-white/[.04]"
      />
    </label>
  );
}

function NodeBody({
  node,
  editing,
  onEditing,
  onUpdate,
  asset,
  onUploadAsset,
}: {
  node: CanvasNode;
  editing: boolean;
  onEditing: (editing: boolean) => void;
  onUpdate: (patch: Partial<CanvasNode>) => void;
  asset?: AssetItem;
  onUploadAsset: (file: File) => void;
}) {
  if (node.type === 'text') {
    return (
      <div
        className="min-h-0 flex-1 overflow-hidden p-4"
        onDoubleClick={() => onEditing(true)}
      >
        {editing ? (
          <textarea
            autoFocus
            value={node.content}
            onChange={(event) => onUpdate({ content: event.target.value })}
            onBlur={() => onEditing(false)}
            className="h-full w-full resize-none rounded-lg border border-zinc-200 bg-white p-2 font-mono text-xs leading-5 outline-none dark:border-white/10 dark:bg-white/[.03]"
            placeholder="Double click to edit Markdown..."
          />
        ) : (
          <div className="h-full overflow-auto whitespace-pre-wrap font-mono text-xs leading-5 text-zinc-500">
            {node.content || 'Double click to edit Markdown...'}
          </div>
        )}
      </div>
    );
  }

  if (
    node.type === 'image-input' ||
    node.type === 'video-input' ||
    node.type === 'audio-input'
  ) {
    return (
      <div className="min-h-0 flex-1 p-4">
        {asset ? (
          <AssetPreview asset={asset} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-zinc-600">
            {node.type === 'image-input' ? (
              <ImageIcon size={32} />
            ) : node.type === 'video-input' ? (
              <Film size={32} />
            ) : (
              <AudioLines size={32} />
            )}
            <label className="cursor-pointer rounded-lg bg-white/5 px-3 py-1.5 text-[10px] font-bold text-zinc-200 transition-colors hover:bg-white/10">
              {node.type === 'image-input'
                ? '选择图片'
                : node.type === 'video-input'
                  ? '选择视频'
                  : '选择音频'}
              <input
                type="file"
                accept={
                  node.type === 'image-input'
                    ? 'image/*'
                    : node.type === 'video-input'
                      ? 'video/*,image/gif,audio/*'
                      : 'audio/*'
                }
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onUploadAsset(file);
                }}
              />
            </label>
            <div className="text-[10px] text-zinc-600">
              {node.type === 'image-input'
                ? '或拖拽图片到此处'
                : node.type === 'video-input'
                  ? '或拖拽视频到此处'
                  : '或拖拽音频到此处'}
            </div>
            <span className="text-xs uppercase tracking-widest">
              {node.type === 'image-input'
                ? 'NO IMAGE'
                : node.type === 'video-input'
                  ? 'NO VIDEO'
                  : 'NO AUDIO'}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (node.type === 'stage') {
    return (
      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#26262b]">
        <div className="absolute inset-0 uw-stage-grid opacity-50" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white/50">
          <Box size={34} className="mx-auto" />
          <div className="mt-2 text-[10px]">3D Scene</div>
        </div>
      </div>
    );
  }

  if (node.type === 'filmboard') {
    return (
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-1.5 p-2.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-[10px] text-zinc-400 dark:border-white/10 dark:bg-white/[.03]"
          >
            镜头 {index + 1}
          </div>
        ))}
      </div>
    );
  }

  if (node.type === 'named-route-decl' || node.type === 'named-route-ref') {
    return (
      <div className="min-h-0 flex-1 p-3">
        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/[.06] p-3">
          <div className="text-[10px] font-medium uppercase tracking-wide text-indigo-500">
            {node.type === 'named-route-decl' ? 'Route declaration' : 'Route reference'}
          </div>
          <div className="mt-2 font-mono text-xs text-zinc-700 dark:text-zinc-300">
            {node.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 p-4">
      {asset?.kind === 'image' ? (
        <div className="relative h-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-white/[.03]">
          <img src={asset.dataUrl} alt={asset.name} className="h-full w-full object-cover" />
          <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[9px] text-white backdrop-blur">
            <Check size={10} />
            生成完成
          </div>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/80 text-center dark:border-white/10 dark:bg-white/[.025]">
          <Sparkles size={24} className="text-zinc-300 dark:text-zinc-600" />
          <div className="mt-2 text-xs text-zinc-500">
            {node.status === 'running'
              ? '正在生成…'
              : node.status === 'complete'
                ? node.content
                : '运行节点后在此查看生成结果'}
          </div>
        </div>
      )}
    </div>
  );
}

function AssetPreview({ asset }: { asset: AssetItem }) {
  return (
    <div className="flex h-full min-h-28 flex-col overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/[.03]">
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        {asset.kind === 'image' ? (
          <img src={asset.dataUrl} alt={asset.name} className="h-full w-full object-contain" />
        ) : asset.kind === 'video' ? (
          <video src={asset.dataUrl} controls className="h-full w-full object-contain" />
        ) : asset.kind === 'audio' ? (
          <audio src={asset.dataUrl} controls className="w-full px-3" />
        ) : (
          <Box size={28} className="text-zinc-400" />
        )}
      </div>
      <div className="truncate border-t border-zinc-200 px-2 py-1.5 text-[10px] text-zinc-500 dark:border-white/10">
        {asset.name}
      </div>
    </div>
  );
}

