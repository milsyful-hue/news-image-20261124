// News image — 24 November 2026 (Node 22, standard library only).
//
// Copies the entry image, a one-day newspaper infographic drawn for
// Tuesday 24 November 2026, to /output/entry.png. No network, no drawing
// at runtime: the bytes in the repository are the bytes that are judged,
// so the two grader runs are byte-identical by construction.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const SOURCE = join(dirname(fileURLToPath(import.meta.url)), 'entry.png');

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(SOURCE, join(OUTPUT_DIR, 'entry.png'));

// The gate: never hand the judge a bad file. Fail loudly instead of
// writing an entry.png that breaks the rules (over 1 MiB, not a PNG,
// or larger than 1024x1024).
const DEST = join(OUTPUT_DIR, 'entry.png');
const bytes = readFileSync(DEST);
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (bytes.length > 1024 * 1024) {
  throw new Error(`invalid entry.png: ${bytes.length} bytes (max 1 MiB)`);
}
if (!bytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error('invalid entry.png: missing PNG signature');
}
if (bytes.toString('ascii', 12, 16) !== 'IHDR') {
  throw new Error('invalid entry.png: missing IHDR chunk');
}
const width = bytes.readUInt32BE(16);
const height = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`invalid entry.png: ${width}x${height} (max 1024x1024)`);
}
console.log('wrote entry.png');
