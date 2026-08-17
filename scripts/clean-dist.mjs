import { rm } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const distributionDirectory = resolve('dist');

if (basename(distributionDirectory) !== 'dist') {
  throw new Error(`Refusing to clean unexpected path: ${distributionDirectory}`);
}

await rm(distributionDirectory, { recursive: true, force: true });
