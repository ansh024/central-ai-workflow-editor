import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildUserMessage } from '../../server/config/prompts.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Retry up to 4 times on Anthropic 529 overloaded errors (1s, 2s, 4s backoff)
async function withRetry(fn, maxRetries = 4) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isOverloaded = err.status === 529 || err.error?.type === 'overloaded_error';
      if (isOverloaded && attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000)); // 1s, 2s, 4s
        continue;
      }
      throw err;
    }
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { transcript, currentQuestion, conversationHistory, currentAnswers } = JSON.parse(event.body || '{}');

    if (!transcript || !currentQuestion) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing transcript or currentQuestion' }) };
    }

    const userMessage = buildUserMessage(transcript, currentQuestion, currentAnswers);

    const messages = [];
    if (conversationHistory?.length > 0) {
      for (const msg of conversationHistory.slice(-4)) {
        messages.push({
          role: msg.role === 'max' ? 'assistant' : 'user',
          content: msg.text,
        });
      }
    }
    messages.push({ role: 'user', content: userMessage });

    const response = await withRetry(() => anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages,
    }));

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to parse AI response', raw: text }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: jsonMatch[0],
    };
  } catch (err) {
    console.error('voice-interpret error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'AI interpretation failed', details: err.message }) };
  }
};
