import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Branch from '../src/models/Branch.js';
import Vendor from '../src/models/Vendor.js';
import { getNearbyStores } from '../src/controllers/storeController.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- Connected to DB ---');

  const vendors = await Vendor.find().lean();
  const branches = await Branch.find().lean();

  const mockRes = {
    status: function(code) {
      console.log(`  Response Status: ${code}`);
      return this;
    },
    json: function(data) {
      console.log(`  Response JSON returned ${data.length} stores.`);
      data.forEach(s => {
        console.log(`    - ID: ${s.id}, Name: ${s.name}, Type: ${s.type}, RoadDistance: ${s.roadDistance} km`);
      });
    }
  };

  for (const v of vendors) {
    console.log(`\nSimulating nearby stores request at Vendor "${v.storeName || v.name}" location: ${JSON.stringify(v.address?.location?.coordinates)}`);
    const [lng, lat] = v.address?.location?.coordinates || [0, 0];
    await getNearbyStores({
      query: { lat: lat.toString(), lng: lng.toString() }
    }, mockRes);
  }

  for (const b of branches) {
    console.log(`\nSimulating nearby stores request at Branch "${b.branchName || b.name}" location: ${JSON.stringify(b.address?.location?.coordinates)}`);
    const [lng, lat] = b.address?.location?.coordinates || [0, 0];
    await getNearbyStores({
      query: { lat: lat.toString(), lng: lng.toString() }
    }, mockRes);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
