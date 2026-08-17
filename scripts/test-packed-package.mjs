import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

const packageName = 'hand-baked-screenplay-pattern';
const workspace = resolve('.');
const npmCli = process.env.npm_execpath;

if (!npmCli) {
  throw new Error('Run the package smoke through npm run test:package.');
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: workspace,
    encoding: 'utf8',
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      [
        `${command} ${args.join(' ')} failed with exit code ${result.status}.`,
        result.stdout,
        result.stderr,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }

  return result.stdout.trim();
}

function runNpm(args, options = {}) {
  return run(process.execPath, [npmCli, ...args], options);
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function installPackedArtifact(fixtureDirectory, tarball) {
  await mkdir(fixtureDirectory, { recursive: true });
  await writeJson(join(fixtureDirectory, 'package.json'), {
    private: true,
    version: '0.0.0',
  });

  runNpm(
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--package-lock=false',
      tarball,
    ],
    { cwd: fixtureDirectory },
  );
}

async function runTypeSmoke(fixtureDirectory, sourceFile) {
  const typescript = resolve(workspace, 'node_modules', 'typescript', 'bin', 'tsc');
  run(
    process.execPath,
    [
      typescript,
      '--noEmit',
      '--strict',
      '--target',
      'ES2022',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--skipLibCheck',
      sourceFile,
    ],
    { cwd: fixtureDirectory },
  );
}

const temporaryRoot = await mkdtemp(join(tmpdir(), 'hbsp-package-smoke-'));

try {
  const manifest = JSON.parse(await readFile('package.json', 'utf8'));
  const packDirectory = join(temporaryRoot, 'pack');
  await mkdir(packDirectory);

  const packOutput = runNpm([
    'pack',
    '--ignore-scripts',
    '--json',
    '--pack-destination',
    packDirectory,
  ]);
  const [packed] = JSON.parse(packOutput);
  const tarball = join(packDirectory, packed.filename);

  if (packed.id !== `${packageName}@${manifest.version}`) {
    throw new Error(`Packed unexpected package: ${packed.id}`);
  }

  const intendedTopLevelFiles = new Set([
    'CHANGELOG.md',
    'LICENSE',
    'README.md',
    'package.json',
  ]);
  const unexpectedFiles = packed.files
    .map(({ path }) => path)
    .filter((path) => !path.startsWith('dist/') && !intendedTopLevelFiles.has(path));

  if (unexpectedFiles.length > 0) {
    throw new Error(`Packed unintended files: ${unexpectedFiles.join(', ')}`);
  }

  const packedPaths = new Set(packed.files.map(({ path }) => path));
  for (const requiredPath of [
    'CHANGELOG.md',
    'LICENSE',
    'README.md',
    'package.json',
    'dist/index.d.ts',
    'dist/index.js',
    'dist/cjs/index.d.ts',
    'dist/cjs/index.js',
    'dist/cjs/package.json',
  ]) {
    if (!packedPaths.has(requiredPath)) {
      throw new Error(`Packed artifact is missing ${requiredPath}.`);
    }
  }

  if (manifest.dependencies && Object.keys(manifest.dependencies).length > 0) {
    throw new Error('The runtime package must retain zero dependencies.');
  }

  const esmFixture = join(temporaryRoot, 'esm-consumer');
  await installPackedArtifact(esmFixture, tarball);
  await writeJson(join(esmFixture, 'package.json'), {
    private: true,
    version: '0.0.0',
    type: 'module',
  });
  await writeFile(
    join(esmFixture, 'runtime.mjs'),
    `import { AbilityToken, Cast, Question, Stage, providerConformanceCases } from '${packageName}';

const Memory = AbilityToken.named('Memory');
const stage = new Stage(Cast.whereEveryoneCan(Memory.bind({ answer: 42 })));
const actor = stage.actor('Ada');
const answer = await actor.answer(Question.about('the answer', candidate => candidate.abilityTo(Memory).answer));

if (answer !== 42 || providerConformanceCases.length === 0) {
  throw new Error('ESM package-root exports did not behave as expected.');
}
`,
    'utf8',
  );
  run(process.execPath, ['runtime.mjs'], { cwd: esmFixture });
  await writeFile(
    join(esmFixture, 'types.mts'),
    `import {
  AbilityToken,
  Cast,
  Question,
  Stage,
  type Actor,
  type ConformanceProvider,
  type QuestionLike,
} from '${packageName}';

type Memory = { answer: number };
const MemoryToken = AbilityToken.named<Memory>('Memory');
const stage = new Stage(Cast.whereEveryoneCan(MemoryToken.bind({ answer: 42 })));
const actor: Actor = stage.actor('Ada');
const question: QuestionLike<number> = Question.about('the answer', candidate => candidate.abilityTo(MemoryToken).answer);
const answer: Promise<number> = actor.answer(question);
const provider: ConformanceProvider | undefined = undefined;
void [answer, provider];
`,
    'utf8',
  );
  await runTypeSmoke(esmFixture, 'types.mts');

  const commonJsFixture = join(temporaryRoot, 'commonjs-consumer');
  await installPackedArtifact(commonJsFixture, tarball);
  await writeFile(
    join(commonJsFixture, 'runtime.cjs'),
    `const { AbilityToken, Cast, Question, Stage, providerConformanceCases } = require('${packageName}');

(async () => {
  const Memory = AbilityToken.named('Memory');
  const stage = new Stage(Cast.whereEveryoneCan(Memory.bind({ answer: 42 })));
  const actor = stage.actor('Ada');
  const answer = await actor.answer(Question.about('the answer', candidate => candidate.abilityTo(Memory).answer));

  if (answer !== 42 || providerConformanceCases.length === 0) {
    throw new Error('CommonJS package-root exports did not behave as expected.');
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
`,
    'utf8',
  );
  run(process.execPath, ['runtime.cjs'], { cwd: commonJsFixture });
  await writeFile(
    join(commonJsFixture, 'types.cts'),
    `import HBSP = require('${packageName}');

type Memory = { answer: number };
const MemoryToken = HBSP.AbilityToken.named<Memory>('Memory');
const stage = new HBSP.Stage(HBSP.Cast.whereEveryoneCan(MemoryToken.bind({ answer: 42 })));
const actor: HBSP.Actor = stage.actor('Ada');
const question: HBSP.QuestionLike<number> = HBSP.Question.about('the answer', candidate => candidate.abilityTo(MemoryToken).answer);
const answer: Promise<number> = actor.answer(question);
const provider: HBSP.ConformanceProvider | undefined = undefined;
void [answer, provider];
`,
    'utf8',
  );
  await runTypeSmoke(commonJsFixture, 'types.cts');

  const checksum = createHash('sha256').update(await readFile(tarball)).digest('hex');
  console.log(`Packed ${basename(tarball)} (${packed.files.length} intended files).`);
  console.log(`SHA-256 ${checksum}`);
  console.log('Clean-room ESM and CommonJS runtime/type smokes passed.');
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
