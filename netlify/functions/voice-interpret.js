import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildUserMessage } from '../../server/config/prompts.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Retry up to 3 times on Anthropic 529 overloaded errors
async function withRetry(fn, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isOverloaded = err.status === 529 || err.error?.type === 'overloaded_error';
      if (isOverloaded && attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, (attempt + 1) * 1000));
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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
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
