import mongoose, { ConnectOptions } from "mongoose";

const MONGODB_URI = (() => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }

  return uri;
})();

type MongooseInstance = typeof mongoose;

interface MongooseCache {
  conn: MongooseInstance | null;
  promise: Promise<MongooseInstance> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

// Reuse the same cache object across hot reloads in development.
const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cached: MongooseCache = globalWithMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<MongooseInstance> {
  // Return the active connection immediately when available.
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const options: ConnectOptions = {
      bufferCommands: false,
    };

    // Save the in-flight connection promise to avoid parallel reconnect attempts.
    cached.promise = mongoose.connect(MONGODB_URI, options).then((instance) => instance);
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset promise so future calls can retry after a failed connection attempt.
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectToDatabase;
