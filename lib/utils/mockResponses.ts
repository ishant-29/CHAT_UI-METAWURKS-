const responses = [
  "That's a fascinating question. Let me think through it carefully...",
  "Based on my analysis, here's what I'd suggest:",
  "Great point! Here are three things to consider:",
  "I understand what you're asking. The key insight here is:",
  "Interesting! From a workflow perspective, this breaks down into:",
];

export function getMockResponse(userMessage: string): string {
  const random = responses[Math.floor(Math.random() * responses.length)];
  return `${random}\n\nYou said: "${userMessage}" — and I'm processing that with full context.`;
}
