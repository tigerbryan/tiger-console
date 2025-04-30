#!/bin/bash

# 配置
AVATAR_DIR="/usr/share/nginx/html/avatars"
MAX_AGE_DAYS=30
EXCLUDE_FILES="default.png"

# 清理超过30天的文件
find $AVATAR_DIR -type f -mtime +$MAX_AGE_DAYS ! -name "$EXCLUDE_FILES" -exec rm {} \;

# 记录清理日志
echo "$(date): Cleaned up old avatar files" >> /var/log/avatar-cleanup.log 