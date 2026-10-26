# Workbench UI

React capability pages use a single authenticated API boundary. `App` coordinates navigation, refresh and session state. Assistant SSE streaming is isolated from deterministic business forms. Shared `components`, `api`, `styles.css` and `workspace.css` provide the visual language and responsive layout.

User-facing copy is Chinese and avoids development diagnostics. `display` and `SitePicker` keep business labels readable without changing stored identifiers; `HelpPage` renders and downloads the short guide from `docs/operations/USER-GUIDE.zh.md`. Model availability remains truthful; presentation changes never alter the server-side budget.

Run `pnpm dev` against the configured backend origin, or `pnpm build` for the server's static bundle. Browser evidence records actual login, persistence, activity stages, report preview/import, inventory/allocation/shipment and advertising flows separately from model probes.
