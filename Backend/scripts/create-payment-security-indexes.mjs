import '../src/config/env.js';
import mongoose from 'mongoose';
import Order from '../src/models/Order.js';
import UserTransaction from '../src/models/UserTransaction.js';
import WalletTopup from '../src/models/WalletTopup.js';

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const [orderIndexes, transactionIndexes, topupIndexes] = await Promise.all([
    Order.createIndexes(),
    UserTransaction.createIndexes(),
    WalletTopup.createIndexes()
  ]);

  console.log('[PAYMENT_INDEXES_READY]', {
    orderIndexes,
    transactionIndexes,
    topupIndexes
  });
};

main()
  .catch((error) => {
    console.error('[PAYMENT_INDEX_CREATION_FAILED]', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
