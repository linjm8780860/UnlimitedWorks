'use client';

import {
  Segmented,
  SelectLine,
  SettingsRow,
  SettingsToggle,
  SliderSetting,
} from '@/features/settings/components/settings-controls';
import { useSettingsStore } from '@/features/settings/settings-store';
import type { AppSettings } from '@/lib/types';

export function GenerationSettings() {
  const settings = useSettingsStore();
  const updateSettings = settings.updateSettings;
  return (
    <>
      <SettingsToggle
        title="智能引用 AutoLink"
        description="粘贴提示词或自动保存时，识别 @image1、@图片1、图片1、{{image1}} 等文字，以及 {{Image 5}}、{{Video 1}} 等带空格格式并转换为引用"
        checked={settings.autoLink}
        onChange={(autoLink) => updateSettings({ autoLink })}
      />
      <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/10">
        <div className="text-sm font-semibold">ChatPanel Agent 默认模型</div>
        <p className="mt-1 text-[10px] leading-4 text-zinc-500">
          主 Agent 使用 ChatPanel 当前 Chat
          模型；这里用于主 Agent 派生的子 Agent 默认文本模型，以及默认生图/生视频模型
        </p>
        <div className="mt-3 space-y-2">
          <SelectLine
            label="子Agent默认文本模型"
            value={settings.defaultSubagentModel}
          />
          <SelectLine label="默认生图模型" value={settings.defaultImageModel} />
          <SelectLine label="默认生视频模型" value={settings.defaultVideoModel} />
        </div>
      </div>
      <SettingsToggle
        title="Agent 创建节点后自动聚焦"
        description="AI 创建节点后，若节点在屏幕外则平移视图到该节点；在屏幕内则保持视图不动"
        checked={settings.agentFocusNewNodes}
        onChange={(agentFocusNewNodes) =>
          updateSettings({ agentFocusNewNodes })
        }
      />
      <SettingsToggle
        title="显示多个 AI 提示框"
        description="在节点上显示多个内联 AI 提示输入框"
        checked={settings.showMultiInlineAiPrompts}
        onChange={(showMultiInlineAiPrompts) =>
          updateSettings({ showMultiInlineAiPrompts })
        }
      />
      <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/10">
        <SettingsToggle
          title="局部重绘"
          description="框选图片区域进行局部重绘，生成结果羽化合成回原图"
          checked={settings.localRepaint}
          onChange={(localRepaint) => updateSettings({ localRepaint })}
          boxed={false}
        />
        <SliderSetting
          title="羽化边缘（12px）"
          description="0px（硬边缘）至 48px（柔和过渡）"
          value={settings.localRepaintFeather}
          min={0}
          max={48}
          step={1}
          suffix="px"
          onChange={(localRepaintFeather) =>
            updateSettings({ localRepaintFeather })
          }
          compact
        />
        <SettingsToggle
          title="自动回填"
          description="生成完成后自动合成回填（仅当生成数量为 1 时生效）"
          checked={settings.localRepaintAutoFill}
          onChange={(localRepaintAutoFill) =>
            updateSettings({ localRepaintAutoFill })
          }
          boxed={false}
        />
      </div>
      <SettingsRow
        title="标记图片发送模式"
        description="当参考图片包含可视化标记时，控制发送给 AI 的图片内容"
        control={
          <Segmented
            value={settings.markedImageSendMode}
            options={[
              ['original', '仅原图'],
              ['marked', '仅标记图'],
              ['both', '原图+标记图'],
            ]}
            onChange={(markedImageSendMode) =>
              updateSettings({
                markedImageSendMode:
                  markedImageSendMode as AppSettings['markedImageSendMode'],
              })
            }
          />
        }
      />
      <SettingsToggle
        title="引用图序号水印"
        description="生图时自动在每张引用图左上角烧录序号，帮助模型区分多张引用图"
        checked={settings.referenceWatermark}
        onChange={(referenceWatermark) =>
          updateSettings({ referenceWatermark })
        }
      />
      <SettingsToggle
        title="引用图智能描述"
        description="生图前用识图模型自动描述每张引用图，注入 prompt 帮助模型理解图片内容"
        checked={settings.referenceAutoDescribe}
        onChange={(referenceAutoDescribe) =>
          updateSettings({ referenceAutoDescribe })
        }
      />
      <SettingsRow
        title="多模态 Chat 图片识别"
        description="按需优先使用模型原生视觉，仅在工具调用或渠道传图失败时反推"
        control={
          <Segmented
            value={settings.multimodalImageRecognition}
            options={[
              ['disabled', '禁用'],
              ['onDemand', '按需'],
              ['forced', '强制'],
            ]}
            onChange={(multimodalImageRecognition) =>
              updateSettings({
                multimodalImageRecognition:
                  multimodalImageRecognition as AppSettings['multimodalImageRecognition'],
              })
            }
          />
        }
      />
      <SettingsRow
        title="反推提示词生成光效"
        description="反推提示词生成光效"
        control={
          <Segmented
            value={settings.promptLighting}
            options={[
              ['strong', '强'],
              ['weak', '弱'],
              ['off', '关闭'],
            ]}
            onChange={(promptLighting) =>
              updateSettings({
                promptLighting:
                  promptLighting as AppSettings['promptLighting'],
              })
            }
          />
        }
      />
      <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/10">
        <div className="text-sm font-semibold">Agent 提示词优化</div>
        <p className="mt-1 text-[10px] text-zinc-500">
          为不同类型的生成节点配置提示词优化模型和模式
        </p>
        <div className="mt-3 space-y-2">
          {[
            '图像生成',
            '视频生成',
            '音频生成',
            '文本生成',
            '分镜润色',
            '新增分镜',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="w-20 text-xs text-zinc-500">{item}</span>
              <Segmented
                value={settings.promptMode}
                options={[
                  ['default', '默认'],
                  ['custom', '自定义'],
                  ['agent', 'Agent'],
                ]}
                onChange={(promptMode) =>
                  updateSettings({
                    promptMode: promptMode as AppSettings['promptMode'],
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/10">
        <div className="text-sm font-semibold">MCP 服务端</div>
        <p className="mt-1 text-[10px] leading-4 text-zinc-500">
          允许外部 AI Agent（如 Claude Desktop、Cursor）通过 MCP 协议远程操作画布
        </p>
        <SettingsToggle
          title="启用 MCP Server"
          description="开启后，外部 Agent 可通过 Token 连接并操作画布节点"
          checked={settings.mcpServerEnabled}
          onChange={(mcpServerEnabled) =>
            updateSettings({ mcpServerEnabled })
          }
          boxed={false}
        />
      </div>
    </>
  );
}
