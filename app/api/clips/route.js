/**
 * GET /api/clips
 * Returns all clips for the authenticated user.
 * Supports: ?jobId=xxx to filter by job, ?page=1&limit=20 for pagination
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/server/lib/mongodb';
import User from '@/server/models/User';
import Clip from '@/server/models/Clip';

export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    // Build query
    const query = { userId: user._id };
    if (jobId) {
      query.jobId = jobId;
    }

    const [clips, total] = await Promise.all([
      Clip.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-remotionBlueprint') // Exclude heavy payload from list
        .lean(),
      Clip.countDocuments(query),
    ]);

    return NextResponse.json({
      clips: clips.map((c) => ({
        ...c,
        _id: c._id.toString(),
        jobId: c.jobId.toString(),
        userId: c.userId.toString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[API /clips] Error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
