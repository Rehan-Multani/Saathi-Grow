import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getZonedDateParts,
  isSlotBookable,
  parseTimeToMinutes
} from '../src/services/deliveryTimingService.js';

test('delivery times accept only valid HH:mm values', () => {
  assert.equal(parseTimeToMinutes('09:30'), 570);
  assert.equal(parseTimeToMinutes('23:59'), 1439);
  assert.equal(parseTimeToMinutes('24:00'), null);
  assert.equal(parseTimeToMinutes('9:30'), null);
});

test('delivery date and time are evaluated in Asia/Kolkata', () => {
  const parts = getZonedDateParts(new Date('2026-08-08T18:45:00.000Z'), 'Asia/Kolkata');
  assert.deepEqual(parts, { date: '2026-08-09', minutes: 15 });
});

test('past and cutoff delivery slots are not bookable', () => {
  const now = new Date('2026-08-08T04:00:00.000Z'); // 09:30 in India
  const settings = { deliveryTimezone: 'Asia/Kolkata', slotBookingCutoffMinutes: 30 };

  assert.equal(isSlotBookable({ isActive: true, startTime: '10:30' }, settings, now), true);
  assert.equal(isSlotBookable({ isActive: true, startTime: '10:00' }, settings, now), false);
  assert.equal(isSlotBookable({ isActive: true, startTime: '08:00' }, settings, now), false);
  assert.equal(isSlotBookable({ isActive: false, startTime: '12:00' }, settings, now), false);
});

test('a zero-minute cutoff is respected', () => {
  const now = new Date('2026-08-08T04:00:00.000Z'); // 09:30 in India
  assert.equal(isSlotBookable(
    { isActive: true, startTime: '09:31' },
    { deliveryTimezone: 'Asia/Kolkata', slotBookingCutoffMinutes: 0 },
    now
  ), true);
});
