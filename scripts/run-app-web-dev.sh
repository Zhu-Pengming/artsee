#!/bin/bash
# 使用 port-manager 分配端口并启动 Flutter Web 开发模式
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_PORT=$(python3 "$PROJECT_ROOT/.kimi/skills/port-manager/scripts/portman.py" get "$PROJECT_ROOT" app-web)
WEB_PORT=$(python3 "$PROJECT_ROOT/.kimi/skills/port-manager/scripts/portman.py" get "$PROJECT_ROOT" web)
cd "$PROJECT_ROOT/app"
flutter run -d chrome \
  --web-port="$APP_PORT" \
  --dart-define=DEV_MODE=true \
  --dart-define=DEV_LOGIN=true \
  --dart-define=WEB_DEV_PORT="$WEB_PORT"
