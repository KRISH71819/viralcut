/**
 * FFmpeg Utility Functions
 * Wraps FFmpeg commands for audio extraction and chunking.
 * Requires ffmpeg to be installed and on PATH.
 */
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
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

const MAX_CHUNK_SIZE = 24 * 1024 * 1024; // 24MB (leave 1MB buffer below Groq's 25MB limit)

/**
 * Extract audio from a video file as mono 16kHz 32kbps MP3.
 * This aggressive compression keeps most 3-hour podcasts under 25MB.
 * 
 * @param {string} videoPath - Absolute path to the input video
 * @param {string} outputDir - Directory to save the audio file
 * @returns {Promise<string>} Path to the extracted audio file
 */
export async function extractAudio(videoPath, outputDir) {
  const audioPath = path.join(outputDir, 'audio.mp3');

  await exec('ffmpeg', [
    '-i', videoPath,
    '-vn',                 // No video
    '-acodec', 'libmp3lame',
    '-ab', '32k',          // 32kbps bitrate (aggressive but speech-legible)
    '-ar', '16000',        // 16kHz sample rate (Whisper optimal)
    '-ac', '1',            // Mono
    '-y',                  // Overwrite
    audioPath,
  ], { timeout: 300000 }); // 5-minute timeout

  return audioPath;
}

/**
 * Get the duration of an audio/video file in seconds.
 * @param {string} filePath - Path to the media file
 * @returns {Promise<number>} Duration in seconds
 */
export async function getDuration(filePath) {
  try {
    const { stdout } = await exec('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'csv=p=0',
      filePath,
    ], { timeout: 30000 });

    return parseFloat(stdout.trim()) || 0;
  } catch {
    return 0;
  }
}

/**
 * Split an audio file into chunks that fit under the Groq 25MB limit.
 * Each chunk has a 2-second overlap with the previous one for transcript continuity.
 * 
 * @param {string} audioPath - Path to the audio file
 * @param {string} outputDir - Directory to save chunk files
 * @returns {Promise<Array<{path: string, startOffset: number, duration: number}>>}
 */
export async function splitAudioIntoChunks(audioPath, outputDir) {
  const stat = await fs.stat(audioPath);
  const fileSize = stat.size;

  // If file is small enough, return as single chunk
  if (fileSize <= MAX_CHUNK_SIZE) {
    const duration = await getDuration(audioPath);
    return [{ path: audioPath, startOffset: 0, duration }];
  }

  const totalDuration = await getDuration(audioPath);
  if (totalDuration <= 0) {
    throw new Error('Could not determine audio duration for chunking');
  }

  // Calculate number of chunks needed
  const numChunks = Math.ceil(fileSize / MAX_CHUNK_SIZE);
  const chunkDuration = Math.ceil(totalDuration / numChunks);
  const overlap = 2; // 2-second overlap between chunks

  const chunks = [];

  for (let i = 0; i < numChunks; i++) {
    const startTime = Math.max(0, i * chunkDuration - (i > 0 ? overlap : 0));
    const duration = chunkDuration + (i > 0 ? overlap : 0);
    const chunkPath = path.join(outputDir, `chunk_${i}.mp3`);

    await exec('ffmpeg', [
      '-i', audioPath,
      '-ss', String(startTime),
      '-t', String(duration),
      '-acodec', 'libmp3lame',
      '-ab', '32k',
      '-ar', '16000',
      '-ac', '1',
      '-y',
      chunkPath,
    ], { timeout: 120000 });

    const actualDuration = await getDuration(chunkPath);

    chunks.push({
      path: chunkPath,
      startOffset: i === 0 ? 0 : i * chunkDuration, // True start (without overlap)
      duration: actualDuration,
    });
  }

  console.log(`[FFmpeg] Split audio into ${chunks.length} chunks (total: ${totalDuration.toFixed(1)}s)`);
  return chunks;
}

/**
 * Check if ffmpeg is available on the system.
 * @returns {Promise<boolean>}
 */
export async function isFFmpegAvailable() {
  try {
    await exec('ffmpeg', ['-version'], { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export default { extractAudio, getDuration, splitAudioIntoChunks, isFFmpegAvailable };
