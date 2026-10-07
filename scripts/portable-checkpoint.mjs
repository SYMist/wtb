#!/usr/bin/env node
/**
 * Produce and verify the portable source manifest used before a workspace move.
 * It intentionally covers Git-tracked files only. Credentials, caches, ignored
 * build output, and Git metadata must never be added to this manifest.
 */
import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { execFileSync } from 'node:child_process';

const [mode, suppliedPath] = process.argv.slice(2);

if (!['write', 'verify'].includes(mode) || !suppliedPath) {
  console.error('Usage: node scripts/portable-checkpoint.mjs <write|verify> <manifest-path>');
  process.exit(2);
}

const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const manifestPath = resolve(repoRoot, suppliedPath);
const manifestRelativePath = relative(repoRoot, manifestPath);

if (
  isAbsolute(suppliedPath) ||
  !manifestRelativePath ||
  manifestRelativePath.startsWith(`..${sep}`) ||
  manifestRelativePath === '..'
) {
  console.error('The manifest path must be a non-empty path inside this repository.');
  process.exit(2);
}

function trackedPaths() {
  const paths = execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot, encoding: 'buffer' })
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .filter((path) => path !== manifestRelativePath)
    .sort((a, b) => a.localeCompare(b));

  if (paths.length === 0) throw new Error('No tracked source files found.');
  return paths;
}

function fingerprint(path) {
  const absolutePath = resolve(repoRoot, path);
  const stat = lstatSync(absolutePath);
  if (!stat.isFile()) throw new Error(`Tracked path is not a regular file: ${path}`);
  const bytes = readFileSync(absolutePath);
  return {
    path,
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  };
}

function buildManifest() {
  const files = trackedPaths().map(fingerprint);
  return {
    schema: 'tooly-portable-source-manifest/v1',
    scope: 'Git-tracked source files, excluding this manifest itself',
    exclusions: [manifestRelativePath],
    fileCount: files.length,
    totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
    files,
  };
}

function fail(message) {
  console.error(`CHECKPOINT VERIFY FAILED: ${message}`);
  process.exit(1);
}

if (mode === 'write') {
  const manifest = buildManifest();
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${manifestRelativePath}: ${manifest.fileCount} files, ${manifest.totalBytes} bytes`);
  process.exit(0);
}

if (!existsSync(manifestPath)) fail(`missing ${manifestRelativePath}`);

let expected;
try {
  expected = JSON.parse(readFileSync(manifestPath, 'utf8'));
} catch {
  fail(`invalid JSON in ${manifestRelativePath}`);
}

if (expected.schema !== 'tooly-portable-source-manifest/v1') fail('unsupported manifest schema');
if (!Array.isArray(expected.files)) fail('manifest files is not an array');

const actual = buildManifest();
if (expected.fileCount !== actual.fileCount || expected.totalBytes !== actual.totalBytes) {
  fail(`expected ${expected.fileCount} files/${expected.totalBytes} bytes, got ${actual.fileCount} files/${actual.totalBytes} bytes`);
}

for (let index = 0; index < expected.files.length; index += 1) {
  const wanted = expected.files[index];
  const found = actual.files[index];
  if (!found || wanted.path !== found.path || wanted.bytes !== found.bytes || wanted.sha256 !== found.sha256) {
    fail(`mismatch at ${wanted.path}`);
  }
}

console.log(`CHECKPOINT VERIFIED: ${actual.fileCount} files, ${actual.totalBytes} bytes`);
