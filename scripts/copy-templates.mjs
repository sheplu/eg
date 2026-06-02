import { cp, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'templates');
const target = join(root, 'dist', 'templates');

await rm(target, { force: true, recursive: true });
await cp(source, target, { recursive: true });
