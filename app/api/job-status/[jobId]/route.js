/**
 * GET /api/job-status/[jobId]
 * Returns the current status of a video processing job.
 * Used for real-time polling from the processing page.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/server/lib/mongodb';
import VideoJob from '@/server/models/VideoJob';
import Clip from '@/server/models/Clip';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    await connectDB();

    const job = await VideoJob.findById(jobId).lean();

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Build response
    const response = {
      jobId: job._id.toString(),
      status: job.status,
      progress: job.progress,
      currentStep: job.currentStep,
      metadata: job.metadata || {},
      error: job.error || null,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      createdAt: job.createdAt,
    };

    // If completed, include clip count
    if (job.status === 'completed') {
      const clipCount = await Clip.countDocuments({ jobId: job._id });
      response.clipCount = clipCount;
    }

    return NextResponse.json(response);
  } catch (err) {
    console.error('[API /job-status] Error:', err.message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
