'use client';

import { LayoutGrid } from 'lucide-react';
import {
  Segmented,
  SettingsRow,
  SettingsToggle,
  SliderSetting,
} from '@/features/settings/components/settings-controls';
import { useSettingsStore } from '@/features/settings/settings-store';
import type { AppSettings } from '@/lib/types';

export function CanvasSettings() {
  const settings = useSettingsStore();
  const updateSettings = settings.updateSettings;
  return (
    <>
      <SettingsRow
        title="连线样式"
        description="节点之间连线的绘制方式"
        control={
          <Segmented
            value={settings.connectionStyle}
            options={[
              ['bezier', '贝塞尔'],
              ['straight', '直线'],
              ['orthogonal', '直角'],
            ]}
            onChange={(connectionStyle) =>
              updateSettings({
                connectionStyle:
                  connectionStyle as AppSettings['connectionStyle'],
              })
            }
          />
        }
      />
      <SettingsToggle
        title="显示小地图"
        description="在画布左下角显示缩略导航地图"
        checked={settings.showMiniMap}
        onChange={(showMiniMap) => updateSettings({ showMiniMap })}
      />
      <SettingsToggle
        title="命名路由幽灵连线"
        description="选中引用节点时，显示虚线指向对应的声明节点"
        checked={settings.namedRouteGhosts}
        onChange={(namedRouteGhosts) => updateSettings({ namedRouteGhosts })}
      />
      <SettingsToggle
        title="视频分析后自动聚焦到新节点"
        description="分镜分析完成后自动将画布视口平移到新生成的节点区域"
        checked={settings.autoFocusVideoAnalysis}
        onChange={(autoFocusVideoAnalysis) =>
          updateSettings({ autoFocusVideoAnalysis })
        }
      />
      <SettingsToggle
        title="Space+左键拖拽画布"
        description="按住空格键时，鼠标左键拖拽可平移画布（类似 Photoshop）"
        checked={settings.spacePan}
        onChange={(spacePan) => updateSettings({ spacePan })}
      />
      <SettingsToggle
        title="ALT 拖拽复制继承容器"
        description="复制节点时继承原节点所在的节点组和注释框；关闭后，复制节点不加入这些容器"
        checked={settings.duplicateInheritsContainer}
        onChange={(duplicateInheritsContainer) =>
          updateSettings({ duplicateInheritsContainer })
        }
      />
      <SettingsToggle
        title="灵动岛随画布缩放"
        description="开启后，普通节点与多选灵动岛在 100% 以下随画布缩放；关闭后始终保持固定屏幕尺寸"
        checked={settings.islandScales}
        onChange={(islandScales) => updateSettings({ islandScales })}
      />
      <SettingsRow
        title="灵动岛显示方式"
        description="选择靠近节点时显示，或仅在节点被选中时显示"
        control={
          <Segmented
            value={settings.islandVisibility}
            options={[
              ['hover', 'Hover 靠近显示'],
              ['selected', '选中节点显示'],
            ]}
            onChange={(islandVisibility) =>
              updateSettings({
                islandVisibility:
                  islandVisibility as AppSettings['islandVisibility'],
              })
            }
          />
        }
      />
      <SettingsRow
        title="画布鼠标滚轮"
        description="鼠标指向画布空白处时滚轮的行为；触控板可按住 Ctrl/⌘ 临时缩放。"
        control={
          <Segmented
            value={settings.wheelMode}
            options={[
              ['zoom', '缩放画布'],
              ['none', '不产生影响'],
              ['pan', '平移画面'],
            ]}
            onChange={(wheelMode) =>
              updateSettings({ wheelMode: wheelMode as AppSettings['wheelMode'] })
            }
          />
        }
      />
      <SliderSetting
        title="缩放灵敏度"
        description="越小越柔和，适合 Mac 触控板；也作用于 Ctrl/⌘ 临时缩放"
        value={settings.zoomSensitivity}
        min={0.2}
        max={2}
        step={0.1}
        suffix="x"
        onChange={(zoomSensitivity) => updateSettings({ zoomSensitivity })}
      />
      <SliderSetting
        title="聚焦冗余"
        description="100% 为当前铺满；数值越小，聚焦后四周留白越多"
        value={settings.focusPadding}
        min={70}
        max={140}
        step={5}
        suffix="%"
        onChange={(focusPadding) => updateSettings({ focusPadding })}
      />
      <SettingsRow
        title="默认创建节点大小"
        description="创建普通节点时使用的默认宽高。影视板、场次卡、故事板等专用尺寸节点不受影响"
        control={
          <Segmented
            value="default"
            options={[
              ['default', '默认'],
              ['custom', '自定义'],
            ]}
            onChange={() => undefined}
          />
        }
      />
      <SliderSetting
        title="灵动岛显示按钮数"
        description="节点上方灵动岛一次显示的最大按钮数量，超出部分可滚动查看"
        value={settings.islandButtonCount}
        min={3}
        max={10}
        step={1}
        suffix=""
        onChange={(islandButtonCount) => updateSettings({ islandButtonCount })}
      />
      <SettingsToggle
        title="灵动岛按钮模式持久化"
        description="新建节点时沿用上次启用的 RH、即梦 CLI 等灵动岛按钮模式"
        checked={settings.persistIslandModes}
        onChange={(persistIslandModes) => updateSettings({ persistIslandModes })}
      />
      <button type="button" className="SettingsAction">
        <LayoutGrid size={14} />
        灵动岛
      </button>
    </>
  );
}
