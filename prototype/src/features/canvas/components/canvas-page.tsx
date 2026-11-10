'use client';

import {
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
  AudioLines,
  Box,
  CircleHelp,
  Clapperboard,
  Copy,
  ExternalLink,
  Film,
  Hand,
  Image as ImageIcon,
  Map as MapIcon,
  MessageSquare,
  MousePointer2,
  Package,
  PanelTop,
  Plus,
  Route,
  Save,
  Settings2,
  Signpost,
  Terminal,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Modal } from '@/components/ui/modal';
import { createId } from '@/lib/id';
import type {
  AssetItem,
  CanvasDocument,
  CanvasNode,
  CanvasNodeType,
  CanvasWorkspace,
} from '@/lib/types';
import { useShellStore } from '@/features/app-shell/shell-store';
import { useAssetStore } from '@/features/assets/asset-store';
import { createAssetFromFile } from '@/features/assets/asset-service';
import { useChatSender } from '@/features/chat/chat-service';
import { useChatStore } from '@/features/chat/chat-store';
import { useSettingsStore } from '@/features/settings/settings-store';
import {
  nodeTypeCatalog,
} from '../domain/canvas-document';
import { CanvasNodeCard } from '@/features/canvas/components/canvas-node-card';
import { CanvasHud } from '@/features/canvas/components/canvas-hud';
import { CanvasAlignmentGuides } from '@/features/canvas/components/canvas-alignment-guides';
import {
  AssetPanel,
  CanvasToolButton,
  CopilotPanel,
  Minimap,
  ProjectPanel,
  SavePanel,
} from '@/features/canvas/components/canvas-panels';
import { useCanvasDocuments } from '@/features/canvas/use-canvas-documents';
import { useCanvasInteractions } from '@/features/canvas/use-canvas-interactions';
import { useCanvasNodeRunner } from '@/features/canvas/use-canvas-node-runner';
import { useCanvasTransientStore } from '@/features/canvas/canvas-transient-store';

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

const colorByType: Record<CanvasNodeType, string> = {
  'image-input': 'emerald',
  'video-input': 'violet',
  'audio-input': 'cyan',
  text: 'emerald',
  'image-gen': 'violet',
  'video-gen': 'rose',
  'audio-gen': 'cyan',
  '3d-gen': 'blue',
  stage: 'orange',
  'named-route-decl': 'indigo',
  'named-route-ref': 'purple',
  filmboard: 'amber',
};

type ToolPanel = 'assets' | 'chat' | 'project' | 'save' | null;

export function CanvasPage({ projectId }: { projectId?: string }) {
  const pushToast = useShellStore((state) => state.pushToast);
  const createConversation = useChatStore((state) => state.createConversation);
  const activeConversationId = useChatStore((state) => state.activeConversationId);
  const conversations = useChatStore((state) => state.conversations);
  const sendMessage = useChatSender();
  const selectedModel = useChatStore((state) => state.selectedModel);
  const assets = useAssetStore((state) => state.assets);
  const addAsset = useAssetStore((state) => state.addAsset);
  const connectionStyle = useSettingsStore((state) => state.connectionStyle);
  const showMiniMap = useSettingsStore((state) => state.showMiniMap);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const {
    canvasWorkspace,
    setCanvasWorkspace,
    canvasHydrated,
    canvasPersistenceError,
    document,
    tabDocuments,
    setDocument,
    createCanvasDocument,
    closeCanvasDocument,
    undoDocument,
    redoDocument,
    recordCurrentDocument,
    historyPausedRef,
  } = useCanvasDocuments(projectId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toolPanel, setToolPanel] = useState<ToolPanel>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const [shortcutOpen, setShortcutOpen] = useState(false);
  const [showConnections, setShowConnections] = useState(true);
  const [chatDraft, setChatDraft] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const loadCanvasRef = useRef<HTMLInputElement>(null);
  const reportedPersistenceErrorRef = useRef<string | null>(null);
  const {
    menuAt,
    closeMenu,
    selectionBox,
    panning,
    connectingFrom,
    setConnectingFrom,
    onSurfacePointerDown,
    onDoubleClick,
    onWheel,
    onContextMenu,
    startNodeDrag,
    startNodeResize,
    connectTo,
    resetZoom,
    fitView,
    zoomBy,
    alignSelection,
    normalizeSelectedSize,
    duplicateSelected,
    deleteSelected,
  } = useCanvasInteractions({
    document,
    setDocument,
    selectedIds,
    setSelectedIds,
    surfaceRef,
    recordCurrentDocument,
    historyPausedRef,
    undoDocument,
    redoDocument,
    onHelp: () => setHelpOpen(true),
  });

  useEffect(() => {
    if (
      !canvasPersistenceError ||
      reportedPersistenceErrorRef.current === canvasPersistenceError
    ) {
      return;
    }
    reportedPersistenceErrorRef.current = canvasPersistenceError;
    pushToast(canvasPersistenceError, 'error', '画布保存失败');
  }, [canvasPersistenceError, pushToast]);

  useEffect(() => {
    useCanvasTransientStore.getState().reset();
  }, [document.id]);

  const updateNode = useCallback(
    (id: string, patch: Partial<CanvasNode>) => {
      setDocument((current) => ({
        ...current,
        updatedAt: Date.now(),
        nodes: current.nodes.map((node) => (node.id === id ? { ...node, ...patch } : node)),
      }));
    },
    [setDocument],
  );
  const runNode = useCanvasNodeRunner({
    selectedModel,
    updateNode,
    addAsset,
    pushToast,
  });

  const createNode = (type: CanvasNodeType) => {
    if (!menuAt) return;
    const meta = nodeTypeCatalog.find((item) => item.type === type);
    if (!meta) return;
    const node: CanvasNode = {
      id: createId('node'),
      type,
      title: meta.label,
      x: menuAt.worldX,
      y: menuAt.worldY,
      width: meta.width,
      height: meta.height,
      prompt: '',
      content:
        type === 'text'
          ? ''
          : type === 'named-route-decl'
            ? 'route://new-route'
            : type === 'named-route-ref'
              ? 'route://new-route'
              : '',
      model: meta.model,
      status: 'idle',
      fixedText: false,
      createdAt: Date.now(),
    };
    setDocument((current) => ({
      ...current,
      nodes: [...current.nodes, node],
      updatedAt: Date.now(),
    }));
    setSelectedIds([node.id]);
    closeMenu();
  };

  const saveCanvas = () => {
    const save = () => {
      const blob = new Blob(
        [
          JSON.stringify(
            {
              name: document.name,
              nodes: document.nodes,
              edges: document.edges,
              viewport: document.viewport,
              assets: assets.filter((asset) =>
                document.nodes.some((node) => node.assetId === asset.id),
              ),
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
      anchor.download = `${document.name || 'canvas'}.uw.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      pushToast('画布工程已导出。', 'success');
      setToolPanel(null);
    };
    save();
  };

  const saveAllCanvas = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            workspace: canvasWorkspace,
            assets,
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
    anchor.download = 'unlimited-works-tabs.json';
    anchor.click();
    URL.revokeObjectURL(url);
    pushToast(`已导出 ${canvasWorkspace.documents.length} 个画布标签。`, 'success');
  };

  const saveRef = useRef(saveCanvas);
  const saveAllRef = useRef(saveAllCanvas);
  useEffect(() => {
    saveRef.current = saveCanvas;
    saveAllRef.current = saveAllCanvas;
  });
  useEffect(() => {
    const saveShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's') return;
      event.preventDefault();
      if (event.shiftKey) saveAllRef.current();
      else saveRef.current();
    };
    window.addEventListener('keydown', saveShortcut);
    return () => window.removeEventListener('keydown', saveShortcut);
  }, []);

  const sendChat = async () => {
    if (!chatDraft.trim()) return;
    const prompt = chatDraft.trim();
    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = createConversation(prompt.slice(0, 24) || '画布对话').id;
    }
    setChatDraft('');
    const canvasContext = `画布：${document.name}\n节点：${document.nodes
      .map((node) => `${node.title}(${node.type})`)
      .join('、')}\n连线：${document.edges.length}\n请求：${prompt}`;
    await sendMessage({
      conversationId,
      prompt: canvasContext,
      displayPrompt: prompt,
      history: conversations.find((item) => item.id === conversationId)?.messages ?? [],
      systemPrompt:
        '你是 Unlimited Works Copilot。根据用户给出的画布节点和连线，提出可以立即执行的节点增删、参数、提示词和工作流顺序建议。',
      localFallback: `我已经读取当前画布「${document.name}」。当前未配置 API，因此仅使用本地模拟。配置 API 后可以基于 ${document.nodes.length} 个节点和 ${document.edges.length} 条连线进行真实分析。`,
    });
  };

  const conversation = conversations.find((item) => item.id === activeConversationId);

  const ingestAsset = async (file: File, nodeId?: string) => {
    try {
      const asset = await createAssetFromFile(file);
      await addAsset(asset);
      if (nodeId) updateNode(nodeId, { assetId: asset.id, content: asset.name });
      pushToast(`资源「${file.name}」已加入资产库。`, 'success');
    } catch (error) {
      pushToast(error instanceof Error ? error.message : String(error), 'error', '资源过大');
    }
  };

  if (!canvasHydrated) {
    return (
      <main className="uw-canvas-workspace grid h-full place-items-center overflow-hidden bg-[#111113]">
        <div className="rounded-xl border border-white/10 bg-[#1b1b1d] px-4 py-3 text-xs text-zinc-400">
          正在加载画布…
        </div>
      </main>
    );
  }

  return (
    <main className="uw-canvas-workspace relative h-full overflow-hidden">
      <div
        ref={surfaceRef}
        data-canvas-surface="1"
        className={`absolute inset-0 overflow-hidden ${panning ? 'cursor-grabbing' : 'cursor-default'} ${
          document.viewport.zoom < 0.8 ? 'uw-canvas-dots-small' : 'uw-canvas-dots'
        } dark:bg-[#111113] light:bg-[#f4f4f5]`}
        onPointerDown={onSurfacePointerDown}
        onDoubleClick={onDoubleClick}
        onWheel={onWheel}
        onContextMenu={onContextMenu}
      >
        <div
          className="uw-canvas-world absolute left-0 top-0"
          style={{
            width: 8000,
            height: 8000,
            transform: `translate(${document.viewport.x}px, ${document.viewport.y}px) scale(${document.viewport.zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {showConnections && (
            <svg className="pointer-events-none absolute inset-0 z-[20] overflow-visible">
              {document.edges.map((edge) => {
                const from = document.nodes.find((node) => node.id === edge.from);
                const to = document.nodes.find((node) => node.id === edge.to);
                if (!from || !to) return null;
                const x1 = from.x + from.width + 18;
                const y1 = from.y + from.height / 2;
                const x2 = to.x - 18;
                const y2 = to.y + to.height / 2;
                const dx = Math.max(70, Math.abs(x2 - x1) * 0.45);
                const path =
                  connectionStyle === 'straight'
                    ? `M ${x1} ${y1} L ${x2} ${y2}`
                    : connectionStyle === 'orthogonal'
                      ? `M ${x1} ${y1} H ${(x1 + x2) / 2} V ${y2} H ${x2}`
                      : `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
                return (
                  <path
                    key={edge.id}
                    d={path}
                    fill="none"
                    stroke="rgba(113,113,122,.62)"
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
          )}
          {document.nodes.map((node) => (
            <CanvasNodeCard
              key={node.id}
              node={node}
              selected={selectedIds.includes(node.id)}
              showActions={selectedIds.length === 1}
              connecting={connectingFrom === node.id}
              onHeaderPointerDown={(event) => startNodeDrag(event, node)}
              onSelect={() => setSelectedIds([node.id])}
              onUpdate={(patch) => updateNode(node.id, patch)}
              onRun={() => runNode(node)}
              onInputPort={() => connectTo(node.id)}
              onOutputPort={() => setConnectingFrom(node.id)}
              onResize={(event, edge) => startNodeResize(event, node, edge)}
              assets={assets}
              onUploadAsset={(file) => void ingestAsset(file, node.id)}
            />
          ))}
          <CanvasAlignmentGuides />
        </div>

        {selectionBox && (
          <div
            className="pointer-events-none absolute z-[240] rounded-md border border-blue-500/50 bg-blue-500/10"
            style={{
              left: selectionBox.x,
              top: selectionBox.y,
              width: selectionBox.width,
              height: selectionBox.height,
            }}
          />
        )}

        {menuAt && (
          <div
            className="absolute z-[260] grid w-[246px] grid-cols-2 gap-1 rounded-xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-[#1b1b1d]"
            style={{ left: menuAt.x, top: menuAt.y }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            {nodeTypeCatalog.map((item) => {
              const Icon = iconByType[item.type];
              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => createNode(item.type)}
                  className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-left text-[11px] text-zinc-600 transition-colors hover:bg-black/5 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/[.07] dark:hover:text-white"
                >
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-md uw-node-color-${colorByType[item.type]}`}
                  >
                    <Icon size={14} />
                  </span>
                  <span className="min-w-0 flex-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        className="pointer-events-none fixed top-10 z-[100] flex min-w-[188px] max-w-[calc(100vw-var(--uw-sidebar-width)-24px)] items-center gap-1.5 rounded-full border border-zinc-200 bg-white/95 px-2.5 py-1 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1b1b1d]/95"
        style={{ left: 'calc(var(--uw-sidebar-width) + 12px)' }}
      >
        <img src="/logo_dark.ico" alt="" className="size-8" />
        <div className="pointer-events-auto flex min-w-0 items-center gap-1 overflow-x-auto">
          {tabDocuments.map((canvasDocument) => {
            const active = canvasDocument.id === document.id;
            return (
              <div
                key={canvasDocument.id}
                className={`group flex h-8 shrink-0 items-center rounded-lg pr-0.5 transition-colors ${
                  active
                    ? 'bg-black/[.055] dark:bg-white/[.08]'
                    : 'hover:bg-black/[.035] dark:hover:bg-white/[.05]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setCanvasWorkspace((current) => ({
                      ...current,
                      activeDocumentId: canvasDocument.id,
                    }));
                    setSelectedIds([]);
                  }}
                  onDoubleClick={() => {
                    const name = window.prompt('工程名称', canvasDocument.name);
                    if (name?.trim()) {
                      setCanvasWorkspace((current) => ({
                        ...current,
                        documents: current.documents.map((item) =>
                          item.id === canvasDocument.id
                            ? { ...item, name: name.trim(), updatedAt: Date.now() }
                            : item,
                        ),
                      }));
                    }
                  }}
                  className="flex h-8 max-w-[170px] items-center gap-1.5 px-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                  title="双击重命名"
                >
                  <span className="size-2 rounded-full bg-orange-400" />
                  <span className="max-w-[130px] truncate">{canvasDocument.name}</span>
                  {active && (
                    <span className="text-[9px] text-zinc-400">
                      {canvasDocument.nodes.length}
                    </span>
                  )}
                </button>
                {tabDocuments.length > 1 && (
                  <button
                    type="button"
                    aria-label={`关闭标签 ${canvasDocument.name}`}
                    onClick={() => closeCanvasDocument(canvasDocument.id)}
                    className="grid size-6 place-items-center rounded-md text-zinc-400 opacity-0 hover:bg-black/5 hover:text-zinc-700 group-hover:opacity-100 dark:hover:bg-white/10 dark:hover:text-zinc-200"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            );
          })}
          <button
            type="button"
            aria-label="新建标签页"
            title="新建标签页"
            onClick={createCanvasDocument}
            className="grid size-8 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div
        className="fixed top-1/2 z-[90] flex -translate-y-1/2 flex-col items-center gap-1 rounded-full border border-zinc-200 bg-white/95 px-1.5 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1b1b1d]/95"
        style={{ left: 'calc(var(--uw-sidebar-width) + 24px)' }}
      >
        <CanvasToolButton
          active={toolPanel === 'assets'}
          title="资产"
          onClick={() => setToolPanel(toolPanel === 'assets' ? null : 'assets')}
          icon={<Package size={20} />}
        />
        <CanvasToolButton
          active={toolPanel === 'chat'}
          title="AI 对话"
          onClick={() => setToolPanel(toolPanel === 'chat' ? null : 'chat')}
          icon={<MessageSquare size={20} />}
        />
        <CanvasToolButton
          active={toolPanel === 'project'}
          title="工程管理"
          onClick={() => setToolPanel(toolPanel === 'project' ? null : 'project')}
          icon={<Settings2 size={20} />}
        />
        <CanvasToolButton
          active={toolPanel === 'save'}
          title="保存/导出"
          onClick={() => setToolPanel(toolPanel === 'save' ? null : 'save')}
          icon={<Save size={20} />}
        />
      </div>

      <CanvasHud
        selectedCount={selectedIds.length}
        nodeCount={document.nodes.length}
        zoom={document.viewport.zoom}
      />

      <div className="absolute bottom-4 left-4 z-[95] flex flex-col items-start gap-2">
        {showMiniMap && (
          <div className="rounded-lg border border-zinc-300 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#1b1b1d]">
            <Minimap document={document} />
          </div>
        )}
        <div className="flex h-8 items-center gap-1 rounded-full border border-zinc-200 bg-white/95 px-1.5 shadow-island backdrop-blur-xl dark:border-white/10 dark:bg-[#1b1b1d]/95">
          <button
            type="button"
            title="显示/隐藏小地图"
            onClick={() => updateSettings({ showMiniMap: !showMiniMap })}
            className={`grid size-6 place-items-center rounded-full ${
              showMiniMap
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <MapIcon size={13} />
          </button>
          <button
            type="button"
            aria-label={showConnections ? '隐藏节点连线' : '显示节点连线'}
            onClick={() => setShowConnections((current) => !current)}
            className="grid size-6 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
          >
            {showConnections ? <MousePointer2 size={13} /> : <Hand size={13} />}
          </button>
          <div className="h-4 w-px bg-zinc-200 dark:bg-white/10" />
          <button
            type="button"
            title="重置缩放"
            onClick={resetZoom}
            className="h-6 rounded-full px-2 font-mono text-xs font-semibold text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
          >
            {Math.round(document.viewport.zoom * 100)}%
          </button>
          <button type="button" onClick={fitView} title="聚焦全部" className="grid size-6 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10">
            <ZoomIn size={13} />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(-0.1)}
            className="grid size-6 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
          >
            <ZoomOut size={13} />
          </button>
          <div className="h-4 w-px bg-zinc-200 dark:bg-white/10" />
          <button
            type="button"
            onClick={() => setHelpMenuOpen((current) => !current)}
            className="grid size-6 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
            title="帮助"
          >
            <CircleHelp size={13} />
          </button>
        </div>
      </div>

      {helpMenuOpen && (
        <div className="absolute bottom-14 right-[calc(50%-40px)] z-[120] min-w-[190px] rounded-xl border border-zinc-200 bg-white p-1.5 shadow-2xl dark:border-white/10 dark:bg-[#1b1b1d]">
          <button
            type="button"
            onClick={() => {
              setShortcutOpen(true);
              setHelpMenuOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/[.06]"
          >
            <CircleHelp size={14} />
            快捷键说明
          </button>
          <button
            type="button"
            onClick={() => {
              setHelpOpen(true);
              setHelpMenuOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/[.06]"
          >
            <img src="/logo_dark.ico" alt="" className="size-4" />
            用户手册
          </button>
        </div>
      )}

      {toolPanel === 'assets' && (
        <AssetPanel
          assets={assets}
          onAdd={(file) => void ingestAsset(file)}
          onClose={() => setToolPanel(null)}
        />
      )}
      {toolPanel === 'project' && (
        <ProjectPanel
          documentName={document.name}
          onClose={() => setToolPanel(null)}
          onCreate={() => {
            createCanvasDocument();
            pushToast('已创建新工程。', 'success');
          }}
          onLoad={() => loadCanvasRef.current?.click()}
        />
      )}

      <input
        ref={loadCanvasRef}
        type="file"
        accept=".json,.uw.json,application/json"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          try {
            const parsed = JSON.parse(await file.text()) as Partial<CanvasDocument> & {
              workspace?: CanvasWorkspace;
              assets?: AssetItem[];
            };
            if (Array.isArray(parsed.assets)) {
              await Promise.all(parsed.assets.map((asset) => addAsset(asset)));
            }
            if (parsed.workspace?.documents?.length) {
              setCanvasWorkspace(parsed.workspace);
              setSelectedIds([]);
              setToolPanel(null);
              pushToast(`已加载 ${parsed.workspace.documents.length} 个画布标签。`, 'success');
              event.target.value = '';
              return;
            }
            const loaded: CanvasDocument = {
              id: parsed.id ?? createId('canvas'),
              name: parsed.name ?? file.name.replace(/\.\w+$/, ''),
              nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
              edges: Array.isArray(parsed.edges) ? parsed.edges : [],
              viewport: parsed.viewport ?? { x: 0, y: 0, zoom: 1 },
              updatedAt: Date.now(),
            };
            setCanvasWorkspace((current) => ({
              documents: [...current.documents, loaded],
              activeDocumentId: loaded.id,
            }));
            setSelectedIds([]);
            setToolPanel(null);
            pushToast(`已加载工程「${loaded.name}」。`, 'success');
          } catch {
            pushToast('工程文件格式无效。', 'error', '加载失败');
          }
          event.target.value = '';
        }}
      />
      {toolPanel === 'save' && (
        <SavePanel
          onSave={saveCanvas}
          onSaveAll={saveAllCanvas}
          onClose={() => setToolPanel(null)}
          onExport={() => {
            const blob = new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const anchor = window.document.createElement('a');
            anchor.href = url;
            anchor.download = `${document.name || 'canvas'}.json`;
            anchor.click();
            URL.revokeObjectURL(url);
          }}
        />
      )}
      {toolPanel === 'chat' && (
        <CopilotPanel
          document={document}
          chatDraft={chatDraft}
          onChatDraft={setChatDraft}
          onSend={sendChat}
          historyOpen={historyOpen}
          onHistory={() => setHistoryOpen((current) => !current)}
          onClose={() => setToolPanel(null)}
          conversation={conversation}
        />
      )}

      {selectedIds.length > 0 && (
        <div className="absolute bottom-4 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-1 rounded-full border border-zinc-200 bg-white/95 px-2 py-1.5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1b1b1d]/95">
          <span className="px-2 text-[11px] text-zinc-500">已选 {selectedIds.length}</span>
          {selectedIds.length > 1 && (
            <>
              <div className="mx-1 h-4 w-px bg-zinc-200 dark:bg-white/10" />
              <button type="button" title="左对齐" onClick={() => alignSelection('left')} className="grid size-7 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10">
                <AlignHorizontalJustifyStart size={13} />
              </button>
              <button type="button" title="水平居中" onClick={() => alignSelection('hcenter')} className="grid size-7 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10">
                <AlignHorizontalJustifyCenter size={13} />
              </button>
              <button type="button" title="右对齐" onClick={() => alignSelection('right')} className="grid size-7 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10">
                <AlignHorizontalJustifyEnd size={13} />
              </button>
              <button type="button" title="顶对齐" onClick={() => alignSelection('top')} className="grid size-7 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10">
                <AlignVerticalJustifyStart size={13} />
              </button>
              <button type="button" title="垂直居中" onClick={() => alignSelection('vcenter')} className="grid size-7 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10">
                <AlignVerticalJustifyCenter size={13} />
              </button>
              <button type="button" title="底对齐" onClick={() => alignSelection('bottom')} className="grid size-7 place-items-center rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10">
                <AlignVerticalJustifyEnd size={13} />
              </button>
              <button type="button" title="统一大小" onClick={normalizeSelectedSize} className="rounded-full px-2 py-1 text-[10px] text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10">
                统一
              </button>
              <div className="mx-1 h-4 w-px bg-zinc-200 dark:bg-white/10" />
            </>
          )}
          <button type="button" onClick={() => duplicateSelected()} className="grid size-7 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10" title="复制">
            <Copy size={14} />
          </button>
          <button type="button" onClick={deleteSelected} className="grid size-7 place-items-center rounded-full text-rose-500 hover:bg-rose-500/10" title="删除">
            <Trash2 size={14} />
          </button>
        </div>
      )}

      <button
        type="button"
        aria-label="展开 UW Agent ChatPanel"
        onClick={() => setToolPanel(toolPanel === 'chat' ? null : 'chat')}
        className="fixed bottom-6 right-6 z-[108] flex size-11 items-center justify-center overflow-hidden rounded-full border border-zinc-600/50 bg-zinc-800 p-1 text-white shadow-xl transition-all hover:border-zinc-500"
      >
        <img src="/logo_dark.ico" alt="" className="size-8 rounded-full object-contain" />
      </button>

      <Modal open={shortcutOpen} onClose={() => setShortcutOpen(false)} title="" width="max-w-3xl">
        <div className="max-h-[76vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">快捷键说明</h2>
            <button
              type="button"
              aria-label="关闭快捷键说明"
              onClick={() => setShortcutOpen(false)}
              className="grid size-8 place-items-center rounded-lg text-zinc-500 hover:bg-black/5 dark:hover:bg-white/10"
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-5 grid gap-6 md:grid-cols-3">
            <ShortcutCard title="画布操作" rows={canvasShortcutRows} />
            <ShortcutCard title="节点操作" rows={nodeShortcutRows} />
            <ShortcutCard title="工程操作" rows={projectShortcutRows} />
          </div>
        </div>
      </Modal>
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Unlimited Works 用户手册" width="max-w-xl">
        <div className="space-y-4 p-6 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
          <p>这是一个从桌面应用编译产物重建的本地研究工作台。</p>
          <p>画布支持双击创建节点、拖拽移动、选择、运行、复制、删除和连线。</p>
          <p>资产、AI 对话、工程管理与保存导出通过左侧悬浮工具岛打开。</p>
          <button type="button" onClick={() => window.open('https://github.com/morluto/rea', '_blank')} className="SettingsAction">
            <ExternalLink size={13} />
            查看 REA
          </button>
        </div>
      </Modal>
    </main>
  );
}

function ShortcutCard({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold">{title}</h3>
      <div className="space-y-1.5">
        {rows.map(([label, keys]) => (
          <div key={label} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-zinc-500">{label}</span>
            <kbd className="shrink-0 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500 dark:border-white/10 dark:bg-white/[.04]">
              {keys}
            </kbd>
          </div>
        ))}
      </div>
    </section>
  );
}

const canvasShortcutRows: Array<[string, string]> = [
  ['缩放画布', '鼠标滚轮'],
  ['移动画布', '右键 / Space + 左键'],
  ['创建节点', '左键双击'],
  ['框选节点', '拖拽空白区域'],
  ['聚焦节点', 'F'],
];

const nodeShortcutRows: Array<[string, string]> = [
  ['复制/粘贴/剪切', 'Ctrl C/V/X'],
  ['复制节点（带连线）', 'Ctrl D'],
  ['复制节点（不带连线）', 'Shift D'],
  ['删除', 'Delete / X'],
  ['撤销', 'Ctrl Z'],
  ['重做', 'Ctrl Shift Z'],
  ['打组', 'Ctrl G'],
];

const projectShortcutRows: Array<[string, string]> = [
  ['保存工程', 'Ctrl S'],
  ['保存所有标签', 'Ctrl Shift S'],
  ['资产面板', 'Ctrl B'],
  ['AI 对话面板', 'Ctrl Q'],
  ['工作流资产菜单', 'Shift E'],
];

