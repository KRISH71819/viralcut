/**
 * Step 2: Audio Transcription
 * Sends audio to Groq Whisper API (whisper-large-v3) with word-level timestamps.
 * Handles chunked audio by merging transcripts with timestamp offset adjustment.
 */
import fs from 'fs';
import { getGroqClient } from '../lib/groq.js';

/**
 * Transcribe audio chunks and merge into a unified transcript.
 * 
 * @param {Array<{path: string, startOffset: number, duration: number}>} audioChunks
 * @returns {Promise<{text: string, words: Array, segments: Array}>}
 */
export async function transcribeAudio(audioChunks) {
  const groq = getGroqClient();
  const allWords = [];
  const allSegments = [];
  let fullText = '';

  console.log(`[Step 2] Transcribing ${audioChunks.length} chunk(s) with Groq Whisper...`);

  for (let i = 0; i < audioChunks.length; i++) {
    const chunk = audioChunks[i];
    console.log(`[Step 2] Processing chunk ${i + 1}/${audioChunks.length} (offset: ${chunk.startOffset.toFixed(1)}s)`);

    // Read audio file as a readable stream for the API
    const audioStream = fs.createReadStream(chunk.path);

    const response = await groq.audio.transcriptions.create({
      file: audioStream,
      model: 'whisper-large-v3',
      response_format: 'verbose_json',
      timestamp_granularities: ['word', 'segment'],
      language: 'en',
    });

    // Extract words with offset adjustment
    const words = (response.words || []).map((w) => ({
      word: w.word,
      start: Math.round((w.start + chunk.startOffset) * 100) / 100,
      end: Math.round((w.end + chunk.startOffset) * 100) / 100,
    }));

    // Extract segments with offset adjustment
    const segments = (response.segments || []).map((s) => ({
      id: s.id,
      text: s.text,
      start: Math.round((s.start + chunk.startOffset) * 100) / 100,
      end: Math.round((s.end + chunk.startOffset) * 100) / 100,
      words: (s.words || []).map((w) => ({
        word: w.word,
        start: Math.round((w.start + chunk.startOffset) * 100) / 100,
        end: Math.round((w.end + chunk.startOffset) * 100) / 100,
      })),
    }));

    // For multi-chunk: deduplicate overlap zone words
    if (i > 0 && allWords.length > 0) {
      const lastExistingTime = allWords[allWords.length - 1]?.end || 0;
      // Only add words that start after the last word we already have
      const newWords = words.filter((w) => w.start > lastExistingTime - 0.1);
      allWords.push(...newWords);

      const lastSegmentTime = allSegments[allSegments.length - 1]?.end || 0;
      const newSegments = segments.filter((s) => s.start > lastSegmentTime - 0.1);
      allSegments.push(...newSegments);
    } else {
      allWords.push(...words);
      allSegments.push(...segments);
    }

    fullText += (fullText ? ' ' : '') + (response.text || '').trim();
  }

  console.log(`[Step 2] Transcription complete: ${allWords.length} words, ${allSegments.length} segments`);

  return {
    text: fullText,
    words: allWords,
    segments: allSegments,
  };
}

export default transcribeAudio;
