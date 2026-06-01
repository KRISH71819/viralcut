/**
 * Step 4: B-Roll Extraction
 * Parses keywords from hooks and queries Pexels for matching stock video footage.
 * Maps B-roll videos to contextually relevant timestamps within each clip.
 */
import { searchVideos } from '../lib/pexels.js';

/**
 * Enrich clip hooks with B-roll video overlays from Pexels.
 * 
 * @param {Array} clips - Array of clip objects from Step 3
 * @returns {Promise<Array>} Clips enriched with broll field
 */
export async function extractBRoll(clips) {
  console.log(`[Step 4] Searching B-Roll for ${clips.length} clips...`);

  const enrichedClips = [];

  for (const clip of clips) {
    const keywords = clip.keywords || [];
    const clipDuration = clip.endTime - clip.startTime;
    const broll = [];

    // Search for each keyword
    for (let k = 0; k < keywords.length && k < 3; k++) {
      const keyword = keywords[k];

      try {
        const videos = await searchVideos(keyword, 2);

        if (videos.length > 0) {
          const video = videos[0]; // Take the best match

          // Calculate insertion point: distribute B-roll evenly across the clip
          // First B-roll at ~25% of clip, second at ~50%, third at ~75%
          const insertionFraction = (k + 1) / (Math.min(keywords.length, 3) + 1);
          const insertAt = clip.startTime + (clipDuration * insertionFraction);

          // B-roll duration: 2-4 seconds, capped to not exceed clip bounds
          const brollDuration = Math.min(
            Math.max(2, video.duration || 3),
            4,
            clip.endTime - insertAt
          );

          broll.push({
            keyword,
            videoUrl: video.url,
            thumbnailUrl: video.thumbnailUrl,
            startTime: Math.round(insertAt * 100) / 100,
            duration: Math.round(brollDuration * 100) / 100,
            photographer: video.photographer,
          });

          console.log(`[Step 4] Found B-Roll for "${keyword}": ${video.url.substring(0, 60)}...`);
        } else {
          console.log(`[Step 4] No B-Roll found for "${keyword}", skipping.`);
        }
      } catch (err) {
        console.warn(`[Step 4] Pexels search failed for "${keyword}": ${err.message}`);
        // Continue without this B-roll — never crash the pipeline
      }

      // Small delay between Pexels requests to avoid rate limiting
      await new Promise((r) => setTimeout(r, 200));
    }

    enrichedClips.push({
      ...clip,
      broll,
    });
  }

  const totalBroll = enrichedClips.reduce((sum, c) => sum + c.broll.length, 0);
  console.log(`[Step 4] B-Roll complete: ${totalBroll} videos mapped across ${enrichedClips.length} clips`);

  return enrichedClips;
}

export default extractBRoll;
