'use client';

const shortcutGroups = [
  {
    title: '全局操作',
    rows: [
      ['AI 对话面板', 'Ctrl + Q'],
      ['保存工程', 'Ctrl + S'],
      ['保存所有标签', 'Ctrl + Shift + S'],
    ],
  },
  {
    title: '画布操作',
    rows: [
      ['资产面板', 'Ctrl + B'],
      ['聚焦节点', 'F'],
      ['节点自动整理', 'Q'],
      ['节点自动整理（展开组）', 'Shift + Q'],
      ['对齐/分布', 'Alt + A'],
      ['统一尺寸', 'Alt + S'],
      ['统一大小', 'Ctrl + Alt + ↓'],
      ['统一宽度', 'Ctrl + Alt + →'],
      ['统一高度', 'Ctrl + Alt + ←'],
      ['统一缩放', 'Ctrl + Alt + ↓'],
      ['独立连线', 'S'],
      ['工作流资产菜单', 'Shift + E'],
      ['资产选择模式', 'Tab'],
    ],
  },
  {
    title: '节点操作',
    rows: [
      ['复制节点（带连线）', 'Ctrl + D'],
      ['复制节点（不带连线）', 'Shift + D'],
      ['复制 / 粘贴 / 剪切', 'Ctrl + C / V / X'],
      ['删除', 'Del / Back / X'],
      ['选中直接相连节点', 'L'],
      ['选中所有相连节点', 'Ctrl + L'],
      ['打组', 'Ctrl + G'],
      ['折叠/取消折叠叠卡', 'Z'],
      ['撤销', 'Ctrl + Z'],
      ['重做', 'Ctrl + Shift + Z'],
      ['创建注释框', 'C'],
      ['提交 Prompt编辑器内', 'Ctrl + Enter'],
    ],
  },
];

export function ShortcutSettings() {
  return (
    <>
      <div>
        <h3 className="text-sm font-semibold">快捷键设置</h3>
        <p className="mt-1 text-xs leading-5 text-zinc-500">
          自定义快捷键绑定，点击编辑后按下新的按键组合
        </p>
      </div>
      {shortcutGroups.map((group) => (
        <div
          key={group.title}
          className="rounded-xl border border-zinc-200 dark:border-white/10"
        >
          <div className="border-b border-zinc-200 px-3 py-2.5 text-xs font-semibold dark:border-white/10">
            {group.title}
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-white/[.07]">
            {group.rows.map(([title, keys]) => (
              <div key={title} className="flex h-10 items-center gap-3 px-3">
                <span className="min-w-0 flex-1 truncate text-xs text-zinc-600 dark:text-zinc-300">
                  {title}
                </span>
                <kbd className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-[10px] text-zinc-500 dark:border-white/10 dark:bg-white/[.05]">
                  {keys}
                </kbd>
                <button
                  type="button"
                  className="text-[10px] text-violet-500 hover:text-violet-400"
                >
                  编辑
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
