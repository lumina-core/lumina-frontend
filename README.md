# Lumina

Lumina 是面向央视《新闻联播》中文文稿库的分析 Agent。它检索 2016 年起的文稿，按关键词、短语和日期查找报道，按年/月/日比较报道频次，并结合日期与原文链接核验分析依据。档案覆盖、搜索词和 AI 回答都有局限；报道频次不等于现实变化。

主域名：<https://lumina-news-agent.vercel.app>。首页提供公开中英双语产品介绍；实际发布版本以 GitHub 与 Vercel 部署记录为准，页面可访问不代表 Google 已收录或流量增长。搜索与统计说明见 [docs/analytics.md](docs/analytics.md)。

## 公开页面与访问边界

- `/` 是同一 canonical URL 下的中英双语产品介绍，两种语言均由服务端渲染，无需 JavaScript 或登录即可阅读。它不切换整个应用的语言；聊天界面及源文稿以中文为主。
- `/`、`/pricing`、`/privacy` 是唯一可索引页面，也是 sitemap 和隐私友好页面统计的精确名单，统一定义于 `lib/site.ts`。
- `/chat`、具体会话、历史、设置和卡片需邮箱登录。分析使用积分，按实际 token 用量结算，不提供匿名分析。
- 问题、回答、历史和积分用量由服务端持久化，以支持会话恢复与计费。登录凭证使用 HttpOnly Cookie；分享链接持有人可匿名阅读相应会话。私有页、认证页、分享页及 API 均不索引，也不进入页面统计。noindex 不是鉴权。

## 当前架构

```text
浏览器 → Next.js（界面、账户 BFF、Agent API）
             ├→ OpenRouter（模型推理）
             └→ ECS / data-hub（新闻数据、账户、积分、历史）
```

新闻数据与账户记录保留在 ECS；Vercel 承载界面、BFF 与 Agent 编排。浏览器通过同源 API 访问服务。生产回源使用有效证书的 HTTPS，不通过裸公网 IP 传递密钥。旧 FastAPI 产品后端不承担当前生产认证与积分。

### 开源范围与自托管限制

本仓库以 [MIT](LICENSE) 提供界面、BFF 与 Agent 编排代码，**不是完整可独立自托管的服务**。现行账户/JWT、积分账本、会话存储与新闻检索依赖私有 Data Hub；它的源码、数据库、采集内容和凭据不随本仓库分发，也不会为测试而公开。旧产品后端不能替代它。

无私有服务权限时可以运行公开页面和本地边界测试，但不能据此宣称注册、计费或真实模型分析可用。模型服务需单独配置并承担费用；新闻原稿和第三方依赖不因本仓库 MIT 许可而获得额外再分发授权。

## 本地开发

CI 使用 Node.js 24.14.0 与锁定的 pnpm 10.28.1。先在无 `.env*` 文件的干净 checkout 中体验隔离公开页：

```bash
pnpm install --frozen-lockfile
pnpm demo
```

仓库不提供 `.env.example`。要使用完整账户和分析服务，需要自行配置私有 `.env.local`，不要提交凭据：

| 变量 | 用途 |
| --- | --- |
| `LUMINA_CONTROL_URL` | 账户、积分与历史控制面 |
| `LUMINA_INTERNAL_KEY` | 积分结算的服务端认证 |
| `DATA_HUB_URL`、`DATA_HUB_API_KEY` | 新闻库地址与服务端查询认证 |
| `OPENROUTER_API_KEY` | 模型调用 |
| `OPENROUTER_BASE_URL`、`OPENROUTER_MODEL` | 可选，覆盖模型服务地址与模型 |
| `APP_URL` | 当前应用地址 |

`BACKEND_URL` 是旧接口的可选 rewrite，正常 BFF 链路应留空。未配置控制面/数据地址时源码有生产默认值；只看公开页面请使用下面的隔离演示，避免意外回源。流式分析还要求已登录会话、有效的历史会话 ID 与积分，不能用匿名 curl 作为完整功能验收。

### 无凭据的公开页演示

`pnpm demo` 会构建并启动生产模式页面，HOME 和临时目录隔离在当前工作树的 `.cache/`；环境凭据不继承、控制面和模型指向本机关闭端口、Node 非回环连接被拒绝。存在 `.env*` 文件时脚本拒绝启动。账户检查失败是这个演示的预期状态，公开页仍可读。

```bash
pnpm demo
```

打开 <http://127.0.0.1:3100/>。`/pricing`、`/privacy` 公开可读，进入分析会转至登录页。此演示不提供登录或真实分析。

## 质量检查

```bash
PLAYWRIGHT_BROWSERS_PATH="$PWD/.cache/playwright-browsers" pnpm exec playwright install chromium
pnpm verify:local
# 或使用已安装的 Chrome，无需下载：
PLAYWRIGHT_CHANNEL=chrome pnpm verify:local
```

`verify:local` 在隔离 HOME/环境下依次运行单元测试、`test:contracts`、lint、production build、TypeScript 和生产浏览器回归，任一失败即退出。测试无需 secrets，不继承真实账户或模型凭据。结果、截图与失败 trace 位于忽略的 `test-results/`。

三层证据必须分开：

- **公开浏览器回归**：原首页、公共链接、无 JS/延迟认证、320px/键盘、protected 跳转、noindex/统计名单；浏览器 API 是明确的 fixture，不能证明真实登录。匿名 chat 401 另向真实本地 handler 断言。
- **公开 BFF 契约**：`pnpm test:contracts` 调用真实 route/传输代码，只替换 Next Cookie 上下文，回源为 loopback HTTP 响应；覆盖未登录、402 短路、Cookie、跨域、非幂等写不重试、取消后的错误 usage。它不验证私有账本。
- **维护者跨仓集成**：有私有后端 checkout 时，在后端运行 `uv sync --frozen` 后执行 `uv run --frozen python scripts/test_isolated.py --frontend /absolute/path/to/lumina-frontend`（先用本仓 `verify:local` 构建）。贯通真实生产 Next HTTP/BFF、私有账号路由、bcrypt/JWT、WAL SQLite、预约/结算/退款及消息/分享。仅种入虚构用户，模型替换为 loopback SSE；不发邮件、不读取生产库、不运行生产启动迁移。数据库和 HOME 每次新建并清理。

跨仓测试不复制或公开后端，也不在公开 PR CI 下载私有库。它覆盖 401、跨账户拒绝、402、服务端 usage ID、重复结算/退款、可信历史、UUID、持久化和分享撤销。真实邮件投递、新闻检索/工具调用质量、付费模型、跨境 TLS、线上计费与真实登录仍须独立授权验收；合成 fixture 全绿不能代替这些验收。

CI 必需 job 名保持 `verify`，所有 Action 固定上游完整 commit SHA，checkout 不保存 token，依赖使用 frozen lockfile。可读版本注释与 SHA 须一起核对更新。私有后端的 `lumina-contracts` job 与维护者跨仓检查是独立门禁；本地通过不代表远程 CI 已运行。

## 反馈与贡献

普通问题请附版本、复现步骤及合成输入；小范围 PR 请运行上述检查并说明真实服务未覆盖项。安全问题走 [私密报告入口](SECURITY.md)，不要公开用户内容或有效分享链接。无支持 SLA 或贡献合并承诺。

## 发布

本变更先通过 PR 审核，不直接修改生产部署。`main` 已关联 Vercel 生产分支，合并会触发生产构建；合并和正式发布须单独授权。发布后独立检查 CI 与部署结果，再按 [docs/analytics.md](docs/analytics.md) 验证正式域名和 Google 状态。生产拓扑及历史验收记录见 [docs/deployment.md](docs/deployment.md)。
