import { trimHistory } from './history.js';

const fake = [];
for (let i = 1; i <= 10; i++) {
  fake.push({ role: 'user', content: `q${i}` });
  fake.push({ role: 'assistant', content: `a${i}` });
}

const result = trimHistory(fake, 5);
console.log('length:', result.length);
console.log(result);