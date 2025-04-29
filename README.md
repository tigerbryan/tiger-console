# Tiger Console

Tiger Console 是一个基于 Next.js 构建的现代化 Web 控制台应用。

## 功能特性

- 🔐 Google OAuth 2.0 认证
- 🎨 现代化 UI 设计 (Tailwind CSS)
- 📱 响应式布局
- 🚀 基于 Next.js 14 构建

## 技术栈

- Next.js 14.1.0
- React 18.2.0
- NextAuth.js
- Tailwind CSS
- TypeScript

## 开发环境设置

1. 克隆仓库：
```bash
git clone https://github.com/tigerbryan/tiger-console.git
cd tiger-console
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
创建 `.env.local` 文件并添加以下配置：
```
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

4. 启动开发服务器：
```bash
npm run dev
```

## 部署

项目已配置为可以直接部署到 Vercel。访问 [Tiger Console](https://tiger-console.vercel.app/) 查看线上版本。

## 环境要求

- Node.js 18.17.0 或更高版本
- npm 9.0.0 或更高版本

## 许可证

MIT 