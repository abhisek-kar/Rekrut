import mongoose from "mongoose";
import { getEnv } from "@/lib/env";
import { log } from "@/lib/logger";

// Get validated environment variables
const env = getEnv();
const MONGODB_URI = env.MONGODB_URI;

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

const cached: Cached = global.mongoose || { conn: null, promise: null };

if (process.env.NODE_ENV !== "production") global.mongoose = cached;

// Enhanced connection options for better performance and reliability
const connectionOptions = {
  bufferCommands: false, // Disable mongoose buffering
  maxPoolSize: parseInt(env.DB_MAX_POOL_SIZE || "10"), // Maintain up to N socket connections
  serverSelectionTimeoutMS: parseInt(env.DB_CONNECTION_TIMEOUT || "5000"), // Keep trying to send operations for N seconds
  socketTimeoutMS: parseInt(env.DB_SOCKET_TIMEOUT || "45000"), // Close sockets after N seconds of inactivity
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true, // Enable retryable writes
  ...(env.NODE_ENV === "production" && {
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity in production
    minPoolSize: 2, // Maintain at least 2 connections in production
  }),
};

async function dbConnect() {
  // Return cached connection if available
  if (cached.conn) {
    log.debug("Using existing MongoDB connection");
    return cached.conn;
  }

  // Create new connection if none exists
  if (!cached.promise) {
    log.info("Creating new MongoDB connection", { uri: MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') });
    
    const startTime = Date.now();
    cached.promise = mongoose.connect(MONGODB_URI, connectionOptions).then((mongoose) => {
      const duration = Date.now() - startTime;
      log.info("MongoDB connected successfully", { duration });
      
      // Set up connection event listeners for better monitoring
      mongoose.connection.on("error", (error) => {
        log.error("MongoDB connection error", error);
      });
      
      mongoose.connection.on("disconnected", () => {
        log.warn("MongoDB disconnected");
      });
      
      mongoose.connection.on("reconnected", () => {
        log.info("MongoDB reconnected");
      });
      
      return mongoose;
    });
  } else {
    log.debug("Waiting for existing MongoDB connection promise");
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Reset promise on failure to allow retry
    cached.promise = null;
    log.error("MongoDB connection failed", error as Error);
    throw error;
  }

  return cached.conn;
}

/**
 * Check if the database connection is healthy
 */
export async function checkDbHealth(): Promise<boolean> {
  try {
    if (!cached.conn) {
      return false;
    }
    
    const startTime = Date.now();
    // Ping the database to check if it's responsive
    await cached.conn.connection.db?.admin().ping();
    const duration = Date.now() - startTime;
    
    log.debug("Database health check passed", { duration });
    return true;
  } catch (error) {
    log.error("Database health check failed", error as Error);
    return false;
  }
}

/**
 * Get database connection status information
 */
export function getDbConnectionInfo() {
  const connection = cached.conn?.connection;
  if (!connection) {
    return {
      status: "disconnected",
      readyState: 0,
      host: null,
      name: null,
    };
  }

  const readyStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return {
    status: readyStates[connection.readyState as keyof typeof readyStates] || "unknown",
    readyState: connection.readyState,
    host: connection.host,
    name: connection.name,
  };
}

/**
 * Gracefully close the database connection
 */
export async function disconnectDb(): Promise<void> {
  try {
    if (cached.conn) {
      await cached.conn.disconnect();
      cached.conn = null;
      cached.promise = null;
      log.info("MongoDB connection closed gracefully");
    }
  } catch (error) {
    log.error("Error closing MongoDB connection", error as Error);
    throw error;
  }
}

/**
 * Force reconnection to the database
 */
export async function reconnectDb(): Promise<typeof mongoose> {
  log.info("Forcing database reconnection");
  
  // Clear cached connection
  cached.conn = null;
  cached.promise = null;
  
  // Create new connection
  return await dbConnect();
}

export default dbConnect;
