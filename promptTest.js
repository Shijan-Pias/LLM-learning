import { chat } from './llm.js';
import { STORE_SYSTEM_PROMPT, FEW_SHOT } from './prompts.js';
import { QUESTIONS } from './testQuestions.js';

for (const q of QUESTIONS) {
  try {
    const { text } = await chat({
      system: STORE_SYSTEM_PROMPT,
      messages: [...FEW_SHOT, { role: 'user', content: q }],
    });
    console.log('\nQ:', q);
    console.log('A:', text);
  } catch (err) {
    console.log('\nQ:', q);
    console.log('ERROR:', err.message);
  }
}