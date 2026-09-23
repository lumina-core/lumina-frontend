# Lumina

Lumina 是一个面向央视《新闻联播》全文库的中文分析 Agent。它会先检索 2016 年至今的原始文稿，再回答报道频次、措辞变化、政策信号和时间趋势，并尽量给出可点击的央视原文。

线上地址：<https://lumina-news-agent.vercel.app>

## 当前架构

```text
浏览器
  → Vercel / Next.js（界面 + Agent API）
  → OpenRouter / openai/gpt-5.6-luna
  → HTTPS + API Key
  → 阿里云 ECS / data-hub（新闻数据与查询）
```

- Vercel 只承载前端和 Agent 编排，不保存新闻数据。
- 新闻数据库、全文检索和 API Key 校验留在 data-hub 服务器。
- Agent 直接使用带有效证书的 HTTPS 域名回源，不通过裸公网 IP 传递密钥。
- 旧 FastAPI 产品后端不在当前上线链路内；登录、积分和持久化历史仍作为可选旧功能保留。
- 未登录用户可直接体验，当前对话保存在浏览器内存中，刷新后不会持久化。

## 本地开发

要求 Node.js 20+、pnpm 10+。

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

必须配置：

```dotenv
DATA_HUB_API_KEY=
DATA_HUB_URL=https://www.lumina-core.cn
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-5.6-luna
APP_URL=http://localhost:3000
```

`BACKEND_URL` 仅用于连接旧 FastAPI 的登录、历史和积分接口。访客版 Agent 不需要它。

## 质量检查

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

也可以直接验证流式 Agent：

```bash
curl --no-buffer http://localhost:3000/api/chat/stream \
  -H 'Content-Type: application/json' \
  --data-binary '{"query":"过去几年《新闻联播》如何报道低空经济？","chat_history":[]}'
```

## Vercel 部署

项目使用 `vercel.json` 固定 Next.js 框架和 Agent 函数时限。首次部署前，在 Vercel 的 Production 与 Preview 环境中配置上面的六个变量，然后执行：

```bash
vercel deploy
vercel deploy --prod
```

生产拓扑、回源说明与验收记录见 [docs/deployment.md](docs/deployment.md)。
