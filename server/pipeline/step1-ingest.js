/**
 * Step 1: Video Ingestion
 * Downloads video via yt-dlp and extracts compressed audio.
 * Handles the critical 25MB Groq Whisper limit via aggressive compression + chunking.
 */
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { extractAudio, splitAudioIntoChunks, getDuration } from '../lib/ffmpeg.js';

import os from 'os';

// Dynamically patch process.env.PATH on Windows to ensure local Python, Winget links, and FFmpeg binaries can be found
if (process.platform === 'win32') {
  const userHome = os.homedir();
  const pathsToAdd = [
    path.join(userHome, 'AppData', 'Local', 'Microsoft', 'WinGet', 'Links'),
    path.join(userHome, 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages', 'Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe', 'ffmpeg-8.1.1-full_build', 'bin'),
    path.join(userHome, 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages', 'yt-dlp.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe', 'ffmpeg-N-124279-g0f6ba39122-win64-gpl', 'bin'),
    path.join(userHome, 'AppData', 'Local', 'Microsoft', 'WinGet', 'Packages', 'yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe'),
    path.join(userHome, 'AppData', 'Roaming', 'Python', 'Python313', 'Scripts'),
    path.join(userHome, 'AppData', 'Roaming', 'Python', 'Python312', 'Scripts'),
    path.join(userHome, 'AppData', 'Local', 'Programs', 'Python', 'Python313', 'Scripts'),
    path.join(userHome, 'AppData', 'Local', 'Programs', 'Python', 'Python312', 'Scripts'),
  ];
  const currentPath = process.env.PATH || '';
  const newPaths = pathsToAdd.filter((p) => !currentPath.toLowerCase().includes(p.toLowerCase()));
  if (newPaths.length > 0) {
    process.env.PATH = `${newPaths.join(';')};${currentPath}`;
  }
}

const exec = promisify(execFile);

/**
 * Download a video from a URL using yt-dlp and extract its audio.
 * 
 * @param {string} videoUrl - YouTube or other video URL
 * @param {string} jobDir - Absolute path to the job's temp directory
 * @returns {Promise<{videoPath: string, audioChunks: Array, metadata: object}>}
 */
export async function ingestVideo(videoUrl, jobDir) {
  // Ensure job directory exists
  await fs.mkdir(jobDir, { recursive: true });

  const videoPath = path.join(jobDir, 'source.mp4');

  if (videoUrl.startsWith('local://')) {
    console.log(`[Step 1] Local file upload detected. Skipping download.`);
    // Verify file exists
    try {
      await fs.access(videoPath);
    } catch {
      throw new Error('Local video file not found in job directory');
    }
  } else {
    console.log(`[Step 1] Downloading video: ${videoUrl}`);

    // Step 1a: Download video with yt-dlp
    // Use best format ≤1080p to avoid massive file sizes
    try {
      await exec('yt-dlp', [
        '-f', 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best',
        '--merge-output-format', 'mp4',
        '-o', videoPath,
        '--no-playlist',          // Single video only
        '--no-check-certificates',
        '--socket-timeout', '30',
        videoUrl,
      ], {
        timeout: 600000, // 10-minute timeout for large videos
        maxBuffer: 50 * 1024 * 1024,
      });
    } catch (err) {
      // If yt-dlp fails with format selection, try simpler format
      console.warn('[Step 1] Primary format failed, trying fallback...');
      await exec('yt-dlp', [
        '-f', 'best[ext=mp4]/best',
        '-o', videoPath,
        '--no-playlist',
        '--no-check-certificates',
        videoUrl,
      ], {
        timeout: 600000,
        maxBuffer: 50 * 1024 * 1024,
      });
    }

    // Verify download succeeded
    try {
      await fs.access(videoPath);
    } catch {
      throw new Error('Video download failed: output file not found');
    }
  }

  const videoStat = await fs.stat(videoPath);
  console.log(`[Step 1] Video downloaded: ${(videoStat.size / 1024 / 1024).toFixed(1)}MB`);

  // Step 1b: Get video metadata
  let metadata = { title: '', duration: 0, fileSize: videoStat.size };

  try {
    const { stdout: titleOut } = await exec('yt-dlp', [
      '--get-title', '--no-playlist', videoUrl,
    ], { timeout: 15000 });
    metadata.title = titleOut.trim();
  } catch {
    metadata.title = 'Untitled Video';
  }

  // Step 1c: Extract audio (mono 16kHz 32kbps MP3)
  console.log('[Step 1] Extracting audio...');
  const audioPath = await extractAudio(videoPath, jobDir);

  const audioStat = await fs.stat(audioPath);
  console.log(`[Step 1] Audio extracted: ${(audioStat.size / 1024 / 1024).toFixed(1)}MB`);

  metadata.duration = await getDuration(audioPath);

  // Step 1d: Split audio into chunks if needed (25MB limit)
  console.log('[Step 1] Checking audio size for chunking...');
  const audioChunks = await splitAudioIntoChunks(audioPath, jobDir);
  console.log(`[Step 1] Audio ready: ${audioChunks.length} chunk(s)`);

  return {
    videoPath,
    audioChunks,
    metadata,
  };
}

export default ingestVideo;
