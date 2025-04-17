import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rekrut';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Define the type for the cached mongoose client
interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Avoid TS error by using 'declare global'
declare global {
  // eslint-disable-next-line no-var
  var mongoose: Cached | undefined; // Use var to avoid TypeScript's block scoping
}

let cached: Cached = global.mongoose || { conn: null, promise: null };

if (process.env.NODE_ENV !== 'production') global.mongoose = cached;

async function dbConnect() {
  if (cached.conn) {
    console.log('🔄 Using existing MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log('🔌 Creating new MongoDB connection');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    });
  } else {
    console.log('⏳ Waiting for existing MongoDB connection promise');
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
