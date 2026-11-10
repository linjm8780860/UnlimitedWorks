export type Theme = 'dark' | 'light';
export type AgentMode = 'standard' | 'ptc' | 'minimal' | 'creative';
export type AccessMode = 'view' | 'workspace' | 'full';
export type ReasoningLevel = 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';

export type Project = {
  id: string;
  name: string;
  path: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};

export type Workspace = {
  id: string;
  name: string;
  path: string;
  createdAt: number;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
};

export type Conversation = {
  id: string;
  title: string;
  projectId?: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

export type Skill = {
  id: string;
  name: string;
  description: string;
  whenToUse: string;
  content: string;
  source: 'built-in' | 'global' | 'project';
  category: string;
  enabled: boolean;
  slash: boolean;
  createdAt: number;
};

export type Plugin = {
  id: string;
  name: string;
  version: string;
  description: string;
  tags: string[];
  enabled: boolean;
  installedAt: number;
};

export type AutomationType = 'once' | 'interval' | 'daily' | 'weekly' | 'cron';

export type Automation = {
  id: string;
  title: string;
  type: AutomationType;
  expression: string;
  content: string;
  enabled: boolean;
  createdAt: number;
  lastCheckedAt?: number;
  lastRunAt?: number;
};

export type ModelOverride = {
  modelName?: string;
  url?: string;
  key?: string;
  enabled?: boolean;
};

export type AppSettings = {
  markdownRendering: boolean;
  promptCharCount: boolean;
  imageOverwriteMode: 'overwrite' | 'append';
  assetCardMode: 'grouped' | 'aggregate';
  assetFill: boolean;
  assetGroupByDate: boolean;
  groupModelsByVendor: boolean;
  settingsSize: 'compact' | 'default' | 'wide';
  includeSecrets: boolean;
  floatingAgentPanel: boolean;
  connectionStyle: 'bezier' | 'straight' | 'orthogonal';
  showMiniMap: boolean;
  namedRouteGhosts: boolean;
  autoFocusVideoAnalysis: boolean;
  spacePan: boolean;
  duplicateInheritsContainer: boolean;
  islandScales: boolean;
  islandVisibility: 'hover' | 'selected';
  wheelMode: 'zoom' | 'none' | 'pan';
  zoomSensitivity: number;
  focusPadding: number;
  islandButtonCount: number;
  persistIslandModes: boolean;
  performanceMode: 'off' | 'auto' | 'global';
  showPerformanceHud: boolean;
  autoSave: boolean;
  idleSaveSeconds: number;
  saveIntervalMinutes: number;
  panoramaThumbnail: boolean;
  viewportPadding: number;
  viewportNodeLimit: number;
  viewportLargeImageLimit: number;
  showReferenceMemory: boolean;
  autoCompressLargeImages: boolean;
  compressionPixelThreshold: number;
  compressionMaxEdge: number;
  compressionQuality: number;
  maxUndoSteps: number;
  referenceTotalLimitMb: number;
  referencePerImageLimitMb: number;
  localCacheLimitMb: number;
  imageExportMode: 'original' | 'compressed';
  redundancyBackup: boolean;
  maxBackups: number;
  proxyMode: 'disabled' | 'system' | 'custom';
  autoLink: boolean;
  defaultSubagentModel: string;
  defaultImageModel: string;
  defaultVideoModel: string;
  agentFocusNewNodes: boolean;
  showMultiInlineAiPrompts: boolean;
  localRepaint: boolean;
  localRepaintFeather: number;
  localRepaintAutoFill: boolean;
  markedImageSendMode: 'original' | 'marked' | 'both';
  referenceWatermark: boolean;
  referenceAutoDescribe: boolean;
  multimodalImageRecognition: 'disabled' | 'onDemand' | 'forced';
  promptLighting: 'strong' | 'weak' | 'off';
  defaultModel: string;
  promptMode: 'default' | 'custom' | 'agent';
  mcpServerEnabled: boolean;
  automationPollingEnabled: boolean;
  globalBaseUrl: string;
  globalApiKey: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  modelOverrides: Record<string, ModelOverride>;
};

export type ToastMessage = {
  id: string;
  title?: string;
  message: string;
  tone: 'default' | 'success' | 'error';
};

export type CanvasNodeType =
  | 'image-input'
  | 'video-input'
  | 'audio-input'
  | 'text'
  | 'image-gen'
  | 'video-gen'
  | 'audio-gen'
  | '3d-gen'
  | 'stage'
  | 'named-route-decl'
  | 'named-route-ref'
  | 'filmboard';

export type CanvasNode = {
  id: string;
  type: CanvasNodeType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prompt: string;
  content: string;
  model: string;
  status: 'idle' | 'running' | 'complete' | 'error';
  fixedText: boolean;
  createdAt: number;
  assetId?: string;
};

export type CanvasEdge = {
  id: string;
  from: string;
  to: string;
};

export type CanvasDocument = {
  id: string;
  projectId?: string;
  name: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  viewport: { x: number; y: number; zoom: number };
  updatedAt: number;
};

export type CanvasWorkspace = {
  documents: CanvasDocument[];
  activeDocumentId: string;
};

export type AssetItem = {
  id: string;
  name: string;
  kind: 'image' | 'video' | 'audio' | '3d';
  mimeType: string;
  dataUrl: string;
  size: number;
  createdAt: number;
};

