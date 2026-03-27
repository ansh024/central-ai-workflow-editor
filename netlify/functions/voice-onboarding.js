import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const STEP_PROMPTS = {
  1: `You are an onboarding assistant extracting business information from a user's spoken input.

Your ONLY job: extract the business name and industry from what the user says.

Valid industries: dental, legal, hvac, salon, medical, real_estate, auto, other

Fuzzy mapping rules:
- "dentist", "dental office", "dental clinic", "teeth" → "dental"
- "lawyer", "law firm", "attorney", "law office" → "legal"
- "plumber", "plumbing", "hvac", "heating", "cooling", "air conditioning", "electrician" → "hvac"
- "barber", "barbershop", "hair salon", "beauty salon", "nail salon", "spa" → "salon"
- "doctor", "physician", "clinic", "medical office", "healthcare", "therapy", "therapist", "chiropractic", "chiropractor" → "medical"
- "realtor", "real estate", "realty", "property", "broker" → "real_estate"
- "mechanic", "auto shop", "car repair", "body shop", "auto body", "garage" → "auto"
- Anything else → "other"

Return ONLY valid JSON:
{
  "understood": true/false,
  "actions": [
    { "key": "businessName", "value": "<extracted name or null>" },
    { "key": "industry", "value": "<mapped industry or null>" }
  ],
  "acknowledgment": "<short friendly 1-sentence response>",
  "filled": true/false
}

Set "filled": true when you have BOTH a business name AND an industry.`,

  2: `You are an onboarding assistant extracting business hours from a user's spoken input.

Return ONLY valid JSON:
{
  "understood": true/false,
  "actions": [{ "key": "schedule", "value": { "Monday": { "open": true, "start": "9:00 AM", "end": "5:00 PM" } } }],
  "acknowledgment": "<short friendly 1-sentence response>",
  "filled": true/false
}

Use 12-hour AM/PM format. Set "filled": true when you have at least some hours info.`,

  3: `You are an onboarding assistant extracting call reason intents from a user's spoken input.

Valid intents: "Book Appointment", "Cancel / Reschedule", "New Patient Info", "Insurance Question", "Billing Question", "Emergency / Pain", "Directions / Hours", "General Inquiry", "Pricing"

Return ONLY valid JSON:
{
  "understood": true/false,
  "actions": [{ "key": "intents", "value": ["Book Appointment"] }],
  "acknowledgment": "<short friendly 1-sentence response>",
  "filled": true/false
}

Set "filled": true when you have at least one intent.`,

  4: `You are an onboarding assistant extracting lead qualification questions.

Return ONLY valid JSON:
{
  "understood": true/false,
  "actions": [{ "key": "leadQuestions", "value": ["What is your name?"] }],
  "acknowledgment": "<short friendly 1-sentence response>",
  "filled": true/false
}`,

  5: `You are an onboarding assistant on the test call step. Always return:
{
  "understood": true,
  "actions": [],
  "acknowledgment": "<short friendly acknowledgment>",
  "filled": false
}`,

  6: `You are an onboarding assistant extracting CRM preference.

Return ONLY valid JSON:
{
  "understood": true/false,
  "actions": [{ "key": "crmChoice", "value": "none" }],
  "acknowledgment": "<short friendly 1-sentence response>",
  "filled": true/false
}`,

  7: `You are an onboarding assistant extracting Zapier integration preferences.

Return ONLY valid JSON:
{
  "understood": true/false,
  "actions": [{ "key": "integrations", "value": [] }],
  "acknowledgment": "<short friendly 1-sentence response>",
  "filled": true/false
}`,

  8: `You are an onboarding assistant extracting team preference ("own" or "central").

Return ONLY valid JSON:
{
  "understood": true/false,
  "actions": [{ "key": "teamChoice", "value": "own" }],
  "acknowledgment": "<short friendly 1-sentence response>",
  "filled": true/false
}`,
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { transcript, stepNumber, stepData } = JSON.parse(event.body || '{}');

    if (!transcript || !stepNumber) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing transcript or stepNumber' }) };
    }

    const systemPrompt = STEP_PROMPTS[stepNumber];
    if (!systemPrompt) {
      return { statusCode: 400, body: JSON.stringify({ error: `Invalid stepNumber: ${stepNumber}` }) };
    }

    let userMessage = `User said: "${transcript}"`;
    if (stepData && Object.keys(stepData).length > 0) {
      userMessage += `\n\nCurrent step data: ${JSON.stringify(stepData)}`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

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
    console.error('voice-onboarding error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'AI interpretation failed', details: err.message }) };
  }
};
