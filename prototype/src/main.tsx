'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
  useViewport,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import {
  Activity, ArrowRight, AudioLines, Box, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Clock3, Clapperboard, Cloud, Command, Download, Ellipsis, FileAudio, FileImage,
  FileVideo, Film, FolderClosed, Fullscreen, Home, ImagePlus, Layers3,
  LoaderCircle, Menu, MessageSquareText, MoreHorizontal, MousePointer2, PanelLeftClose,
  PanelsTopLeft, Play, Plus, Puzzle, Save, ScanSearch, Search, Settings2, Share2,
  SlidersHorizontal, Sparkles, Type, Upload, WandSparkles, X, Zap,
} from 'lucide-react';

type NodeKind = 'image-input' | 'video-input' | 'audio-input' | 'text' | 'image-gen' | 'video-gen' | 'audio-gen' | 'model-3d' | 'storyboard' | 'video-analyze' | 'stage';
type StudioNodeData = {
  title: string;
  kind: NodeKind;
  prompt?: string;
  status?: 'idle' | 'running' | 'complete' | 'failed';
  model?: string;
  ratio?: string;
  count?: number;
  images?: string[];
  mediaUrl?: string;
  mediaName?: string;
  body?: string;
};
type LibraryEntry = {
  title: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  image?: string;
  action: string;
};

const productImage = 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=85';
const renderImage = 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=1000&q=85';

const initialNodes: Node<StudioNodeData>[] = [
  { id: 'product', type: 'studio', position: { x: 60, y: 174 }, data: { title: '产品原图', kind: 'image-input', images: [productImage], body: 'product-hero.png · 3.2 MB' }, style: { width: 250 } },
  { id: 'copy', type: 'studio', position: { x: 415, y: 82 }, data: { title: '详情页文案方案', kind: 'text', model: 'Gemini 2.5 Flash', body: '提炼核心卖点，规划 4 屏详情页结构，文案简洁、可信。' }, style: { width: 284 } },
  { id: 'style', type: 'studio', position: { x: 415, y: 382 }, data: { title: '全案视觉参考', kind: 'image-gen', model: 'Nano Banana 2', ratio: '3:4', prompt: '高端护肤品牌视觉系统总览，暖白和柑橘绿，杂志式排版，细腻自然光，留白克制。', status: 'complete', images: [renderImage] }, style: { width: 284 } },
  { id: 'detail', type: 'studio', position: { x: 830, y: 196 }, data: { title: '详情页首屏', kind: 'image-gen', model: 'Nano Banana 2', ratio: '3:4', prompt: '为维 C 精华制作高端电商详情首屏。突出真实质地和清新活力，以产品原图保持包装一致，引用统一视觉参考。', status: 'complete', images: [renderImage] }, style: { width: 300 } },
];
const initialEdges: Edge[] = [
  { id: 'e-product-copy', source: 'product', target: 'copy', sourceHandle: 'right', targetHandle: 'left', animated: false, type: 'smoothstep', style: { stroke: '#9ca3af', strokeWidth: 1.6 } },
  { id: 'e-product-style', source: 'product', target: 'style', sourceHandle: 'right', targetHandle: 'left', type: 'smoothstep', style: { stroke: '#9ca3af', strokeWidth: 1.6 } },
  { id: 'e-copy-detail', source: 'copy', target: 'detail', sourceHandle: 'right', targetHandle: 'left', type: 'smoothstep', style: { stroke: '#9ca3af', strokeWidth: 1.6 } },
  { id: 'e-style-detail', source: 'style', target: 'detail', sourceHandle: 'right', targetHandle: 'left', type: 'smoothstep', style: { stroke: '#9ca3af', strokeWidth: 1.6 } },
];

const kindInfo: Record<NodeKind, { name: string; icon: React.ElementType; tone: string; short: string }> = {
  'image-input': { name: '图片素材', icon: FileImage, tone: 'mint', short: 'INPUT' },
  'video-input': { name: '视频素材', icon: FileVideo, tone: 'blue', short: 'INPUT' },
  'audio-input': { name: '音频素材', icon: FileAudio, tone: 'amber', short: 'INPUT' },
  text: { name: '文本生成', icon: Type, tone: 'violet', short: 'TEXT' },
  'image-gen': { name: '图片生成', icon: ImagePlus, tone: 'coral', short: 'IMAGE' },
  'video-gen': { name: '视频生成', icon: Film, tone: 'blue', short: 'VIDEO' },
  'audio-gen': { name: '音频生成', icon: AudioLines, tone: 'amber', short: 'AUDIO' },
  'model-3d': { name: '3D 生成', icon: Box, tone: 'cyan', short: '3D' },
  storyboard: { name: '分镜生成', icon: Clapperboard, tone: 'violet', short: 'BOARD' },
  'video-analyze': { name: '视频分析', icon: ScanSearch, tone: 'blue', short: 'ANALYZE' },
  stage: { name: '导演台', icon: PanelsTopLeft, tone: 'amber', short: 'STAGE' },
};

function workflowPreset(title: string) {
  if (title.includes('短片') || title.includes('视频')) {
    const nodes: Node<StudioNodeData>[] = [
      { id: 'film-script', type: 'studio', position: { x: 50, y: 130 }, data: { title: '创意脚本', kind: 'text', body: '围绕新品发布，设计 15 秒品牌短片。' }, style: { width: 260 } },
      { id: 'film-board', type: 'studio', position: { x: 405, y: 110 }, data: { title: '镜头分解', kind: 'storyboard', status: 'idle', body: '拆分场景、镜头和动作。' }, style: { width: 270 } },
      { id: 'film-video', type: 'studio', position: { x: 775, y: 140 }, data: { title: '镜头片段', kind: 'video-gen', status: 'idle', model: 'Kling 2.6', prompt: '根据分镜生成写实产品镜头。' }, style: { width: 290 } },
      { id: 'film-review', type: 'studio', position: { x: 1140, y: 140 }, data: { title: '成片检查', kind: 'video-analyze', status: 'idle', body: '检查画面连贯性与节奏。' }, style: { width: 270 } },
    ];
    const edges: Edge[] = [['film-script', 'film-board'], ['film-board', 'film-video'], ['film-video', 'film-review']].map(([source, target]) => ({ id: `e-${source}-${target}`, source, target, sourceHandle: 'right', targetHandle: 'left', type: 'smoothstep', style: { stroke: '#78877c', strokeWidth: 1.6 } }));
    return { nodes, edges };
  }
  if (title.includes('场景')) {
    const nodes: Node<StudioNodeData>[] = [
      { id: 'scene-product', type: 'studio', position: { x: 50, y: 150 }, data: { title: '产品参考图', kind: 'image-input', images: [productImage], body: 'product-hero.png · 3.2 MB' }, style: { width: 250 } },
      { id: 'scene-ideas', type: 'studio', position: { x: 400, y: 75 }, data: { title: '场景方向', kind: 'text', body: '探索日常浴室、清晨梳妆台和旅行收纳三种场景。' }, style: { width: 280 } },
      { id: 'scene-image', type: 'studio', position: { x: 800, y: 150 }, data: { title: '场景图生成', kind: 'image-gen', status: 'idle', model: 'Nano Banana 2', ratio: '4:3', prompt: '保持产品包装一致，生成自然光下的生活方式场景图。' }, style: { width: 300 } },
    ];
    const edges: Edge[] = [['scene-product', 'scene-ideas'], ['scene-product', 'scene-image'], ['scene-ideas', 'scene-image']].map(([source, target]) => ({ id: `e-${source}-${target}`, source, target, sourceHandle: 'right', targetHandle: 'left', type: 'smoothstep', style: { stroke: '#78877c', strokeWidth: 1.6 } }));
    return { nodes, edges };
  }
  if (title.includes('角色')) {
    const nodes: Node<StudioNodeData>[] = [
      { id: 'character-brief', type: 'studio', position: { x: 50, y: 150 }, data: { title: '角色设定', kind: 'text', body: '建立角色的外观、材质与性格关键词。' }, style: { width: 270 } },
      { id: 'character-turn', type: 'studio', position: { x: 430, y: 150 }, data: { title: '多视角角色图', kind: 'image-gen', status: 'idle', model: 'Nano Banana 2', ratio: '4:3', prompt: '角色正面、侧面与背面转面设定图。' }, style: { width: 300 } },
      { id: 'character-model', type: 'studio', position: { x: 850, y: 150 }, data: { title: '3D 模型', kind: 'model-3d', status: 'idle', model: 'Tripo 2.5' }, style: { width: 280 } },
    ];
    const edges: Edge[] = [['character-brief', 'character-turn'], ['character-turn', 'character-model']].map(([source, target]) => ({ id: `e-${source}-${target}`, source, target, sourceHandle: 'right', targetHandle: 'left', type: 'smoothstep', style: { stroke: '#78877c', strokeWidth: 1.6 } }));
    return { nodes, edges };
  }
  return { nodes: initialNodes, edges: initialEdges };
}

function StudioNode({ data, selected }: NodeProps<Node<StudioNodeData>>) {
  const meta = kindInfo[data.kind];
  const Icon = meta.icon;
  const status = data.status ?? 'idle';
  return (
    <article className={`studio-node ${selected ? 'is-selected' : ''} ${status === 'running' ? 'is-running' : ''}`}>
      <Handle type="target" position={Position.Left} id="left" className="node-handle" />
      <header className="node-header">
        <span className={`node-type-icon ${meta.tone}`}><Icon size={15} /></span>
        <span className="node-kind">{meta.name}</span>
        <button className="icon-button node-more" title="更多操作"><Ellipsis size={17} /></button>
      </header>
      <div className="node-title">{data.title}</div>
      {data.kind === 'image-input' && data.images?.[0] ? (
        <div className="node-image-wrap"><img src={data.images[0]} alt="产品素材" /><span className="media-badge"><Check size={11} /> 已就绪</span></div>
      ) : null}
      {data.kind === 'text' && <p className="node-body">{data.body}</p>}
      {data.kind === 'image-gen' && data.images?.length ? (
        <div className="node-image-wrap generated"><img src={data.images[0]} alt="生成的产品视觉" /><button className="download-chip" title="下载图片"><Download size={13} /></button></div>
      ) : data.kind === 'image-gen' && <div className="node-placeholder"><ImagePlus size={20} /><span>运行后在此查看结果</span></div>}
      {data.kind === 'video-input' && (data.mediaUrl ? <div className="node-media-preview"><video src={data.mediaUrl} controls /><span>{data.mediaName}</span></div> : <div className="node-placeholder"><FileVideo size={20} /><span>选择视频素材</span></div>)}
      {data.kind === 'audio-input' && (data.mediaUrl ? <div className="node-media-preview"><audio src={data.mediaUrl} controls /><span>{data.mediaName}</span></div> : <div className="node-placeholder"><FileAudio size={20} /><span>选择音频素材</span></div>)}
      {data.kind !== 'image-input' && data.kind !== 'video-input' && data.kind !== 'audio-input' && data.kind !== 'text' && data.kind !== 'image-gen' && <div className={`node-placeholder ${status === 'complete' ? 'is-complete' : ''}`}><Icon size={20} /><span>{status === 'complete' ? 'Mock 结果已生成' : status === 'running' ? '正在执行节点…' : '配置参数后开始生成'}</span></div>}
      {data.kind === 'image-gen' && <div className="node-footer"><span className="model-pill"><Sparkles size={11} />{data.model ?? 'Nano Banana 2'}</span><span>{data.ratio ?? '3:4'}</span><span className={`node-status ${status}`}>{status === 'running' ? <LoaderCircle size={12} className="spin" /> : status === 'complete' ? <Check size={12} /> : <span className="status-dot" />}{status === 'running' ? '生成中' : status === 'complete' ? '已完成' : status === 'failed' ? '失败' : '待运行'}</span></div>}
      {data.kind === 'text' && <div className="node-footer"><span className="model-pill"><Sparkles size={11} />{data.model ?? 'Gemini 2.5 Flash'}</span><span className={`node-status ${status}`}>{status === 'complete' ? <Check size={12} /> : status === 'running' ? <LoaderCircle size={12} className="spin" /> : <span className="status-dot" />}{status === 'running' ? '运行中' : status === 'complete' ? '已完成' : '待运行'}</span></div>}
      {!['image-input', 'video-input', 'audio-input', 'text', 'image-gen'].includes(data.kind) && <div className="node-footer"><span className="model-pill"><Sparkles size={11} />{data.model ?? 'Mock 执行器'}</span><span className={`node-status ${status}`}>{status === 'running' ? <LoaderCircle size={12} className="spin" /> : status === 'complete' ? <Check size={12} /> : <span className="status-dot" />}{status === 'running' ? '运行中' : status === 'complete' ? '已完成' : '待运行'}</span></div>}
      <Handle type="source" position={Position.Right} id="right" className="node-handle" />
    </article>
  );
}

const nodeTypes: NodeTypes = { studio: StudioNode };

function StudioApp() {
  const [nodes, setNodes] = useState<Node<StudioNodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>('detail');
  const [activeNav, setActiveNav] = useState('画布');
  const [featureToggles, setFeatureToggles] = useState<Record<string, boolean>>({ '电商文案助手': true, '分镜创作': true, '视频工具箱': true, '自动保存项目快照': true, '工作日晨间创作摘要': false, 'FFmpeg 视频工具': true, 'Blender LiveLink': true, '工作流执行器': false, '模型服务连接': true });
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showModelOptions, setShowModelOptions] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [runState, setRunState] = useState<'idle' | 'running' | 'complete'>('idle');
  const [progress, setProgress] = useState(0);
  const [projectName, setProjectName] = useState('柑橘焕亮精华 · 电商详情页');
  const [showRuns, setShowRuns] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [savedAt, setSavedAt] = useState('刚刚保存');
  const [runLabel, setRunLabel] = useState('工作流');
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const { zoom } = useViewport();
  const selectedNode = nodes.find(node => node.id === selectedId) ?? null;
  const SelectedNodeIcon = selectedNode ? kindInfo[selectedNode.data.kind].icon : Box;
  const modelChoices = selectedNode?.data.kind === 'video-gen' ? ['Kling 2.6', 'Veo 3.1', 'Runway Gen-4'] : ['Nano Banana 2', 'Flux.1 Kontext', 'Seedream 4'];

  useEffect(() => {
    const stored = localStorage.getItem('uw-studio-prototype');
    if (stored) {
      try {
        const state = JSON.parse(stored) as { nodes: Node<StudioNodeData>[]; edges: Edge[]; projectName: string };
        setNodes(state.nodes); setEdges(state.edges); setProjectName(state.projectName);
      } catch { localStorage.removeItem('uw-studio-prototype'); }
    }
  }, []);

  useEffect(() => {
    if (!window.matchMedia('(max-width: 680px)').matches) return;
    const timer = window.setTimeout(() => fitView({ nodes: selectedId ? [{ id: selectedId }] : undefined, padding: 0.35, duration: 250 }), 120);
    return () => window.clearTimeout(timer);
  }, [fitView, selectedId]);

  const onNodesChange: OnNodesChange = useCallback(changes => setNodes(current => applyNodeChanges(changes, current) as Node<StudioNodeData>[]), []);
  const onEdgesChange: OnEdgesChange = useCallback(changes => setEdges(current => applyEdgeChanges(changes, current)), []);
  const onConnect = useCallback((connection: Connection) => setEdges(current => addEdge({ ...connection, id: `e-${crypto.randomUUID()}`, type: 'smoothstep', style: { stroke: '#88918d', strokeWidth: 1.6 } }, current)), []);

  const flash = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2400); };
  const saveProject = () => {
    try {
      localStorage.setItem('uw-studio-prototype', JSON.stringify({ nodes, edges, projectName }));
      setSavedAt('刚刚保存'); flash('项目已保存到本地');
    } catch {
      flash('本地存储空间不足，请移除较大的上传素材后重试');
    }
  };
  const addNode = (kind: NodeKind) => {
    const id = `${kind}-${crypto.randomUUID().slice(0, 5)}`;
    const meta = kindInfo[kind];
    const position = { x: 240 + (nodes.length % 3) * 80, y: 120 + nodes.length * 42 };
    const data: StudioNodeData = { kind, title: `${meta.name} ${nodes.filter(n => n.data.kind === kind).length + 1}`, status: 'idle', model: kind === 'text' ? 'Gemini 2.5 Flash' : 'Nano Banana 2', ratio: '3:4', body: '描述你想要生成的内容…' };
    setNodes(current => [...current, { id, type: 'studio', position, data, style: { width: kind === 'text' ? 284 : 300 } }]);
    setSelectedId(id); setShowNodeMenu(false); setActiveNav('画布');
  };
  const updateSelected = (updates: Partial<StudioNodeData>) => {
    if (!selectedId) return;
    setNodes(current => current.map(node => node.id === selectedId ? { ...node, data: { ...node.data, ...updates } } : node));
  };
  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !selectedNode) return;
    if (file.size > 1_500_000) { flash('演示模式下素材需小于 1.5 MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      if (selectedNode.data.kind === 'image-input') updateSelected({ images: [reader.result], mediaName: file.name, body: `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB` });
      else updateSelected({ mediaUrl: reader.result, mediaName: file.name, body: `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB` });
      flash(`${file.name} 已添加`);
    };
    reader.readAsDataURL(file);
  };
  const runWorkflow = (targetId?: string) => {
    if (runState === 'running') return;
    const runnable = nodes.filter(node => (!targetId || node.id === targetId) && !['image-input', 'video-input', 'audio-input'].includes(node.data.kind));
    if (!runnable.length) { flash('先选择一个可运行节点'); return; }
    setRunLabel(targetId ? runnable[0].data.title : '工作流');
    setRunState('running'); setProgress(4); setShowRuns(true);
    setNodes(current => current.map(node => runnable.some(item => item.id === node.id) ? { ...node, data: { ...node.data, status: 'running' } } : node));
    let value = 4;
    const timer = window.setInterval(() => {
      value = Math.min(value + 16 + Math.round(Math.random() * 8), 100);
      setProgress(value);
      if (value >= 100) {
        window.clearInterval(timer); setRunState('complete');
        setNodes(current => current.map(node => {
          if (!runnable.some(item => item.id === node.id)) return node;
          const nextData = { ...node.data, status: 'complete' as const };
          if (nextData.kind === 'image-gen' && !nextData.images?.length) nextData.images = [renderImage];
          if (nextData.kind === 'text' && nextData.body === '描述你想要生成的内容…') nextData.body = '以产品核心成分与真实使用感为主线，建立清新、可信的视觉表达。';
          return { ...node, data: nextData };
        }));
        flash(targetId ? '节点运行完成' : '工作流已完成 · 生成结果已保存');
      }
    }, 360);
  };
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key === 'Enter') { event.preventDefault(); runWorkflow(); }
      if (event.key.toLowerCase() === 's') { event.preventDefault(); saveProject(); }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [runWorkflow, saveProject]);
  const autoArrange = () => {
    const depth = new Map<string, number>();
    const pending = [...nodes.filter(node => !edges.some(edge => edge.target === node.id)).map(node => node.id)];
    const visited = new Set<string>();
    for (const id of pending) depth.set(id, 0);
    while (visited.size < nodes.length) {
      if (!pending.length) {
        const next = nodes.find(node => !visited.has(node.id));
        if (!next) break;
        depth.set(next.id, 0);
        pending.push(next.id);
      }
      const current = pending.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const nextDepth = (depth.get(current) ?? 0) + 1;
      for (const edge of edges.filter(item => item.source === current)) {
        if (!visited.has(edge.target) && !pending.includes(edge.target)) {
          depth.set(edge.target, nextDepth);
          pending.push(edge.target);
        }
      }
    }
    const rows = new Map<number, number>();
    setNodes(current => current.map(node => {
      const column = depth.get(node.id) ?? 0;
      const row = rows.get(column) ?? 0;
      rows.set(column, row + 1);
      return { ...node, position: { x: 80 + column * 370, y: 105 + row * 265 } };
    }));
    window.setTimeout(() => fitView({ padding: 0.22, duration: 300 }), 40);
    flash('节点已按连接关系整理');
  };

  const navItems = [
    { label: '首页', icon: Home }, { label: '项目', icon: FolderClosed },
    { label: '画布', icon: Layers3 }, { label: '技能', icon: Sparkles },
    { label: '插件', icon: Puzzle }, { label: '自动化任务', icon: Clock3 },
  ];
  const addMenuItems: { kind: NodeKind; label: string; icon: React.ElementType }[] = [
    { kind: 'image-input', label: '输入图片节点', icon: FileImage }, { kind: 'video-input', label: '输入视频节点', icon: FileVideo },
    { kind: 'audio-input', label: '输入音频节点', icon: FileAudio }, { kind: 'text', label: '文本节点', icon: Type },
    { kind: 'image-gen', label: '图片生成节点', icon: ImagePlus }, { kind: 'video-gen', label: '视频生成节点', icon: Film },
    { kind: 'audio-gen', label: '音频生成节点', icon: AudioLines }, { kind: 'model-3d', label: '3D 生成节点', icon: Box },
    { kind: 'storyboard', label: '分镜节点', icon: Clapperboard }, { kind: 'video-analyze', label: '视频分析节点', icon: ScanSearch },
    { kind: 'stage', label: '导演台节点', icon: PanelsTopLeft },
  ];

  const openLibrary = activeNav !== '画布';
  const libraryTitle = activeNav;
  const libraryDescription: Record<string, string> = {
    首页: '从项目、创作技能和最近的工作继续开始。',
    项目: '管理画布项目和创作草稿。',
    技能: '用领域工作流快速完成一类创作任务。',
    插件: '查看本机插件和运行依赖的状态。',
    自动化任务: '管理计划运行和周期性创作任务。',
  };
  const libraryEntries = useMemo<LibraryEntry[]>(() => {
    if (activeNav === '技能') return [
      { title: '电商产品详情页', sub: '文案方案 → 全案视觉 → 多屏详情图', icon: ImagePlus, color: 'coral', action: 'workflow' },
      { title: '产品场景图', sub: '共享产品参考，批量生成不同场景', icon: FileImage, color: 'mint', action: 'workflow' },
      { title: '短片分镜创作', sub: '剧本结构 → 分镜画面 → 视频生成', icon: Clapperboard, color: 'violet', action: 'workflow' },
      { title: '角色设定与转面图', sub: '角色提取 → 外观设定 → 多视角生成', icon: Layers3, color: 'amber', action: 'workflow' },
      { title: '视频创意方案', sub: '创意大纲 → 镜头规划 → 视频片段', icon: Film, color: 'blue', action: 'workflow' },
      { title: '社交媒体配图', sub: '平台规格 → 视觉生成 → 文案配套', icon: Sparkles, color: 'mint', action: 'workflow' },
    ];
    if (activeNav === '插件') return [
      { title: 'FFmpeg 视频工具', sub: '视频预检、抽帧、分析和转码', icon: Film, color: 'blue', action: 'plugin' },
      { title: 'Blender LiveLink', sub: '连接 Blender 视口和相机画面', icon: Box, color: 'coral', action: 'plugin' },
      { title: '工作流执行器', sub: '连接 RunningHub 或本地 ComfyUI', icon: Activity, color: 'mint', action: 'plugin' },
      { title: '模型服务连接', sub: '管理文本、图像、视频模型渠道', icon: Zap, color: 'amber', action: 'plugin' },
    ];
    if (activeNav === '自动化任务') return [
      { title: '每周社媒选题', sub: '每周一 09:00 · 工作流：内容日历', icon: Clock3, color: 'violet', action: 'toggle' },
      { title: '新品图批次生成', sub: '每日 10:30 · 工作流：电商场景图', icon: ImagePlus, color: 'coral', action: 'toggle' },
      { title: '工作日晨间创作摘要', sub: '工作日 08:30 · 通知：站内', icon: Activity, color: 'mint', action: 'toggle' },
    ];
    if (activeNav === '项目') return [
      { title: projectName, sub: '保存于今天 14:32 · 4 个节点', icon: Layers3, color: 'violet', image: renderImage, action: 'project' },
      { title: '新品上市主视觉', sub: '草稿 · 6 个节点 · 昨天', icon: Layers3, color: 'mint', action: 'project' },
      { title: '品牌短片分镜', sub: '草稿 · 9 个节点 · 10 月 31 日', icon: Clapperboard, color: 'blue', action: 'project' },
    ];
    return [
      { title: '电商产品详情页', sub: '从产品图开始，生成完整详情页方案', icon: ImagePlus, color: 'coral', action: 'workflow' },
      { title: '产品场景图', sub: '基于产品素材批量探索应用场景', icon: FileImage, color: 'mint', action: 'workflow' },
      { title: '短片分镜创作', sub: '将创意拆解为可执行的分镜流程', icon: Clapperboard, color: 'violet', action: 'workflow' },
      { title: projectName, sub: '最近项目 · 4 个节点 · 今天 14:32', icon: Layers3, color: 'violet', image: renderImage, action: 'project' },
    ];
  }, [activeNav, projectName]);
  const visibleLibrary = useMemo(() => libraryEntries.filter(entry => entry.title.toLowerCase().includes(search.toLowerCase())), [libraryEntries, search]);

  const runLibraryAction = (entry: LibraryEntry) => {
    if (entry.action === 'project') { const preset = workflowPreset(entry.title); setProjectName(entry.title); setNodes(preset.nodes); setEdges(preset.edges); setSelectedId(preset.nodes.at(-1)?.id ?? null); setActiveNav('画布'); return; }
    if (entry.action === 'workflow') { const preset = workflowPreset(entry.title); setProjectName(entry.title); setNodes(preset.nodes); setEdges(preset.edges); setSelectedId(preset.nodes.at(-1)?.id ?? null); setActiveNav('画布'); flash(`${entry.title} 工作流已载入`); return; }
    if (entry.action === 'plugin') { const enabled = !featureToggles[entry.title]; setFeatureToggles(current => ({ ...current, [entry.title]: enabled })); flash(`${entry.title} 已${enabled ? '启用' : '停用'}`); return; }
    setFeatureToggles(current => ({ ...current, [entry.title]: !current[entry.title] }));
    flash(`${entry.title} 已${featureToggles[entry.title] ? '暂停' : '启用'}`);
  };

  return (
    <div className={`app-shell ${mobileMenu ? 'mobile-nav-open' : ''}`}>
      <input ref={mediaInputRef} className="visually-hidden" type="file" onChange={handleMediaUpload} />
      <aside className="left-rail">
        <div className="brand-row"><div className="brand-mark"><Layers3 size={18} strokeWidth={2.2} /></div><span>UNLIMITED <b>WORKS</b></span><button className="icon-button rail-collapse" title="收起侧栏"><PanelLeftClose size={16} /></button></div>
        <button className="workspace-switch"><span className="workspace-avatar">U</span><span className="workspace-copy"><b>创作工作区</b><small>Unlimited Works</small></span><ChevronDown size={14} /></button>
        <div className="rail-label">工作台</div>
        <nav className="main-nav">{navItems.map(item => <button key={item.label} className={`nav-item ${activeNav === item.label ? 'active' : ''}`} onClick={() => { setActiveNav(item.label); setMobileMenu(false); }}><item.icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{item.label === '自动化任务' && <span className="nav-count">2</span>}</button>)}</nav>
        <div className="rail-section-head"><span>最近项目</span><button className="icon-button" title="新建项目" onClick={() => { setProjectName('未命名项目'); setShowTemplates(true); }}><Plus size={15} /></button></div>
        <button className="recent-project active" onClick={() => setActiveNav('画布')}><span className="recent-dot" /><span>柑橘焕亮精华</span><span className="recent-status" /></button>
        <button className="recent-project" onClick={() => { setProjectName('新品上市主视觉'); setActiveNav('画布'); }}><span className="recent-dot muted" /><span>新品上市主视觉</span></button>
        <div className="rail-spacer" />
        <div className="credits-block"><div className="credits-top"><span><Zap size={14} /> 可用算力</span><b>8,420 <small>点</small></b></div><div className="credits-track"><i /></div><div className="credits-note">本月用量 · 演示数据</div></div>
        <button className="nav-item rail-bottom" onClick={() => flash('设置页面进入下一阶段')}><Settings2 size={17} /><span>设置</span></button>
        <button className="profile-row"><span className="profile-avatar">U</span><span className="profile-copy"><b>工作区成员</b><small>共享账号体系</small></span><MoreHorizontal size={18} /></button>
      </aside>
      <div className="mobile-scrim" onClick={() => setMobileMenu(false)} />

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu-trigger" title="打开导航" onClick={() => setMobileMenu(true)}><Menu size={18} /></button><div className="breadcrumbs"><span>工作台</span><ChevronRight size={14} /><b>{openLibrary ? libraryTitle : '画布'}</b>{!openLibrary && <><ChevronRight size={14} /><input aria-label="项目名称" value={projectName} onChange={event => setProjectName(event.target.value)} /></>}</div><span className="save-indicator"><Cloud size={14} />{savedAt}</span></div>
          <div className="topbar-actions"><button className="quiet-button share-button" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); flash('页面链接已复制'); } catch { flash('请复制浏览器地址栏中的页面链接'); } }}><Share2 size={15} />分享</button><button className="quiet-button" title="快捷键" onClick={() => setShowShortcuts(true)}><Command size={15} /></button><span className="top-separator" /><button className="run-button" onClick={() => runWorkflow()} disabled={runState === 'running'}>{runState === 'running' ? <LoaderCircle size={15} className="spin" /> : <Play size={15} fill="currentColor" />}{runState === 'running' ? '运行中' : '运行工作流'}<span className="run-shortcut">⌘ ↵</span></button></div>
        </header>

        {openLibrary ? (
          <section className="library-page">
            <div className="library-heading">
              <div><div className="eyebrow">UNLIMITED WORKS</div><h1>{libraryTitle}</h1><p>{libraryDescription[activeNav]}</p></div>
              {(activeNav === '首页' || activeNav === '项目') && <button className="primary-button" onClick={() => { setProjectName('未命名项目'); setShowTemplates(true); }}><Plus size={16} />新建项目</button>}
            </div>
            {activeNav === '首页' && <div className="home-resume"><div><span className="home-resume-kicker">继续创作</span><b>{projectName}</b><span>4 个节点 · 最近编辑于今天 14:32</span></div><button className="run-button" onClick={() => setActiveNav('画布')}>打开画布<ArrowRight size={15} /></button></div>}
            <div className="library-tools"><div className="search-field"><Search size={16} /><input placeholder={`搜索${libraryTitle}`} value={search} onChange={event => setSearch(event.target.value)} /></div><span className="library-total">{visibleLibrary.length} 项</span></div>
            <div className="library-grid">{visibleLibrary.map(entry => {
              const EntryIcon = entry.icon;
              const enabled = featureToggles[entry.title] ?? (entry.action === 'project' || entry.action === 'workflow' || entry.action === 'plugin');
              return <article key={entry.title} className="library-card">
                {'image' in entry && entry.image ? <img className="library-card-image" src={entry.image} alt="" /> : <span className={`library-card-icon ${entry.color}`}><EntryIcon size={19} /></span>}
                <div className="library-card-copy"><b>{entry.title}</b><span>{entry.sub}</span></div>
                {entry.action === 'toggle' ? <button className={`toggle-control ${enabled ? 'on' : ''}`} aria-label={`${enabled ? '暂停' : '启用'}${entry.title}`} onClick={() => runLibraryAction(entry)}><span /></button> : <button className="card-action" onClick={() => runLibraryAction(entry)}>{entry.action === 'plugin' ? (enabled ? '已启用' : '启用') : entry.action === 'workflow' ? '打开工作流' : '打开'}<ArrowRight size={13} /></button>}
              </article>;
            })}</div>
            {(activeNav === '技能' || activeNav === '插件') && <div className="library-footnote"><Activity size={14} />项目和运行状态目前使用本地 mock 数据</div>}
          </section>
        ) : (
          <>
            <div className="canvas-toolbar"><div className="canvas-context"><span className="context-icon"><Sparkles size={15} /></span><span>{projectName}</span><span className="context-tag">工作流 · 已保存</span><button className="icon-button" title="项目操作"><ChevronDown size={15} /></button></div><div className="canvas-actions"><div className="view-toggle"><button className="view-active" title="选择工具"><MousePointer2 size={15} /></button><button title="手型工具"><span className="hand-symbol">✋</span></button></div><span className="toolbar-divider" /><button className="icon-button" title="缩小" onClick={() => zoomOut()}><span className="zoom-glyph">−</span></button><button className="zoom-value" title="适配画布" onClick={() => fitView({ padding: 0.2, duration: 300 })}>{Math.round(zoom * 100)}%</button><button className="icon-button" title="放大" onClick={() => zoomIn()}><span className="zoom-glyph">+</span></button><span className="toolbar-divider" /><button className="icon-button" title="自动整理节点" onClick={autoArrange}><SlidersHorizontal size={15} /></button><button className="icon-button" title="聚焦全部节点" onClick={() => fitView({ padding: 0.18, duration: 300 })}><Fullscreen size={16} /></button></div></div>
            <div className="canvas-area">
              <div className="canvas-label"><span className="live-dot" />创作画布 <span className="canvas-label-divider">/</span> {nodes.length} 个节点 <span className="canvas-label-divider">·</span> {edges.length} 条连接</div>
              <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={(_, node) => { setSelectedId(node.id); setMobileInspectorOpen(true); }} onPaneClick={() => { setSelectedId(null); setMobileInspectorOpen(false); }} fitView fitViewOptions={{ padding: 0.22 }} minZoom={0.2} maxZoom={1.5} defaultEdgeOptions={{ type: 'smoothstep' }} proOptions={{ hideAttribution: true }}>
                <Background variant={BackgroundVariant.Dots} gap={22} size={1.25} color="#414742" />
                <Controls position="bottom-left" showInteractive={false} />
                <MiniMap position="bottom-right" pannable zoomable nodeColor={node => { const item = node.data as StudioNodeData; return ({ 'image-input': '#609378', 'video-input': '#5b84a1', 'audio-input': '#a4874b', text: '#8377b0', 'image-gen': '#b87556', 'video-gen': '#5b84a1', 'audio-gen': '#a4874b', 'model-3d': '#4d8885', storyboard: '#8377b0', 'video-analyze': '#5b84a1', stage: '#a4874b' } as Record<NodeKind, string>)[item.kind]; }} maskColor="rgba(8,10,9,0.56)" />
                <div className="canvas-float-toolbar"><button className={`float-add ${showNodeMenu ? 'pressed' : ''}`} title="添加节点" onClick={() => setShowNodeMenu(value => !value)}><Plus size={18} /></button><button className="float-tool" title="添加注释节点" onClick={() => addNode('text')}><MessageSquareText size={17} /></button><button className="float-tool" title="打开项目" onClick={() => setActiveNav('项目')}><FolderClosed size={17} /></button><button className="float-tool" title="保存项目" onClick={saveProject}><Save size={16} /></button>{showNodeMenu && <div className="node-menu"><div className="node-menu-heading"><b>添加节点</b><button className="icon-button" onClick={() => setShowNodeMenu(false)} title="关闭"><X size={15} /></button></div>{addMenuItems.map(item => <button key={item.kind} className="node-menu-item" onClick={() => addNode(item.kind)}><span className={`node-type-icon ${kindInfo[item.kind].tone}`}><item.icon size={15} /></span><span>{item.label}</span><Plus size={14} /></button>)}</div>}</div>
                <div className="canvas-bottom-hint"><span>拖动节点整理画布</span><span className="hint-sep" /><span>从端口拖出连线</span><span className="hint-sep" /><span>⌘ + ↵ 运行</span></div>
              </ReactFlow>
            </div>
            {showRuns && <div className="runs-panel"><div className="runs-panel-top"><div className="runs-heading"><span className="runs-icon"><Activity size={15} /></span><b>运行面板</b><span className="runs-count">{runState === 'running' ? '执行中' : runState === 'complete' ? '刚刚完成' : '最近运行'}</span></div><div className="runs-panel-actions"><button className="icon-button" title="收起运行面板" onClick={() => setShowRuns(false)}><ChevronLeft size={16} /></button></div></div><div className="run-row"><span className={`run-state-mark ${runState}`}>{runState === 'running' ? <LoaderCircle size={13} className="spin" /> : runState === 'complete' ? <Check size={13} /> : <Clock3 size={13} />}</span><div className="run-row-main"><b>{runState === 'running' ? `正在运行${runLabel === '工作流' ? '工作流' : `「${runLabel}」`}` : `${runLabel === '工作流' ? projectName : runLabel} · ${runState === 'complete' ? '已完成' : '上次运行'}`}</b><span>{runState === 'running' ? `Mock 执行 · ${nodes.filter(node => node.data.status === 'running').length} 个节点` : `${nodes.length} 个节点 · 本地演示运行`}</span></div>{runState === 'running' ? <div className="run-progress"><div><span>总体进度</span><b>{progress}%</b></div><div className="progress-track"><i style={{ width: `${progress}%` }} /></div></div> : <button className="results-link" onClick={() => { const result = [...nodes].reverse().find(node => node.data.status === 'complete'); if (!result) { flash('还没有可查看的生成结果'); return; } setSelectedId(result.id); fitView({ nodes: [{ id: result.id }], padding: 0.4, duration: 300 }); flash(`已定位到「${result.data.title}」`); }}>查看结果<ArrowRight size={14} /></button>}</div></div>}
          </>
        )}
      </main>

      {!openLibrary && <aside className={`inspector ${mobileInspectorOpen ? 'mobile-open' : ''}`}>
        <div className="inspector-tabs"><button className="tab-current"><SlidersHorizontal size={15} />属性</button><button onClick={() => setShowRuns(true)}><Activity size={15} />运行<span className="tiny-count">2</span></button><button className="icon-button inspector-mobile-close" title="收起属性面板" onClick={() => setMobileInspectorOpen(false)}><ChevronDown size={17} /></button><button className="icon-button inspector-more" title="更多面板操作"><Ellipsis size={18} /></button></div>
        {selectedNode ? <>
          <div className="inspector-node-head"><span className={`node-type-icon ${kindInfo[selectedNode.data.kind].tone}`}><SelectedNodeIcon size={16} /></span><div><small>{kindInfo[selectedNode.data.kind].name}</small><b>{selectedNode.data.title}</b></div><button className="icon-button" title="节点选项"><Ellipsis size={17} /></button></div>
          <div className="inspector-scroll">
            <section className="inspector-section"><div className="section-title">基本信息</div><label className="field-label">节点名称</label><input className="text-input" value={selectedNode.data.title} onChange={event => updateSelected({ title: event.target.value })} /><div className="field-label label-spaced">执行状态</div><div className="status-line"><span className={`status-dot ${selectedNode.data.status === 'complete' ? 'success' : ''}`} />{selectedNode.data.status === 'complete' ? '已完成' : selectedNode.data.status === 'running' ? '生成中' : '等待运行'}<span className="status-time">{selectedNode.data.status === 'complete' ? '今天 14:32' : '—'}</span></div></section>
            {selectedNode.data.kind !== 'image-input' && <section className="inspector-section"><div className="section-title">{selectedNode.data.kind === 'text' ? '提示词' : '生成提示词'}<span className="optional-mark">必填</span></div><textarea className="prompt-input" rows={7} value={selectedNode.data.kind === 'text' ? selectedNode.data.body ?? '' : selectedNode.data.prompt ?? ''} onChange={event => updateSelected(selectedNode.data.kind === 'text' ? { body: event.target.value } : { prompt: event.target.value })} placeholder="描述你想要的内容…" /><div className="prompt-foot"><span>⌘ ↵ 优化提示词</span><button className="icon-button" title="AI 优化提示词" onClick={() => flash('提示词已优化（演示）')}><WandSparkles size={15} /></button></div></section>}
            {(selectedNode.data.kind === 'image-gen' || selectedNode.data.kind === 'video-gen') && <section className="inspector-section"><div className="section-title">生成设置</div><label className="field-label">模型</label><div className="model-picker"><button className="select-field" aria-expanded={showModelOptions} onClick={() => setShowModelOptions(value => !value)}><span className="model-select-icon"><Sparkles size={13} /></span>{selectedNode.data.model ?? 'Nano Banana 2'}<ChevronDown size={14} /></button>{showModelOptions && <div className="model-options">{modelChoices.map(model => <button key={model} onClick={() => { updateSelected({ model }); setShowModelOptions(false); }}>{model}{model === selectedNode.data.model && <Check size={13} />}</button>)}</div>}</div>{selectedNode.data.kind === 'image-gen' && <><label className="field-label label-spaced">画面比例</label><div className="ratio-options">{['1:1', '3:4', '4:3', '16:9'].map(ratio => <button key={ratio} className={selectedNode.data.ratio === ratio ? 'selected' : ''} onClick={() => updateSelected({ ratio })}><span className={`ratio-icon ratio-${ratio.replace(':', '-')}`} />{ratio}</button>)}</div></>}<label className="field-label label-spaced">生成数量</label><div className="stepper"><button onClick={() => updateSelected({ count: Math.max(1, (selectedNode.data.count ?? 1) - 1) })} title="减少"><span>−</span></button><span>{selectedNode.data.count ?? 1} {selectedNode.data.kind === 'image-gen' ? '张' : '段'}</span><button onClick={() => updateSelected({ count: Math.min(8, (selectedNode.data.count ?? 1) + 1) })} title="增加"><Plus size={14} /></button></div></section>}
            {['image-input', 'video-input', 'audio-input'].includes(selectedNode.data.kind) && <section className="inspector-section"><div className="section-title">输入素材</div>{selectedNode.data.mediaName && <div className="inspector-asset">{selectedNode.data.kind === 'image-input' && selectedNode.data.images?.[0] ? <img src={selectedNode.data.images[0]} alt="上传素材" /> : <span className={`node-type-icon ${kindInfo[selectedNode.data.kind].tone}`}><SelectedNodeIcon size={15} /></span>}<div><b>{selectedNode.data.mediaName}</b><span>{(selectedNode.data.body ?? '').split(' · ').slice(-1)[0]}</span></div><button className="icon-button" title="替换素材" onClick={() => { if (mediaInputRef.current) { mediaInputRef.current.accept = selectedNode.data.kind === 'image-input' ? 'image/*' : selectedNode.data.kind === 'video-input' ? 'video/*' : 'audio/*'; mediaInputRef.current.click(); } }}><Upload size={15} /></button></div>}{!selectedNode.data.mediaName && selectedNode.data.kind === 'image-input' && selectedNode.data.images?.[0] && <div className="inspector-asset"><img src={selectedNode.data.images[0]} alt="产品素材" /><div><b>产品原图</b><span>示例素材 · 已就绪</span></div><button className="icon-button" title="替换素材" onClick={() => { if (mediaInputRef.current) { mediaInputRef.current.accept = 'image/*'; mediaInputRef.current.click(); } }}><Upload size={15} /></button></div>}<button className="outline-wide" onClick={() => { if (mediaInputRef.current) { mediaInputRef.current.accept = selectedNode.data.kind === 'image-input' ? 'image/*' : selectedNode.data.kind === 'video-input' ? 'video/*' : 'audio/*'; mediaInputRef.current.click(); } }}><Plus size={15} />选择本地文件</button><span className="upload-limit">演示素材上限 1.5 MB</span></section>}
            <section className="inspector-section connections-section"><div className="section-title">节点连接 <span>{edges.filter(edge => edge.target === selectedNode.id || edge.source === selectedNode.id).length}</span></div>{edges.filter(edge => edge.target === selectedNode.id || edge.source === selectedNode.id).map(edge => { const other = nodes.find(node => node.id === (edge.source === selectedNode.id ? edge.target : edge.source)); if (!other) return null; const OtherIcon = other ? kindInfo[other.data.kind].icon : Box; return <button className="connection-row" key={edge.id} onClick={() => setSelectedId(other.id)}><span className={`node-type-icon small ${kindInfo[other.data.kind].tone}`}><OtherIcon size={12} /></span><span>{other.data.title}</span><ArrowRight size={13} /></button>; })}</section>
          </div>
          <div className="inspector-bottom"><button className="delete-node" onClick={() => { setNodes(current => current.filter(node => node.id !== selectedNode.id)); setEdges(current => current.filter(edge => edge.source !== selectedNode.id && edge.target !== selectedNode.id)); setSelectedId(null); flash('节点已移除'); }}><X size={15} />删除节点</button><button className="inspector-run" disabled={['image-input', 'video-input', 'audio-input'].includes(selectedNode.data.kind)} onClick={() => runWorkflow(selectedNode.id)}><Play size={13} fill="currentColor" />运行节点</button></div>
        </> : <div className="inspector-empty"><span className="empty-inspector-icon"><MousePointer2 size={20} /></span><b>选择一个节点</b><p>查看并编辑节点内容、模型参数和连接关系。</p><button className="outline-wide" onClick={() => setShowNodeMenu(true)}><Plus size={15} />添加节点</button></div>}
      </aside>}

      {toast && <div className="toast-message"><Check size={15} />{toast}</div>}
      {showTemplates && <div className="modal-backdrop" onClick={() => setShowTemplates(false)}><div className="template-modal" onClick={event => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">从模板开始</span><h2>电商产品详情页</h2></div><button className="icon-button" onClick={() => setShowTemplates(false)} title="关闭"><X size={18} /></button></div><p>载入包含产品素材、文案方案、全案视觉参考和并行详情图生成的工作流。</p><div className="template-steps"><span><Type size={15} />文案方案</span><ArrowRight size={14} /><span><ImagePlus size={15} />视觉参考</span><ArrowRight size={14} /><span><Layers3 size={15} />多屏生成</span></div><button className="primary-button full-button" onClick={() => { const name = projectName === '未命名项目' ? '电商产品详情页' : projectName; const preset = workflowPreset(name); setProjectName(name); setNodes(preset.nodes); setEdges(preset.edges); setSelectedId(preset.nodes.at(-1)?.id ?? null); setShowTemplates(false); setActiveNav('画布'); flash('工作流模板已载入'); }}>使用此模板<ArrowRight size={15} /></button></div></div>}
      {showShortcuts && <div className="modal-backdrop" onClick={() => setShowShortcuts(false)}><div className="template-modal shortcuts-modal" onClick={event => event.stopPropagation()}><div className="modal-top"><div><span className="eyebrow">快捷键</span><h2>画布操作</h2></div><button className="icon-button" onClick={() => setShowShortcuts(false)} title="关闭"><X size={18} /></button></div><div className="shortcut-row"><span>运行工作流</span><kbd>⌘ / Ctrl + Enter</kbd></div><div className="shortcut-row"><span>保存项目</span><kbd>⌘ / Ctrl + S</kbd></div><div className="shortcut-row"><span>移动画布</span><kbd>空格 + 拖动</kbd></div></div></div>}
      <footer className="bottom-status"><span><span className="online-dot" />所有系统正常</span><span>Mock 模式</span><button onClick={() => flash('Unlimited Studio · 前端原型') }><CircleHelp size={14} />帮助</button></footer>
    </div>
  );
}

export function Root() {
  return <ReactFlowProvider><StudioApp /></ReactFlowProvider>;
}
