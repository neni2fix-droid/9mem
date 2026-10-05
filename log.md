# 📜 9mem — Activity Log

> Chronological record of everything that happened. Append only.
> Format: `## [YYYY-MM-DD HH:MM UTC] type | Description`
> Grep: `grep "^## \[" log.md | tail -5`

---

## [2026-07-29 12:08 UTC] milestone | Created 9mem project structure
- Built directory layout, wrote all base files

## [2026-07-29 12:13 UTC] milestone | GitHub repo created and seeded
- Repo at github.com/nenifix/9mem
- 12 files pushed across 2 commits

## [2026-07-29 12:13 UTC] complete | 9mem deployed to GitHub
- Full system live, MIT licensed, public

## [2026-07-29 12:19 UTC] milestone | Notion backup structure created
- 🧠 9mem page under Designs todo
- 📜 Session Logs — chronological log
- 📚 Wiki Backup — entities & concepts
- 🔄 Sync Guide — how it works
- 🧠 Second Brain — relocated under 9mem
- All synced to GitHub repo

## [2026-10-05 02:54 UTC] milestone | Improved retrieval, safety, and wiki navigation
- Added dependency-free local Markdown search and wikilink checker in `tools/9mem.mjs`
- Documented progressive context loading, repository-based project scope, privacy, provenance, and freshness
- Added seven source-labelled Nenifix portfolio entity pages to resolve existing wiki links
- Changes are local and have not been pushed
## 2026-10-05 — OKF-inspired knowledge metadata

- Reviewed Google's Open Knowledge Format v0.2 and captured a small, compatible subset in `wiki/concepts/okf-profile.md`.
- Added explicit provenance and lifecycle metadata to durable wiki pages; distinguished authorship from verification and left unverified claims unverified.
- Added `check-frontmatter` validation and documented that 9mem is inspired by, not fully conformant to, OKF.

## [2026-10-05 04:35 UTC] completion | Added cross-platform 9mem CLI

- Added npm executable metadata, a Node.js 22+ floor, CLI help, and OS-neutral path confinement. Documented usage across Windows, macOS, and Linux.
- Added Windows/macOS/Linux CI coverage for Node.js 22 and 24, plus automated lifecycle and Obsidian-export tests.
- Local Windows/Node.js 24 validation passes: `npm test` (2/2), `npm run check` (19 wiki pages and 26 Markdown files), and `git diff --check`.

## 2026-10-05 — Hermes compatibility

- Added `.hermes.md` with Hermes-native project context, startup retrieval, wiki write, and validation workflows.
- Kept the wiki as shared durable knowledge and documented Hermes's bounded `MEMORY.md` / `USER.md` as separate always-loaded stores.
- Updated Hermes setup documentation and verified JavaScript syntax, all 15 wiki frontmatter pages, 21 Markdown wikilink targets, and `git diff --check`.

## [2026-10-05 03:49 UTC] milestone | Added mandatory task records and central vault routing

- Added task scaffolding, timestamped milestone, and completion-summary commands to `tools/9mem.mjs`.
- Added a central task ledger and `.9mem/config.json`-based selection of an existing 9mem vault; the default remains this repository root.
- Updated SCHEMA, README, Hermes, Cursor, and other agent setup guidance to record request/scope/plan before work and summarize at completion.
- Validated start, milestone, completion, custom-vault routing, frontmatter, wikilinks, and diff whitespace; changes remain local and unpushed.

## [2026-10-05 04:23 UTC] milestone | Added Obsidian import/export compatibility

- Added an Obsidian import guide and a dependency-free `export-obsidian` command that preserves Markdown paths and wikilinks while flattening nested provenance metadata in the export only.
- Verified a 25-file exported vault has flat Properties-compatible frontmatter and resolving wikilinks; canonical files are unchanged by export.
- Repository checks pass: 18 wiki/task frontmatter pages, 25 Markdown link targets, JavaScript syntax, and diff whitespace.
