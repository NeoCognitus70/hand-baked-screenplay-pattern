import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('package.json', 'utf8'));
const changelog = await readFile('CHANGELOG.md', 'utf8');
const tag = process.env.GITHUB_REF_NAME ?? process.argv[2];
const expectedTag = `v${manifest.version}`;

if (!tag) {
  throw new Error('Pass a release tag or set GITHUB_REF_NAME.');
}

if (tag !== expectedTag) {
  throw new Error(`Release tag ${tag} does not match package version ${manifest.version}.`);
}

if (!changelog.includes(`## [${manifest.version}]`)) {
  throw new Error(`CHANGELOG.md has no release heading for ${manifest.version}.`);
}

console.log(`Release metadata agrees on ${tag}.`);
