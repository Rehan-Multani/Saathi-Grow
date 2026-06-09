import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import { getGoogleDistances } from '../src/services/locationService.js';
import Branch from '../src/models/Branch.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- Connected to DB ---');

  const udaipurBranch = await Branch.findOne({ _id: '69e732a2e7e9bc830e36ac16' }).lean();
  console.log('Udaipur Branch:', JSON.stringify(udaipurBranch));

  const origin = udaipurBranch.address.location.coordinates;
  const destinations = [origin];

  const apiKey = process.env.GOOGLE_MAPS_API;
  console.log('API Key:', apiKey ? 'exists' : 'does not exist');

  const destString = destinations.map(d => `${d[1]},${d[0]}`).join('|');
  const originString = `${origin[1]},${origin[0]}`;

  const GOOGLE_MAPS_DISTANCEMATRIX_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';
  
  try {
    const response = await axios.get(GOOGLE_MAPS_DISTANCEMATRIX_URL, {
      params: {
        origins: originString,
        destinations: destString,
        key: apiKey,
        mode: 'driving'
      }
    });

    console.log('Google Maps Distance Matrix response status:', response.status);
    console.log('Google Maps Distance Matrix response body:', JSON.stringify(response.data, null, 2));

    const enriched = response.data.rows?.[0]?.elements?.map((el, idx) => ({
      status: el.status,
      distance: el.distance?.value / 1000 || 99999,
      distanceText: el.distance?.text,
      duration: el.duration?.value || 0,
      destination: destinations[idx]
    }));
    console.log('Enriched distances:', JSON.stringify(enriched, null, 2));

  } catch (error) {
    console.error('Error calling Google API:', error.message);
    if (error.response) {
      console.error('Response body:', JSON.stringify(error.response.data, null, 2));
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
