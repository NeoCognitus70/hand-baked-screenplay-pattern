// Writes the deterministic sample report (HBSP-27 / landing LAND-09B) to disk
// for GitHub Pages publication. Runs on plain Node against the built `dist/`
// output (no ts-node/tsx), so it adds no dependency. Build first
// (`npm run build`) or use `npm run report:sample`, which builds then runs this.
//
// Usage: node scripts/generate-sample-report.mjs [outDir]   (default: report)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { renderSampleReport } from '../dist/sample/sampleReport.js';

const outDir = process.argv[2] ?? 'report';
const outPath = resolve(process.cwd(), outDir, 'index.html');
const html = await renderSampleReport();

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, html, 'utf8');

console.log(`sample-report: wrote ${outPath} (${Buffer.byteLength(html, 'utf8')} bytes)`);
