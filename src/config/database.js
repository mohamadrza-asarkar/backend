import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rice_store';

let isMongooseConnected = false;

/**
 * Connect to MongoDB with Mongoose
 */
export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    isMongooseConnected = true;
    return true;
  }

  try {
    mongoose.set('strictQuery', false);
    
    const connectionOptions = {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 5000
    };

    console.log(`🔌 Connecting Mongoose to: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')} ...`);
    await mongoose.connect(MONGODB_URI, connectionOptions);

    isMongooseConnected = true;
    console.log('✅ Mongoose connected successfully to MongoDB');
    return true;
  } catch (error) {
    isMongooseConnected = false;
    console.warn(`⚠️ Mongoose connection warning: ${error.message}`);
    return false;
  }
}

/**
 * Check if Mongoose is currently connected to a live MongoDB instance
 */
export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

export default connectDB;
