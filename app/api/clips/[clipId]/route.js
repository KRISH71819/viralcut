/**
 * GET /api/clips/[clipId]
 * Returns detailed clip data including the full Remotion blueprint.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/server/lib/mongodb';
import User from '@/server/models/User';
import Clip from '@/server/models/Clip';

export async function GET(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { clipId } = await params;

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const clip = await Clip.findOne({
      _id: clipId,
      userId: user._id,
    }).lean();

    if (!clip) {
      return NextResponse.json({ error: 'Clip not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...clip,
      _id: clip._id.toString(),
      jobId: clip.jobId.toString(),
      userId: clip.userId.toString(),
    });
  } catch (err) {
    console.error('[API /clips/:id] Error:', err.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
