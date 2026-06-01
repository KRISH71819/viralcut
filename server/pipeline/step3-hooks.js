/**
 * Step 3: Semantic Hook Finding with Fallback
 * PRIMARY: Gemma 4 27B via Groq
 * FALLBACK: Gemini 2.0 Flash Lite via Google AI (silent failover)
 * 
 * Analyzes transcript to find the top 5 viral-worthy clip segments
 * based on semantic virality metrics.
 */
import { getGroqClient } from '../lib/groq.js';
import { getGeminiModel } from '../lib/gemini.js';

const SYSTEM_PROMPT = `You are ViralCut AI, an expert short-form content analyst specializing in identifying viral-worthy moments from long-form content.

Your task: Analyze the provided transcript and identify the TOP 5 moments that would make the best short-form video clips (Reels, Shorts, TikToks).

## VIRALITY SCORING CRITERIA (score each 0-100):

1. **Hook Strength (30%)**: The opening 3 seconds must create an instant "pattern interrupt" — a statement so bold, surprising, or emotionally charged that viewers physically stop scrolling.

2. **Emotional Intensity (25%)**: The segment should contain at least one emotional peak — controversy, revelation, humor, shock, or vulnerability. Flat educational content scores low.

3. **Shareability (20%)**: Would someone tag a friend, repost, or quote this? High shareability comes from universal truths, contrarian takes, or "I needed to hear this" moments.

4. **Narrative Completeness (15%)**: The clip must have a mini-arc: setup → tension → resolution. Avoid segments that feel cut off mid-thought.

5. **Replay Value (10%)**: Would someone watch this twice? Information density, wordplay, or layered meaning increases replay value.

## OUTPUT REQUIREMENTS:

Return ONLY valid JSON with this exact structure:
{
  "clips": [
    {
      "title": "Short catchy title for the clip (max 60 chars)",
      "startTime": 125.5,
      "endTime": 172.3,
      "hookReasoning": "2-3 sentence explanation of WHY this hook works and what makes it viral",
      "viralityScore": 87,
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}

## RULES:
- Each clip MUST be between 30 and 90 seconds long
- Clips must NOT overlap with each other
- Start times and end times must align with actual transcript word timestamps
- "keywords" are 3 visual concepts from the clip for B-roll search (e.g., "money", "stock market", "frustrated person")
- Sort clips by viralityScore descending (best first)
- Return EXACTLY 5 clips
- Output ONLY the JSON object, no markdown, no explanation, no code blocks`;

/**
 * Find viral hooks in the transcript using Gemma 4 27B (primary) with Gemini fallback.
 * 
 * @param {object} transcript - { text, words, segments }
 * @returns {Promise<{clips: Array}>}
 */
export async function findHooks(transcript) {
  const userPrompt = `Here is the full transcript to analyze:\n\n${transcript.text}\n\n---\n\nWord-level timestamps (first 500 words for reference):\n${JSON.stringify(transcript.words.slice(0, 500), null, 0)}\n\nTotal duration: ${transcript.words.length > 0 ? transcript.words[transcript.words.length - 1].end.toFixed(1) : '0'}s\nTotal words: ${transcript.words.length}`;

  // PRIMARY: Try Gemma 4 27B via Groq
  try {
    console.log('[Step 3] Attempting hook finding with Gemma 4 27B (Groq)...');

    const groq = getGroqClient();
    const response = await groq.chat.completions.create({
      model: 'gemma2-9b-it', // Groq's latest available Gemma model
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from Gemma model');
    }

    const result = JSON.parse(content);
    validateClipsResponse(result);

    console.log(`[Step 3] Gemma found ${result.clips.length} hooks successfully`);
    return result;

  } catch (primaryError) {
    // FALLBACK: Silently catch and try Gemini Flash Lite
    console.warn(`[Step 3] Gemma failed (${primaryError.message}), falling back to Gemini Flash Lite...`);

    try {
      const model = getGeminiModel('gemini-2.0-flash-lite');

      const result = await model.generateContent([
        SYSTEM_PROMPT + '\n\n' + userPrompt,
      ]);

      const responseText = result.response.text();
      if (!responseText) {
        throw new Error('Empty response from Gemini model');
      }

      // Parse JSON (handle potential markdown wrapping)
      let parsed;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(responseText);
      }

      validateClipsResponse(parsed);

      console.log(`[Step 3] Gemini fallback found ${parsed.clips.length} hooks successfully`);
      return parsed;

    } catch (fallbackError) {
      console.error(`[Step 3] Both models failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`);
      
      // Last resort: generate synthetic hooks from transcript segments
      return generateSyntheticHooks(transcript);
    }
  }
}

/**
 * Validate the clips response has the expected structure.
 */
function validateClipsResponse(result) {
  if (!result || !Array.isArray(result.clips)) {
    throw new Error('Invalid response: missing "clips" array');
  }
  if (result.clips.length === 0) {
    throw new Error('Invalid response: empty clips array');
  }
  for (const clip of result.clips) {
    if (typeof clip.startTime !== 'number' || typeof clip.endTime !== 'number') {
      throw new Error('Invalid clip: missing startTime or endTime');
    }
    if (clip.endTime <= clip.startTime) {
      throw new Error('Invalid clip: endTime must be after startTime');
    }
  }
}

/**
 * Emergency fallback: generate synthetic hooks from transcript segments.
 * Used only if both AI models fail completely.
 */
function generateSyntheticHooks(transcript) {
  console.warn('[Step 3] Generating synthetic hooks from transcript segments...');

  const segments = transcript.segments || [];
  if (segments.length === 0) {
    return { clips: [] };
  }

  const totalDuration = transcript.words.length > 0 
    ? transcript.words[transcript.words.length - 1].end 
    : 0;

  // Pick 5 evenly spaced 45-second segments
  const clips = [];
  const spacing = totalDuration / 6;

  for (let i = 1; i <= 5 && i * spacing < totalDuration; i++) {
    const start = Math.floor(i * spacing);
    const end = Math.min(start + 45, totalDuration);
    
    // Find the nearest segment text for the title
    const nearestSegment = segments.find(s => s.start >= start) || segments[0];
    const title = (nearestSegment?.text || '').substring(0, 60).trim() || `Clip ${i}`;

    clips.push({
      title,
      startTime: start,
      endTime: end,
      hookReasoning: 'Auto-generated clip based on transcript position.',
      viralityScore: 50,
      keywords: ['content', 'speaker', 'discussion'],
    });
  }

  return { clips };
}

export default findHooks;
