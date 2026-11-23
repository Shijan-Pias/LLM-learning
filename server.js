import 'dotenv/config';
import express from 'express';
import { chat, LLMError } from './llm.js';
import { STORE_SYSTEM_PROMPT,FEW_SHOT } from './prompts.js';
import { classifyMessage } from './classify.js';
import { randomUUID } from 'node:crypto';
import { connectDB } from './db.js';
import { getHistory, appendMessages } from './conversations.js';
import { trimHistory } from './history.js';

const app = express();
app.use(express.json({ limit: '10kb' }));



app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.post('/chat', async (req, res, next) => {
  try {
    const { message, sessionId: incomingId } = req.body ?? {};

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required (non-empty text)' });
    }
    if (message.length > 1000) {
      return res.status(400).json({ error: 'message is too long (max 1000 characters)' });
    }

    const isValidId =
      typeof incomingId === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(incomingId);
    const sessionId = isValidId ? incomingId : randomUUID();

    const history = await getHistory(sessionId);
    const userMsg = { role: 'user', content: message.trim() };

    const { text, usage } = await chat({
      system: STORE_SYSTEM_PROMPT,
      messages: [...FEW_SHOT, ...trimHistory(history, 12), userMsg],
    });

    if (!text.trim()) {
      return res.status(502).json({ error: 'Empty reply from AI, please try again' });
    }

    await appendMessages(sessionId, [userMsg, { role: 'assistant', content: text }]);

    res.json({ reply: text, sessionId, usage });
  } catch (err) {
    next(err);
  }
});

app.post('/classify', async (req, res, next) => {
  try {
    const { message } = req.body ?? {};

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'message is required (non-empty text)' });
    }
    if (message.length > 1000) {
      return res.status(400).json({ error: 'message is too long (max 1000 characters)' });
    }

    const result = await classifyMessage(message.trim());
    res.json(result);
  } catch (err) {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  console.error('Error:', err.name, err.status, err.message);
  if (err instanceof LLMError) {
    const status = err.status === 429 ? 429 : 502;
    return res.status(status).json({
      error: status === 429 ? 'Too many requests, please try again shortly' : 'AI service error',
    });
  }
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
await connectDB();
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));