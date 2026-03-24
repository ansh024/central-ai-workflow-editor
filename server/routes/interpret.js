import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildUserMessage } from '../config/prompts.js';

const router = express.Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

router.post('/', async (req, res) => {
  try {
    const { transcript, currentQuestion, conversationHistory, currentAnswers } = req.body;

    if (!transcript || !currentQuestion) {
      return res.status(400).json({ error: 'Missing transcript or currentQuestion' });
    }

    const userMessage = buildUserMessage(transcript, currentQuestion, currentAnswers);

    // Only include the last 4 messages for immediate context (current question's back-and-forth)
    // Avoid sending full history which confuses the model into referencing old questions
    const messages = [];
    if (conversationHistory && conversationHistory.length > 0) {
      const recent = conversationHistory.slice(-4);
      for (const msg of recent) {
        messages.push({
          role: msg.role === 'max' ? 'assistant' : 'user',
          content: msg.text,
        });
      }
    }
    messages.push({ role: 'user', content: userMessage });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    // Extract text content
    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to parse AI response', raw: text });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json(parsed);
  } catch (error) {
    console.error('Interpret error:', error.message);
    res.status(500).json({ error: 'AI interpretation failed', details: error.message });
  }
});

export default router;
