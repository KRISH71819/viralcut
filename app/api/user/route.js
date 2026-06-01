/**
 * GET /api/user
 * Returns the authenticated user's profile, tier, and credit info.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/server/lib/mongodb';
import User from '@/server/models/User';
import VideoJob from '@/server/models/VideoJob';
import Clip from '@/server/models/Clip';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email }).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get stats
    const [jobCount, clipCount, avgScore] = await Promise.all([
      VideoJob.countDocuments({ userId: user._id, status: 'completed' }),
      Clip.countDocuments({ userId: user._id }),
      Clip.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: null, avg: { $avg: '$viralityScore' } } },
      ]),
    ]);

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image,
        tier: user.tier,
        credits: user.credits,
        creditsUsed: user.creditsUsed,
        creditsRemaining: user.tier === 'pro' ? 'unlimited' : user.credits - user.creditsUsed,
        createdAt: user.createdAt,
      },
      stats: {
        videosProcessed: jobCount,
        clipsGenerated: clipCount,
        avgHookScore: Math.round(avgScore[0]?.avg || 0),
      },
    });
  } catch (err) {
    console.error('[API /user] Error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
