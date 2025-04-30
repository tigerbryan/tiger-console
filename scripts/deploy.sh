#!/bin/bash

# 配置
REMOTE_USER="root"
REMOTE_HOST="43.100.16.213"
REMOTE_DIR="/var/www/tiger-console"
PEM_FILE="$HOME/Desktop/cursor.pem"

# 构建应用
echo "构建应用..."
npm run build

# 创建临时目录
echo "创建临时目录..."
TMP_DIR=$(mktemp -d)
mkdir -p $TMP_DIR/node_modules/@prisma
cp -r .next package.json package-lock.json prisma $TMP_DIR/
cp -r node_modules/@prisma/client $TMP_DIR/node_modules/@prisma/

# 压缩文件
echo "压缩文件..."
cd $TMP_DIR
tar czf ../deploy.tar.gz .
cd -

# 上传到服务器
echo "上传文件到服务器..."
scp -i $PEM_FILE deploy.tar.gz $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/
rm deploy.tar.gz

# 在服务器上解压和安装
echo "在服务器上部署..."
ssh -i $PEM_FILE $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_DIR && \
  tar xzf deploy.tar.gz && \
  rm deploy.tar.gz && \
  npm install --production && \
  pm2 restart tiger-console || pm2 start npm --name 'tiger-console' -- start"

echo "部署完成！" 