#!/bin/bash

# 服务器配置信息
export SERVER_IP="47.242.123.123"
export SERVER_USER="root"
export SERVER_DIR="/var/www/tiger-console"
export SSH_KEY="/Users/bryanchen/Desktop/cursor.pem"

# 数据库配置
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tiger_console"

# 环境变量
export NODE_ENV="production"
export PORT=3000

# 部署命令
deploy() {
    echo "开始部署到服务器 $SERVER_IP..."
    ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_DIR"
    scp -i $SSH_KEY deploy.tar.gz $SERVER_USER@$SERVER_IP:$SERVER_DIR/
    ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "cd $SERVER_DIR && \
        tar xzf deploy.tar.gz && \
        rm deploy.tar.gz && \
        npm install --production && \
        pm2 restart tiger-console || pm2 start npm --name 'tiger-console' -- start"
}

# 服务器初始化
init_server() {
    echo "初始化服务器环境..."
    ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_DIR && \
        apt-get update && \
        apt-get install -y nodejs npm nginx pm2"
}

# 使用说明
echo "使用方法："
echo "1. 初始化服务器: source server-config.sh && init_server"
echo "2. 部署应用: source server-config.sh && deploy" 