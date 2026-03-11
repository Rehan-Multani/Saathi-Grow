import { readdir } from 'fs/promises';
import { join, extname } from 'path';
import { execFileSync } from 'child_process';

const root = process.cwd();
const targets = [join(root, 'src')];

const shouldInclude = (filePath) => extname(filePath) === '.js';

const collectJsFiles = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectJsFiles(fullPath)));
      continue;
    }
    if (entry.isFile() && shouldInclude(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
};

const main = async () => {
  const files = [];
  for (const dir of targets) {
    files.push(...(await collectJsFiles(dir)));
  }

  for (const file of files) {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  }

  console.log(`[CHECK] Syntax OK for ${files.length} backend files.`);
};

main().catch((error) => {
  console.error('[CHECK] Syntax validation failed.');
  if (error?.stderr) {
    console.error(String(error.stderr));
  } else {
    console.error(error);
  }
  process.exit(1);
});
