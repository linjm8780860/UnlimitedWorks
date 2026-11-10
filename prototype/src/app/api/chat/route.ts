import { NextResponse } from 'next/server';
import { normalizeChatEndpoint, type ChatCompletionMessage } from '@/lib/api';

type RequestBody = {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
  messages?: ChatCompletionMessage[];
  temperature?: number;
};

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const endpoint = normalizeChatEndpoint(body.baseUrl ?? '');
  const apiKey = body.apiKey?.trim();
  const model = body.model?.trim();
  const messages = body.messages;

  if (!endpoint || !apiKey || !model || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: 'baseUrl, apiKey, model and messages are required' },
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
  const timeout = setTimeout(() => controller.abort(), 90_000);
  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: body.temperature ?? 0.7,
        stream: false,
      }),
      signal: controller.signal,
      cache: 'no-store',
    });
    const payload = (await upstream.json()) as {
      choices?: Array<{
        message?: { content?: string | Array<{ type?: string; text?: string }> };
      }>;
      error?: { message?: string } | string;
    };
    if (!upstream.ok) {
      const message =
        typeof payload.error === 'string'
          ? payload.error
          : payload.error?.message || `Upstream returned ${upstream.status}`;
      return NextResponse.json({ error: message }, { status: upstream.status });
    }
    const content = payload.choices?.[0]?.message?.content;
    const text = Array.isArray(content)
      ? content.map((part) => part.text ?? '').join('')
      : (content ?? '');
    return NextResponse.json({ content: text });
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'API request timed out'
        : error instanceof Error
          ? error.message
          : 'API request failed';
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

