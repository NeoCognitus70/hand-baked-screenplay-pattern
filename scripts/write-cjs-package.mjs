import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const commonJsDirectory = resolve('dist', 'cjs');

await mkdir(commonJsDirectory, { recursive: true });
await writeFile(
  resolve(commonJsDirectory, 'package.json'),
  `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`,
  'utf8',
);
