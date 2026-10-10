# Lumina

Lumina 是面向央视《新闻联播》中文文稿库的分析 Agent。它检索 2016 年起的文稿，按关键词、短语和日期查找报道，按年/月/日比较报道频次，并结合日期与原文链接核验分析依据。档案覆盖、搜索词和 AI 回答都有局限；报道频次不等于现实变化。

主域名：<https://lumina-news-agent.vercel.app>。本分支实现公开中英双语首页，尚未发布；本地验证不代表部署、Google 收录或增长。搜索与统计状态见 [docs/analytics.md](docs/analytics.md)。

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

## 本地开发

CI 使用 Node.js 24 与锁定的 pnpm 10.28.1。

```bash
pnpm install --frozen-lockfile
pnpm dev --hostname 127.0.0.1
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

在没有 `.env*` 文件的 checkout 中运行。临时目录置于当前工作树；控制面和模型地址指向本机关闭端口，不会调用生产服务。账户检查失败是这个演示的预期状态，公开页仍可读。

```bash
mkdir -p .cache/demo
export TMPDIR="$PWD/.cache/demo"
export NEXT_TELEMETRY_DISABLED=1
export BACKEND_URL=''
export LUMINA_CONTROL_URL=http://127.0.0.1:9
export DATA_HUB_URL=http://127.0.0.1:9
export OPENROUTER_BASE_URL=http://127.0.0.1:9
export OPENROUTER_API_KEY='' OPENAI_API_KEY='' DATA_HUB_API_KEY='' LUMINA_INTERNAL_KEY=''
pnpm build
pnpm start --hostname 127.0.0.1 --port 3100
```

打开 <http://127.0.0.1:3100/>。`/pricing`、`/privacy` 公开可读，进入分析会转至登录页。此演示不提供登录或真实分析。

## 质量检查

```bash
pnpm test
pnpm lint
pnpm build
pnpm exec tsc --noEmit
pnpm exec playwright install chromium
pnpm test:e2e
```

本地可用现有 Chrome：`PLAYWRIGHT_CHANNEL=chrome pnpm test:e2e`，无需下载浏览器。浏览器测试使用上一步的 production build，自动启动 loopback 服务、拦截浏览器 API 为明确的测试 fixture，并拒绝外部请求；不需要 secrets。应在无 `.env*` 文件的 checkout 中运行。浏览器临时文件默认写 `.cache/playwright`（可用 `TMPDIR` 覆盖），结果和失败 trace 在忽略的 `test-results/`。

覆盖无 JS 的双语首页和 SEO、延迟/失败/已登录认证后的首页、公共链接、匿名私有路由守卫、分享与认证 noindex、精确 sitemap、320px 布局和键盘访问。单元测试覆盖 SSR 内容、共享路径与 analytics 隐私策略。CI 对 PR 执行测试、lint、build、类型检查及 Chromium smoke；本地 Chrome 通过不能替代远程 CI 结果。

## 发布

本变更先通过 PR 审核，不直接修改生产部署。`main` 已关联 Vercel 生产分支，合并会触发生产构建；合并和正式发布须单独授权。发布后独立检查 CI 与部署结果，再按 [docs/analytics.md](docs/analytics.md) 验证正式域名和 Google 状态。生产拓扑及历史验收记录见 [docs/deployment.md](docs/deployment.md)。
