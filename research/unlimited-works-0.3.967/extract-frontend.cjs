const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const input = process.argv[2];
if (!input) throw new Error('Usage: node extract-frontend.cjs <unlimited_works.exe>');
const binary = fs.readFileSync(input);
const outputDir = path.join(__dirname, 'frontend');
fs.mkdirSync(outputDir, { recursive: true });
const targets = [
  { name: 'index.html', check: value => /^<!doctype html>/i.test(value.trimStart()) },
  { name: 'assets/index-DjRrn5cR.js', check: value => value.includes('__vite__mapDeps') },
  { name: 'assets/index-DCG6pvV7.js', check: value => value.includes('__vite__mapDeps') },
  { name: 'assets/index-BFpAZGXW.css', check: value => value.includes('{') },
];
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const manifest = { input: path.resolve(input), inputSha256: hash(binary), resources: [] };
for (const target of targets) {
  const key = Buffer.from(target.name);
  let offset = -1;
  const candidates = [];
  while ((offset = binary.indexOf(key, offset + 1)) !== -1) {
    try {
      const result = zlib.brotliDecompressSync(binary.subarray(offset + key.length), {
        maxOutputLength: 32 * 1024 * 1024,
        info: true,
      });
      if (target.check(result.buffer.toString('utf8'))) {
        candidates.push({ offset, data: result.buffer, compressedBytes: result.engine.bytesWritten });
      }
    } catch (error) {
      if (!String(error.code || '').startsWith('ERR_') && error.code !== 'Z_DATA_ERROR') throw error;
    }
  }
  if (candidates.length !== 1) throw new Error(`${target.name}: expected one candidate, found ${candidates.length}`);
  const candidate = candidates[0];
  const destination = path.join(outputDir, ...target.name.split('/'));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, candidate.data, { flag: 'wx' });
  manifest.resources.push({ path: target.name, filenameOffset: candidate.offset,
    compressedBytes: candidate.compressedBytes, bytes: candidate.data.length, sha256: hash(candidate.data) });
}
fs.writeFileSync(path.join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(manifest, null, 2));
