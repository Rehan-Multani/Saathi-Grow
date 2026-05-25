import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Complaint from './src/models/Complaint.js';

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const complaint = await Complaint.findOne().sort('-createdAt');
        console.log('Found complaint:', complaint.ticketId);

        complaint.status = 'CLOSED';
        complaint.closedAt = new Date();
        complaint.resolutionThread.push({
            sender: complaint.user,
            senderModel: 'Admin',
            senderName: 'Test Admin',
            message: 'Test message'
        });

        await complaint.save();
        console.log('Saved successfully');
    } catch (e) {
        console.error('Save error:', e);
    } finally {
        process.exit(0);
    }
};

test();
