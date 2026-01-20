This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### 开发环境

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 生产环境部署

```bash
# 1. 安装依赖
pnpm install

# 2. 构建生产版本
pnpm build

# 3. 启动生产服务器（默认端口 3000）
pnpm start

# 或指定端口
PORT=8080 pnpm start

# 后台运行（使用 nohup）
nohup pnpm start > lumina.log 2>&1 &

# 后台运行并指定端口
nohup sh -c 'PORT=8080 pnpm start' > lumina.log 2>&1 &

# 查看后台进程
ps aux | grep next

# 停止后台进程
kill $(lsof -t -i:3000)  # 停止 3000 端口的进程
```

**使用 PM2 进行进程管理（推荐生产环境）：**

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start npm --name "lumina-frontend" -- start

# 或指定端口
pm2 start npm --name "lumina-frontend" -- start -- -p 8080

# 常用命令
pm2 list          # 查看进程列表
pm2 logs          # 查看日志
pm2 restart all   # 重启所有服务
pm2 stop all      # 停止所有服务
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
