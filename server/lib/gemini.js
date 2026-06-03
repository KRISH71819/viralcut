/**
 * Google Generative AI Client
 * Used as fallback for hook finding when Gemma 4 27B fails.
 * Model: Gemini 2.0 Flash Lite (or latest available Flash Lite)
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

let geminiClient = null;

export function getGeminiClient() {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined');
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

/**
 * Get a generative model instance.
 * @param {string} modelName - Model ID (default: gemini-2.0-flash-lite)
 * @returns {import('@google/generative-ai').GenerativeModel}
 */
export function getGeminiModel(modelName = 'gemini-3.1-flash-lite') {
  const client = getGeminiClient();
  return client.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  });
}

export default getGeminiClient;
