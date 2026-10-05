# Import 9mem into Obsidian

9mem is a folder-based Markdown wiki and can be opened as an Obsidian vault. Its `[[wikilinks]]` are Obsidian's native internal-link syntax. Obsidian also supports standard Markdown links and YAML frontmatter properties. See the official [internal links and Markdown guide](https://help.obsidian.md/Editing+and+formatting/Basic+formatting+syntax) and [Properties guide](https://help.obsidian.md/Editing+and+formatting/Properties).

## Recommended: make an Obsidian-friendly copy

From the 9mem repository root, export Markdown files to a new, empty folder outside the repository:

```bash
node tools/9mem.mjs export-obsidian "../9mem-obsidian"
```

In Obsidian, choose **Open folder as vault** and select the exported folder. The exporter preserves the folder structure and wiki links, and flattens nested `generated` and `sources` YAML into Obsidian-friendly top-level properties. It leaves the canonical 9mem files unchanged. The export destination must be new or empty and separate from the source vault.

The current export includes Markdown files only. Copy any future images or other attachments separately while preserving their relative paths.

## Open the repository directly

Alternatively, clone/download the repository and open its root folder as a vault. This keeps Git history and helper scripts alongside the notes. The canonical frontmatter contains nested `generated` and `sources` mappings; Obsidian can read the Markdown, but its official documentation says nested properties are not fully supported in the Properties UI. Use the export command if you want those fields exposed as flat properties.

## Import into an existing vault

Use the exported folder as a staging area, then copy `index.md`, `SESSION.md`, `log.md`, `SCHEMA.md`, `README.md`, `OBSIDIAN_IMPORT.md`, and `wiki/` into the destination vault. Preserve the folder layout so relative paths and wikilinks continue to resolve. Back up the destination first and resolve any filename collisions rather than overwriting existing notes.

Run `node tools/9mem.mjs check-links` on the canonical vault before importing to catch unresolved `[[wikilinks]]`.
