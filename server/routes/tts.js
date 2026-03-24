import express from 'express';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text' });
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (response.ok) {
      // Stream ElevenLabs audio back to client
      res.set({
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      });

      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
      return;
    }

    // ElevenLabs failed — try OpenAI TTS as fallback
    const elevenLabsError = await response.text();
    console.error('ElevenLabs error:', response.status, elevenLabsError);
    console.log('Falling back to OpenAI TTS...');

    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            voice: 'nova',
            input: text,
          }),
        });

        if (openaiResponse.ok) {
          res.set({
            'Content-Type': 'audio/mpeg',
            'Transfer-Encoding': 'chunked',
          });

          const reader = openaiResponse.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
          res.end();
          return;
        }

        const openaiError = await openaiResponse.text();
        console.error('OpenAI TTS error:', openaiResponse.status, openaiError);
      } catch (openaiErr) {
        console.error('OpenAI TTS fetch error:', openaiErr.message);
      }
    } else {
      console.warn('OPENAI_API_KEY not set, skipping OpenAI TTS fallback');
    }

    // Both ElevenLabs and OpenAI failed
    return res.status(500).json({ error: 'TTS failed', details: 'Both ElevenLabs and OpenAI TTS failed' });
  } catch (error) {
    console.error('TTS error:', error.message);
    res.status(500).json({ error: 'TTS failed', details: error.message });
  }
});

export default router;
