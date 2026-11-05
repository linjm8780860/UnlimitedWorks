# REA 功能分析：Unlimited Works

分析日期：2026-11-05  
目标页面：`http://localhost:3000/`  
目标版本：构建资源请求中出现 `0.3.967`  
分析工具：[REA](https://github.com/morluto/rea) CLI 6.8.0

## 结论

从许可协议文案、入口资源和懒加载模块可以判断，Unlimited Works 是一个以节点式 AI 工作流为核心的桌面创作应用。包内还包含媒体处理、3D/模型显示、插件、技能、Agent 和设置等模块。由于运行态停在首次使用协议页，除协议页和启动外观外，主画布及这些模块尚未通过交互确认。

## 运行态观察

REA 通过 CDP 找到了 `http://localhost:3000/` 页面。页面标题为 `Unlimited Works`。启动时会加载 `splash/UW_开场动画.mp4`；随后出现《Unlimited Works (UW) 软件许可及服务协议》1.1 版，页面标注最近更新日期为 2026 年 2 月 12 日。协议弹窗包含可滚动正文、滚动到底部提示、同意复选框、“拒绝并退出”和“同意并继续”按钮。

页面使用暗色主题。协议遮罩下能观察到应用标题栏和“折叠侧边栏”按钮；协议未完成前，React 主工作区没有进入可检查状态。分析过程没有代替用户勾选或接受协议。

REA 检查到主 bundle、CSS 及懒加载脚本。主脚本约 14,585,740 字节，主样式约 581,503 字节。storage 检查只返回键名，例如 `uw-pro-auth`、`uw-app-store`、`uw-tab-store`，没有读取或记录值。

运行态记录到应用尝试请求本机服务 `127.0.0.1:9466`，包括 `/proxy-config`、`/uw/auth/hwid`、`/uw/auth/device_name`、`/uw/update/check`、`/global/file/...`、`/global/mkdir` 和 `/global/save` 等。检查时该服务不可用，请求连接失败。`/cordis.patch.yml` 返回 404；提取目录也记录有未解析资源引用。由此可知，浏览器静态预览没有桌面原生桥接服务，不能据此确认这些操作在正常桌面环境中的结果。

## Bundle 静态证据

入口 `index.html` 引用 Vite 构建资源和 React vendor，并预加载 Lucide、Marked 及全局 CSS。主入口是 `assets/index-DCG6pvV7.js`；相关 CSS 为 `assets/index-BFpAZGXW.css`。提取清单包含 206 个资源、17 个未解析的本地引用。包内没有 Source Map，REA 捕获到的脚本 `source_map_url` 均为空。

| 功能方向 | 证据 | 置信度与边界 |
| --- | --- | --- |
| 节点式工作流画布 | 协议把软件定义为节点式工作流工具框架；主 bundle 有 canvas、node、connection 等结构 | 高；默认画布内容和节点行为未运行验证 |
| 图片、视频、文本与聊天创作 | 主 bundle 和功能 chunk 中可见媒体、生成任务、文本/聊天相关实现与字符串 | 中；不能据此确认入口位置、调用成功与结果状态 |
| 3D 与模型查看 | `ModelViewer`、`Scene3DViewport`、`SparkStage` 等懒加载 chunk | 中；界面布局和实际交互未观察 |
| 插件、Skill 与 Agent | `PluginsPage`、`agentRegistry`、`nativeNodeClient` 等模块；启动日志报告内置技能部署 | 中；页面可达性和部署成功状态未确认 |
| 设置、视频配置和轨迹视图 | `SettingsModal`、`VideoProcessingConfigSlot`、`DshTrajectory` 等 chunk | 中；chunk 存在不代表运行时一定可达 |
| 本地文件与桌面服务 | bundle 字符串和运行态请求包含本机桥接、全局文件读写接口 | 高；服务协议与成功响应仍待观察 |
| 账号和远端 API | storage key 名称及 bundle 中的远端 API origin | 低至中；没有读取密钥或 storage 值，也没有验证鉴权流程 |

以上是模块级判断，不是完整功能清单。Chunk 文件名只能说明包内存在相关代码，不能单独证明 UI 可达或功能正常。

## REA 覆盖范围与限制

本次使用 `list-browser-targets`、`inspect-web-page`、`analyze-web-bundle` 和 `analyze-javascript-application`。REA 的页面检查捕获了 8 个脚本，bundle 分析为部分完成；路由候选数为 0，但路由覆盖度为 unknown，不能据此断言应用没有路由。

REA 对约 14.6 MB 的主 bundle 做静态语义分析时，1 GB heap 配置发生内存不足；提高到 4 GB 后仍在 300 秒分析期限内超时。提取目录的多文件分析在 90 个 JS 文件中解析到 66 个后，为避免重复占用约 1.4 GB 内存而停止。分析器超时意味着证据不完整，不代表功能不存在。

## 后续运行态核验

在用户本人完成协议后，再用 REA 和 Playwright 记录主画布首次打开状态、导航/面板、节点创建和连接、运行/停止、导入导出、设置和插件等流程。之后以运行态观察到的请求和响应定义本地 mock；将本地文件桥接与账号系统作为独立的 SaaS 迁移事项处理。未经用户操作前，不把这些流程写成已验证行为。
