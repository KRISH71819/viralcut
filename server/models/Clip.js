/**
 * Clip Model
 * Stores individual clip data: timestamps, captions, B-roll, virality score,
 * and the Remotion rendering blueprint.
 */
import mongoose from 'mongoose';

const CaptionWordSchema = new mongoose.Schema(
  {
    word: { type: String, required: true },
    start: { type: Number, required: true },  // seconds
    end: { type: Number, required: true },    // seconds
  },
  { _id: false }
);

const BRollSchema = new mongoose.Schema(
  {
    keyword: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    startTime: { type: Number, default: 0 },   // insertion point in clip (seconds)
    duration: { type: Number, default: 3 },     // overlay duration (seconds)
    photographer: { type: String, default: '' },
  },
  { _id: false }
);

const ClipSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VideoJob',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clipIndex: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    startTime: {
      type: Number,
      required: true,
      min: 0,
    },
    endTime: {
      type: Number,
      required: true,
      min: 0,
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
    captions: [CaptionWordSchema],
    broll: [BRollSchema],

    viralityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    hookReasoning: {
      type: String,
      default: '',
    },

    // Full Remotion-compatible blueprint payload
    remotionBlueprint: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Future: URL to rendered video on S3/Cloudflare R2
    renderedUrl: {
      type: String,
      default: '',
    },

    status: {
      type: String,
      enum: ['pending', 'rendering', 'ready'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save: calculate duration
ClipSchema.pre('save', function (next) {
  if (this.startTime != null && this.endTime != null) {
    this.duration = Math.round((this.endTime - this.startTime) * 100) / 100;
  }
  next();
});

export default mongoose.models.Clip || mongoose.model('Clip', ClipSchema);
