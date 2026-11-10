export type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ChatCompletionRequest = {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ChatCompletionMessage[];
  temperature?: number;
};

export async function requestChatCompletion(
  input: ChatCompletionRequest,
  options: { signal?: AbortSignal } = {},
) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: options.signal,
  });
  const payload = (await response.json()) as { content?: string; error?: string };
  if (!response.ok) {
    throw new Error(payload.error || `API request failed with ${response.status}`);
  }
  if (!payload.content?.trim()) {
    throw new Error('API returned an empty response');
  }
  return payload.content.trim();
}

export type ImageGenerationRequest = {
  baseUrl: string;
  apiKey: string;
  model: string;
  prompt: string;
  size?: string;
};

export async function requestImageGeneration(
  input: ImageGenerationRequest,
  options: { signal?: AbortSignal } = {},
) {
  const response = await fetch('/api/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: options.signal,
  });
  const payload = (await response.json()) as { imageUrl?: string; error?: string };
  if (!response.ok) {
    throw new Error(payload.error || `Image request failed with ${response.status}`);
  }
  if (!payload.imageUrl) throw new Error('API returned no image');
  return payload.imageUrl;
}

export function normalizeChatEndpoint(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (/\/chat\/completions$/i.test(trimmed)) return trimmed;
  if (/\/v1$/i.test(trimmed)) return `${trimmed}/chat/completions`;
  return `${trimmed}/v1/chat/completions`;
}

export function normalizeImageEndpoint(baseUrl: string) {
  const trimmed = baseUrl.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (/\/images\/generations$/i.test(trimmed)) return trimmed;
  if (/\/v1$/i.test(trimmed)) return `${trimmed}/images/generations`;
  return `${trimmed}/v1/images/generations`;
}

