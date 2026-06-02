import { existsSync } from 'node:fs';
import { mkdir, readdir, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { relative, sep } from 'node:path';
import type { GeneratorOptions } from './options.js';
import { copyTemplate } from './template.js';

export type GenerateResult = {
  installed: boolean;
  packageName: string;
  projectName: string;
  targetDirectory: string;
};

export async function generateProject(options: GeneratorOptions): Promise<GenerateResult> {
  await prepareTargetDirectory(options.targetDirectory, options.force);

  await copyTemplate(options.targetDirectory, {
    packageName: options.packageName,
    projectName: options.projectName,
  });

  if (options.install) {
    await installDependencies(options.targetDirectory);
  }

  return {
    installed: options.install,
    packageName: options.packageName,
    projectName: options.projectName,
    targetDirectory: options.targetDirectory,
  };
}

export function formatNextSteps(result: GenerateResult, cwd = process.cwd()): string {
  const relativeTarget = relative(cwd, result.targetDirectory);
  // Fall back to the absolute path when the target lives outside cwd, so we
  // never print a long chain of `../` segments.
  const target = relativeTarget === '' ? '.' : relativeTarget.startsWith('..') ? result.targetDirectory : relativeTarget;
  const commands = [`cd ${formatShellPath(target)}`];

  if (!result.installed) {
    commands.push('npm install');
  }

  commands.push('npm run dev');

  return [
    '',
    `Created ${result.projectName}.`,
    '',
    'Next steps:',
    ...commands.map((command) => `  ${command}`),
    '',
    'Useful commands:',
    '  npm test',
    '  npm run typecheck',
    '  npm run lint',
  ].join('\n');
}

function formatShellPath(path: string): string {
  const normalized = path.split(sep).join('/');
  if (/^[a-zA-Z0-9._/-]+$/.test(normalized)) {
    return normalized;
  }

  return `'${normalized.replaceAll("'", "'\\''")}'`;
}

async function prepareTargetDirectory(targetDirectory: string, force: boolean): Promise<void> {
  if (!existsSync(targetDirectory)) {
    await mkdir(targetDirectory, { recursive: true });
    return;
  }

  const entries = await readdir(targetDirectory);
  if (entries.length === 0) {
    return;
  }

  if (!force) {
    throw new Error(`Target directory is not empty: ${targetDirectory}. Use --force to overwrite it.`);
  }

  await rm(targetDirectory, { force: true, recursive: true });
  await mkdir(targetDirectory, { recursive: true });
}

async function installDependencies(cwd: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn('npm', ['install'], {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`npm install failed${signal ? ` with signal ${signal}` : ` with exit code ${code}`}.`));
    });
  });
}
