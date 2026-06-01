/**
 * POST /api/upload
 * Handles local video file uploads, saves them, and starts the processing pipeline.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/server/lib/mongodb';
import User from '@/server/models/User';
import VideoJob from '@/server/models/VideoJob';
import { runPipeline } from '@/server/pipeline/orchestrator';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    // 1. Authenticate
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2. Parse Form Data
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    await connectDB();

    // 3. Check user credits
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.hasCredits()) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please upgrade your plan or purchase credits.' },
        { status: 403 }
      );
    }

    // 4. Create VideoJob document
    const job = await VideoJob.create({
      userId: user._id,
      sourceUrl: `local://${file.name}`,
      status: 'queued',
      progress: 0,
      currentStep: 'Queued for processing...',
    });

    // 5. Ensure temp directory exists
    const jobDir = path.join(process.cwd(), 'tmp', 'jobs', job._id.toString());
    await fs.mkdir(jobDir, { recursive: true });

    const localFilePath = path.join(jobDir, 'source.mp4');

    // 6. Write file contents to job directory
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(localFilePath, buffer);

    // Save actual file path to job for the pipeline
    job.sourceFilePath = localFilePath;
    await job.save();

    // 7. Consume a credit
    await user.consumeCredit();

    // 8. Fire the pipeline asynchronously
    runPipeline(job._id.toString()).catch((err) => {
      console.error(`[API] Pipeline background error for job ${job._id}:`, err.message);
    });

    return NextResponse.json(
      {
        jobId: job._id.toString(),
        status: 'queued',
        message: 'Video upload completed and processing started',
      },
      { status: 202 }
    );
  } catch (err) {
    console.error('[API /api/upload] Error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
