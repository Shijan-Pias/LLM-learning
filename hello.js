import 'dotenv/config';

const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'openai/gpt-oss-120b',
    messages: [
      { role: 'system', content: 'You are a support assistant for a T-shirt store. Answer in under 80 words. If you do not know store policies, prices or stock, say you do not know. Never invent them.' },
      { role: 'user', content: 'Do you have free shipping?' },
    ],
    temperature: 0.7,
    max_completion_tokens: 150,
  }),
});

const data = await res.json();

if (!res.ok) {
  console.error('Error:', res.status, data);
  process.exit(1);
}

console.log(data.choices[0].message.content);
console.log('Usage:', data.usage);