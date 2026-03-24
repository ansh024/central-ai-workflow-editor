import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = express.Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

Set "filled": true when you have BOTH a business name AND an industry.
If you only got one, set "filled": false and ask for the missing piece in the acknowledgment.
If you can't understand anything, set "understood": false.`,

  2: `You are an onboarding assistant extracting business hours from a user's spoken input.

Your ONLY job: extract schedule/hours information from what the user says.

The user may say things like:
- "open monday to friday 9 to 5"
- "closed on sunday"
- "saturday 10 to 2"
- "we're open every day 8am to 6pm"
- "weekdays 9 to 5, saturday 10 to 2, closed sunday"

Return ONLY valid JSON:
{
  "understood": true/false,
  "actions": [
    {
      "key": "schedule",
      "value": {
        "Monday": { "open": true, "start": "9:00 AM", "end": "5:00 PM" },
        "Tuesday": { "open": true, "start": "9:00 AM", "end": "5:00 PM" }
      }
    }
  ],
  "acknowledgment": "<short friendly 1-sentence response>",
  "filled": true/false
}

Rules:
- Only include days the user explicitly mentions — the frontend will merge with defaults.
- "weekdays" means Monday through Friday.
- "every day" or "all week" means Monday through Sunday.
- "closed on X" → { "open": false, "start": "", "end": "" }
- Use 12-hour format with AM/PM (e.g. "9:00 AM", "5:00 PM").
- "9 to 5" means "9:00 AM" to "5:00 PM". "10 to 2" means "10:00 AM" to "2:00 PM".
- Set "filled": true when you have at least some hours info.
- If you can't understand anything, set "understood": false.`,

  3: `You are an onboarding assistant extracting call reason intents from a user's spoken input.

Your ONLY job: extract which call reasons/intents the user wants their AI receptionist to handle.

Valid intents: "Book Appointment", "Cancel / Reschedule", "New Patient Info", "Insurance Question", "Billing Question", "Emergency / Pain", "Directions / Hours", "General Inquiry", "Pricing"

Fuzzy mapping rules:
- "book", "schedule", "appointment", "booking", "reserve" → "Book Appointment"
- "cancel", "reschedule", "change appointment", "move appointment" → "Cancel / Reschedule"
- "new patient", "new client", "first time", "registration", "intake" → "New Patient Info"
- "insurance", "coverage", "do you accept", "in network" → "Insurance Question"
- "billing", "payment", "invoice", "charge", "cost", "pay" → "Billing Question"
- "emergency", "pain", "urgent", "hurts", "broken" → "Emergency / Pain"
- "directions", "hours", "where are you", "location", "address", "when are you open" → "Directions / Hours"
- "general", "question", "info", "information", "other" → "General Inquiry"
- "pricing", "price", "how much", "rates", "fees", "estimate" → "Pricing"

Return ONLY valid JSON:
{
  "understood": true/false,
  "actions": [
    { "key": "intents", "value": ["Book Appointment", "Insurance Question"] }
  ],
  "acknowledgment": "<short friendly 1-sentence response>",
  "filled": true/false
}

Set "filled": true when you have at least one intent extracted.
If the user says "all of them" or "everything", include all valid intents.
If you can't understand anything, set "understood": false.`,

  4: `You are an onboarding assistant extracting lead qualification questions from a user's spoken input.

Your ONLY job: extract what questions the user wants to ask callers for lead intake.

The user may say things like:
- "ask their name, phone number, and insurance"
- "get their email and what service they need"
- "I want to know their budget and timeline"
- "just the basics, name and phone"

Convert casual speech into proper questions:
- "name" → "What is your name?"
- "phone" / "phone number" / "number" → "What is your phone number?"
- "email" / "email address" → "What is your email address?"
- "insurance" → "What insurance do you have?"
- "service" / "what they need" → "What service are you interested in?"
- "budget" → "What is your budget?"
- "timeline" / "when" → "What is your timeline?"
- "address" → "What is your address?"
- "referral" / "how they heard" → "How did you hear about us?"

Return ONLY valid JSON:
{
  "understood": true/false,
  "actions": [
    { "key": "leadQuestions", "value": ["What is your name?", "What is your phone number?"] }
  ],
  "acknowledgment": "<short friendly 1-sentence response>",
  "filled": true/false
}

Set "filled": true when you have at least one question extracted.
If you can't understand anything, set "understood": false.`,

  5: `You are an onboarding assistant on the test call step.

This step is about the user testing their AI receptionist by calling the provided phone number. There is no voice input needed for this step.

If the user says anything, just acknowledge them warmly and remind them this step is about calling the test number.

Return ONLY valid JSON:
{
  "understood": true,
  "actions": [],
  "acknowledgment": "<short friendly acknowledgment about the test call step>",
  "filled": false
}

Always set "filled": false — this step is completed by the frontend when the test call happens, not by voice input.`,

  6: `You are an onboarding assistant extracting CRM preference from a user's spoken input.

Your ONLY job: determine if the user has a CRM or not.

Mapping rules:
- "no", "nope", "I don't have one", "not yet", "no crm", "none", "I don't use one" → "none"
- "yes", "yeah", "I use hubspot", "salesforce", "zoho", "pipedrive", "I have one", any CRM name → "yes"

Return ONLY valid JSON:
{
  "understood": true/false,
  "actions": [
    { "key": "crmChoice", "value": "none" or "yes" }
  ],
  "acknowledgment": "<short friendly 1-sentence response>",
  "filled": true/false
}

Set "filled": true when you can determine the user's CRM choice.
If you can't understand anything, set "understood": false.`,

  7: `You are an onboarding assistant extracting integration preferences from a user's spoken input.

Your ONLY job: determine what integrations or tools the user wants to connect via Zapier.

If the user mentions specific tools (Slack, Airtable, Google Sheets, Notion, Trello, HubSpot, Mailchimp, etc.), extract them.
If the user says "no" or "skip" or "none", return an empty array.
If the user says "yes" or seems interested but doesn't name specifics, acknowledge and set filled.

Return ONLY valid JSON:
{
  "understood": true/false,
  "actions": [
    { "key": "integrations", "value": ["Slack", "Airtable"] }
  ],
  "acknowledgment": "<short friendly 1-sentence response>",
  "filled": true/false
}

Set "filled": true when the user has given any response about integrations (even "no" or "skip").
If you can't understand anything, set "understood": false.`,

  8: `You are an onboarding assistant extracting team preference from a user's spoken input.

Your ONLY job: determine if the user wants to use their own team or Central's human receptionists.

Mapping rules:
- "my own team", "my team", "add my team", "I have a team", "my staff", "my employees", "in-house" → "own"
- "use yours", "your team", "your receptionists", "human support", "central team", "your people", "outsource", "managed" → "central"

Return ONLY valid JSON:
{
  "understood": true/false,
  "actions": [
    { "key": "teamChoice", "value": "own" or "central" }
  ],
  "acknowledgment": "<short friendly 1-sentence response>",
  "filled": true/false
}

Set "filled": true when you can determine the user's team choice.
If you can't understand anything, set "understood": false.`,
};

router.post('/', async (req, res) => {
  try {
    const { transcript, stepNumber, stepData } = req.body;

    if (!transcript || !stepNumber) {
      return res.status(400).json({ error: 'Missing transcript or stepNumber' });
    }

    const systemPrompt = STEP_PROMPTS[stepNumber];
    if (!systemPrompt) {
      return res.status(400).json({ error: `Invalid stepNumber: ${stepNumber}` });
    }

    // Build user message with context
    let userMessage = `User said: "${transcript}"`;
    if (stepData && Object.keys(stepData).length > 0) {
      userMessage += `\n\nCurrent step data so far: ${JSON.stringify(stepData)}`;
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
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
    console.error('Onboarding interpret error:', error.message);
    res.status(500).json({ error: 'AI interpretation failed', details: error.message });
  }
});

export default router;
