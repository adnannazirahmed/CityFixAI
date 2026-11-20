// Generates saved GPT-4o analyses for the demo sample photos.
//
//   npm run demo:analyze
//
// Reads OPENAI_API_KEY from .env.local, sends each sample's processed photo
// (public/demo/samples/<photoId>.jpg, from `npm run demo:photos`) plus its description
// and location context to the model using the app's own prompt, request settings and
// schema (src/lib/openai/analysis-shared.ts), and writes src/data/demo-sample-analyses.json.
// Asks for confirmation before making any API calls.

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import OpenAI from 'openai';
import {
  ANALYSIS_MODEL,
  ANALYSIS_REQUEST_OPTIONS,
  buildAnalysisMessages,
  parseAnalysisResponse,
} from '../../src/lib/openai/analysis-shared';
import { DEMO_SAMPLES } from '../../src/data/demo-samples';
import type { SavedAnalysis } from '../../src/data/demo-samples';

const ROOT = path.resolve(__dirname, '..', '..');
const ENV_FILE = path.join(ROOT, '.env.local');
const OUT_FILE = path.join(ROOT, 'src', 'data', 'demo-sample-analyses.json');
const PHOTO_DIR = path.join(ROOT, 'public', 'demo', 'samples');

function die(msg: string): never {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

async function main() {
  // ─── API key from .env.local ────────────────────────────────────────────────
  if (!existsSync(ENV_FILE)) die('.env.local not found. Create it with OPENAI_API_KEY=sk-... (it is gitignored).');
  process.loadEnvFile(ENV_FILE);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.startsWith('sk-placeholder') || apiKey === 'sk-...') {
    die('OPENAI_API_KEY in .env.local is missing or a placeholder.');
  }

  // ─── Photos must exist ──────────────────────────────────────────────────────
  const missing = DEMO_SAMPLES.filter(s => !existsSync(path.join(PHOTO_DIR, `${s.photoId}.jpg`)));
  if (missing.length) {
    die(`Missing processed photos: ${Array.from(new Set(missing.map(s => `${s.photoId}.jpg`))).join(', ')}.\n  Run \`npm run demo:photos\` first.`);
  }

  // ─── Plan + confirmation ────────────────────────────────────────────────────
  console.log(`\nPlan: ${DEMO_SAMPLES.length} calls to ${ANALYSIS_MODEL} (billed to your OpenAI account)\n`);
  for (const s of DEMO_SAMPLES) {
    const note = s.id === 'mismatch' ? '  ← description claims a pothole; expect mismatch_detected=true' : '';
    console.log(`  • ${s.id.padEnd(20)} photo ${`${s.photoId}.jpg`.padEnd(24)} ${s.neighborhood}${note}`);
  }
  console.log(`\nOutput: ${path.relative(ROOT, OUT_FILE)} (samples that fail keep their previous entry)\n`);

  if (!process.stdin.isTTY) die('Not an interactive terminal; run this directly so you can confirm.');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(`Make ${DEMO_SAMPLES.length} API calls now? [y/N] `)).trim().toLowerCase();
  rl.close();
  if (answer !== 'y' && answer !== 'yes') {
    console.log('Aborted. No API calls were made.');
    return;
  }

  // ─── Generate ───────────────────────────────────────────────────────────────
  const existing: Record<string, SavedAnalysis> = existsSync(OUT_FILE)
    ? JSON.parse(await readFile(OUT_FILE, 'utf8'))
    : {};
  const client = new OpenAI({ apiKey });
  const output: Record<string, SavedAnalysis> = {};
  const failures: string[] = [];

  for (const s of DEMO_SAMPLES) {
    process.stdout.write(`  ${s.id.padEnd(20)} … `);
    try {
      const photo = await readFile(path.join(PHOTO_DIR, `${s.photoId}.jpg`));
      const dataUrl = `data:image/jpeg;base64,${photo.toString('base64')}`;
      const response = await client.chat.completions.create({
        model: ANALYSIS_MODEL,
        messages: buildAnalysisMessages(s.description, dataUrl, s.latitude, s.longitude),
        ...ANALYSIS_REQUEST_OPTIONS,
      });
      const analysis = parseAnalysisResponse(response.choices[0]?.message?.content ?? '{}');
      output[s.id] = {
        analysis,
        source: 'gpt-4o',
        model: response.model,
        generatedAt: new Date().toISOString(),
      };

      const flags: string[] = [];
      if (analysis.category !== s.category) flags.push(`category "${analysis.category}" (expected "${s.category}")`);
      if (s.id === 'mismatch' && !analysis.mismatch_detected) flags.push('mismatch NOT detected — the demo warning will not show; consider re-running');
      if (s.id !== 'mismatch' && analysis.mismatch_detected) flags.push(`flagged a mismatch: ${analysis.mismatch_note ?? ''}`);
      console.log(`ok  ${analysis.category}, priority ${analysis.priority_score}, confidence ${analysis.confidence}${flags.length ? `\n      ⚠ ${flags.join('\n      ⚠ ')}` : ''}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`FAILED  ${msg}`);
      failures.push(s.id);
      if (existing[s.id]) output[s.id] = existing[s.id];
    }
  }

  await writeFile(OUT_FILE, JSON.stringify(output, null, 2) + '\n');
  console.log(`\nWrote ${path.relative(ROOT, OUT_FILE)}: ${DEMO_SAMPLES.length - failures.length}/${DEMO_SAMPLES.length} generated.`);
  if (failures.length) {
    console.error(`Failed: ${failures.join(', ')} (kept previous entries). Re-run to retry.`);
    process.exitCode = 1;
  }
}

main().catch(err => die(err instanceof Error ? err.message : String(err)));
