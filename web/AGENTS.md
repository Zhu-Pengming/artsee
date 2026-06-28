<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Web scope

Production `web/` is the Next.js BFF and admin surface:

- `/api/*` and `/api/v1/*` are backend-for-frontend API routes.
- `/admin/*` is the management console.
- The public frontend `/` is Flutter Web built from `../app/`, not `app/artiqore-ui/`.
- Do not treat `app/artiqore-ui/` as the live product frontend. It is an older/adapted React reference shell.
- For public product UI changes, edit `../app/lib/`. Use `../artiqore-艺见心-网页版前端与ui(1)/src` only as visual reference.
- Do not use `../artlink-reference/` as the current UI baseline.

# Artsee Next.js（`web/`）

- **仓库总览**：根目录 [`../AGENTS.md`](../AGENTS.md)。
- **调试僵局时必读**：[`../.cursor/skills/jinhui-stack-debug/SKILL.md`](../.cursor/skills/jinhui-stack-debug/SKILL.md)

对外 API 在 `app/api/v1/`；环境变量示例：本目录下 `.env.development.example`、`.env.production.example`。开发：`npm run dev`（默认端口 9090）。
