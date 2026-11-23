import { Conversation } from './models/Conversation.js';

export async function getHistory(sessionId) {
  const convo = await Conversation.findOne({ sessionId }).lean();
  return convo ? convo.messages.map(({ role, content }) => ({ role, content })) : [];
}

export async function appendMessages(sessionId, newMessages) {
  await Conversation.updateOne(
    { sessionId },
    { $push: { messages: { $each: newMessages } } },
    { upsert: true }
  );
}