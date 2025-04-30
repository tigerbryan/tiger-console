#!/bin/bash

# 配置
REPO_URL="https://github.com/tigerbryan/tiger-console.git"
DEPLOY_DIR="/var/www/tiger-console"
BRANCH="main"

# 创建部署目录
mkdir -p $DEPLOY_DIR
cd $DEPLOY_DIR

# 初始化 Git
if [ ! -d ".git" ]; then
    git init
    git remote add origin $REPO_URL
fi

# 拉取最新代码
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# 安装依赖
npm install

# 构建应用
npm run build

# 配置 Nginx
cat > /etc/nginx/sites-available/tiger-console << 'EOL'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /avatars/ {
        alias /var/www/tiger-console/public/avatars/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOL

# 启用 Nginx 配置
ln -sf /etc/nginx/sites-available/tiger-console /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 启动应用
pm2 start npm --name "tiger-console" -- start

# 设置开机自启
pm2 save
pm2 startup

echo "部署完成！" 