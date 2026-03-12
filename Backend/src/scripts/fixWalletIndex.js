/**
 * One-Time Fix Script: Drop stale deliveryPartner_1 unique index from wallets collection
 * Run once: node src/scripts/fixWalletIndex.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env') });

const fix = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const walletsCollection = db.collection('wallets');

    // List existing indexes
    const indexes = await walletsCollection.indexes();
    console.log('Current indexes on wallets:', indexes.map(i => i.name));

    // Drop the stale deliveryPartner_1 index if it exists
    const hasIndex = indexes.find(i => i.name === 'deliveryPartner_1');
    if (hasIndex) {
      await walletsCollection.dropIndex('deliveryPartner_1');
      console.log('✅ Dropped stale index: deliveryPartner_1');
    } else {
      console.log('ℹ️  Index deliveryPartner_1 not found (already clean)');
    }

    // List remaining indexes
    const remaining = await walletsCollection.indexes();
    console.log('Remaining indexes:', remaining.map(i => i.name));

    console.log('✅ Fix complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
};

fix();
