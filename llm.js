import 'dotenv/config';

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

export class LLMError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'LLMError';
    this.status = status;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function chat({ system, messages, temperature = 0.3, maxTokens = 600,responseFormat }) {
  if (!process.env.GROQ_API_KEY) {
    throw new LLMError('GROQ_API_KEY is missing', 500);
  }

  const body = {
  model: MODEL,
  messages: [...(system ? [{ role: 'system', content: system }] : []), ...messages],
  temperature,
  max_completion_tokens: maxTokens,
  ...(responseFormat ? { response_format: responseFormat } : {}),
};

  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let res;
    try {
      res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      if (attempt === maxRetries) throw new LLMError('Network error', 502);
      await sleep(1000 * 2 ** attempt);
      continue;
    }

    if (res.ok) {
      const data = await res.json();
      return {
        text: data.choices?.[0]?.message?.content ?? '',
        usage: data.usage,
      };
    }

    const retryable = res.status === 429 || res.status >= 500;
    if (retryable && attempt < maxRetries) {
      const retryAfter = Number(res.headers.get('retry-after'));
      const waitMs = retryAfter > 0 ? retryAfter * 1000 : 1000 * 2 ** attempt;
      await sleep(waitMs);
      continue;
    }

    const errBody = await res.json().catch(() => ({}));
    throw new LLMError(errBody?.error?.message || `LLM request failed (${res.status})`, res.status);
  }
}