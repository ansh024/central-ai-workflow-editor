import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import interpretRouter from './routes/interpret.js';
import onboardingInterpretRouter from './routes/onboarding-interpret.js';
import ttsRouter from './routes/tts.js';

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

app.use('/api/voice/interpret', interpretRouter);
app.use('/api/voice/onboarding', onboardingInterpretRouter);
app.use('/api/voice/tts', ttsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Voice backend running on http://localhost:${PORT}`);
});
