import mongoose from 'mongoose';
import dns from 'node:dns';

// Set DNS servers to Google DNS as requested to bypass ISP restrictions
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    dns.setDefaultResultOrder('ipv4first');
} catch (e) {
    console.warn('DNS server setting failed, using system defaults.');
}

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || '';
        const maskedUri = uri.replace(/\/\/.*:.*@/, '//****:****@');
        console.log(`📡 Attempting to connect to: ${maskedUri}`);
        
        const conn = await mongoose.connect(uri);
        
        console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        if (error.reason) {
            console.error('Server Selection Reason:', JSON.stringify(error.reason, null, 2));
        }
        console.log(`🔍 TIP: If using Atlas, ensure your IP is whitelisted. We are currently using the Standard Connection String to bypass SRV DNS issues.`);
        // Don't kill the server process on DB failures.
        // This keeps the API reachable (so nginx doesn't return 502),
        // and lets endpoints respond with proper JSON errors.
        return null;
    }
};

export default connectDB;
