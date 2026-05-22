require('dotenv').config();
const mongoose = require('mongoose');
const DeliveryPartner = require('./src/models/DeliveryPartner.js').default;

mongoose.connect(process.env.MONGO_URI).then(async () => {
    await DeliveryPartner.updateMany(
        { name: 'palak patel' }, 
        { $set: { assignmentStatus: 'Free', activeOrder: null, activeRun: null } }
    );
    console.log('Fixed Palak Patel');
    process.exit(0);
});
