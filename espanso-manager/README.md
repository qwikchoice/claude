# Espanso Manager

A visual CRUD interface for managing [Espanso](https://espanso.org) text expansions — no dependencies required.

![Dark UI with search, tags, and expansion cards](https://img.shields.io/badge/UI-Dark%20Theme-7c6fff?style=flat-square) ![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=flat-square&logo=python) ![Zero dependencies](https://img.shields.io/badge/dependencies-none%20(stdlib%20only)-success?style=flat-square)

## Features

- **Full CRUD** — Add, edit, and delete text expansions through a clean browser UI
- **Simple & Advanced modes** — Toggle between plain text entry and raw YAML for complex matches (date vars, shell commands, forms)
- **Search & filter** — Live search across triggers and replacement text; filter by tags
- **Tags & Notes** — Attach metadata to any expansion (stored in a sidecar `base.meta.json`, invisible to Espanso)
- **Auto-backup** — Every save creates a timestamped backup; older ones are auto-archived (configurable limit)
- **Export / Import** — Round-trip your expansions as YAML, JSON, or CSV
- **Zero dependencies** — Python stdlib only; the HTML UI loads `js-yaml` from a CDN

## Quick Start

1. **Install Python** (3.8+) — make sure it's on your PATH
2. Copy `espanso_server.py`, `espanso-manager.html`, and `start_espanso.bat` into your Espanso `match` folder:
   ```
   %AppData%\espanso\match\
   ```
3. Double-click **`start_espanso.bat`** (or run `python espanso_server.py`)
4. Your browser opens at `http://localhost:7890` — start managing expansions

## How It Works

```
start_espanso.bat
      │
      └─► espanso_server.py  (stdlib HTTPServer on :7890)
                │
                ├── GET /          → serves espanso-manager.html
                ├── GET /api/load  → reads base.yml + base.meta.json
                └── POST /api/save → writes files + creates timestamped backup
```

The HTML file is fully self-contained and also works standalone via the **File System Access API** in Chrome/Edge — just open it directly in the browser and grant access to your `match` folder.

## File Layout

```
match/
├── espanso_server.py       ← API server (this repo)
├── espanso-manager.html    ← UI (this repo)
├── start_espanso.bat       ← launcher (this repo)
├── base.yml                ← your expansions (managed by this tool)
├── base.meta.json          ← tags & notes sidecar (managed by this tool)
├── base_backup_<ts>.yml    ← rolling backups (auto-created)
└── archive/                ← older backups (auto-moved here)
```

## Configuration

Edit the constants at the top of `espanso_server.py`:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `7890` | Local server port |
| `MAX_BACKUPS` | `5` | Backups kept in the match folder before archiving |

## License

MIT
