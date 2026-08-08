import DeliveryRun from '../models/DeliveryRun.js';

const ACTIVE_RUN_STATUSES = ['assigned', 'in_progress'];

export const getPartnerActiveLoad = async (partnerId, session = null, excludeRunId = null) => {
  const query = { deliveryPartner: partnerId, status: { $in: ACTIVE_RUN_STATUSES } };
  if (excludeRunId) query._id = { $ne: excludeRunId };
  let find = DeliveryRun.find(query).select('_id orders status createdAt').sort({ createdAt: 1 });
  if (session) find = find.session(session);
  const runs = await find.lean();
  const activeOrderCount = runs.reduce((count, run) => (
    count + run.orders.filter((stop) => !['delivered', 'failed', 'returned', 'picked_up'].includes(stop.status)).length
  ), 0);
  return { runs, activeOrderCount };
};

export const assertPartnerCapacity = async (partner, additionalOrders, session = null) => {
  const { activeOrderCount } = await getPartnerActiveLoad(partner._id, session);
  const maxActiveOrders = Number(partner.maxActiveOrders) || 10;
  if (activeOrderCount + additionalOrders > maxActiveOrders) {
    throw new Error(`Partner capacity exceeded (${activeOrderCount}/${maxActiveOrders} active parcels).`);
  }
  return { activeOrderCount, maxActiveOrders };
};

export const syncPartnerAssignmentState = async (partner, session = null, excludeRunId = null) => {
  const { runs } = await getPartnerActiveLoad(partner._id, session, excludeRunId);
  partner.assignmentStatus = runs.length > 0 ? 'Busy' : 'Free';
  partner.activeRun = runs[0]?._id || null;
  const focusedStop = runs[0]?.orders.find((stop) => !['delivered', 'failed', 'returned', 'picked_up'].includes(stop.status));
  partner.activeOrder = focusedStop?.order || null;
  partner.currentStopIndex = 0;
  await partner.save({ session });
  return runs;
};
