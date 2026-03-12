import cron from 'node-cron';
import Complaint from '../models/Complaint.js';
import { notifyAdmins } from './notificationService.js';

/**
 * Initialize all cron jobs
 */
export const initCronJobs = () => {
  // Run every hour to check SLA expiry
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Checking for SLA expirations...');
    try {
      const now = new Date();
      
      // Find tickets that are ESCALATED_TO_STORE and have passed slaExpiry
      const overdueTickets = await Complaint.find({
        status: 'ESCALATED_TO_STORE',
        slaExpiry: { $lt: now }
      }).populate('order');

      if (overdueTickets.length > 0) {
        console.log(`[CRON] Found ${overdueTickets.length} overdue tickets.`);
        
        for (const ticket of overdueTickets) {
          ticket.status = 'OVERDUE';
          await ticket.save();

          // Notify Admins about the escalation failure
          await notifyAdmins({
            title: `SLA BREACH: ${ticket.ticketId}`,
            body: `Store failed to respond to Order #${ticket.order?.orderId} within SLA.`
          }, {
            ticketId: ticket.ticketId,
            type: 'sla_breach'
          });
        }
      }
    } catch (error) {
      console.error('[CRON-ERROR] SLA Check Failed:', error);
    }
  });

  console.log('[CRON] Support SLA Monitor active (Hourly)');
};
