---
type: Task
title: Upgrade 9mem task lifecycle and central storage
description: Add pre-task Markdown records, milestone capture, completion summaries, and a configurable central data root to 9mem.
status: stable
task_status: complete
generated:
  by: codex/assistant
  at: 2026-10-05T03:28:57Z
sources:
  - resource: /SESSION.md
    title: Active 9mem task
---

# Upgrade 9mem task lifecycle and central storage

**Project:** `nenifix/9mem`
**Started:** 2026-10-05 03:28 UTC
**Request:** Make 9mem record tasks before execution, capture milestones and completion summaries as Markdown, and put collected data in a central folder selected by the user or agent.
**Status:** Complete
**Completed:** 2026-10-05 03:52 UTC

## Plan
- [x] Inspect the current schema, agent guidance, and local tooling.
- [x] Create this task record before continuing implementation.
- [x] Define the current vault root as the agent-selected default and support selecting another initialized vault.
- [x] Add commands to create task records, append milestones, and complete tasks.
- [x] Update schema, Hermes/Cursor/ChatGPT/Claude/OpenCode guidance, README, and wiki navigation.
- [x] Validate the full workflow and record completion.

## Milestones
- 2026-10-05 03:28 UTC — Confirmed no task ledger or central-root configuration exists; created this record before implementation edits, using the existing repository root as the default vault.
- 2026-10-05 03:34 UTC — Added task lifecycle commands, a central task ledger, configurable existing-vault selection, and agent-specific pre-task instructions.

- 2026-10-05 03:52 UTC — Lifecycle smoke test passed for default/custom vault routing, start-task, milestone, complete-task, frontmatter, and wikilinks.
- 2026-10-05 03:52 UTC — Task completed.
## Completion summary
Implemented task pre-registration, timestamped milestone recording, completion summaries, a central task ledger, and configurable selection of an existing initialized 9mem vault. Updated README, SCHEMA, Hermes/Cursor/Claude/ChatGPT/OpenCode guidance, and navigation. Smoke test and repository checks passed; changes are local and unpushed.
