// AETHER-ASSIST TTS — ElevenLabs Text-to-Speech (Pro Tier)
// Streams high-quality audio from ElevenLabs Eleven v3 / Multilingual v2
// Output: MP3 44.1kHz 192kbps (highest quality)

// ─── Rate Limiting (in-memory, per-instance) ───
const ttsRateLimitMap = new Map();
const TTS_RATE_LIMIT_WINDOW = 60 * 1000;
const TTS_RATE_LIMIT_MAX = 8;

function checkTtsRateLimit(ip) {
  const now = Date.now();
  const record = ttsRateLimitMap.get(ip);
  if (!record || now - record.start > TTS_RATE_LIMIT_WINDOW) {
    ttsRateLimitMap.set(ip, { start: now, count: 1 });
    return true;
  }
  if (record.count >= TTS_RATE_LIMIT_MAX) return false;
  record.count++;
  return true;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowed = ['https://aetherlink.ai', 'https://www.aetherlink.ai', 'https://aetherlink-website.vercel.app'];
  res.setHeader('Access-Control-Allow-Origin', allowed.includes(origin) ? origin : allowed[0]);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  if (!checkTtsRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many TTS requests. Please try again in a minute.' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'TTS not configured' });

  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text required' });
    }

    // Strip markdown for cleaner speech
    const cleanText = text
      .replace(/\*\*(.+?)\*\*/g, '$1')       // bold
      .replace(/\*(.+?)\*/g, '$1')            // italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → text only
      .replace(/`([^`]+)`/g, '$1')            // inline code
      .replace(/^[-*] /gm, '')                // list markers
      .replace(/#{1,6}\s*/g, '')              // heading markers
      .replace(/\n{2,}/g, '. ')               // paragraph breaks → pause
      .replace(/\s{2,}/g, ' ')               // collapse whitespace
      .trim();

    if (!cleanText) {
      return res.status(400).json({ error: 'No speakable text' });
    }

    // Limit text to ~800 chars (increased from 500 for better context)
    const trimmed = cleanText.length > 800
      ? cleanText.slice(0, 797) + '...'
      : cleanText;

    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'ErXwobaYiN019PkySvjV';

    // Use highest quality model: eleven_v3 (most expressive, 70+ languages)
    // Fallback: eleven_multilingual_v2 if v3 fails
    const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_v3';

    // Output format: MP3 44.1kHz 192kbps (highest MP3 quality, requires Creator+ tier)
    const outputFormat = 'mp3_44100_192';

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=${outputFormat}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: trimmed,
          model_id: modelId,
          voice_settings: {
            stability: 0.45,
            similarity_boost: 0.82,
            style: 0.4,
            use_speaker_boost: true,
          },
        }),
      }
    );

    // If v3 fails (e.g. plan doesn't support it), fallback to multilingual v2
    if (!response.ok && modelId === 'eleven_v3') {
      console.warn('Eleven v3 failed, falling back to multilingual v2');
      const fallbackResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=${outputFormat}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text: trimmed,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.45,
              similarity_boost: 0.82,
              style: 0.4,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!fallbackResponse.ok) {
        const errorText = await fallbackResponse.text();
        console.error('ElevenLabs fallback error:', fallbackResponse.status, errorText);
        return res.status(502).json({ error: 'TTS service unavailable' });
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Transfer-Encoding', 'chunked');

      const reader = fallbackResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
      return res.end();
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs error:', response.status, errorText);
      return res.status(502).json({ error: 'TTS service unavailable' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Transfer-Encoding', 'chunked');

    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(Buffer.from(value));
    }

    res.end();
  } catch (error) {
    console.error('TTS error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.end();
    }
  }
}
