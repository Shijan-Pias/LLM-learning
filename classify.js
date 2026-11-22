import { chat } from './llm.js';
import { ComplaintSchema } from './schemas.js';

const CLASSIFY_PROMPT = `
You classify customer messages for a T-shirt store.
Return ONLY a JSON object with exactly these keys:
- "category": one of "delivery", "return", "product", "payment", "other"
- "urgency": one of "low", "medium", "high"
- "summary": a short summary in English, max 25 words
- "needs_human": true or false

Rules:
- Use "high" urgency only if the customer reports lost money, a wrong or damaged item, or is very angry.
- If the message is not about the store, use category "other" and urgency "low".
- Do not write anything outside the JSON.
`;

function extractJson(text) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  return JSON.parse(cleaned);
}

function describeError(err) {
  if (err instanceof SyntaxError) return 'The text was not valid JSON.';
  if (err.issues) return err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  return 'Unknown validation error.';
}

export async function classifyMessage(message) {
  const messages = [{ role: 'user', content: message }];

  for (let attempt = 1; attempt <= 3; attempt++) {
    const { text } = await chat({
      system: CLASSIFY_PROMPT,
      messages,
      temperature: 0,
      maxTokens: 1000,
      responseFormat: { type: 'json_object' },
    });

    try {
      const data = ComplaintSchema.parse(extractJson(text));
      console.log(`classify ok (attempt ${attempt})`);
      return data;
    } catch (err) {
      const reason = describeError(err);
      console.log(`classify failed (attempt ${attempt}):`, reason);
      messages.push({ role: 'assistant', content: text });
      messages.push({
        role: 'user',
        content: `Your JSON was invalid: ${reason} Return only the corrected JSON.`,
      });
    }
  }

  throw new Error('Could not get valid JSON from the model');
}