/**
 * Pexels API Client
 * Searches for stock video B-Roll footage by keyword.
 */

const PEXELS_BASE = 'https://api.pexels.com';

function getApiKey() {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    throw new Error('PEXELS_API_KEY environment variable is not defined');
  }
  return key;
}

/**
 * Search for videos on Pexels by keyword.
 * @param {string} query - Search keyword
 * @param {number} perPage - Results per page (default: 3)
 * @returns {Promise<Array<{url: string, thumbnailUrl: string, duration: number, photographer: string}>>}
 */
export async function searchVideos(query, perPage = 3) {
  const apiKey = getApiKey();

  try {
    const res = await fetch(
      `${PEXELS_BASE}/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait&size=medium`,
      {
        headers: { Authorization: apiKey },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      console.error(`[Pexels] API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();

    return (data.videos || []).map((video) => {
      // Find the best quality file (prefer HD, fallback to SD)
      const hdFile = video.video_files?.find((f) => f.quality === 'hd' && f.width <= 1920);
      const sdFile = video.video_files?.find((f) => f.quality === 'sd');
      const file = hdFile || sdFile || video.video_files?.[0];

      return {
        url: file?.link || '',
        thumbnailUrl: video.image || '',
        duration: video.duration || 0,
        photographer: video.user?.name || 'Unknown',
        width: file?.width || 0,
        height: file?.height || 0,
      };
    }).filter((v) => v.url);
  } catch (err) {
    console.error(`[Pexels] Search failed for "${query}":`, err.message);
    return [];
  }
}

export default { searchVideos };
