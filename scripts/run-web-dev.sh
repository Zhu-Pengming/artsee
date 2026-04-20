#!/bin/bash
# 使用 port-manager 分配端口并启动 Next.js 开发服务器
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PORT=$(python3 "$PROJECT_ROOT/.kimi/skills/port-manager/scripts/portman.py" get "$PROJECT_ROOT" web)
cd "$PROJECT_ROOT/web"
PORT=$PORT npm run dev
