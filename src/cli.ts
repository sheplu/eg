#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { formatNextSteps, generateProject } from './generator/generate.js';
import { parseArgs } from './generator/options.js';

const help = `eg - Express 5 API generator

Usage:
  eg <project-directory> [options]

Options:
  --force         Overwrite a non-empty target directory
  --skip-install  Create files without running npm install
  -h, --help      Show this help message
  -v, --version   Show the package version
`;

async function main(): Promise<void> {
  const result = parseArgs(process.argv.slice(2));

  if (result.kind === 'help') {
    console.log(help);
    return;
  }

  if (result.kind === 'version') {
    console.log(await readPackageVersion());
    return;
  }

  const generation = await generateProject(result.options);
  console.log(formatNextSteps(generation));
}

async function readPackageVersion(): Promise<string> {
  const currentDirectory = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(currentDirectory, '..', 'package.json'),
    join(currentDirectory, '..', '..', 'package.json'),
  ];

  for (const candidate of candidates) {
    try {
      const packageJson = JSON.parse(await readFile(candidate, 'utf8')) as { version?: unknown };
      if (typeof packageJson.version === 'string') {
        return packageJson.version;
      }
    } catch {
      // Try the next candidate.
    }
  }

  return '0.0.0';
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
