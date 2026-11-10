import defaults from '@/data/app.default.json';

export type ModelConfig = {
  id: string;
  provider: string;
  displayName: string;
  modelName: string;
  type: string;
  key?: string;
  url?: string;
  useGlobalBaseUrl?: boolean;
  hidden?: boolean;
  durations?: string[];
  resolutions?: string[];
};

type DefaultsShape = {
  apiConfigs: ModelConfig[];
  providerOrder?: string[];
  workflowApps: Array<{
    id: string;
    name: string;
    description?: string;
    provider: string;
    outputType: string;
    category: string;
  }>;
  workflowCategories: Array<{
    key: string;
    label: string;
    iconType: string;
    iconName: string;
  }>;
};

export const appDefaults = defaults as unknown as DefaultsShape;

export const modelCatalog = appDefaults.apiConfigs.filter((model) => !model.hidden);

const providerLabels: Record<string, string> = {
  'GPT Image 2': 'OpenAI',
  'OpenAI': 'OpenAI',
  'Google Veo 3.1': 'Google',
  'Google Veo 3.1 Fast': 'Google',
  'Google Veo 3.1 Pro': 'Google',
  'Google Omni Flash': 'Google',
  'DeepSeek Flash': 'DeepSeek',
  'ByteDance Seedance 2.5': 'ByteDance',
  'Volcengine Doubao Audio': 'ByteDance',
  'Volcengine Doubao Seed 2.1 Pro': 'ByteDance',
  'Volcengine Doubao Seed 2.1 Turbo': 'ByteDance',
  'Volcengine Doubao Seed Evolving': 'ByteDance',
  'Volcengine Seedream 5.0': 'ByteDance',
  'Volcengine Seedream 5.0 Pro': 'ByteDance',
  'Volcengine Seedream 5.0 Flash': 'ByteDance',
  'Volcengine Seedream 4.5': 'ByteDance',
  'Volcengine Seedream 4.0': 'ByteDance',
  'Volcengine Seedance 1.5 Pro': 'ByteDance',
  'Volcengine Seedance 2.0': 'ByteDance',
  'Volcengine Seedance 2.0 Fast': 'ByteDance',
  'Volcengine Seedance 2.0 Mini': 'ByteDance',
  'Volcengine Seed3D': 'ByteDance',
  'Xiaomi MiMo V2.5 Pro': 'Xiaomi',
  'Xiaomi MiMo V2.5': 'Xiaomi',
  'Xiaomi MiMo V2 Flash': 'Xiaomi',
  'Xiaomi MiMo V2 TTS': 'Xiaomi',
  'Xiaomi MiMo V2.5 TTS': 'Xiaomi',
  'Xiaomi MiMo V2.5 TTS VoiceDesign': 'Xiaomi',
  'Xiaomi MiMo V2.5 TTS VoiceClone': 'Xiaomi',
  'Kuaishou Kling': 'MiniMax',
  'MiniMax TTS': 'MiniMax',
  'Grok Imagine Video 1.5': 'xAI',
  'Grok Imagine Video 1.0': 'xAI',
  'Kimi': 'Kimi',
  'Zhipu GLM': '智谱',
  'Alibaba Wan': 'Alibaba',
  'Alibaba Qwen Image': 'Alibaba',
  'Alibaba': 'Alibaba',
};

export function generalProvider(provider: string) {
  if (providerLabels[provider]) return providerLabels[provider];
  if (provider.startsWith('Claude')) return 'Anthropic';
  if (provider.startsWith('GPT')) return 'OpenAI';
  if (provider.startsWith('Gemini') || provider.startsWith('Google')) return 'Google';
  if (provider.startsWith('Grok')) return 'xAI';
  if (provider.startsWith('DeepSeek')) return 'DeepSeek';
  if (provider.startsWith('Kimi')) return 'Kimi';
  if (provider.startsWith('Kuaishou')) return 'Kuaishou';
  if (provider.startsWith('Xiaomi')) return 'Xiaomi';
  if (provider.startsWith('MiniMax')) return 'MiniMax';
  if (provider.startsWith('Volcengine') || provider.startsWith('ByteDance')) return 'ByteDance';
  if (provider.startsWith('Alibaba')) return 'Alibaba';
  return provider;
}

export const chatModels = modelCatalog
  .filter((model) => model.type === 'Text' || model.type === 'Chat')
  .map((model) => ({
    id: model.id,
    name: model.displayName,
    provider: generalProvider(model.provider),
    modelName: model.modelName,
  }));

export type ChatModel = (typeof chatModels)[number];

const providerOrder = [
  'DeepSeek',
  'OpenAI',
  'Google',
  'ByteDance',
  '智谱',
  'Kimi',
  'Anthropic',
  'Xiaomi',
  'MiniMax',
  'xAI',
];

export const chatProviders = providerOrder
  .map((provider) => ({
    provider,
    models: chatModels.filter((model) => model.provider === provider),
  }))
  .filter((item) => item.models.length > 0);

export const imageModels = modelCatalog.filter((model) => model.type === 'Image');
export const videoModels = modelCatalog.filter((model) => model.type === 'Video');
export const audioModels = modelCatalog.filter((model) => model.type === 'Audio');

export const pluginMarket = [
  {
    id: 'video-processing',
    name: '视频处理',
    version: '1.0.0',
    description:
      '为视频预检、视频分析与转码提供 ffmpeg 与 ffprobe；未安装时可在插件页或首次使用时下载。',
    tags: ['Video', 'FFmpeg', '官方'],
  },
  {
    id: 'doubao-search',
    name: '豆包搜索',
    version: '1.0.0',
    description:
      '火山引擎豆包搜索（原联网搜索 / SearchInfinity）。支持网页与图片搜索、Global / Custom 版本、主备 Key 回退；Custom 网页支持时间范围与权威筛选。',
    tags: ['联网搜索', '搜索', '火山引擎'],
  },
  {
    id: 'subagent',
    name: '子智能体',
    version: '0.1.0',
    description: '设置子智能体的递归层级、数量和模型。',
    tags: ['Agent', 'Subagent', '官方'],
  },
  {
    id: 'terminal',
    name: '终端',
    version: '0.1.0',
    description: '限制每条命令最多能跑多久、最多输出多少内容。',
    tags: ['Terminal', 'Shell', '官方'],
  },
  {
    id: 'agent-loop',
    name: 'Agent 循环',
    version: '0.1.0',
    description: '控制 Agent 派发工具调用的方式。',
    tags: ['Agent', 'Loop', 'Tools'],
  },
  {
    id: 'auto-review',
    name: 'Auto review',
    version: '0.2.0',
    description: '提供自动审查权限模式，由模型在每次工具调用前判断是否授权。',
    tags: ['Permission', 'Authorization', '官方'],
  },
  {
    id: 'schedule',
    name: '自动化任务',
    version: '0.1.0',
    description: '按设定的时间或周期，在会话中自动执行任务。',
    tags: ['Schedule', 'Cron', '官方'],
  },
  {
    id: 'agent-team',
    name: '智能体团队',
    version: '0.2.0',
    description: '启用团队协作、团队工具、成员列表和共享任务看板。',
    tags: ['Agent', 'Team', '官方'],
  },
  {
    id: 'web-search',
    name: '网页搜索',
    version: '0.1.0',
    description: '设置 DeepSeek 的搜索提供方。',
    tags: ['搜索', 'Search', '官方'],
  },
  {
    id: 'voice-input',
    name: '语音输入',
    version: '0.2.0',
    description: '在本机使用 SenseVoice 转写录音，首次使用需安装依赖。',
    tags: ['Voice', 'Speech', '官方'],
  },
] as const;

export const builtInSkills: Array<{
  id: string;
  name: string;
  description: string;
  whenToUse: string;
  content: string;
  category: string;
}> = [
  {
    id: 'story-planning',
    name: 'story-planning',
    description: '把故事概念拆解为人物、冲突、场景和镜头计划。',
    whenToUse: '需要设计叙事结构、分镜或影视化方案时。',
    content:
      '# Story Planning\n\n先明确核心冲突，再拆解人物目标、场景节点与镜头节奏。每一步输出可验证的中间结果。',
    category: '创作',
  },
  {
    id: 'visual-research',
    name: 'visual-research',
    description: '围绕视觉主题整理参考方向、材质、光线和构图。',
    whenToUse: '需要为图像、视频或 3D 资产建立视觉方向时。',
    content:
      '# Visual Research\n\n收集主题事实，归纳视觉关键词，并给出至少三个可执行的画面方案。',
    category: '设计',
  },
  {
    id: 'workflow-design',
    name: 'workflow-design',
    description: '将重复创作任务沉淀为节点式工作流。',
    whenToUse: '需要把素材输入、生成、筛选和导出连接成稳定流程时。',
    content:
      '# Workflow Design\n\n识别输入、处理、生成和验收节点，明确每个节点的模型、参数与失败回退。',
    category: '效率',
  },
];

