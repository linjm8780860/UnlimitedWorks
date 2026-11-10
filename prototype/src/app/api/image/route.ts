import { NextResponse } from 'next/server';
import { normalizeImageEndpoint } from '@/lib/api';

type RequestBody = {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  prompt?: string;
  size?: string;
};

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const endpoint = normalizeImageEndpoint(body.baseUrl ?? '');
  const apiKey = body.apiKey?.trim();
  const model = body.model?.trim();
  const prompt = body.prompt?.trim();
  if (!endpoint || !apiKey || !model || !prompt) {
    return NextResponse.json(
      { error: 'baseUrl, apiKey, model and prompt are required' },
      { status: 400 },
    );
  }
  try {
    const parsed = new URL(endpoint);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported protocol');
  } catch {
    return NextResponse.json({ error: 'baseUrl must be a valid HTTP(S) URL' }, { status: 400 });
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000);
  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        size: body.size || '1024x1024',
        n: 1,
        response_format: 'b64_json',
      }),
      signal: controller.signal,
      cache: 'no-store',
    });
    const payload = (await upstream.json()) as {
      data?: Array<{ b64_json?: string; url?: string }>;
      error?: { message?: string } | string;
    };
    if (!upstream.ok) {
      const message =
        typeof payload.error === 'string'
          ? payload.error
          : payload.error?.message || `Upstream returned ${upstream.status}`;
      return NextResponse.json({ error: message }, { status: upstream.status });
    }
    const item = payload.data?.[0];
    let imageUrl = item?.b64_json ? `data:image/png;base64,${item.b64_json}` : item?.url;
    if (!item?.b64_json && item?.url) {
      const imageResponse = await fetch(item.url, { cache: 'no-store' });
      if (imageResponse.ok) {
        const bytes = Buffer.from(await imageResponse.arrayBuffer());
        const mimeType = imageResponse.headers.get('content-type') || 'image/png';
        imageUrl = `data:${mimeType};base64,${bytes.toString('base64')}`;
      }
    }
    if (!imageUrl) {
      return NextResponse.json({ error: 'Upstream returned no image' }, { status: 502 });
    }
    return NextResponse.json({ imageUrl });
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'Image request timed out'
        : error instanceof Error
          ? error.message
          : 'Image request failed';
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

