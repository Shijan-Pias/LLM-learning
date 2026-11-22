import { chat } from './llm.js';

const SYSTEM = 'You are a friendly assistant. Keep answers short.';

const r1 = await chat({
  system: SYSTEM,
  messages: [{ role: 'user', content: 'My name is Pias.' }],
});
console.log('1:', r1.text);

// ইতিহাস ছাড়া
const r2 = await chat({
  system: SYSTEM,
  messages: [{ role: 'user', content: 'What is my name?' }],
});
console.log('2 (no history):', r2.text);

// ইতিহাস সহ
const r3 = await chat({
  system: SYSTEM,
  messages: [
    { role: 'user', content: 'My name is Pias.' },
    { role: 'assistant', content: r1.text },
    { role: 'user', content: 'What is my name?' },
  ],
});
console.log('3 (with history):', r3.text);