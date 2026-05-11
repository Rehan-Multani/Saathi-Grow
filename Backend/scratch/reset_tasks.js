
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import DeliveryPartner from '../src/models/DeliveryPartner.js';
import DeliveryRun from '../src/models/DeliveryRun.js';
import Order from '../src/models/Order.js';
import connectDB from '../src/config/db.js';

dotenv.config();

const resetTasks = async () => {
    try {
        await connectDB();
        const phone = '6264715409';
        const partner = await DeliveryPartner.findOne({ phone });
        
        if (!partner) {
            console.log('Delivery partner not found with phone:', phone);
            process.exit(1);
        }

        console.log(`Resetting tasks for ${partner.name} (${phone})...`);

        const oldRunId = partner.activeRun;
        const oldOrderId = partner.activeOrder;

        // 1. Reset Partner Fields
        partner.assignmentStatus = 'Free';
        partner.activeRun = null;
        partner.activeOrder = null;
        partner.currentStopIndex = 0;
        await partner.save();
        console.log('Partner fields reset to Free/null.');

        // 2. Cleanup DeliveryRun if any
        if (oldRunId) {
            const run = await DeliveryRun.findById(oldRunId);
            if (run && (run.status === 'assigned' || run.status === 'in_progress')) {
                run.status = 'cancelled'; // Or 'partial_complete'
                run.cancelledAt = new Date();
                run.notes = (run.notes || '') + '\n[System Reset] Task cleared by admin request.';
                await run.save();
                console.log(`Run ${run.runId} marked as cancelled.`);

                // Release orders in the run
                for (const orderItem of run.orders) {
                    await Order.updateOne(
                        { _id: orderItem.order, status: { $in: ['out_for_delivery'] } },
                        { 
                            $set: { 
                                status: 'ready_for_pickup',
                                deliveryPartnerId: null,
                                deliveryRunId: null
                            } 
                        }
                    );
                }
                console.log('Orders in run released back to ready_for_pickup.');
            }
        }

        // 3. Cleanup direct activeOrder if any
        if (oldOrderId) {
            await Order.updateOne(
                { _id: oldOrderId },
                { 
                    $set: { 
                        status: 'ready_for_pickup',
                        deliveryPartnerId: null,
                        deliveryRunId: null
                    } 
                }
            );
            console.log(`Direct active order ${oldOrderId} released.`);
        }

        console.log('Success: Tasks set to 0 and partner is now Free.');
        process.exit(0);
    } catch (error) {
        console.error('Error resetting tasks:', error);
        process.exit(1);
    }
};

resetTasks();
