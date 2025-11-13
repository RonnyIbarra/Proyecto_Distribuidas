import mongoose from 'mongoose';
import { createClient } from 'redis';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado');
  } catch (err) {
    console.error('Error MongoDB:', err);
    process.exit(1);
  }
};

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.on('error', (err) => console.log('Redis Error:', err));
await redisClient.connect();

export { connectDB, redisClient };