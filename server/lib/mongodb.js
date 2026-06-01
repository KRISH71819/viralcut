/**
 * MongoDB Connection Singleton
 * Handles connection pooling and hot-reload safety in development.
 * Uses cached connection to prevent multiple connections during Next.js hot reloads.
 */
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined. Add it to .env.local');
}

/**
 * Global cache to reuse the connection across hot reloads in development.
 * In production, this is a no-op since the module is only loaded once.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB. Returns the cached connection if available.
 * @returns {Promise<mongoose.Connection>}
 */
export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('[MongoDB] Connected successfully');
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    console.error('[MongoDB] Connection error:', err.message);
    throw err;
  }

  return cached.conn;
}

export default connectDB;
