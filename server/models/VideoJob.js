/**
 * VideoJob Model
 * Tracks the state of each video processing pipeline run.
 */
import mongoose from 'mongoose';

const VideoJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sourceUrl: {
      type: String,
      required: [true, 'Source video URL is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'queued',
        'downloading',
        'transcribing',
        'analyzing',
        'b-rolling',
        'blueprinting',
        'completed',
        'failed',
      ],
      default: 'queued',
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentStep: {
      type: String,
      default: 'Waiting in queue...',
    },
    // File paths (local/temp storage)
    sourceFilePath: { type: String, default: '' },
    audioFilePath: { type: String, default: '' },

    // Full Whisper transcript response
    transcript: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Error info if pipeline fails
    error: { type: String, default: '' },

    // Video metadata
    metadata: {
      title: { type: String, default: '' },
      duration: { type: Number, default: 0 },   // seconds
      fileSize: { type: Number, default: 0 },    // bytes
    },

    // Timing
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// TTL index: auto-delete failed jobs after 7 days
VideoJobSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 7 * 24 * 3600, partialFilterExpression: { status: 'failed' } }
);

// Helper to update status and progress atomically
VideoJobSchema.methods.updateProgress = async function (status, progress, currentStep) {
  this.status = status;
  this.progress = progress;
  this.currentStep = currentStep;
  if (status === 'downloading' && !this.startedAt) {
    this.startedAt = new Date();
  }
  if (status === 'completed') {
    this.completedAt = new Date();
  }
  await this.save();
};

export default mongoose.models.VideoJob || mongoose.model('VideoJob', VideoJobSchema);
