// ElevenLabs voice IDs per language
const VOICES = {
  nl: "pNInz6obpgDQGcFmaJgB", // Adam - deep male, works well for Dutch
  en: "21m00Tcm4TlvDq8ikWAM", // Rachel - clear female English
  fi: "EXAVITQu4vr4xnSDxMaL", // Bella - works for Finnish
};

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, language = "nl" } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    // Trim text to reasonable length for TTS
    const trimmedText = text.slice(0, 1000);
    const voiceId = VOICES[language] || VOICES.nl;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: trimmedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs error:", response.status, errorText);
      return res
        .status(response.status)
        .json({ error: "TTS generation failed" });
    }

    // Stream the audio response
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-cache");

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (error) {
    console.error("TTS API error:", error.message);
    return res.status(500).json({ error: "TTS service error" });
  }
};
