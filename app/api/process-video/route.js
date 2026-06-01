/**
 * POST /api/process-video
 * Accepts a video URL, creates a VideoJob, and spawns the async pipeline.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/server/lib/mongodb';
import User from '@/server/models/User';
import VideoJob from '@/server/models/VideoJob';
import { runPipeline } from '@/server/pipeline/orchestrator';

export async function POST(req) {
  try {
    // 1. Authenticate
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // 2. Parse body
    const body = await req.json();
    const { videoUrl } = body;

    if (!videoUrl || typeof videoUrl !== 'string') {
      return NextResponse.json(
        { error: 'videoUrl is required and must be a string' },
        { status: 400 }
      );
    }

    // Basic URL validation
    const urlPattern = /^https?:\/\/.+/i;
    if (!urlPattern.test(videoUrl)) {
      return NextResponse.json(
        { error: 'Invalid video URL. Must start with http:// or https://' },
        { status: 400 }
      );
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
      sourceUrl: videoUrl,
      status: 'queued',
      progress: 0,
      currentStep: 'Queued for processing...',
    });

    // 5. Consume a credit
    await user.consumeCredit();

    // 6. Fire the pipeline asynchronously (don't await)
    // The pipeline will update the job document as it progresses
    runPipeline(job._id.toString()).catch((err) => {
      console.error(`[API] Pipeline background error for job ${job._id}:`, err.message);
    });

    // 7. Return immediately
    return NextResponse.json(
      {
        jobId: job._id.toString(),
        status: 'queued',
        message: 'Video processing started',
      },
      { status: 202 }
    );
  } catch (err) {
    console.error('[API /process-video] Error:', err.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
