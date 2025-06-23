import mongoose from 'mongoose';

// Debug the MONGO_URI
console.log('MONGO_URI:', process.env.MONGO_URI);

export const dbConnection = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined in the environment variables.');
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'Job_Portal',
    });
    console.log('MongoDB Connected Successfully!');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    throw error;
  }
}; 