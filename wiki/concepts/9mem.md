---
type: Concept
title: 9mem — Universal AI Agent Memory System
description: A portable file-based memory wiki for AI agents with project-scoped, progressive context retrieval.
tags: [agent-memory, wiki, project-context]
status: stable
generated:
  by: codex/assistant
  at: 2026-10-05T03:00:59Z
sources:
  - resource: /README.md
    title: 9mem project overview
  - resource: /wiki/concepts/okf-profile.md
    title: 9mem OKF-inspired metadata profile
---

# 9mem — Universal AI Agent Memory System

## Summary
A persistent, compounding knowledge system for AI agents. Inspired by [[llm-wiki]] pattern.

## Core Principles
1. Read SESSION.md first
2. Document at every milestone
3. Timestamp everything (UTC)
4. Use [[wikilinks]] for cross-references
5. Append-only log
6. Agent-agnostic
7. Retrieve progressively; search before writing to avoid duplicate or conflicting knowledge
8. Record provenance and distinguish authored content from independently verified content

## Structure
```
9mem/
├── SESSION.md
├── SCHEMA.md
├── index.md
├── log.md
├── wiki/{entities,concepts,sessions}/
├── raw/
└── tools/
```

## Related
- [[llm-wiki]] — The inspiration
- [[nenifix]] — Primary user
- [[okf-profile]] — Metadata conventions inspired by OKF
