#!/bin/bash

# 加载服务器配置
source "$(dirname "$0")/server-config.sh"

# 初始化服务器环境
echo "开始初始化服务器环境..."

# 1. 安装必要软件
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "apt-get update && \
    apt-get install -y nodejs npm nginx pm2 postgresql postgresql-contrib"

# 2. 配置 PostgreSQL
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "sudo -u postgres psql -c \"CREATE DATABASE tiger_console;\" && \
    sudo -u postgres psql -c \"CREATE USER postgres WITH PASSWORD 'postgres';\" && \
    sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE tiger_console TO postgres;\""

# 3. 创建项目目录和头像目录
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_DIR/public/avatars && \
    chmod -R 755 $SERVER_DIR/public/avatars"

# 4. 配置 Nginx
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "cat > /etc/nginx/sites-available/tiger-console << 'EOL'
server {
    listen 80;
    server_name $SERVER_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /avatars/ {
        alias $SERVER_DIR/public/avatars/;
        expires 30d;
        add_header Cache-Control \"public, no-transform\";
    }
}
EOL"

# 5. 启用 Nginx 配置
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "ln -sf /etc/nginx/sites-available/tiger-console /etc/nginx/sites-enabled/ && \
    nginx -t && \
    systemctl restart nginx"

# 6. 配置防火墙
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "ufw allow 22 && \
    ufw allow 80 && \
    ufw allow 443 && \
    ufw --force enable"

echo "服务器初始化完成！" 