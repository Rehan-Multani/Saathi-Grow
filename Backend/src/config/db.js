import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Fail fast if Atlas is unreachable
        });
        console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error(`🔍 Please check if your IP matches the whitelist in MongoDB Atlas: https://www.mongodb.com/docs/atlas/security-whitelist/`);
        process.exit(1); // Exit process if DB connection fails
    }
};

export default connectDB;
