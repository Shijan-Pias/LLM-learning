export function trimHistory(messages, maxMessages = 4) {
  if (messages.length <= maxMessages) return messages;

  let trimmed = messages.slice(-maxMessages);

  // ছাঁটা অংশ যেন 'user' বার্তা দিয়ে শুরু হয়
  while (trimmed.length > 0 && trimmed[0].role !== 'user') {
    trimmed = trimmed.slice(1);
  }
  return trimmed;
}