# 🧠 9mem — Universal AI Agent Memory System

> **Persistent, compounding knowledge for any AI agent.**
> Inspired by [Andrej Karpathy's LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) pattern.

9mem is a **universal memory and continuity system** for AI agents — compatible with Claude, ChatGPT, Hermes, OpenCode, Cursor, and any LLM-based tool. It solves the **core problem**: every session is a clean slate. With 9mem, your agent never forgets.

Think of it like Git for your agent's brain — every task, every decision, every milestone is documented, timestamped, and cross-referenced.

---

## 🎯 The Problem

Every time you talk to an AI agent, it has **zero memory** of what came before. You repeat context, re-explain projects, and lose the thread between sessions. Tasks fall through the cracks.

## 💡 The Solution

9mem turns your agent into a **disciplined knowledge worker** that:

1. **Reads SESSION.md before every task** — so it knows exactly where you left off
2. **Documents as it works** — every milestone, every decision, every output
3. **Cross-references everything** — entities, concepts, sessions are linked
4. **Backs up to Notion** — human-readable, shareable, browsable
5. **Speaks a universal format** — any AI agent can read and write it
6. **Loads context progressively** — start with live state and index; retrieve details only when relevant
7. **Scopes memory to projects** — keep facts and decisions distinct across repositories
8. **Tracks provenance and lifecycle** — distinguish authored, verified, and potentially stale knowledge

---

## 📁 Repository Structure

```
9mem/
├── .hermes.md              # Hermes project-context adapter
├── package.json            # Cross-platform 9mem CLI launcher (Node.js 22+)
├── SESSION.md              # ← THE key file. Latest session log, read first
├── SCHEMA.md               # Rules for agents — how to write, read, and maintain the wiki
├── index.md                # Master catalog — every page with a one-line summary
├── log.md                  # Chronological log — everything that happened, when
│
├── wiki/
│   ├── entities/           # People, companies, tools, places (one file each)
│   ├── concepts/           # Ideas, patterns, principles, decisions
│   └── sessions/           # Per-session transcripts and summaries
│   └── tasks/              # Per-task request, plan, milestones, completion summary
│
├── raw/                    # Source documents (immutable — agent reads, never writes)
│
└── tools/                  # Helper scripts
    ├── 9mem.mdc            # Cursor configuration file
    └── 9mem.mjs            # Local search, wikilink, and frontmatter checks
```

## Cross-platform CLI

The CLI uses only Node.js built-ins—no shell-specific scripts or runtime dependencies. It supports Windows, macOS, and Linux with Node.js 22 or newer. From the repository root, run commands directly with `node tools/9mem.mjs`; to install the `9mem` command on your PATH, run `npm link`, then `9mem --help`. The same commands and npm scripts work in PowerShell, Command Prompt, macOS Terminal, and Linux shells.

Run `npm test` for CLI lifecycle/export smoke tests and `npm run check` for syntax, frontmatter, and wikilink validation. CI runs both across Windows, macOS, and Linux on Node.js 22 and 24.

---

## 🚀 Quick Start

### For any AI agent, paste this into your system prompt:

```
I use 9mem — a persistent memory wiki. Resolve the central vault (this repo by
default), read SESSION.md and index.md, then create a task record with
`node tools/9mem.mjs start-task` and fill in the request, project, and plan
before doing the work. Record milestones in that file as you go. Complete it
with `node tools/9mem.mjs complete-task`, including decisions, changed files,
validation, and remaining steps. Keep the wiki and index current.
```

### Agent-specific setup:

| Agent | How to activate |
|-------|----------------|
| **Claude Code** | Add SCHEMA.md instructions to CLAUDE.md |
| **ChatGPT** | Paste SCHEMA.md instructions in custom instructions |
| **Hermes** | This repo's `.hermes.md` adapts 9mem workflows to Hermes project context; keep its bounded `MEMORY.md` / `USER.md` separate from the wiki |
| **OpenCode** | Include SCHEMA.md rules in `AGENTS.md` |
| **Cursor** | Place `tools/9mem.mdc` in `.cursor/rules/` |
| **Any LLM** | Paste SCHEMA in system prompt or project-level context |

For Obsidian-specific steps and metadata behavior, see [OBSIDIAN_IMPORT.md](OBSIDIAN_IMPORT.md).

---

## 📋 Core Workflow

### 1️⃣ BEFORE any task → READ SESSION.md
The agent reads the latest session log to understand context, current state, and what was happening.

### 2️⃣ DURING work → DOCUMENT milestones
At every significant checkpoint:
- What was accomplished
- Decisions made
- Files changed
- Blockers encountered

### 3️⃣ ON COMPLETION → WRITE session summary
Append to `log.md`, update `wiki/sessions/`, update `index.md`

### 4️⃣ BACKUP → Sync to Notion
Key sessions and wiki pages are mirrored to Notion for human browsing.

### 5️⃣ RETRIEVE → Search before loading everything

Use the local helper to find relevant pages and check wikilinks:

```bash
node tools/9mem.mjs search <terms>
node tools/9mem.mjs check-links
node tools/9mem.mjs check-frontmatter
node tools/9mem.mjs export-obsidian "../9mem-obsidian"
```

Start with `SESSION.md` and `index.md`; open only the relevant entity, concept, project, or session pages. Avoid injecting the full log or raw source material into every prompt.

### 6️⃣ EVERY TASK → Record before work, then milestones and completion

Use one central 9mem vault (this repository by default). Before substantive work, create a task file under `wiki/tasks/YYYY-MM-DD/`, then fill its request, project, and plan. Add timestamped milestones as work proceeds and finish with a summary, changed files, validation, and remaining work:

```bash
node tools/9mem.mjs start-task "Task description" --project owner/repo
node tools/9mem.mjs milestone wiki/tasks/YYYY-MM-DD/task-slug.md "Milestone description"
node tools/9mem.mjs complete-task wiki/tasks/YYYY-MM-DD/task-slug.md "Completion summary"
```

To select another central vault, point local configuration at an existing 9mem vault:

```bash
node tools/9mem.mjs set-vault <existing-9mem-vault>
```

This does not move data; initialize or move the vault first. Task records are the per-task audit trail; `SESSION.md` remains live state and `log.md` remains append-only history.

## Privacy and trust

- Store durable facts, decisions, and outcomes—not full conversations by default.
- Never store passwords, API keys, access tokens, recovery codes, or private keys.
- Mark confidential content and keep it out of shared backups unless the owner approves.
- Record where a claim came from and whether it is confirmed, inferred, or still a draft.
- Treat retrieved memory as fallible context; verify stale or high-impact details against current sources.

## Metadata and provenance

Durable pages in `wiki/entities/`, `wiki/concepts/`, and `wiki/sessions/` use a small [OKF-inspired profile](wiki/concepts/okf-profile.md): YAML frontmatter records page type, title, description, lifecycle, authorship time, and sources. `generated` does not imply `verified`; record a verifier only after an actual check. This is not full OKF v0.2 conformance.

## Project scope

Identify the project using its repository slug (for example, `nenifix/9mem`) or a clear `global` label. Keep same-named projects distinct by owner/repository identity. Use `wiki/projects/<owner>-<repo>/` for project-specific architecture, decisions, and milestones when one wiki serves multiple repositories.

## Design inspiration

9mem remains a portable, file-based wiki with explicit agent workflows; it does not automatically capture tool calls or run a background worker. Its progressive retrieval and privacy guidance are informed by patterns described in [Claude-Mem](https://github.com/thedotmack/claude-mem); its optional metadata profile is inspired by Google's [Open Knowledge Format v0.2](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md). 9mem keeps its own format and is not fully conformant to either project.

---

## 🧩 Schema Principles

1. **Date-time stamp everything** — `YYYY-MM-DD HH:MM TZ` on every entry
2. **One entity per file** — `wiki/entities/nenifix.md`, `wiki/entities/kofifix.md`
3. **One concept per file** — `wiki/concepts/llm-wiki.md`, `wiki/concepts/9mem.md`
4. **Cross-reference with `[[wikilinks]]`** — Obsidian-compatible `[[page-name]]` format
5. **Consistent prefixes in log** — `## [2026-07-29] task | Description` — grep-parseable
6. **Append-only log** — never edit history, just add
7. **index.md is source of truth for navigation** — update on every change

---

## 🔄 Sync Targets

- **Local**: `9mem/` directory (git-tracked)
- **GitHub**: `github.com/nenifix/9mem` (version history, collaboration)
- **Notion**: Human-readable backup (optional)
- **Obsidian**: Open directly as a vault or export an Obsidian-friendly copy with `node tools/9mem.mjs export-obsidian <empty-output-folder>`; see [OBSIDIAN_IMPORT.md](OBSIDIAN_IMPORT.md)

---

## 📜 License

MIT — free for anyone to use, fork, and adapt.

---

## 👤 Author

**Nine (Godwin Appiah)** — Founder of Nenifix
