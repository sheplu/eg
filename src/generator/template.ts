import { existsSync } from 'node:fs';
import { cp, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export type TemplateVariables = {
  packageName: string;
  projectName: string;
};

export async function copyTemplate(targetDirectory: string, variables: TemplateVariables): Promise<void> {
  const templateDirectory = findTemplateDirectory();

  await mkdir(targetDirectory, { recursive: true });
  await cp(templateDirectory, targetDirectory, {
    recursive: true,
    filter: (source) => !source.split(sep).includes('node_modules'),
  });

  await applyTemplateVariables(targetDirectory, variables);
}

function findTemplateDirectory(): string {
  const currentDirectory = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(currentDirectory, '..', 'templates', 'api-ts'),
    join(currentDirectory, '..', '..', 'templates', 'api-ts'),
  ];

  const templateDirectory = candidates.find((candidate) => existsSync(candidate));
  if (!templateDirectory) {
    throw new Error('Unable to locate api-ts template directory.');
  }

  return templateDirectory;
}

async function applyTemplateVariables(
  targetDirectory: string,
  variables: TemplateVariables,
  currentDirectory = targetDirectory,
): Promise<void> {
  const entries = await readdir(currentDirectory, { withFileTypes: true });

  for (const entry of entries) {
    const currentPath = join(currentDirectory, entry.name);

    if (entry.isDirectory()) {
      await applyTemplateVariables(targetDirectory, variables, currentPath);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = extname(entry.name);
    const relativePath = relative(targetDirectory, currentPath);

    if (isTextTemplate(relativePath)) {
      const content = await readFile(currentPath, 'utf8');
      await writeFile(currentPath, renderTemplate(content, variables));
    }

    // The `.tpl` suffix lets the template carry filenames npm would otherwise
    // strip from a published tarball (e.g. `.gitignore.tpl` -> `.gitignore`).
    if (extension === '.tpl') {
      await rename(currentPath, currentPath.slice(0, -4));
    }
  }
}

function renderTemplate(content: string, variables: TemplateVariables): string {
  return content
    .replaceAll('__PACKAGE_NAME__', variables.packageName)
    .replaceAll('__PROJECT_NAME_TS__', escapeSingleQuotedString(variables.projectName))
    .replaceAll('__PROJECT_NAME__', variables.projectName);
}

function escapeSingleQuotedString(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")
    .replaceAll('\r', '\\r')
    .replaceAll('\n', '\\n')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}

function isTextTemplate(path: string): boolean {
  return [
    '.cjs',
    '.js',
    '.json',
    '.md',
    '.mjs',
    '.ts',
    '.tpl',
    '.yml',
    '.yaml',
  ].some((extension) => path.endsWith(extension));
}
