import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const frontendRoot = path.resolve(process.cwd(), 'reference/compiled-frontend');
const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ resource: string[] }> },
) {
  const { resource } = await params;
  const relativePath = resource[0] === 'reference' ? resource.slice(1) : resource;
  const filePath = path.resolve(frontendRoot, ...relativePath);
  const relativeFilePath = path.relative(frontendRoot, filePath);

  if (!relativeFilePath || relativeFilePath.startsWith('..') || path.isAbsolute(relativeFilePath)) {
    return new Response('Not found', { status: 404 });
  }

  try {
    if (!(await stat(filePath)).isFile()) return new Response('Not found', { status: 404 });
    const body = new Uint8Array(await readFile(filePath));
    const extension = path.extname(filePath).toLowerCase();

    return new Response(body, {
      headers: {
        'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=3600',
        'Content-Type': contentTypes[extension] ?? 'application/octet-stream',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
