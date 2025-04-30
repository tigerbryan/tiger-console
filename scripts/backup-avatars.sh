#!/bin/bash

# 配置
AVATAR_DIR="/usr/share/nginx/html/avatars"
BACKUP_DIR="/backup/avatars"
DATE=$(date +%Y%m%d)
BACKUP_FILE="avatars-$DATE.tar.gz"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 创建备份
tar -czf "$BACKUP_DIR/$BACKUP_FILE" -C $AVATAR_DIR .

# 删除30天前的备份
find $BACKUP_DIR -name "avatars-*.tar.gz" -mtime +30 -delete

# 记录备份日志
echo "$(date): Backup created: $BACKUP_FILE" >> /var/log/avatar-backup.log 