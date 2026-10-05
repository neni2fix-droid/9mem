# 📐 9mem Schema — Agent Behavior Rules

> This file defines how AI agents should read, write, and maintain the 9mem wiki.
> Copy this into your agent's system prompt, CLAUDE.md, AGENTS.md, or custom instructions.

---

## 🟢 MANDATORY BEHAVIOR

### Rule 1: Create a task record before any task work
Before research, edits, tool calls that change state, or other substantive task work:
1. Resolve the selected 9mem vault using `.9mem/config.json`; absent a configuration, the current 9mem repository is the agent-selected central vault.
2. Create `wiki/tasks/YYYY-MM-DD/<task-slug>.md` with `node tools/9mem.mjs start-task "Task description" [--project owner/repo]`.
3. Fill in the request, repository/project scope, and concrete plan in that file before proceeding. Record `global` when no repository/project applies.
4. If the chosen central vault is unavailable or ambiguous, ask the user before collecting durable task data. Never silently scatter records across project folders.

### Rule 2: Read SESSION.md before every task
Always start by reading `SESSION.md`. It tells you:
- What was happening before this session
- What's in progress
- What the last state was

### Rule 3: Document at every milestone
Whenever you complete a significant step:
1. Append a timestamped milestone to the task record with `node tools/9mem.mjs milestone <task-file> "Milestone description"`.
2. Update `SESSION.md` with current state.
3. Append durable cross-task history to `log.md`; update `index.md` for new durable wiki pages.

### Rule 4: Timestamp everything
Every entry uses this format:
```
## [YYYY-MM-DD HH:MM UTC] action | Description
```

### Rule 5: Use wikilinks
Link entities and concepts using `[[wikilinks]]`:
- `[[nenifix]]` → wiki/entities/nenifix.md
- `[[llm-wiki]]` → wiki/concepts/llm-wiki.md

### Rule 6: Append-only log
Never edit past log entries. The log is immutable history. Only SESSION.md gets rewritten (it's the live state).

### Rule 7: One entity, one file
Each person, company, tool, or project gets its own file in `wiki/entities/`.
Each concept, pattern, or principle gets its own file in `wiki/concepts/`.

### Rule 8: Every session gets a wiki page
After each session, write `wiki/sessions/YYYY-MM-DD.md` with:
- Participants
- Tasks worked
- Decisions made
- Files/outputs
- Next steps

### Rule 9: Load context progressively
1. Start with `SESSION.md` for active work and `index.md` for navigation.
2. Search for the task's project, files, people, decisions, or concepts.
3. Read only relevant pages; open full session notes or source documents when needed.
4. Do not inject the full activity log or raw archive by default.

### Rule 10: Scope each memory to a project
Identify each session and durable project fact with a repository slug (for example, `owner/repo`) or `global`. Keep project-specific pages under `wiki/projects/<owner>-<repo>/` when multiple projects share one wiki. Do not merge facts solely because folder names match.

### Rule 11: Preserve privacy and provenance
- Never save credentials, tokens, private keys, or recovery codes.
- Do not save full conversations by default; retain minimal useful summaries.
- Mark confidential information and exclude it from shared backups unless explicitly approved.
- Distinguish confirmed facts from inference, proposal, or stale information.
- Record a source for important facts and verify it before high-impact use.

### Rule 12: Make summaries freshness-aware
Include the end time, project, request, discoveries, completed work, files changed, decisions, and next steps in each summary. If further work happens afterward, update the live state rather than presenting an older summary as current.

### Rule 13: Search before writing
Before adding a durable fact, search by title, alias, and key terms. Update the existing concept when it is the same subject; create a separate page only for a distinct concept. Resolve conflicts with sources instead of silently duplicating or blending claims.

### Rule 14: Add provenance and lifecycle metadata
Durable pages under `wiki/entities/`, `wiki/concepts/`, and `wiki/sessions/` use YAML frontmatter following the [9mem OKF-inspired profile](wiki/concepts/okf-profile.md). Keep authorship (`generated`) separate from verification (`verified`). Record sources; only record a verifier after an actual check. Use `stale_after` only when a defensible review deadline exists. This profile is not full OKF v0.2 conformance.

---

## 📋 Workflow Steps

### STARTUP (first thing every session)
1. Locate the selected central vault from `.9mem/config.json`; default to this 9mem repository if unset.
2. Read `SESSION.md` (or `log.md` last 5 entries if no SESSION.md) and relevant entity/concept pages.
3. Create a task record and write the request, scope, and plan before starting the requested work.

### DURING WORK
At each milestone:
1. Record what was accomplished, decisions, outputs, and blockers in the task's Markdown file.
2. Use the `milestone` command to timestamp and append significant milestones.
3. Update `SESSION.md` with current state.

### TASK COMPLETION
1. Record changed files, decisions, tests/validation, and remaining work in the task record.
2. Use `complete-task` to timestamp completion and save the summary.
3. Write/update `wiki/sessions/YYYY-MM-DD.md`, append to `log.md`, and update related durable pages and `index.md` as applicable.
4. Update `SESSION.md` with final state; optionally back up approved key entries to Notion.

### CENTRAL VAULT
All 9mem task records and durable knowledge belong in one selected 9mem vault, never scattered into whichever project happens to be open. The default is this repository's root. To select a different existing vault, run `node tools/9mem.mjs set-vault <path>`; the target must already contain `SESSION.md`, `index.md`, and `wiki/`. This changes the local `.9mem/config.json` only and does not move or merge files. Move/initialize the existing vault first, then configure it. Ask the user if no suitable central vault can be selected confidently.

### QUERY
When asked "what was I doing?" or "where were we?":
1. Read `SESSION.md`
2. Read last 3 entries of `log.md`
3. Read relevant wiki pages
4. Compose full context report

For local retrieval and wiki-link validation, run:

```bash
node tools/9mem.mjs search <terms>
node tools/9mem.mjs check-links
node tools/9mem.mjs check-frontmatter
node tools/9mem.mjs start-task "Task description" --project owner/repo
node tools/9mem.mjs milestone wiki/tasks/YYYY-MM-DD/task-slug.md "Milestone description"
node tools/9mem.mjs complete-task wiki/tasks/YYYY-MM-DD/task-slug.md "Completion summary"
node tools/9mem.mjs set-vault <existing-9mem-vault>
```

The CLI requires Node.js 22 or newer and uses only built-in modules. Run it with `node tools/9mem.mjs` on Windows, macOS, or Linux, or run `npm link` from the repository root to install the `9mem` command on your PATH. Validate changes with `npm test` and `npm run check`.

---

## File Format Standards

### Entity pages (`wiki/entities/X.md`)
```markdown
---
type: Person
title: Entity Name
description: One-sentence summary of this entity.
status: draft
entity_status: active
generated:
  by: agent/name
  at: YYYY-MM-DDTHH:MM:SSZ
sources:
  - resource: /wiki/sessions/YYYY-MM-DD.md
---

# Entity Name

Use `status` for document lifecycle (`draft`, `stable`, `deprecated`). Use a separate key such as `entity_status` for the entity's own state.

## Summary
Brief description.

## Details
- Key fact 1
- Key fact 2

## Relationships
- [[related-entity-1]] — relationship description

## Session References
- [[YYYY-MM-DD]] — what happened in that session
```

### Concept pages (`wiki/concepts/X.md`)
```markdown
---
type: Concept
title: Concept Name
description: One-sentence summary of this concept.
status: stable
generated:
  by: agent/name
  at: YYYY-MM-DDTHH:MM:SSZ
sources:
  - id: source-key
    resource: https://example.com/source
    title: Source title
---

# Concept Name

Omit `verified` unless a human or defined process has checked the page. `status: stable` describes lifecycle, not verification. Use source IDs as footnote keys when attributing individual claims.

## Summary
What this concept is.

## Details
Deep explanation.

## Related
- [[related-entity]]
- [[related-concept]]

## Session References
- [[YYYY-MM-DD]] — when this was discussed
```

### Session pages (`wiki/sessions/YYYY-MM-DD.md`)
```markdown
---
type: Session
title: "Session: YYYY-MM-DD"
description: Brief summary of the session.
status: stable
generated:
  by: agent/name
  at: YYYY-MM-DDTHH:MM:SSZ
sources:
  - resource: /log.md
---

# Session: YYYY-MM-DD

**Start:** HH:MM UTC
**End:** HH:MM UTC
**Participants:** [names]

## Tasks
1. Task description — status: ✅ | 🟡 | ❌

## Decisions
- Decision 1

## Outputs
- File: path/to/file

## Next Steps
- [ ] Step 1
```

### Task pages (`wiki/tasks/YYYY-MM-DD/<task-slug>.md`)
Create one before each task and append milestones to that same file. Keep the chronological task record distinct from the end-of-day/session summary.

```markdown
---
type: Task
title: "Task description"
description: "Brief task summary."
status: stable
task_status: in_progress
project: owner/repo
generated:
  by: agent/name
  at: YYYY-MM-DDTHH:MM:SSZ
sources:
  - resource: /SESSION.md
    title: Active 9mem context
---

# Task description

**Project:** owner/repo
**Started:** YYYY-MM-DD HH:MM UTC
**Status:** In progress

## Request
The user's task request.

## Plan
- [ ] Intended step, written before execution

## Milestones
- YYYY-MM-DD HH:MM UTC — Timestamped progress

## Completion summary
Pending.
```

---

## Agent-Specific Integration

### Claude Code
Add to `CLAUDE.md`:
```
Resolve the central 9mem vault, read SESSION.md and index.md, then create a task file with `node tools/9mem.mjs start-task` and write its request, project, and plan before work. Record milestones with the milestone command. Complete the task record with summary, changed files, validation, and remaining steps.
```

### ChatGPT
Add to Custom Instructions:
```
[9MEM ACTIVE] Resolve the central vault (this repo by default); read SESSION.md and index.md; create a task record and fill its request, project, and plan before work; record timestamped milestones; finish with a completion summary, changed files, validation, and remaining steps.
```

### Hermes
This repository's `.hermes.md` is the Hermes project-context adapter. Keep the wiki as durable shared knowledge; use Hermes's bounded `MEMORY.md` and `USER.md` only for compact always-loaded agent notes and user profile facts. Hermes project context is read at session start, so restart after changing it.

### OpenCode
Add to `AGENTS.md` or system prompt:
```
9MEM: Resolve the central vault and read SESSION.md/index.md. Before work create a task record and fill request, project, and plan. Record milestones in it; complete it with summary, changed files, validation, and next steps.
```

### Cursor
Place `tools/9mem.mdc` in `.cursor/rules/` directory.

### Obsidian
Open the repository root as a vault, or create a separate flat-properties copy with `node tools/9mem.mjs export-obsidian <empty-output-folder>`. The exporter preserves note paths and links and flattens nested metadata without modifying the canonical vault. See `OBSIDIAN_IMPORT.md`.

### Any tool
Paste SCHEMA.md content as system prompt or project context.

---

## Principles

- **Write for humans AND machines** — markdown is readable by both
- **Append, don't edit** — log.md is immutable history
- **Cross-reference everything** — wikilinks make the wiki a graph, not a pile
- **Track the "why"** — not just what was done, but why decisions were made
- **Be concise** — one line per log entry, one page per entity
- **Never lose context** — before any costly operation, check the wiki first
