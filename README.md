# Tiger Console

一个现代化的管理控制台，用于管理 Jellyfin 和其他服务的访问权限。

## 功能特性

- 🔐 用户认证和授权
- 👥 用户邀请系统
- 🎬 Jellyfin 服务集成
- 🔒 双因素认证 (2FA)
- 🔑 访问令牌管理
- 📨 通知系统

## 快速开始

1. 克隆仓库：
```bash
git clone https://github.com/your-username/tiger-console.git
cd tiger-console
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量：
复制 `.env.example` 到 `.env.local` 并填写必要的配置：
```bash
cp .env.example .env.local
```

必需的环境变量：
- `DATABASE_URL`: PostgreSQL 数据库连接字符串
- `NEXTAUTH_URL`: 应用 URL (开发环境使用 http://localhost:3000)
- `NEXTAUTH_SECRET`: 用于加密会话的密钥

4. 初始化数据库：
```bash
npm run db:push    # 推送数据库架构
npm run db:init    # 创建初始管理员账号
```

5. 启动开发服务器：
```bash
npm run dev
```

6. 访问应用：
打开 http://localhost:3000

默认管理员账号：
- 邮箱：admin@example.com
- 密码：admin123

## 开发指南

### 数据库管理

- `npm run db:studio`: 启动 Prisma Studio 查看/编辑数据
- `npm run db:push`: 更新数据库架构
- `npm run db:reset`: 重置数据库并重新初始化

### 环境要求

- Node.js 18.17.0 或更高版本
- PostgreSQL 12 或更高版本

## 部署

1. 构建应用：
```bash
npm run build
```

2. 启动生产服务器：
```bash
npm run start
```

## 安全说明

- 请确保更改默认管理员密码
- 建议启用双因素认证
- 定期轮换访问令牌
- 谨慎管理邀请码

## 许可证

MIT 