#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['.git', 'node_modules', 'raw']);
const configPath = path.join(root, '.9mem', 'config.json');

function vaultRoot() {
  if (!fs.existsSync(configPath)) return root;
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return path.resolve(root, config.centralRoot || '.');
}

function markdownFiles(directory = vaultRoot()) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.isDirectory()) continue;
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...markdownFiles(fullPath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) files.push(fullPath);
  }
  return files;
}

function relative(file) {
  return path.relative(vaultRoot(), file).split(path.sep).join('/');
}

function timestamp() {
  const date = new Date();
  const iso = date.toISOString().replace(/\.\d{3}Z$/, 'Z');
  return { iso, human: `${iso.slice(0, 16).replace('T', ' ')} UTC` };
}

function slugify(value) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72) || 'task';
}

function setVault(directory) {
  if (!directory) throw new Error('Provide the path to an existing 9mem vault.');
  const selected = path.resolve(process.cwd(), directory);
  if (!fs.existsSync(path.join(selected, 'SESSION.md')) || !fs.existsSync(path.join(selected, 'index.md')) || !fs.existsSync(path.join(selected, 'wiki'))) {
    throw new Error('The selected central folder must already be a 9mem vault containing SESSION.md, index.md, and wiki/. Initialize or move the vault first.');
  }
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  const centralRoot = path.relative(root, selected) || '.';
  fs.writeFileSync(configPath, `${JSON.stringify({ centralRoot }, null, 2)}\n`);
  console.log(`Central 9mem vault set to ${selected}`);
}

function startTask(args) {
  let project = 'global';
  const titleParts = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--project') {
      project = args[index + 1];
      if (!project) throw new Error('Provide a project slug after --project.');
      index += 1;
    } else titleParts.push(args[index]);
  }
  const title = titleParts.join(' ').replace(/\s+/g, ' ').trim();
  if (!title) throw new Error('Usage: node tools/9mem.mjs start-task "Task description" [--project owner/repo]');
  if (project !== 'global' && !/^[\w.-]+\/[\w.-]+$/.test(project)) throw new Error('Project must be "global" or a repository slug such as owner/repo.');
  const now = timestamp();
  const date = now.iso.slice(0, 10);
  const directory = path.join(vaultRoot(), 'wiki', 'tasks', date);
  fs.mkdirSync(directory, { recursive: true });
  const base = slugify(title);
  let file = path.join(directory, `${base}.md`);
  for (let suffix = 2; fs.existsSync(file); suffix += 1) file = path.join(directory, `${base}-${suffix}.md`);
  const content = `---\ntype: Task\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(`Task record for ${title}.`)}\nstatus: stable\ntask_status: in_progress\nproject: ${JSON.stringify(project)}\ngenerated:\n  by: 9mem/cli\n  at: ${now.iso}\nsources:\n  - resource: /SESSION.md\n    title: Active 9mem context\n---\n\n# ${title}\n\n**Project:** ${project}\n**Started:** ${now.human}\n**Status:** In progress\n\n## Request\n${title}\n\n## Plan\n- [ ] Add intended steps before substantive task work.\n\n## Milestones\n- ${now.human} — Task record created before work began.\n\n## Completion summary\nPending.\n`;
  fs.writeFileSync(file, content, { flag: 'wx' });
  const tasksRoot = path.join(vaultRoot(), 'wiki', 'tasks');
  const ledger = path.join(tasksRoot, 'task-ledger.md');
  if (!fs.existsSync(ledger)) {
    fs.writeFileSync(ledger, `---\ntype: Index\ntitle: 9mem Task Ledger\ndescription: Central index of per-task records and milestone histories.\nstatus: stable\ngenerated:\n  by: 9mem/cli\n  at: ${now.iso}\nsources:\n  - resource: /index.md\n    title: 9mem wiki index\n---\n\n# 9mem Task Ledger\n\nNewest task records are listed first.\n`);
  }
  const link = `${date}/${path.basename(file, '.md')}`;
  fs.appendFileSync(ledger, `\n- [[${link}]] — ${project}: ${title}`);
  const index = path.join(vaultRoot(), 'index.md');
  if (fs.existsSync(index) && !fs.readFileSync(index, 'utf8').includes('[[task-ledger]]')) fs.appendFileSync(index, '\n\n## Task records\n\n- [[task-ledger]] — Central index of task requests, plans, milestones, and completion summaries.\n');
  console.log(relative(file));
}

function taskFile(fileArgument) {
  if (!fileArgument) throw new Error('Provide the task record path.');
  const file = path.resolve(vaultRoot(), fileArgument);
  const tasksDirectory = path.resolve(vaultRoot(), 'wiki', 'tasks');
  const relative = path.relative(tasksDirectory, file);
  if (!relative || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    throw new Error('Task record must be an existing file under wiki/tasks/.');
  }
  return file;
}

function addMilestone(args) {
  const file = taskFile(args[0]);
  const message = args.slice(1).join(' ').trim();
  if (!message) throw new Error('Usage: node tools/9mem.mjs milestone <task-file> "Milestone description"');
  const now = timestamp();
  let content = fs.readFileSync(file, 'utf8');
  const updated = content.replace(/(^## Milestones\r?\n[\s\S]*?)(\r?\n## Completion summary)/m, (_match, milestones, heading) => `${milestones}\n- ${now.human} — ${message}${heading}`);
  if (updated === content) throw new Error('Task record is missing its Milestones section.');
  fs.writeFileSync(file, updated);
  console.log(`Milestone added to ${relative(file)}`);
}

function completeTask(args) {
  const file = taskFile(args[0]);
  const summary = args.slice(1).join(' ').trim();
  if (!summary) throw new Error('Usage: node tools/9mem.mjs complete-task <task-file> "Completion summary"');
  const now = timestamp();
  let content = fs.readFileSync(file, 'utf8');
  if (!/^task_status: in_progress$/m.test(content)) throw new Error('Task is not marked in progress.');
  content = content.replace(/^task_status: in_progress$/m, 'task_status: complete');
  content = content.replace(/^\*\*Status:\*\* In progress$/m, `**Status:** Complete\n**Completed:** ${now.human}`);
  content = content.replace(/(^## Milestones\r?\n[\s\S]*?)(\r?\n## Completion summary)/m, (_match, milestones, heading) => `${milestones}\n- ${now.human} — Task completed.${heading}`);
  content = content.replace(/^Pending\.$/m, () => summary);
  fs.writeFileSync(file, content);
  console.log(`Task completed: ${relative(file)}`);
}

function yamlText(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"')) {
    try { return JSON.parse(trimmed); } catch {}
  }
  if (trimmed.startsWith("'")) return trimmed.slice(1, -1).replace(/''/g, "'");
  return trimmed;
}

function flattenObsidianProperties(content) {
  const match = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n)/);
  if (!match) return content;
  const output = [];
  const generated = {};
  const sources = [];
  let section = '';
  let currentSource = null;
  const flushSource = () => {
    if (currentSource) sources.push(currentSource);
    currentSource = null;
  };
  for (const line of match[2].split(/\r?\n/)) {
    const topLevel = line.match(/^([A-Za-z_][\w-]*):(?:[ \t]*(.*))?$/);
    if (topLevel) {
      flushSource();
      section = topLevel[1];
      if (section === 'generated' || section === 'sources') continue;
      output.push(line);
      section = '';
      continue;
    }
    if (section === 'generated') {
      const field = line.match(/^\s+([\w-]+):\s*(.*)$/);
      if (field) generated[field[1]] = yamlText(field[2]);
      continue;
    }
    if (section === 'sources') {
      const item = line.match(/^\s+-\s*([\w-]+):\s*(.*)$/);
      const property = line.match(/^\s+([\w-]+):\s*(.*)$/);
      if (item) {
        flushSource();
        currentSource = { [item[1]]: yamlText(item[2]) };
      } else if (property && currentSource) currentSource[property[1]] = yamlText(property[2]);
      continue;
    }
    output.push(line);
  }
  flushSource();
  if (generated.by !== undefined) output.push(`generated_by: ${JSON.stringify(generated.by)}`);
  if (generated.at !== undefined) output.push(`generated_at: ${JSON.stringify(generated.at)}`);
  if (sources.length) {
    output.push('sources:');
    for (const source of sources) {
      const parts = [source.id, source.title, source.resource].filter(Boolean);
      output.push(`  - ${JSON.stringify(parts.join(' | '))}`);
    }
  }
  return `${match[1]}${output.join('\n')}${match[3]}${content.slice(match[0].length)}`;
}

function exportObsidian(directory) {
  if (!directory) throw new Error('Usage: node tools/9mem.mjs export-obsidian <new-output-folder>');
  const source = path.resolve(vaultRoot());
  const destination = path.resolve(process.cwd(), directory);
  const isWithin = (base, candidate) => {
    const relative = path.relative(base, candidate);
    return relative === '' || (!path.isAbsolute(relative) && relative !== '..' && !relative.startsWith(`..${path.sep}`));
  };
  if (isWithin(source, destination) || isWithin(destination, source)) {
    throw new Error('Export destination must be separate from and outside the source vault.');
  }
  if (fs.existsSync(destination) && (!fs.statSync(destination).isDirectory() || fs.readdirSync(destination).length > 0)) {
    throw new Error('Export destination must not exist or must be an empty directory.');
  }
  fs.mkdirSync(destination, { recursive: true });
  const files = markdownFiles(source);
  for (const file of files) {
    const target = path.join(destination, path.relative(source, file));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, flattenObsidianProperties(fs.readFileSync(file, 'utf8')));
  }
  console.log(`Exported ${files.length} Markdown files to ${destination}`);
  console.log('Open the exported folder as a vault in Obsidian. Nested generated/sources YAML is flattened to Obsidian-friendly properties.');
}

function termsOf(value) {
  return value.toLowerCase().match(/[\p{L}\p{N}_-]+/gu) ?? [];
}

function search(query) {
  const terms = [...new Set(termsOf(query))];
  if (!terms.length) throw new Error('Provide search terms.');
  const results = markdownFiles().map(file => {
    const content = fs.readFileSync(file, 'utf8');
    const headings = content.split(/\r?\n/).filter(line => /^#{1,6}\s/.test(line)).join(' ');
    const lower = content.toLowerCase();
    const score = terms.reduce((total, term) => {
      const occurrences = lower.split(term).length - 1;
      const headingBonus = termsOf(headings).filter(headingTerm => headingTerm === term).length * 5;
      const titleBonus = path.basename(file, '.md').toLowerCase().includes(term) ? 8 : 0;
      return total + occurrences + headingBonus + titleBonus;
    }, 0);
    if (!score) return null;
    const lines = content.split(/\r?\n/);
    const matchingLine = lines.findIndex(line => terms.some(term => line.toLowerCase().includes(term)));
    const snippet = matchingLine < 0 ? '' : lines.slice(Math.max(0, matchingLine - 1), matchingLine + 2).join(' ').trim();
    return { file: relative(file), score, snippet };
  }).filter(Boolean).sort((left, right) => right.score - left.score || left.file.localeCompare(right.file));
  if (!results.length) {
    console.log('No matching Markdown pages.');
    return;
  }
  for (const item of results.slice(0, 20)) console.log(`${item.file}  [${item.score}]\n  ${item.snippet}`);
}

function checkLinks() {
  const files = markdownFiles();
  const names = new Set(files.map(file => path.basename(file, '.md').toLowerCase()));
  const broken = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const match of content.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g)) {
      const target = match[1].trim().replace(/\\/g, '/').split('/').at(-1).replace(/\.md$/i, '').toLowerCase();
      if (/^(wikilinks|page-name|related-.+|yyyy-mm-dd)$/.test(target)) continue;
      if (!names.has(target)) broken.push({ file: relative(file), target: match[1].trim() });
    }
  }
  if (!broken.length) {
    console.log(`All wikilinks resolve (${files.length} Markdown files scanned).`);
    return;
  }
  for (const link of broken) console.log(`${link.file}: [[${link.target}]]`);
  console.log(`Found ${broken.length} unresolved wikilink(s).`);
  process.exitCode = 1;
}

function checkFrontmatter() {
  const folders = ['wiki/entities', 'wiki/concepts', 'wiki/sessions', 'wiki/tasks'].map(folder => path.join(vaultRoot(), folder));
  const files = folders.flatMap(folder => fs.existsSync(folder) ? markdownFiles(folder) : []);
  const errors = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    if (!match) {
      errors.push(`${relative(file)}: missing YAML frontmatter`);
      continue;
    }
    const yaml = match[1];
    for (const field of ['type', 'title', 'description', 'status', 'generated', 'sources']) {
      if (!new RegExp(`^${field}:\\s*\\S`, 'm').test(yaml)) errors.push(`${relative(file)}: missing ${field}`);
    }
    if (!/^status:\s*(draft|stable|deprecated)\s*$/m.test(yaml)) errors.push(`${relative(file)}: status must be draft, stable, or deprecated`);
    const generated = yaml.match(/^generated:[ \t]*\r?\n((?:[ \t]+.*(?:\r?\n|$))*)/m)?.[1] ?? '';
    if (!/^[ \t]+by:[ \t]*\S/m.test(generated)) errors.push(`${relative(file)}: generated.by is missing`);
    if (/^[ \t]+at:[ \t]*\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z[ \t]*$/m.test(generated) === false) errors.push(`${relative(file)}: generated.at must be an ISO-8601 UTC timestamp`);
    const lines = yaml.split(/\r?\n/);
    const sourceStart = lines.findIndex(line => /^sources:[ \t]*$/.test(line));
    const sourceLines = sourceStart < 0 ? [] : lines.slice(sourceStart + 1).filter(line => /^[ \t]/.test(line));
    if (!sourceLines.some(line => /^[ \t]+(?:-[ \t]+)?resource:[ \t]*\S/.test(line))) errors.push(`${relative(file)}: sources must include a resource`);
  }
  if (errors.length) {
    for (const error of errors) console.log(error);
    console.log(`Found ${errors.length} frontmatter issue(s) in ${files.length} wiki pages.`);
    process.exitCode = 1;
  } else console.log(`Frontmatter checks passed (${files.length} wiki pages scanned).`);
}

const [command, ...args] = process.argv.slice(2);
if (command === '--help' || command === '-h' || command === 'help') {
  console.log('9mem local helper\n\nUsage:\n  9mem set-vault <existing-9mem-vault>\n  9mem export-obsidian <new-output-folder>\n  9mem start-task "Task description" [--project owner/repo]\n  9mem milestone <task-file> "Milestone description"\n  9mem complete-task <task-file> "Completion summary"\n  9mem search <terms>\n  9mem check-links\n  9mem check-frontmatter');
} else if (command === 'search') search(args.join(' '));
else if (command === 'check-links') checkLinks();
else if (command === 'check-frontmatter') checkFrontmatter();
else if (command === 'set-vault') setVault(args.join(' '));
else if (command === 'export-obsidian') exportObsidian(args.join(' '));
else if (command === 'start-task') startTask(args);
else if (command === 'milestone') addMilestone(args);
else if (command === 'complete-task') completeTask(args);
else {
  console.log('9mem local helper\n\nUsage:\n  node tools/9mem.mjs set-vault <existing-9mem-vault>\n  node tools/9mem.mjs export-obsidian <new-output-folder>\n  node tools/9mem.mjs start-task "Task description" [--project owner/repo]\n  node tools/9mem.mjs milestone <task-file> "Milestone description"\n  node tools/9mem.mjs complete-task <task-file> "Completion summary"\n  node tools/9mem.mjs search <terms>\n  node tools/9mem.mjs check-links\n  node tools/9mem.mjs check-frontmatter');
  if (command) process.exitCode = 2;
}
