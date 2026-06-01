/**
 * Pipeline Orchestrator
 * Runs the 5-step video processing pipeline sequentially.
 * Updates VideoJob status/progress after each step.
 * Designed to run asynchronously (fire-and-forget from API route).
 */
import path from 'path';
import fs from 'fs/promises';
import { connectDB } from '../lib/mongodb.js';
import VideoJob from '../models/VideoJob.js';
import { ingestVideo } from './step1-ingest.js';
import { transcribeAudio } from './step2-transcribe.js';
import { findHooks } from './step3-hooks.js';
import { extractBRoll } from './step4-broll.js';
import { buildBlueprints } from './step5-blueprint.js';

/**
 * Run the complete video processing pipeline for a given job.
 * This function is fire-and-forget — it handles its own errors.
 * 
 * @param {string} jobId - The VideoJob document ID
 */
export async function runPipeline(jobId) {
  let job;

  try {
    await connectDB();
    job = await VideoJob.findById(jobId);

    if (!job) {
      console.error(`[Pipeline] Job ${jobId} not found`);
      return;
    }

    // Create temp directory for this job
    const jobDir = path.join(process.cwd(), 'tmp', 'jobs', jobId.toString());
    await fs.mkdir(jobDir, { recursive: true });

    // ─────────────────────────────────────────────
    // STEP 1: Video Ingestion & Audio Extraction
    // ─────────────────────────────────────────────
    await job.updateProgress('downloading', 5, 'Downloading video and extracting audio...');

    const { videoPath, audioChunks, metadata } = await ingestVideo(job.sourceUrl, jobDir);

    job.sourceFilePath = videoPath;
    job.audioFilePath = audioChunks[0]?.path || '';
    job.metadata = metadata;
    await job.updateProgress('downloading', 20, 'Video downloaded, audio extracted');

    // ─────────────────────────────────────────────
    // STEP 2: Transcription (Groq Whisper)
    // ─────────────────────────────────────────────
    await job.updateProgress('transcribing', 25, 'Transcribing audio with Whisper AI...');

    const transcript = await transcribeAudio(audioChunks);

    job.transcript = transcript;
    await job.updateProgress('transcribing', 40, `Transcription complete: ${transcript.words.length} words`);

    // ─────────────────────────────────────────────
    // STEP 3: Semantic Hook Finding
    // ─────────────────────────────────────────────
    await job.updateProgress('analyzing', 45, 'Finding viral hooks with AI analysis...');

    const hookResult = await findHooks(transcript);

    await job.updateProgress('analyzing', 60, `Found ${hookResult.clips.length} viral hooks`);

    // ─────────────────────────────────────────────
    // STEP 4: B-Roll Extraction
    // ─────────────────────────────────────────────
    await job.updateProgress('b-rolling', 65, 'Searching for B-Roll footage...');

    const enrichedClips = await extractBRoll(hookResult.clips);

    await job.updateProgress('b-rolling', 80, 'B-Roll matched to clip timestamps');

    // ─────────────────────────────────────────────
    // STEP 5: Remotion Blueprint
    // ─────────────────────────────────────────────
    await job.updateProgress('blueprinting', 85, 'Building rendering blueprints...');

    const savedClips = await buildBlueprints({
      jobId: job._id,
      userId: job.userId,
      sourceVideoPath: videoPath,
      sourceUrl: job.sourceUrl,
      clips: enrichedClips,
      transcript,
    });

    // ─────────────────────────────────────────────
    // COMPLETE
    // ─────────────────────────────────────────────
    await job.updateProgress(
      'completed',
      100,
      `Done! ${savedClips.length} clips ready`
    );

    console.log(`[Pipeline] ✅ Job ${jobId} completed successfully with ${savedClips.length} clips`);

    // Cleanup: remove temp video/audio files (keep for now during dev)
    // await fs.rm(jobDir, { recursive: true, force: true });

  } catch (err) {
    console.error(`[Pipeline] ❌ Job ${jobId} failed:`, err.message);

    // Update job status to failed
    try {
      if (job) {
        job.status = 'failed';
        job.error = err.message || 'Unknown pipeline error';
        job.currentStep = `Failed: ${err.message}`;
        await job.save();
      }
    } catch (saveErr) {
      console.error('[Pipeline] Failed to save error state:', saveErr.message);
    }
  }
}

export default runPipeline;
