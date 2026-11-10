'use client';

import { Download, PlugZap, RefreshCw } from 'lucide-react';
import type { AppSettings } from '@/lib/types';
import { useSettingsStore } from '@/features/settings/settings-store';
import { useShellStore } from '@/features/app-shell/shell-store';
import {
  Segmented,
  SettingsRow,
  SettingsToggle,
  SliderSetting,
} from '@/features/settings/components/settings-controls';

export function ProxySettings() {
  const settings = useSettingsStore();
  const updateSettings = settings.updateSettings;
  return (
    <div className="space-y-5 px-6 py-5">
      <SettingsRow
        title="代理模式"
        description={
          settings.proxyMode === 'disabled'
            ? '不使用任何代理，直接连接。'
            : settings.proxyMode === 'system'
              ? '使用操作系统当前的网络代理。'
              : '使用自定义 HTTP/SOCKS 代理。'
        }
        control={
          <Segmented
            value={settings.proxyMode}
            options={[
              ['disabled', '禁用代理'],
              ['system', '系统代理'],
              ['custom', '自定义代理'],
            ]}
            onChange={(proxyMode) =>
              updateSettings({ proxyMode: proxyMode as AppSettings['proxyMode'] })
            }
          />
        }
      />
      {settings.proxyMode === 'custom' && (
        <label className="block rounded-xl border border-zinc-200 p-3 dark:border-white/10">
          <span className="block text-xs text-zinc-500">代理地址</span>
          <input
            placeholder="http://127.0.0.1:7890"
            className="mt-1.5 h-9 w-full rounded-lg border border-zinc-200 bg-transparent px-2.5 text-sm outline-none dark:border-white/10"
          />
        </label>
      )}
      <button type="button" className="SettingsAction">
        <PlugZap size={14} />
        测试连接
      </button>
    </div>
  );
}

export function PerformanceSettings() {
  const settings = useSettingsStore();
  const updateSettings = settings.updateSettings;
  return (
    <div className="space-y-5 px-6 py-4">
      <SettingsRow
        title="性能模式"
        description="关闭：正常渲染。自动：节点过多时自动进入性能模式。全局：始终性能模式。"
        control={
          <Segmented
            value={settings.performanceMode}
            options={[
              ['off', '关闭'],
              ['auto', '自动'],
              ['global', '全局'],
            ]}
            onChange={(performanceMode) =>
              updateSettings({ performanceMode: performanceMode as AppSettings['performanceMode'] })
            }
          />
        }
      />
      <SettingsToggle
        title="性能显示"
        description="管理画布 HUD、WebView2 内存监测与后台清理"
        checked={settings.showPerformanceHud}
        onChange={(showPerformanceHud) => updateSettings({ showPerformanceHud })}
      />
      <SettingsToggle
        title="自动保存"
        description="空闲且工程有未保存更改时自动保存；任务进行中不会执行。"
        checked={settings.autoSave}
        onChange={(autoSave) => updateSettings({ autoSave })}
      />
      <SettingsRow
        title="空闲等待"
        description="开始自动保存前的空闲时间"
        control={
          <Segmented
            value={String(settings.idleSaveSeconds)}
            options={[
              ['30', '30 秒'],
              ['60', '60 秒'],
              ['120', '2 分钟'],
              ['300', '5 分钟'],
              ['600', '10 分钟'],
            ]}
            onChange={(value) => updateSettings({ idleSaveSeconds: Number(value) })}
          />
        }
      />
      <SettingsToggle
        title="全景预览使用缩略图"
        description="开启后全景预览使用缩略图（更流畅），关闭则使用原图（更清晰）"
        checked={settings.panoramaThumbnail}
        onChange={(panoramaThumbnail) => updateSettings({ panoramaThumbnail })}
      />
      <SliderSetting
        title="视口裁剪边距（px）"
        description="边距越大，渲染越平滑但视口统计会更大；边距为 0 时更贴近真实视口。"
        value={settings.viewportPadding}
        min={0}
        max={300}
        step={10}
        suffix="px"
        onChange={(viewportPadding) => updateSettings({ viewportPadding })}
      />
      <SliderSetting
        title="视口内节点数阈值"
        description="超过阈值后自动切换性能策略"
        value={settings.viewportNodeLimit}
        min={50}
        max={500}
        step={10}
        suffix=""
        onChange={(viewportNodeLimit) => updateSettings({ viewportNodeLimit })}
      />
      <SliderSetting
        title="视口内大图节点数阈值（边长>3000）"
        description="限制大图同时渲染数量"
        value={settings.viewportLargeImageLimit}
        min={8}
        max={100}
        step={4}
        suffix=""
        onChange={(viewportLargeImageLimit) => updateSettings({ viewportLargeImageLimit })}
      />
      <SettingsToggle
        title="显示参考图片内存使用"
        description="在参考图片栏显示图片总大小"
        checked={settings.showReferenceMemory}
        onChange={(showReferenceMemory) => updateSettings({ showReferenceMemory })}
      />
      <SettingsToggle
        title="导入时自动压缩大图"
        description="仅在像素总量超过阈值时压缩，避免导入卡顿与内存峰值"
        checked={settings.autoCompressLargeImages}
        onChange={(autoCompressLargeImages) => updateSettings({ autoCompressLargeImages })}
      />
      <SliderSetting
        title="触发压缩像素阈值（宽×高超过此值才压缩）"
        description="单位：百万像素"
        value={settings.compressionPixelThreshold}
        min={1}
        max={128}
        step={1}
        suffix="MP"
        onChange={(compressionPixelThreshold) => updateSettings({ compressionPixelThreshold })}
      />
      <SliderSetting
        title="压缩后最大边长"
        description="压缩时会缩放到此边长以内"
        value={settings.compressionMaxEdge}
        min={1024}
        max={8192}
        step={256}
        suffix="px"
        onChange={(compressionMaxEdge) => updateSettings({ compressionMaxEdge })}
      />
      <SliderSetting
        title="压缩质量（越高画质越好，文件越大）"
        description="压缩质量"
        value={settings.compressionQuality}
        min={50}
        max={100}
        step={1}
        suffix="%"
        onChange={(compressionQuality) => updateSettings({ compressionQuality })}
      />
      <SliderSetting
        title="最大撤销步数"
        description="较大的值会占用更多内存，建议范围 20-100"
        value={settings.maxUndoSteps}
        min={10}
        max={100}
        step={1}
        suffix=""
        onChange={(maxUndoSteps) => updateSettings({ maxUndoSteps })}
      />
      <SettingsRow
        title="图片导出设置"
        description="下载或复制图片时是否压缩。常规模式保持原图不变；压缩模式可选格式与质量。"
        control={
          <Segmented
            value={settings.imageExportMode}
            options={[
              ['original', '常规'],
              ['compressed', '压缩'],
            ]}
            onChange={(imageExportMode) =>
              updateSettings({ imageExportMode: imageExportMode as AppSettings['imageExportMode'] })
            }
          />
        }
      />
      <SettingsToggle
        title="启用冗余备份"
        description="CTRL+S 保存时自动创建备份文件，存放在工程目录/Workflow/ 下"
        checked={settings.redundancyBackup}
        onChange={(redundancyBackup) => updateSettings({ redundancyBackup })}
      />
      <SliderSetting
        title="最多保留备份数量"
        description="超过此数量时自动删除最旧的备份（范围 1-50）"
        value={settings.maxBackups}
        min={1}
        max={50}
        step={1}
        suffix=""
        onChange={(maxBackups) => updateSettings({ maxBackups })}
      />
    </div>
  );
}

export function LogSettings() {
  const pushToast = useShellStore((state) => state.pushToast);
  return (
    <div className="space-y-4 px-6 py-5">
      <SettingsRow
        title="导出日志"
        description="仅包含本次运行的日志（由 remoteLog 记录）"
        control={
          <button
            type="button"
            onClick={() => pushToast('日志已导出到本地下载。', 'success')}
            className="SettingsAction"
          >
            <Download size={14} />
            导出日志
          </button>
        }
      />
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-[11px] leading-5 text-zinc-500 dark:border-white/10 dark:bg-black/20">
        [INFO] uw-next bootstrap completed
        <br />
        [INFO] workspace provider loaded
        <br />
        [INFO] local persistence ready
      </div>
    </div>
  );
}

export function ProSettings() {
  const pushToast = useShellStore((state) => state.pushToast);
  return (
    <div className="space-y-4 px-6 py-5">
      <div className="rounded-xl border border-zinc-200 p-4 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">授权状态</div>
          <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] text-zinc-500 dark:bg-white/[.06]">
            未激活
          </span>
        </div>
        <div className="mt-2 font-mono text-[11px] text-zinc-400">HWID: -</div>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-xs text-zinc-500">激活码</span>
        <input
          placeholder='输入激活码后点击"激活"按钮完成激活'
          className="h-10 w-full rounded-lg border border-zinc-200 bg-transparent px-3 text-sm outline-none dark:border-white/10"
        />
      </label>
      <button
        type="button"
        onClick={() => pushToast('本地复刻环境不连接真实授权服务。', 'error', '激活失败')}
        className="h-9 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white dark:bg-white dark:text-zinc-900"
      >
        激活
      </button>
      <label className="block">
        <span className="mb-1.5 block text-xs text-zinc-500">邀请码（选填）</span>
        <input
          placeholder="验证邮箱后，系统将自动为邀请人发放奖励天数"
          className="h-10 w-full rounded-lg border border-zinc-200 bg-transparent px-3 text-sm outline-none dark:border-white/10"
        />
      </label>
      <p className="text-xs leading-5 text-zinc-500">
        没有邀请码？可使用管理员推荐码
        <button type="button" className="ml-1 font-mono text-violet-500 hover:text-violet-400">
          YKFTGGSN
        </button>
        （点击填入）
      </p>
      <div className="rounded-xl border border-zinc-200 p-3 dark:border-white/10">
        <div className="text-sm font-semibold">爱发电订单提货</div>
        <p className="mt-1 text-[10px] text-zinc-500">在爱发电购买后，输入订单号即可自动获取激活码</p>
        <div className="mt-3 flex gap-2">
          <input
            placeholder="订单号"
            className="h-9 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-transparent px-2.5 text-sm outline-none dark:border-white/10"
          />
          <button type="button" className="SettingsAction">
            提货
          </button>
        </div>
      </div>
    </div>
  );
}

export function AboutSettings() {
  const pushToast = useShellStore((state) => state.pushToast);
  return (
    <div className="flex flex-col items-center px-6 py-7 text-center">
      <img src="/logo_dark.ico" alt="Unlimited Works" className="size-14 object-contain" />
      <h3 className="mt-3 text-lg font-semibold">Unlimited Works</h3>
      <p className="mt-1 text-xs text-zinc-500">Version 0.3.967</p>
      <button
        type="button"
        onClick={() => pushToast('当前已是本地复刻版本。', 'success', '检查更新')}
        className="mt-3 SettingsAction"
      >
        <RefreshCw size={13} />
        检查更新
      </button>
      <div className="mt-5 max-w-sm text-sm leading-6 text-zinc-500">
        <div className="font-medium text-zinc-700 dark:text-zinc-300">Yukirito</div>
        <div>UE美术 &amp; 独立开发者</div>
        <div>YukiritoStudio</div>
        <div>-Yukirito-</div>
      </div>
      <div className="mt-5 grid w-full max-w-sm grid-cols-2 gap-3">
        {['Bilibili', '小红书', '抖音', 'Notion'].map((item) => (
          <button
            key={item}
            type="button"
            className="h-10 rounded-lg border border-zinc-200 text-xs text-zinc-600 hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[.05]"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-6 w-full rounded-xl bg-zinc-100 p-4 dark:bg-white/[.05]">
        <div className="text-xs font-medium">用户群</div>
        <p className="mt-1 text-[10px] text-zinc-500">若扫码失败，请联系微信号: YukiritoStudio</p>
      </div>
      <p className="mt-5 text-[10px] text-zinc-400">
        Copyright © 2026 Yukirito. All Rights Reserved.
      </p>
      <div className="mt-3 flex gap-3 text-[11px] text-violet-500">
        <button type="button">软件许可协议</button>
        <button type="button">隐私声明</button>
        <button type="button" className="text-rose-500">
          重置授权
        </button>
      </div>
    </div>
  );
}

