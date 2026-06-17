#!/usr/bin/env bash
# 更新 Nginx 配置以指向新的 Flutter Web 部署位置

set -euo pipefail

TENCENT_KEY="${TENCENT_KEY:-${HOME}/tom.pem}"
TENCENT_HOST="${TENCENT_HOST:-artiqore.com}"
TENCENT_USER="${TENCENT_USER:-ubuntu}"
SSH_TARGET="${TENCENT_USER}@${TENCENT_HOST}"
SSH_OPTS=(-i "${TENCENT_KEY}" -o StrictHostKeyChecking=accept-new)

echo "更新 Nginx 配置..."

ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" 'sudo bash -s' <<'REMOTE_SCRIPT'
set -euo pipefail

NGINX_CONF="/etc/nginx/sites-available/artiqore.com"
BACKUP_CONF="${NGINX_CONF}.bak-$(date +%Y%m%d%H%M%S)"

# 备份当前配置
cp "$NGINX_CONF" "$BACKUP_CONF"
echo "已备份配置到: $BACKUP_CONF"

# 更新配置：将 /var/www/artsee-flutter-web 替换为新路径
sed -i 's|root /var/www/artsee-flutter-web;|root /home/ubuntu/website/artsee-app/current;|g' "$NGINX_CONF"

echo "配置已更新，检查语法..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx 配置语法正确，重新加载..."
    systemctl reload nginx
    echo "✅ Nginx 已重新加载"
else
    echo "❌ Nginx 配置语法错误，恢复备份..."
    cp "$BACKUP_CONF" "$NGINX_CONF"
    exit 1
fi

echo ""
echo "========================================="
echo "配置更新完成！"
echo "========================================="
echo "Flutter Web 访问地址: https://artiqore.com/"
echo "API 访问地址: https://artiqore.com/api/"
echo "========================================="
REMOTE_SCRIPT

echo "完成！"
