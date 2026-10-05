import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceCli = path.join(repositoryRoot, 'tools', '9mem.mjs');

function fixture() {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), '9mem-cli-'));
  const installation = path.join(temporaryRoot, '9mem install');
  const cliPath = path.join(installation, 'tools', '9mem.mjs');
  fs.mkdirSync(path.dirname(cliPath), { recursive: true });
  fs.copyFileSync(sourceCli, cliPath);
  const run = (...args) => execFileSync(process.execPath, [cliPath, ...args], { cwd: installation, encoding: 'utf8' }).trim();
  return { temporaryRoot, installation, cliPath, run };
}

test('task lifecycle routes through a configured vault with paths containing spaces', t => {
  const { temporaryRoot, installation, run } = fixture();
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));

  const vault = path.join(temporaryRoot, 'central 9mem vault');
  fs.mkdirSync(path.join(vault, 'wiki'), { recursive: true });
  fs.writeFileSync(path.join(vault, 'SESSION.md'), '# Session\n');
  fs.writeFileSync(path.join(vault, 'index.md'), '# Index\n');
  run('set-vault', vault);
  const taskPath = run('start-task', 'Portable CLI smoke test', '--project', 'nenifix/9mem');
  run('milestone', taskPath, 'Milestone added from a path with spaces');
  run('complete-task', taskPath, 'Task lifecycle completed successfully');

  const task = fs.readFileSync(path.join(vault, taskPath), 'utf8');
  assert.match(task, /task_status: complete/);
  assert.match(task, /Milestone added from a path with spaces/);
  assert.match(task, /Task lifecycle completed successfully/);
  assert.match(run('check-frontmatter'), /passed/);
  assert.match(run('check-links'), /resolve/);
  assert.match(run('--help'), /export-obsidian/);
  assert.ok(fs.existsSync(path.join(installation, '.9mem', 'config.json')));
});

test('Obsidian export preserves links and flattens provenance properties', t => {
  const { temporaryRoot, cliPath, run } = fixture();
  t.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));

  const vault = path.join(temporaryRoot, 'source vault');
  const output = path.join(temporaryRoot, 'exported vault');
  fs.mkdirSync(path.join(vault, 'wiki'), { recursive: true });
  fs.writeFileSync(path.join(vault, 'SESSION.md'), '# Session\n');
  fs.writeFileSync(path.join(vault, 'index.md'), '# Index\n\n[[note]]\n');
  fs.writeFileSync(path.join(vault, 'wiki', 'note.md'), `---\ntype: Concept\ntitle: Test\ntags: [test, obsidian]\ngenerated:\n  by: agent/test\n  at: 2026-10-05T03:00:00Z\nsources:\n  - id: source-a\n    resource: https://example.com/source\n    title: Example source\n---\n\n# Test\n`);
  run('set-vault', vault);
  execFileSync(process.execPath, [cliPath, 'export-obsidian', output], { cwd: path.dirname(cliPath), stdio: 'pipe' });

  const exported = fs.readFileSync(path.join(output, 'wiki', 'note.md'), 'utf8');
  assert.match(exported, /generated_by: "agent\/test"/);
  assert.match(exported, /generated_at: "2026-10-05T03:00:00Z"/);
  assert.match(exported, /sources:\r?\n  - "source-a \| Example source \| https:\/\/example\.com\/source"/);
  assert.doesNotMatch(exported, /^generated:$/m);
  assert.match(fs.readFileSync(path.join(output, 'index.md'), 'utf8'), /\[\[note\]\]/);
});
