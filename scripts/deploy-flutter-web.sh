#!/usr/bin/env bash
# 将 Flutter Web 构建产物部署到远程服务器
# 用法: ./scripts/deploy-flutter-web.sh
#
# 环境变量（可选）：
#   DEPLOY_USER   默认 root
#   DEPLOY_HOST   默认 artiqore.com
#   SSH_KEY       SSH 密钥路径（可选）
#   FLUTTER_REMOTE_DIR  默认 /var/www/flutter-web

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
APP_DIR="${REPO_ROOT}/app"
BUILD_DIR="${APP_DIR}/build/web"

DEPLOY_USER="${DEPLOY_USER:-root}"
DEPLOY_HOST="${DEPLOY_HOST:-artiqore.com}"
SSH_KEY="${SSH_KEY:-}"
FLUTTER_REMOTE_DIR="${FLUTTER_REMOTE_DIR:-/var/www/flutter-web}"
ARCHIVE_NAME="artsee-flutter-web.tar.gz"
ARCHIVE_PATH="${REPO_ROOT}/${ARCHIVE_NAME}"

if [[ -n "${SSH_KEY}" ]]; then
  SSH_OPTS=(-i "${SSH_KEY}" -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
else
  SSH_OPTS=(-o BatchMode=yes -o StrictHostKeyChecking=accept-new)
fi
SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"

log() { printf '%s\n' "$*"; }

if [[ ! -d "${BUILD_DIR}" ]]; then
  log "错误：未找到 Flutter Web 构建目录 ${BUILD_DIR}"
  log "请先运行: cd app && flutter build web --release"
  exit 1
fi

log "打包 Flutter Web: ${ARCHIVE_NAME}"
rm -f "${ARCHIVE_PATH}"
COPYFILE_DISABLE=1 tar czf "${ARCHIVE_PATH}" -C "${BUILD_DIR}" .

log "确保远程目录存在..."
ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" "mkdir -p ${FLUTTER_REMOTE_DIR}"

log "上传压缩包..."
scp "${SSH_OPTS[@]}" "${ARCHIVE_PATH}" "${SSH_TARGET}:${FLUTTER_REMOTE_DIR}/"

log "远程解压..."
ssh "${SSH_OPTS[@]}" "${SSH_TARGET}" bash -s <<REMOTE_SCRIPT
set -euo pipefail
cd ${FLUTTER_REMOTE_DIR}

# 清理旧文件（保留压缩包）
find . -mindepth 1 -maxdepth 1 ! -name "${ARCHIVE_NAME}" -exec rm -rf {} +

# 解压
tar xzf "${ARCHIVE_NAME}"
rm -f "${ARCHIVE_NAME}"

echo "Flutter Web 部署完成: ${FLUTTER_REMOTE_DIR}"
REMOTE_SCRIPT

log "删除本地压缩包..."
rm -f "${ARCHIVE_PATH}"

log "Flutter Web 部署完成！"
