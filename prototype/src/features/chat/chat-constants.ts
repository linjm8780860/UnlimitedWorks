export const agentModeCopy = {
  standard: {
    label: '标准模式',
    description: '处理代码、文件和资料，适合大多数任务。Agent 会按需使用检索、编辑和终端等工具。',
  },
  ptc: {
    label: 'PTC 模式',
    description:
      '包含标准模式的所有能力，更适合批量调用工具，并对结果进行筛选、整理、去重、统计或汇总的任务。',
  },
  minimal: {
    label: '极简模式',
    description: 'Agent 仅使用终端工具完成任务，适合测试和对比其基础表现。',
  },
  creative: {
    label: '创造模式',
    description: '用对话定制 UW：让 Agent 编写插件，添加新功能或界面；也能组合工具和提示词，创建自己的模式。',
  },
} as const;

export const accessModeCopy = {
  view: '仅可查看',
  workspace: '工作区内修改',
  full: '完全权限',
} as const;

export const reasoningCopy = {
  minimal: 'Minimal',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  xhigh: 'XHigh',
} as const;

