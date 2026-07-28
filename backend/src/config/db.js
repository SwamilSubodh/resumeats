const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const env = require("./env");

mongoose.set("strictQuery", true);

let memoryServer = null;

async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const useMemoryFallback = env.nodeEnv !== "production";

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    return mongoose.connection;
  } catch (error) {
    if (!useMemoryFallback) {
      throw error;
    }

    console.warn("[DB] MongoDB not reachable, starting in-memory MongoDB for local development.");
    memoryServer = await MongoMemoryServer.create();
    await mongoose.disconnect().catch(() => {});
    await mongoose.connect(memoryServer.getUri(), {
      serverSelectionTimeoutMS: 5000
    });
    return mongoose.connection;
  }
}

module.exports = connectDB;
