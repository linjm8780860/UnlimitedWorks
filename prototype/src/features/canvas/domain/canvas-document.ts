import type { CanvasDocument, CanvasNodeType, CanvasWorkspace } from '@/lib/types';

export const nodeTypeCatalog: Array<{
  type: CanvasNodeType;
  label: string;
  icon: string;
  color: string;
  width: number;
  height: number;
  model: string;
}> = [
  {
    type: 'image-input',
    label: '图片输入',
    icon: 'Image',
    color: 'emerald',
    width: 420,
    height: 280,
    model: '图片输入',
  },
  {
    type: 'video-input',
    label: '视频输入',
    icon: 'Video',
    color: 'violet',
    width: 420,
    height: 280,
    model: '视频输入',
  },
  {
    type: 'audio-input',
    label: '音频输入',
    icon: 'AudioLines',
    color: 'cyan',
    width: 420,
    height: 280,
    model: '音频输入',
  },
  {
    type: 'text',
    label: '文本生成',
    icon: 'Terminal',
    color: 'emerald',
    width: 420,
    height: 280,
    model: 'GPT 5.5',
  },
  {
    type: 'image-gen',
    label: '图片生成',
    icon: 'Image',
    color: 'violet',
    width: 420,
    height: 360,
    model: 'GPT Image 2',
  },
  {
    type: 'video-gen',
    label: '视频生成',
    icon: 'Clapperboard',
    color: 'rose',
    width: 420,
    height: 320,
    model: 'Seedance 1.5 Pro',
  },
  {
    type: 'audio-gen',
    label: '音频生成',
    icon: 'AudioLines',
    color: 'cyan',
    width: 420,
    height: 280,
    model: 'Suno',
  },
  {
    type: '3d-gen',
    label: '3D生成',
    icon: 'Box',
    color: 'blue',
    width: 440,
    height: 340,
    model: 'Hyper3d Gen2',
  },
  {
    type: 'stage',
    label: '导演台',
    icon: 'Clapperboard',
    color: 'orange',
    width: 520,
    height: 360,
    model: 'Scene',
  },
  {
    type: 'named-route-decl',
    label: '命名路由（声明）',
    icon: 'Route',
    color: 'indigo',
    width: 380,
    height: 190,
    model: 'Route',
  },
  {
    type: 'named-route-ref',
    label: '命名路由（引用）',
    icon: 'Signpost',
    color: 'purple',
    width: 380,
    height: 190,
    model: 'Route',
  },
  {
    type: 'filmboard',
    label: '影视板',
    icon: 'PanelTop',
    color: 'amber',
    width: 520,
    height: 320,
    model: 'Storyboard',
  },
];

export function createEmptyDocument(): CanvasDocument {
  return {
    id: 'canvas-default',
    name: '未命名',
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    updatedAt: Date.now(),
  };
}

export function createDefaultCanvasDocument() {
  return createEmptyDocument();
}

export function createDefaultCanvasWorkspace(): CanvasWorkspace {
  const document = createEmptyDocument();
  return {
    documents: [document],
    activeDocumentId: document.id,
  };
}

