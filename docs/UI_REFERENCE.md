# UI Reference Source Of Truth

The current UI baseline is:

- `artiqore-艺见心-网页版前端与ui(1)/src`

Use this folder only as a visual/design reference.

Production public UI code lives in:

- `app/lib/`

The deployed public site (`/`) is Flutter Web built from `app/`. Next.js in `web/` serves `/admin` and `/api/*`; `web/app/artiqore-ui/` is an older/adapted React reference shell and must not be treated as the live public frontend.

Do not use `artlink-reference/` as the current UI baseline. It is an older April 2026 reference and must not override the current 艺见心 design.
