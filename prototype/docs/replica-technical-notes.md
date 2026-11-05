# Unlimited Works 1:1 基线：技术说明

日期：2026-11-05  
工程目录：`prototype/`  
应用框架：Next.js 15.5.29 App Router

## 当前交付

当前首页使用提取出的生产 bundle 作为视觉基线。Next.js 将原始 `index.html` 和 root-relative 静态资源从 `reference/compiled-frontend/` 提供给浏览器，不复制或改写这 65 MB 的资源集。这样可以在尚无 Source Map 和原始组件源码的情况下，忠实呈现现有编译 UI。

这属于对编译前端的 Next.js 托管，不是把原应用组件重写成 React/Next.js。原来的 SaaS mock 仍保留在 `/studio`，作为可单独访问的 React Flow 原型。

## 路由与文件

| 路径/文件 | 用途 |
| --- | --- |
| `/` | Next.js 页面加载全屏 iframe，内容指向 `/reference/index.html` |
| `/reference/index.html` | 从 `reference/compiled-frontend/index.html` 提供原入口 |
| `/assets/*`、`/icons/*`、`/splash/*` 等 | 动态资源路由从提取目录读取文件并返回对应 MIME 类型 |
| `/studio` | 原有 SaaS mock 工作台 |
| `src/app/page.tsx` | 编译前端 iframe 首页 |
| `src/app/[...resource]/route.ts` | 静态文件读取、路径约束和 MIME 响应 |
| `src/app/studio/page.tsx` | 挂载现有 `Root` 工作台 |
| `src/styles.css` | iframe 全屏样式及 `/studio` 样式 |
| `reference/compiled-frontend/` | 从 Unlimited Works 可执行包提取的生产资源 |

资源路由将请求路径规范化到 `reference/compiled-frontend/` 下，并拒绝目录外路径。HTML 使用 `no-cache`，其他资源使用 1 小时缓存。常用 JS、CSS、HTML、图片、视频、字体和 WASM 扩展名有显式 MIME 映射。

## 运行

在 `prototype/` 目录执行：

```powershell
npm install
npm run dev
```

`npm run dev` 默认使用 `http://127.0.0.1:4173`。本次验证时该端口已有服务，因此生产预览额外运行在 `http://127.0.0.1:4174`。生产启动命令为：

```powershell
npm run build
node_modules\.bin\next start --hostname 127.0.0.1 --port 4174
```

## 验证记录

- `npx tsc --noEmit`：通过。
- `npm run build`：通过；构建包含 `/`、动态资源路由和 `/studio`。
- 生产模式下，用同一 Chrome、同一 1440×960 视口对比 3000 参照页与 Next 首页的协议状态：差异像素为 0 / 1,382,400。
- `/studio` 在浏览器中正常渲染 4 个 React Flow 节点、58 个按钮，没有 page error。
- 主 JS、CSS、favicon 和开场动画在 Next 静态资源路由下均返回成功。

## 当前边界

1. 首屏会显示原应用软件协议。自动化没有替用户同意；主工作区的运行态布局和交互尚未采集。
2. 编译前端会访问原桌面桥接端口 `9466/9467/9476/9477`。这些接口目前没有被 Next mock，网页里的原生文件、身份和其他桌面操作可能失败，也不应作为 SaaS 后端实现。
3. `reference/compiled-frontend/manifest.json` 记录 17 个未解析本地资源引用，预览中至少有部分可选资源返回 404。
4. `/studio` 使用前端演示数据，不接生产 API，也未接入 BizyHome 共享用户系统。
5. 1:1 像素核验只覆盖首次协议页；没有覆盖主画布、移动布局、交互状态和原生 API。

## 下一步

取得主画布运行态证据后，先整理页面状态、交互流程和本地桥接请求/响应，再实现独立的 mock API。之后决定以编译前端作为短期精确基线，还是依据观察结果逐步将界面迁移到 Next 组件。认证继续预留给 BizyHome，共享用户系统不在当前 mock 范围内。
