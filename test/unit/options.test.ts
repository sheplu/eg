import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatNextSteps } from '../../src/generator/generate.js';
import { parseArgs, toPackageName } from '../../src/generator/options.js';

describe('parseArgs', () => {
  it('parses a project directory with defaults', () => {
    const result = parseArgs(['my-api'], '/tmp/workspace');

    assert.equal(result.kind, 'generate');
    if (result.kind !== 'generate') {
      throw new Error('Expected generate result.');
    }

    assert.equal(result.options.force, false);
    assert.equal(result.options.install, true);
    assert.equal(result.options.packageName, 'my-api');
    assert.equal(result.options.projectName, 'my-api');
    assert.equal(result.options.targetDirectory, '/tmp/workspace/my-api');
  });

  it('parses force and skip-install flags', () => {
    const result = parseArgs(['my-api', '--force', '--skip-install'], '/tmp/workspace');

    assert.equal(result.kind, 'generate');
    if (result.kind !== 'generate') {
      throw new Error('Expected generate result.');
    }

    assert.equal(result.options.force, true);
    assert.equal(result.options.install, false);
  });

  it('returns help and version results', () => {
    assert.deepEqual(parseArgs(['--help']), { kind: 'help' });
    assert.deepEqual(parseArgs(['-h']), { kind: 'help' });
    assert.deepEqual(parseArgs(['--version']), { kind: 'version' });
    assert.deepEqual(parseArgs(['-v']), { kind: 'version' });
  });

  it('rejects missing and extra project directories', () => {
    assert.throws(() => parseArgs([]), /Missing project directory/);
    assert.throws(() => parseArgs(['api', 'extra']), /Unexpected arguments: extra/);
  });

  it('rejects unknown options', () => {
    assert.throws(() => parseArgs(['my-api', '--unknown']), /Unknown option/);
  });
});

describe('formatNextSteps', () => {
  it('quotes paths with spaces in shell commands', () => {
    const output = formatNextSteps(
      {
        installed: false,
        packageName: 'my-api',
        projectName: 'My API',
        targetDirectory: '/tmp/workspace/My API',
      },
      '/tmp/workspace',
    );

    assert.match(output, /cd 'My API'/);
    assert.match(output, /npm install/);
  });

  it('escapes single quotes in shell commands', () => {
    const output = formatNextSteps(
      {
        installed: true,
        packageName: 'owners-api',
        projectName: "owner's api",
        targetDirectory: "/tmp/workspace/owner's api",
      },
      '/tmp/workspace',
    );

    assert.match(output, /cd 'owner'\\''s api'/);
    assert.doesNotMatch(output, /npm install/);
  });

  it('uses the absolute path when the target lives outside cwd', () => {
    const output = formatNextSteps(
      {
        installed: true,
        packageName: 'my-api',
        projectName: 'my-api',
        targetDirectory: '/var/tmp/my-api',
      },
      '/home/user/projects',
    );

    assert.match(output, /cd \/var\/tmp\/my-api/);
    assert.doesNotMatch(output, /\.\.\//);
  });

  it('uses the current directory when the target matches cwd', () => {
    const output = formatNextSteps(
      {
        installed: true,
        packageName: 'my-api',
        projectName: 'my-api',
        targetDirectory: '/tmp/workspace/my-api',
      },
      '/tmp/workspace/my-api',
    );

    assert.match(output, /cd \./);
  });
});

describe('toPackageName', () => {
  it('normalizes names for package.json', () => {
    assert.equal(toPackageName('My API!'), 'my-api');
    assert.equal(toPackageName('___'), '___');
    assert.equal(toPackageName(''), 'express-api');
  });
});
