const prisma = require('../config/db');

async function joinWaitlist(userId, tripId) {
  // Check if user already in waitlist for this trip
  const existing = await prisma.waitlistEntry.findFirst({
    where: { userId, tripId: Number(tripId), status: 'WAITING' }
  });
  
  if (existing) {
    throw new Error('You are already on the waiting list for this trip');
  }
  
  // Check if user has a confirmed booking for this trip
  const booking = await prisma.booking.findFirst({
    where: { userId, tripId: Number(tripId), status: 'CONFIRMED' }
  });
  
  if (booking) {
    throw new Error('You already have a confirmed booking for this trip');
  }
  
  // Get current max position
  const lastEntry = await prisma.waitlistEntry.findFirst({
    where: { tripId: Number(tripId), status: 'WAITING' },
    orderBy: { position: 'desc' }
  });
  
  const position = (lastEntry ? lastEntry.position : 0) + 1;
  
  const entry = await prisma.waitlistEntry.create({
    data: {
      userId,
      tripId: Number(tripId),
      position,
      status: 'WAITING'
    },
    include: { trip: { include: { bus: true } } }
  });
  
  return entry;
}

async function getMyWaitlist(userId) {
  const entries = await prisma.waitlistEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { trip: { include: { bus: true } } }
  });
  return entries;
}

async function getWaitlistByTrip(tripId) {
  const entries = await prisma.waitlistEntry.findMany({
    where: { tripId: Number(tripId) },
    orderBy: { position: 'asc' },
    include: { user: { select: { id: true, name: true, email: true } }, trip: { include: { bus: true } } }
  });
  return entries;
}

async function leaveWaitlist(entryId, userId) {
  const entry = await prisma.waitlistEntry.findFirst({
    where: { id: Number(entryId), userId }
  });
  
  if (!entry) throw new Error('Waiting list entry not found');
  if (entry.status !== 'WAITING') throw new Error('Cannot leave an already processed waitlist entry');
  
  await prisma.waitlistEntry.update({
    where: { id: entry.id },
    data: { status: 'CANCELLED' }
  });
  
  return { success: true };
}

module.exports = { joinWaitlist, getMyWaitlist, getWaitlistByTrip, leaveWaitlist };
