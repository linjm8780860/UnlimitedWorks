const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');

const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/extract-compiled-frontend.cjs <unlimited_works.exe> [output-directory]');

const executablePath = path.resolve(input);
const outputDir = path.resolve(process.argv[3] || path.join(__dirname, '..', 'reference', 'compiled-frontend'));
if (fs.existsSync(outputDir) && fs.readdirSync(outputDir).length) {
  throw new Error(`Output directory is not empty: ${outputDir}`);
}
const stagingDir = `${outputDir}.extracting-${process.pid}`;

const binary = fs.readFileSync(executablePath);
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const manifest = { input: executablePath, inputSha256: hash(binary), resources: [], missing: [] };
const visited = new Set();
const pending = ['index.html'];

function decodeResource(name) {
  const key = Buffer.from(name);
  const candidates = new Map();
  let offset = -1;
  while ((offset = binary.indexOf(key, offset + 1)) !== -1) {
    try {
      const result = zlib.brotliDecompressSync(binary.subarray(offset + key.length), {
        maxOutputLength: 128 * 1024 * 1024,
        info: true,
      });
      const data = result.buffer;
      if (!data.length || !result.engine.bytesWritten) continue;
      const digest = hash(data);
      candidates.set(digest, data);
    } catch (error) {
      if (!String(error.code || '').startsWith('ERR_') && error.code !== 'Z_DATA_ERROR') throw error;
    }
  }
  if (candidates.size > 1) throw new Error(`Ambiguous embedded resource: ${name}`);
  return candidates.values().next().value;
}

function addReferences(name, data) {
  const extension = path.extname(name).toLowerCase();
  if (!['.html', '.js', '.mjs', '.css'].includes(extension)) return;
  const source = data.toString('utf8');
  const references = extension === '.html'
    ? [...source.matchAll(/(?:src|href)=["']([^"']+)["']/gi)].map(match => match[1])
    : [...source.matchAll(/((?:\/|\.\/)?(?:assets|icons|splash|models|fonts|images|config|eula)\/[^\s"'`?#<>]+\.(?:js|mjs|css|wasm|woff2?|ttf|otf|png|jpe?g|svg|webp|gif|mp4|ico|glb|gltf|hdr|exr|json|md|txt)|\/[A-Za-z0-9_.-]+\.(?:json|md|txt|ico|png|svg))/giu)].map(match => match[1]);

  for (const reference of references) {
    if (/^(?:[a-z]+:|#|data:|blob:)/i.test(reference)) continue;
    let decoded = reference.split(/[?#]/, 1)[0];
    try { decoded = decodeURIComponent(decoded); } catch {}
    const normalized = decoded.replace(/^\/+|^\.\//, '');
    if (!normalized || normalized.split(/[\\/]/).includes('..')) continue;
    if (!pending.includes(normalized) && !visited.has(normalized)) pending.push(normalized);
  }
}

fs.mkdirSync(stagingDir, { recursive: true });
while (pending.length) {
  const name = pending.shift();
  if (visited.has(name)) continue;
  visited.add(name);
  const data = decodeResource(name);
  if (!data) {
    manifest.missing.push(name);
    continue;
  }
  const destination = path.join(stagingDir, ...name.split('/'));
  const relative = path.relative(stagingDir, destination);
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Invalid resource path: ${name}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, data, { flag: 'wx' });
  manifest.resources.push({ path: name, bytes: data.length, sha256: hash(data) });
  addReferences(name, data);
}

manifest.resources.sort((a, b) => a.path.localeCompare(b.path));
manifest.missing.sort();
fs.writeFileSync(path.join(stagingDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
fs.writeFileSync(path.join(stagingDir, 'README.txt'), [
  'Unlimited Works compiled frontend',
  `Source: ${executablePath}`,
  `Source SHA-256: ${manifest.inputSha256}`,
  `Extracted resources: ${manifest.resources.length}`,
  `Unresolved local references: ${manifest.missing.length}`,
  '',
  'These are production build artifacts, not original source files. The app was built without source maps.',
  'Some runtime resources are not embedded in the executable. The static preview may show the app software agreement first.',
  'Serve this directory over HTTP to view index.html because its assets use root-relative URLs.',
].join('\n') + '\n', { flag: 'wx' });
fs.mkdirSync(path.dirname(outputDir), { recursive: true });
fs.renameSync(stagingDir, outputDir);

console.log(JSON.stringify({ outputDir, resources: manifest.resources.length, missing: manifest.missing.length, bytes: manifest.resources.reduce((sum, item) => sum + item.bytes, 0), unresolved: manifest.missing }, null, 2));
