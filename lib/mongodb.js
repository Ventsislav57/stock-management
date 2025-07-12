// lib/dbConnect.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.CONNECTION_STRING;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI не е дефиниран в .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
