#!/bin/bash

# 加载服务器配置
source "$(dirname "$0")/server-config.sh"

# 确保密钥文件存在
if [ ! -f "$SSH_KEY" ]; then
    echo "错误：找不到密钥文件 $SSH_KEY"
    exit 1
fi

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
scp -i $SSH_KEY deploy.tar.gz $SERVER_USER@$SERVER_IP:$SERVER_DIR/
rm deploy.tar.gz

# 在服务器上解压和安装
echo "在服务器上部署..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_IP "cd $SERVER_DIR && \
  tar xzf deploy.tar.gz && \
  rm deploy.tar.gz && \
  npm install --production && \
  pm2 restart tiger-console || pm2 start npm --name 'tiger-console' -- start"

echo "部署完成！" 