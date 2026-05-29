import { basename, resolve } from 'node:path';

export type GeneratorOptions = {
  force: boolean;
  install: boolean;
  packageName: string;
  projectName: string;
  targetDirectory: string;
};

export type ParseArgsResult =
  | { kind: 'generate'; options: GeneratorOptions }
  | { kind: 'help' }
  | { kind: 'version' };

const helpFlags = new Set(['--help', '-h']);
const versionFlags = new Set(['--version', '-v']);

export function parseArgs(argv: readonly string[], cwd = process.cwd()): ParseArgsResult {
  if (argv.some((arg) => helpFlags.has(arg))) {
    return { kind: 'help' };
  }

  if (argv.some((arg) => versionFlags.has(arg))) {
    return { kind: 'version' };
  }

  const positional: string[] = [];
  let force = false;
  let install = true;

  for (const arg of argv) {
    if (arg === '--force') {
      force = true;
      continue;
    }

    if (arg === '--skip-install') {
      install = false;
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }

    positional.push(arg);
  }

  if (positional.length === 0) {
    throw new Error('Missing project directory.');
  }

  if (positional.length > 1) {
    throw new Error(`Unexpected arguments: ${positional.slice(1).join(' ')}`);
  }

  const projectName = positional[0];
  if (!projectName) {
    throw new Error('Missing project directory.');
  }

  const targetDirectory = resolve(cwd, projectName);
  const packageName = toPackageName(basename(targetDirectory));

  return {
    kind: 'generate',
    options: {
      force,
      install,
      packageName,
      projectName: basename(targetDirectory),
      targetDirectory,
    },
  };
}

export function toPackageName(name: string): string {
  const normalized = name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9._~-]+/g, '-')
    .replaceAll(/^-+|-+$/g, '');

  if (normalized.length === 0) {
    return 'express-api';
  }

  return normalized;
}
