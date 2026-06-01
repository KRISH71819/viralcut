/**
 * Groq API Client
 * Used for Whisper transcription and Gemma 4 27B hook finding.
 */
import Groq from 'groq-sdk';

let groqClient = null;

export function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is not defined');
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

export default getGroqClient;
