import { NextResponse } from 'next/server';

export const maxDuration = 30; // Allow streaming responses up to 30 seconds

export async function POST(req: Request) {
  const { text, voiceName } = await req.json();

  if (!process.env.GOOGLE_TTS_API_KEY) {
    return NextResponse.json({ error: 'Google TTS API Key not configured.' }, { status: 500 });
  }

  const GOOGLE_TTS_ENDPOINT = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`;

  try {
    const response = await fetch(GOOGLE_TTS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioConfig: {
          audioEncoding: 'MP3', // Changed to MP3 for broader browser compatibility
          effectsProfileId: [
            'small-bluetooth-speaker-class-device'
          ],
          pitch: 0,
          speakingRate: 1
        },
        input: {
          text: text,
        },
        voice: {
          languageCode: 'en-GB',
          name: voiceName, // Use the requested voice name
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google TTS API error:', errorData);
      return NextResponse.json({ error: 'Failed to synthesize speech', details: errorData }, { status: response.status });
    }

    const data = await response.json();
    // The audioContent is base64 encoded
    return NextResponse.json({ audioContent: data.audioContent });

  } catch (error) {
    console.error('Error synthesizing speech:', error);
    return NextResponse.json({ error: 'Internal server error during speech synthesis.' }, { status: 500 });
  }
}
