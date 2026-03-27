export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { text } = JSON.parse(event.body || '{}');
    if (!text) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing text' }) };
    }

    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'ElevenLabs API key not configured' }) };
    }

    // Try ElevenLabs
    const elevenRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
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
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    );

    if (elevenRes.ok) {
      const arrayBuffer = await elevenRes.arrayBuffer();
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'audio/mpeg' },
        body: Buffer.from(arrayBuffer).toString('base64'),
        isBase64Encoded: true,
      };
    }

    const elevenErr = await elevenRes.text();
    console.error('ElevenLabs error:', elevenRes.status, elevenErr);

    // Fallback: OpenAI TTS
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      const openaiRes = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: 'tts-1', voice: 'nova', input: text }),
      });

      if (openaiRes.ok) {
        const arrayBuffer = await openaiRes.arrayBuffer();
        return {
          statusCode: 200,
          headers: { 'Content-Type': 'audio/mpeg' },
          body: Buffer.from(arrayBuffer).toString('base64'),
          isBase64Encoded: true,
        };
      }
      console.error('OpenAI TTS error:', openaiRes.status, await openaiRes.text());
    }

    return { statusCode: 500, body: JSON.stringify({ error: 'TTS failed: all providers failed' }) };
  } catch (err) {
    console.error('voice-tts error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'TTS failed', details: err.message }) };
  }
};
