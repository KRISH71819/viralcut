/**
 * Step 5: Remotion Rendering Blueprint
 * Structures the final payload per clip so it can be fed directly into
 * a Remotion compilation. Also saves clips as Clip documents in MongoDB.
 */
import { connectDB } from '../lib/mongodb.js';
import Clip from '../models/Clip.js';

/**
 * Build Remotion-ready blueprints and persist clips to the database.
 * 
 * @param {object} params
 * @param {string} params.jobId - The VideoJob document ID
 * @param {string} params.userId - The User document ID
 * @param {string} params.sourceVideoPath - Local path to the downloaded source video
 * @param {string} params.sourceUrl - Original video URL
 * @param {Array} params.clips - Enriched clips from Step 4 (with broll)
 * @param {object} params.transcript - Full transcript { text, words, segments }
 * @returns {Promise<Array>} Array of saved Clip documents
 */
export async function buildBlueprints(params) {
  const { jobId, userId, sourceVideoPath, sourceUrl, clips, transcript } = params;

  await connectDB();

  console.log(`[Step 5] Building Remotion blueprints for ${clips.length} clips...`);

  const savedClips = [];

  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];

    // Extract caption words for this clip's time range
    const clipCaptions = (transcript.words || [])
      .filter((w) => w.start >= clip.startTime && w.end <= clip.endTime)
      .map((w) => ({
        word: w.word,
        start: Math.round((w.start - clip.startTime) * 100) / 100, // Relative to clip start
        end: Math.round((w.end - clip.startTime) * 100) / 100,
      }));

    // Build the Remotion blueprint payload
    const remotionBlueprint = {
      // Source
      sourceVideoUrl: sourceUrl,
      sourceVideoPath: sourceVideoPath,

      // Clip boundaries (absolute timestamps)
      clip: {
        start: clip.startTime,
        end: clip.endTime,
        duration: Math.round((clip.endTime - clip.startTime) * 100) / 100,
      },

      // Word-level captions (relative to clip start)
      captions: clipCaptions,

      // B-Roll overlays (relative to clip start)
      broll: (clip.broll || []).map((br) => ({
        url: br.videoUrl,
        thumbnailUrl: br.thumbnailUrl,
        insertAt: Math.round((br.startTime - clip.startTime) * 100) / 100,
        duration: br.duration,
        keyword: br.keyword,
        photographer: br.photographer,
      })),

      // Scoring & metadata
      viralityScore: clip.viralityScore || 0,
      hookReasoning: clip.hookReasoning || '',
      title: clip.title || `Clip ${i + 1}`,

      // Rendering config (defaults, customizable in the editor later)
      renderConfig: {
        fps: 30,
        width: 1080,
        height: 1920,   // 9:16 aspect ratio
        codec: 'h264',
        captionStyle: 'hormozi-bold', // Default caption style
        captionPosition: 'bottom',    // bottom-center
        captionFontSize: 48,
        captionColor: '#FFFFFF',
        captionStroke: '#000000',
        captionStrokeWidth: 4,
      },
    };

    // Persist to MongoDB
    const clipDoc = await Clip.create({
      jobId,
      userId,
      clipIndex: i + 1,
      title: clip.title || `Clip ${i + 1}`,
      startTime: clip.startTime,
      endTime: clip.endTime,
      captions: clipCaptions,
      broll: clip.broll || [],
      viralityScore: clip.viralityScore || 0,
      hookReasoning: clip.hookReasoning || '',
      remotionBlueprint,
      status: 'pending',
    });

    savedClips.push(clipDoc);
    console.log(`[Step 5] Clip ${i + 1}/${clips.length} saved: "${clip.title}" (score: ${clip.viralityScore})`);
  }

  console.log(`[Step 5] Blueprint complete: ${savedClips.length} clips ready for Remotion`);
  return savedClips;
}

export default buildBlueprints;
