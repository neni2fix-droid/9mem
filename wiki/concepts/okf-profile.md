---
type: Concept
title: 9mem OKF-Inspired Metadata Profile
description: A small Markdown and YAML metadata convention for tracking 9mem page type, provenance, generation, verification, and lifecycle.
tags: [okf, metadata, provenance, memory]
status: stable
generated:
  by: codex/assistant
  at: 2026-10-05T03:00:59Z
sources:
  - resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
    title: Google Open Knowledge Format v0.2 specification
---

# 9mem OKF-Inspired Metadata Profile

## Purpose
Use interoperable, human-readable YAML frontmatter on durable entity, concept, project, and session pages. This is a 9mem profile inspired by OKF v0.2, not a claim of full OKF conformance.

## Required in durable wiki pages
- `type`: a short, descriptive concept kind.
- `title`: display title.
- `description`: one-sentence summary.
- `status`: `draft`, `stable`, or `deprecated` for the document lifecycle.
- `generated.by` and `generated.at`: who last meaningfully changed the record and when.
- `sources`: include when the record derives from identifiable sources; cite paths or URLs.

## Trust and freshness
- `generated` says who authored/changed the current record; it does not mean the claims are verified.
- Omit `verified` unless a human or defined process actually checked the content against sources. Do not infer verification from a timestamp.
- Use `stale_after` only when there is a defensible review deadline. No deadline means no field.
- If an entity has its own operating state, use a separate field such as `entity_status`; do not overload document lifecycle `status`.
- Attribute specific claims with Markdown footnotes keyed to stable `sources[].id` values where finer provenance is needed.

## Compatibility boundaries
9mem keeps Obsidian wikilinks, append-only activity logs, and existing folder conventions. These remain supported, but this profile is not a validator for every requirement of OKF v0.2.

## Source
[Google Open Knowledge Format v0.2 specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md).
