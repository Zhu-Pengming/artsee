<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# UI reference source of truth

For frontend UI work, use `../artiqore-艺见心-网页版前端与ui(1)/src` as the source reference. The Next.js UI currently lives in `app/artiqore-ui/`, copied from that Chinese folder and adapted for Next. Do not use `../artlink-reference/` as the current UI baseline.

# Artsee Next.js（`web/`）

- **仓库总览**：根目录 [`../AGENTS.md`](../AGENTS.md)。
- **调试僵局时必读**：[`../.cursor/skills/jinhui-stack-debug/SKILL.md`](../.cursor/skills/jinhui-stack-debug/SKILL.md)

对外 API 在 `app/api/v1/`；环境变量示例：本目录下 `.env.development.example`、`.env.production.example`。开发：`npm run dev`（默认端口 9090）。
