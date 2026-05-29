import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { afterEach, describe, it } from 'node:test';
import { generateProject } from '../../src/generator/generate.js';

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirectories.splice(0).map((directory) => rm(directory, { force: true, recursive: true })));
});

describe('generateProject', () => {
  it('creates an Express 5 TypeScript API project from the template', async () => {
    const workspace = await createTempDirectory();
    const targetDirectory = join(workspace, 'My API');

    const result = await generateProject({
      force: false,
      install: false,
      packageName: 'my-api',
      projectName: 'My API',
      targetDirectory,
    });

    assert.equal(result.installed, false);

    const packageJson = JSON.parse(await readFile(join(targetDirectory, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
      name: string;
      scripts: Record<string, string>;
    };

    assert.equal(packageJson.name, 'my-api');
    assert.match(packageJson.dependencies.express ?? '', /^\^5\./);
    assert.ok(packageJson.dependencies.ajv);
    assert.ok(packageJson.devDependencies.oxlint);
    assert.equal(packageJson.scripts.test, 'node --import tsx --test test/**/*.test.ts');

    const statusController = await readFile(join(targetDirectory, 'src/controllers/status.controller.ts'), 'utf8');
    assert.match(statusController, /name: 'My API'/);

    const generatedReadme = await readFile(join(targetDirectory, 'README.md'), 'utf8');
    assert.match(generatedReadme, /^# My API/m);
  });

  it('escapes project names used inside generated TypeScript string literals', async () => {
    const workspace = await createTempDirectory();
    const targetDirectory = join(workspace, "owner's api");

    await generateProject({
      force: false,
      install: false,
      packageName: 'owners-api',
      projectName: "owner's api",
      targetDirectory,
    });

    const statusController = await readFile(join(targetDirectory, 'src/controllers/status.controller.ts'), 'utf8');
    assert.match(statusController, /name: 'owner\\'s api'/);

    const generatedReadme = await readFile(join(targetDirectory, 'README.md'), 'utf8');
    assert.match(generatedReadme, /^# owner's api/m);
  });

  it('uses an existing empty target directory', async () => {
    const workspace = await createTempDirectory();
    const targetDirectory = join(workspace, 'api');
    await mkdir(targetDirectory);

    const result = await generateProject({
      force: false,
      install: false,
      packageName: 'api',
      projectName: 'api',
      targetDirectory,
    });

    assert.equal(result.targetDirectory, targetDirectory);

    const packageJson = await readFile(join(targetDirectory, 'package.json'), 'utf8');
    assert.match(packageJson, /"name": "api"/);
  });

  it('runs the install step when requested', async () => {
    const workspace = await createTempDirectory();
    const targetDirectory = join(workspace, 'api');

    await withFakeNpm('exit 0', async () => {
      const result = await generateProject({
        force: false,
        install: true,
        packageName: 'api',
        projectName: 'api',
        targetDirectory,
      });

      assert.equal(result.installed, true);
    });

    const packageJson = await readFile(join(targetDirectory, 'package.json'), 'utf8');
    assert.match(packageJson, /"name": "api"/);
  });

  it('reports install failures with the exit code', async () => {
    const workspace = await createTempDirectory();
    const targetDirectory = join(workspace, 'api');

    await withFakeNpm('exit 2', async () => {
      await assert.rejects(
        () =>
          generateProject({
            force: false,
            install: true,
            packageName: 'api',
            projectName: 'api',
            targetDirectory,
          }),
        /npm install failed with exit code 2/,
      );
    });
  });

  it('reports install failures with the signal', async () => {
    const workspace = await createTempDirectory();
    const targetDirectory = join(workspace, 'api');

    await withFakeNpm('kill -TERM $$', async () => {
      await assert.rejects(
        () =>
          generateProject({
            force: false,
            install: true,
            packageName: 'api',
            projectName: 'api',
            targetDirectory,
          }),
        /npm install failed with signal SIGTERM/,
      );
    });
  });

  it('reports install spawn errors', async () => {
    const workspace = await createTempDirectory();
    const targetDirectory = join(workspace, 'api');
    const binDirectory = await createTempDirectory();

    await withPath(binDirectory, async () => {
      await assert.rejects(
        () =>
          generateProject({
            force: false,
            install: true,
            packageName: 'api',
            projectName: 'api',
            targetDirectory,
          }),
        /ENOENT/,
      );
    });
  });

  it('throws for a non-empty directory without force and overwrites with force', async () => {
    const workspace = await createTempDirectory();
    const targetDirectory = join(workspace, 'api');
    await mkdir(targetDirectory);
    await writeFile(join(targetDirectory, 'keep.txt'), 'placeholder');

    await assert.rejects(
      () =>
        generateProject({
          force: false,
          install: false,
          packageName: 'api',
          projectName: 'api',
          targetDirectory,
        }),
      /Target directory is not empty/,
    );

    await generateProject({
      force: true,
      install: false,
      packageName: 'api',
      projectName: 'api',
      targetDirectory,
    });

    const packageJson = await readFile(join(targetDirectory, 'package.json'), 'utf8');
    assert.match(packageJson, /"name": "api"/);
  });
});

async function createTempDirectory(): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'eg-'));
  tempDirectories.push(directory);
  return directory;
}

async function withFakeNpm(script: string, callback: () => Promise<void>): Promise<void> {
  const binDirectory = await createTempDirectory();
  const npmPath = join(binDirectory, 'npm');
  await writeFile(npmPath, `#!/usr/bin/env sh\n${script}\n`);
  await chmod(npmPath, 0o755);

  const path = [binDirectory, process.env.PATH].filter(Boolean).join(delimiter);
  await withPath(path, callback);
}

async function withPath(path: string, callback: () => Promise<void>): Promise<void> {
  const originalPath = process.env.PATH;
  process.env.PATH = path;

  try {
    await callback();
  } finally {
    if (originalPath === undefined) {
      delete process.env.PATH;
    } else {
      process.env.PATH = originalPath;
    }
  }
}
