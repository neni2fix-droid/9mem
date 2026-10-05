---
type: Concept
title: LLM Wiki
description: A pattern for incrementally building and maintaining a persistent Markdown knowledge base with an LLM.
tags: [knowledge-management, llm]
status: stable
generated:
  by: codex/assistant
  at: 2026-10-05T03:00:59Z
sources:
  - resource: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
    title: Karpathy's LLM wiki concept
---

# LLM Wiki

## Summary
A pattern by Andrej Karpathy for building personal knowledge bases using LLMs. Instead of RAG, the LLM incrementally builds and maintains a persistent wiki.

## Three Layers
1. Raw sources — immutable source documents
2. The wiki — LLM-generated markdown files
3. The schema — Configuration telling LLM how to maintain the wiki

## Related
- [[9mem]] — Implementation of this pattern
