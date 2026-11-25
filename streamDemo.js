import 'dotenv/config';

const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    messages: [{ role: 'user', content: 'Give me 5 short tips for learning programming.' }],
    stream: true,
  }),
});

if (!res.ok) {
  console.error(res.status, await res.text());
  process.exit(1);
}

const decoder = new TextDecoder();
let buffer = '';

for await (const chunk of res.body) {
  buffer += decoder.decode(chunk, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.startsWith('data:')) continue;
    const payload = line.slice(5).trim();
    if (payload === '[DONE]') {
      console.log('\n[done]');
      continue;
    }
    console.log('RAW:', line);
    const json = JSON.parse(payload);
    const piece = json.choices?.[0]?.delta?.content;
    if (piece) process.stdout.write(piece);
  }
}