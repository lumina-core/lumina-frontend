# Lumina 部署说明

完整业务链路历史验证：2026-09-23（不代表今日业务实测）。

## 局部网页发布与回退

2026-11-11 核对：项目 `prj_xbpwfOOMer1BKH1AfWJatJocon2T` 属于
`team_iplHWnEw5KErlysvZjKjfyQ5`，仓库根目录（rootDirectory=null），Node 24.x、
Next.js；build/install/output 均为框架默认，锁文件选用 pnpm，构建执行 `pnpm build`。
`vercel.json` 继续声明 Next.js 和 stream 函数 60 秒上限。

沿用 Git → PR `verify` → 受保护 `main` → Vercel 自动发布，不绕过检查。
当前没有额外 Vercel Deployment Checks；不要把 GitHub 分支检查写成已配置该能力。
每次记录正式 alias 的前后 deployment ID/URL、源码 SHA 与有效 projectSettings。
局部字体/联系变更只验证公开页和隔离 fixture，不调用生产账户、验证码或模型。

本次发布前正式 alias 对应 `dpl_ARxEuGWaMNnDHwuwix5GuBU3uCpE`，
源码 `0b6de1da0bfc3e2d88c56149459fac5eeb6777ab`，可作为本次静态变更的回退版本。
需要回退时，在已核对 owner/project 的 CLI 上执行：

```sh
vercel rollback lumina-news-agent-d8b066a9y-shanes-projects-025e82ba.vercel.app --scope shanes-projects-025e82ba
```

回退后读回正式 alias 并检查公开页；回退不回滚外部数据库。旧构建的环境配置需
按当时情况复核；Instant Rollback 后恢复自动域名分配应明确 promote 目标版本。
本次交付的部署/CI/浏览器证据保存在仓库忽略目录 `.cache/release-206/`，通过任务附件交付。

## 生产拓扑

Lumina 采用“Vercel Agent/BFF 层 + 自有控制面与数据层”：

1. Next.js 页面和 `/api/chat/stream` 部署在 Vercel。
2. `openai/gpt-5.6-luna` 通过 OpenRouter 执行工具调用和生成回答。
3. 新闻搜索工具使用 `X-API-Key` 访问阿里云 ECS 上的 data-hub。
4. 用户、积分、邀请码、聊天历史保存在 ECS 的独立 `accounts.db`。
5. 新闻正文、SQLite 数据库和采集任务不进入 Vercel。

Data Hub 本身不再作为独立产品展示。`api.lumina-core.cn`、`console.lumina-core.cn`、
根域和相关 Vercel 部署均受 Vercel Authentication 保护；ECS 的根路径、API 文档、
OpenAPI 与 `/llms.txt` 也不公开。Lumina 通过服务端密钥继续使用数据和账号控制面，
浏览器不会直接访问 Data Hub。

登录注册通过 Vercel 的 `/api/v1/*` BFF 转发到 ECS。ECS 返回的 JWT 只写入
`HttpOnly + Secure + SameSite=Lax` Cookie，不进入浏览器 JavaScript 或
`localStorage`。登录用户开始分析前，Vercel 会向 ECS 原子预占 1 积分；模型完成后
用同一 `request_id` 结算 token 用量。重复请求不会重复扣分，Agent 失败会退回预占，
超时未完成的预占会在下次请求时自动释放。

没有采用“公网 IP + API Key”的方案。裸 IP 无法为目标主机名提供正常的 TLS 校验，明文 HTTP 又会暴露 API Key。生产回源使用 `https://www.lumina-core.cn`，证书链和 URL 主机名校验保持开启。

该域名在部分跨境链路中发送 SNI 后会被中途重置。Agent 的 Node.js 回源客户端只对这个已知域名省略 SNI，由 Caddy 的 `default_sni` 返回同一张有效证书；它没有关闭 `rejectUnauthorized`，错误证书或错误主机名仍会失败。这样也省掉了 `api.lumina-core.cn` Vercel 网关的额外一跳。

## Vercel

- Project：`shanes-projects-025e82ba/lumina-news-agent`
- Production：<https://lumina-news-agent.vercel.app>
- Runtime：Node.js / Next.js App Router
- Agent 函数上限：60 秒

环境变量：

| 名称 | 类型 | 用途 |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Secret | 模型调用 |
| `DATA_HUB_API_KEY` | Secret | data-hub 鉴权 |
| `OPENROUTER_BASE_URL` | Config | OpenRouter OpenAI-compatible 地址 |
| `OPENROUTER_MODEL` | Config | `openai/gpt-5.6-luna` |
| `DATA_HUB_URL` | Config | `https://www.lumina-core.cn` |
| `LUMINA_CONTROL_URL` | Config | ECS 账户控制面地址 |
| `LUMINA_INTERNAL_KEY` | Secret | Vercel → ECS 积分结算认证 |
| `APP_URL` | Config | 生产站地址 |

密钥只保存在 Vercel 环境变量和本机私有配置中，不写入仓库。

公开 Agent 在函数内有一层 best-effort 的每 IP 10 分钟 12 次限流。它用于防止单个热实例上的明显滥用，不能替代平台级限制；Vercel Firewall 规则应先以 log 模式观察真实流量，再发布 429 限流。

## 2026-09-23 验收

- TypeScript、ESLint、Next.js production build 全部通过。
- 首页和 `/chat` 均返回 HTTP 200。
- 线上真实请求完成 `searchNews → getNewsArticle → 流式回答`。
- 验证问题成功返回年度报道数量、原文引用、央视链接和 token 用量。
- ECS 本机新闻聚合查询约为毫秒级；修复回源握手后，本机 HTTPS 查询实测约 0.6 秒。

## 账户控制面

账户能力复用 data-hub 已在线的门户用户体系，并在独立的 `accounts.db` 新增
Lumina 积分钱包、幂等流水、邀请关系和聊天历史表。新闻库仍在 `lumina.db`，两者
物理分离。旧 `lumina-backend` 保留为历史代码，不再承担生产认证和积分。
