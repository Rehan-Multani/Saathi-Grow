import '../src/config/env.js';
import mongoose from 'mongoose';
import UserTransaction from '../src/models/UserTransaction.js';
import razorpayInstance from '../src/services/razorpayVerificationService.js';

const suffix = (value) => String(value || '').slice(-6);

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const transactions = await UserTransaction.find({ category: 'topup' }).sort({ createdAt: 1 }).lean();
  const seenPayments = new Set();
  const suspicious = [];

  for (const transaction of transactions) {
    const issues = [];
    if (!transaction.razorpayOrderId) issues.push('missing_order_id');
    if (!transaction.razorpayPaymentId) issues.push('missing_payment_id');
    if (seenPayments.has(transaction.razorpayPaymentId)) issues.push('duplicate_payment_id');
    seenPayments.add(transaction.razorpayPaymentId);

    if (transaction.razorpayOrderId && transaction.razorpayPaymentId) {
      try {
        const [payment, order] = await Promise.all([
          razorpayInstance.payments.fetch(transaction.razorpayPaymentId),
          razorpayInstance.orders.fetch(transaction.razorpayOrderId)
        ]);
        if (payment.status !== 'captured' || payment.captured !== true) issues.push('payment_not_captured');
        if (order.status !== 'paid' || Number(order.amount_due) !== 0) issues.push('order_not_paid');
        if (String(payment.order_id) !== String(transaction.razorpayOrderId)) issues.push('payment_order_mismatch');
        if (Number(payment.amount) !== Number(order.amount)) issues.push('provider_amount_mismatch');
        if (Number(transaction.amount) !== Number(payment.amount) / 100) issues.push('ledger_amount_mismatch');
        if (payment.currency !== 'INR' || order.currency !== 'INR') issues.push('currency_mismatch');
      } catch (error) {
        issues.push(`provider_lookup_failed:${error.message}`);
      }
    }

    if (issues.length > 0) {
      suspicious.push({
        transactionIdSuffix: suffix(transaction._id),
        paymentIdSuffix: suffix(transaction.razorpayPaymentId),
        createdAt: transaction.createdAt,
        amount: transaction.amount,
        issues
      });
    }
  }

  console.log(JSON.stringify({
    checked: transactions.length,
    clean: transactions.length - suspicious.length,
    suspicious
  }, null, 2));
};

main()
  .catch((error) => {
    console.error('[TOPUP_AUDIT_FAILED]', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
