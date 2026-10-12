const prisma = require('../config/db');
const { generateBookingCode } = require('../utils/bookingCode');

async function getDashboard() {
  const [totalBuses, totalUsers, totalBookings, confirmedBookings, cancelledBookings, activeTrips, waitlistCount] = await Promise.all([
    prisma.bus.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { status: 'CANCELLED' } }),
    prisma.trip.count({ where: { status: 'SCHEDULED' } }),
    prisma.waitlistEntry.count({ where: { status: 'WAITING' } })
  ]);
  
  const revenueResult = await prisma.booking.aggregate({
    where: { status: 'CONFIRMED', paymentStatus: 'PAID' },
    _sum: { totalFare: true }
  });
  
  const recentBookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: { select: { name: true, email: true } }, trip: { include: { bus: true } } }
  });
  
  // Revenue last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  
  const revenueBookings = await prisma.booking.findMany({
    where: { status: 'CONFIRMED', paymentStatus: 'PAID', createdAt: { gte: fourteenDaysAgo } },
    select: { totalFare: true, createdAt: true, trip: { include: { bus: { select: { busType: true } } } } }
  });
  
  const revenueByDay = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    revenueByDay[key] = 0;
  }
  
  let bookingsByType = { REGULAR: 0, AC: 0, SLEEPER: 0 };
  
  for (const b of revenueBookings) {
    const dayKey = b.createdAt.toISOString().split('T')[0];
    if (revenueByDay[dayKey]) revenueByDay[dayKey] += b.totalFare;
    if (b.trip && b.trip.bus && b.trip.bus.busType) {
      bookingsByType[b.trip.bus.busType] = (bookingsByType[b.trip.bus.busType] || 0) + 1;
    }
  }
  
  // Buses with waitlist
  const waitlistTrips = await prisma.waitlistEntry.findMany({
    where: { status: 'WAITING' },
    select: { tripId: true, trip: { include: { bus: { select: { id: true, name: true, busNumber: true } } } } }
  });
  
  const busesWithWaitlist = [...new Set(waitlistTrips.map(w => w.trip.bus.id))].map(id => {
    const entry = waitlistTrips.find(w => w.trip.bus.id === id);
    return entry.trip.bus;
  });
  
  return {
    stats: { totalBuses, totalUsers, totalBookings, confirmedBookings, cancelledBookings, activeTrips, waitlistCount },
    revenue: revenueResult._sum.totalFare || 0,
    recentBookings,
    revenueByDay,
    bookingsByType,
    busesWithWaitlist
  };
}

async function getAllBuses() {
  return prisma.bus.findMany({ orderBy: { id: 'asc' } });
}

async function createBus(data) {
  const amenities = Array.isArray(data.amenities) ? data.amenities : JSON.parse(data.amenities || '[]');
  
  const bus = await prisma.bus.create({
    data: {
      busNumber: data.busNumber,
      name: data.name,
      operator: data.operator,
      fromCity: data.fromCity,
      toCity: data.toCity,
      departureTime: data.departureTime,
      arrivalTime: data.arrivalTime,
      durationMinutes: Number(data.durationMinutes),
      busType: data.busType,
      totalSeats: Number(data.totalSeats) || 40,
      baseFare: Number(data.baseFare),
      amenities: JSON.stringify(amenities),
      imageUri: data.imageUri || '',
      isActive: true
    }
  });
  
  // Create seats
  const seats = [];
  for (let s = 1; s <= (Number(data.totalSeats) || 40); s++) {
    const row = Math.ceil(s / 4);
    const col = ((s - 1) % 4) + 1;
    let seatType = 'AISLE';
    if (row >= 32 && row <= 35) seatType = 'LADIES';
    else if (col === 1 || col === 4) seatType = 'WINDOW';
    else if (row >= 36 && row <= 40) seatType = 'EXTRA_LEGROOM';
    seats.push({ busId: bus.id, seatNumber: s, seatType, isBlocked: false });
  }
  
  await prisma.seat.createMany({ data: seats });
  
  return bus;
}

async function updateBus(id, data) {
  const amenities = Array.isArray(data.amenities) ? data.amenities : (data.amenities ? JSON.parse(data.amenities) : null);
  
  const updateData = {};
  if (data.busNumber) updateData.busNumber = data.busNumber;
  if (data.name) updateData.name = data.name;
  if (data.operator) updateData.operator = data.operator;
  if (data.fromCity) updateData.fromCity = data.fromCity;
  if (data.toCity) updateData.toCity = data.toCity;
  if (data.departureTime) updateData.departureTime = data.departureTime;
  if (data.arrivalTime) updateData.arrivalTime = data.arrivalTime;
  if (data.durationMinutes) updateData.durationMinutes = Number(data.durationMinutes);
  if (data.busType) updateData.busType = data.busType;
  if (data.totalSeats) updateData.totalSeats = Number(data.totalSeats);
  if (data.baseFare) updateData.baseFare = Number(data.baseFare);
  if (amenities) updateData.amenities = JSON.stringify(amenities);
  if (data.imageUri !== undefined) updateData.imageUri = data.imageUri;
  if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
  
  const bus = await prisma.bus.update({ where: { id: Number(id) }, data: updateData });
  return bus;
}

async function deleteBus(id) {
  const busId = Number(id);
  
  // Check for future confirmed bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const trips = await prisma.trip.findMany({
    where: { busId, travelDate: { gte: today }, status: 'SCHEDULED' }
  });
  
  for (const trip of trips) {
    const bookings = await prisma.booking.count({
      where: { tripId: trip.id, status: 'CONFIRMED' }
    });
    if (bookings > 0) {
      throw new Error('Cannot delete bus with future confirmed bookings');
    }
  }
  
  await prisma.$transaction([
    prisma.waitlistEntry.deleteMany({ where: { trip: { busId } } }),
    prisma.booking.deleteMany({ where: { trip: { busId } } }),
    prisma.trip.deleteMany({ where: { busId } }),
    prisma.seat.deleteMany({ where: { busId } }),
    prisma.bus.delete({ where: { id: busId } })
  ]);
  
  return { success: true };
}

async function getAllTrips() {
  return prisma.trip.findMany({
    orderBy: { travelDate: 'desc' },
    include: { bus: true },
    take: 200
  });
}

async function createTrip(busId, travelDateStr) {
  const travelDate = new Date(travelDateStr);
  
  const existing = await prisma.trip.findUnique({
    where: { busId_travelDate: { busId: Number(busId), travelDate } }
  });
  
  if (existing) throw new Error('Trip already exists for this date');
  
  const trip = await prisma.trip.create({
    data: { busId: Number(busId), travelDate, status: 'SCHEDULED' },
    include: { bus: true }
  });
  
  return trip;
}

async function createTripsRange(busId, startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const created = [];
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    date.setHours(0, 0, 0, 0);
    try {
      const trip = await prisma.trip.create({
        data: { busId: Number(busId), travelDate: date, status: 'SCHEDULED' }
      });
      created.push(trip);
    } catch(e) {}
  }
  
  return { count: created.length };
}

async function cancelTrip(tripId) {
  return prisma.$transaction(async (tx) => {
    const trip = await tx.trip.findUnique({ where: { id: Number(tripId) }, include: { bus: true } });
    if (!trip) throw new Error('Trip not found');
    
    // Cancel confirmed bookings
    const bookings = await tx.booking.findMany({ where: { tripId: Number(tripId), status: 'CONFIRMED' } });
    for (const b of bookings) {
      await tx.booking.update({
        where: { id: b.id },
        data: { status: 'CANCELLED', paymentStatus: 'REFUNDED', cancelledAt: new Date() }
      });
    }
    
    // Cancel waitlist entries
    await tx.waitlistEntry.updateMany({
      where: { tripId: Number(tripId), status: 'WAITING' },
      data: { status: 'CANCELLED' }
    });
    
    // Update trip status
    await tx.trip.update({ where: { id: trip.id }, data: { status: 'CANCELLED' } });
    
    return { success: true, cancelledBookings: bookings.length };
  });
}

async function getAllBookings(filters = {}) {
  const where = {};
  
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    where.OR = [
      { bookingCode: { contains: filters.search } },
      { passengerName: { contains: filters.search } },
      { passengerPhone: { contains: filters.search } }
    ];
  }
  
  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { user: true, trip: { include: { bus: true } } },
    take: 100
  });
  
  return bookings;
}

async function cancelAdminBooking(bookingId, adminUserId) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: Number(bookingId) }, include: { trip: true } });
    if (!booking) throw new Error('Booking not found');
    if (booking.status === 'CANCELLED') throw new Error('Already cancelled');
    
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: 'CANCELLED', paymentStatus: 'REFUNDED', cancelledAt: new Date() }
    });
    
    // Promote waitlist
    const waitlist = await tx.waitlistEntry.findFirst({
      where: { tripId: booking.tripId, status: 'WAITING' },
      orderBy: { position: 'asc' }
    });
    
    if (waitlist) {
      const bus = await tx.bus.findUnique({ where: { id: booking.trip.busId } });
      const seats = await tx.seat.findMany({ where: { busId: bus.id, isBlocked: false } });
      const confirmedBookings = await tx.booking.findMany({
        where: { tripId: booking.tripId, status: 'CONFIRMED' },
        select: { seatNumbers: true }
      });
      
      const bookedSeats = [];
      for (const b of confirmedBookings) {
        try { bookedSeats.push(...JSON.parse(b.seatNumbers)); } catch(e) {}
      }
      
      const availableSeat = seats.find(s => !bookedSeats.includes(s.seatNumber));
      
      if (availableSeat) {
        const serviceFee = 50;
        const baseFare = bus.baseFare;
        await tx.booking.create({
          data: {
            bookingCode: generateBookingCode(),
            userId: waitlist.userId,
            tripId: booking.tripId,
            passengerName: 'Waitlist Promotion',
            passengerPhone: '',
            seatNumbers: JSON.stringify([availableSeat.seatNumber]),
            seatCount: 1,
            baseFare,
            serviceFee,
            totalFare: baseFare + serviceFee,
            status: 'CONFIRMED',
            paymentStatus: 'UNPAID'
          }
        });
        await tx.waitlistEntry.update({ where: { id: waitlist.id }, data: { status: 'PROMOTED' } });
      }
    }
    
    await tx.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'ADMIN_BOOKING_CANCELLED',
        entityType: 'Booking',
        entityId: booking.id,
        details: JSON.stringify({ bookingCode: booking.bookingCode })
      }
    });
    
    return { success: true };
  });
}

async function getAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      bookings: { select: { id: true, totalFare: true, status: true } }
    }
  });
  
  return users.map(u => ({
    ...u,
    totalBookings: u.bookings.length,
    confirmedBookings: u.bookings.filter(b => b.status === 'CONFIRMED').length,
    cancelledBookings: u.bookings.filter(b => b.status === 'CANCELLED').length,
    totalSpending: u.bookings.filter(b => b.status === 'CONFIRMED').reduce((sum, b) => sum + b.totalFare, 0),
    bookings: undefined
  }));
}

async function toggleUserStatus(id, adminId) {
  if (Number(id) === Number(adminId)) {
    throw new Error('Cannot deactivate your own account');
  }
  
  const user = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!user) throw new Error('User not found');
  
  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: { isActive: !user.isActive }
  });
  
  return updated;
}

async function getAllWaitlist() {
  return prisma.waitlistEntry.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true, trip: { include: { bus: true } } },
    take: 200
  });
}

async function promoteWaitlist(entryId) {
  return prisma.$transaction(async (tx) => {
    const entry = await tx.waitlistEntry.findUnique({ where: { id: Number(entryId) }, include: { trip: true } });
    if (!entry || entry.status !== 'WAITING') throw new Error('Invalid waitlist entry');
    
    const bus = await tx.bus.findUnique({ where: { id: entry.trip.busId } });
    const seats = await tx.seat.findMany({ where: { busId: bus.id, isBlocked: false } });
    
    const confirmedBookings = await tx.booking.findMany({
      where: { tripId: entry.tripId, status: 'CONFIRMED' },
      select: { seatNumbers: true }
    });
    
    const bookedSeats = [];
    for (const b of confirmedBookings) {
      try { bookedSeats.push(...JSON.parse(b.seatNumbers)); } catch(e) {}
    }
    
    const availableSeat = seats.find(s => !bookedSeats.includes(s.seatNumber));
    if (!availableSeat) throw new Error('No available seat to promote');
    
    const serviceFee = 50;
    const baseFare = bus.baseFare;
    
    await tx.booking.create({
      data: {
        bookingCode: generateBookingCode(),
        userId: entry.userId,
        tripId: entry.tripId,
        passengerName: 'Waitlist Promotion',
        passengerPhone: '',
        seatNumbers: JSON.stringify([availableSeat.seatNumber]),
        seatCount: 1,
        baseFare,
        serviceFee,
        totalFare: baseFare + serviceFee,
        status: 'CONFIRMED',
        paymentStatus: 'UNPAID'
      }
    });
    
    await tx.waitlistEntry.update({ where: { id: entry.id }, data: { status: 'PROMOTED' } });
    
    return { success: true, seatNumber: availableSeat.seatNumber };
  });
}

async function deleteWaitlistEntry(entryId) {
  await prisma.waitlistEntry.update({
    where: { id: Number(entryId) },
    data: { status: 'CANCELLED' }
  });
  return { success: true };
}

async function blockSeat(busId, seatNumbers) {
  const nums = Array.isArray(seatNumbers) ? seatNumbers : [Number(seatNumbers)];
  
  await prisma.seat.updateMany({
    where: { busId: Number(busId), seatNumber: { in: nums } },
    data: { isBlocked: true }
  });
  
  return { success: true };
}

async function unblockSeat(busId, seatNumber) {
  await prisma.seat.updateMany({
    where: { busId: Number(busId), seatNumber: Number(seatNumber) },
    data: { isBlocked: false }
  });
  
  return { success: true };
}

async function changeSeatType(busId, seatNumber, seatType) {
  await prisma.seat.updateMany({
    where: { busId: Number(busId), seatNumber: Number(seatNumber) },
    data: { seatType }
  });
  
  return { success: true };
}

async function getRevenue(fromStr, toStr) {
  const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 30 * 86400000);
  const to = toStr ? new Date(toStr) : new Date();
  
  const bookings = await prisma.booking.findMany({
    where: { status: 'CONFIRMED', paymentStatus: 'PAID', createdAt: { gte: from, lte: to } },
    include: { trip: { include: { bus: true } } }
  });
  
  const cancelledBookings = await prisma.booking.findMany({
    where: { status: 'CANCELLED', paymentStatus: 'REFUNDED', createdAt: { gte: from, lte: to } },
    select: { totalFare: true }
  });
  
  let totalRevenue = 0;
  const revenueByDay = {};
  const revenueByType = { REGULAR: 0, AC: 0, SLEEPER: 0 };
  const revenueByRoute = {};
  const busEarnings = {};
  
  for (const b of bookings) {
    totalRevenue += b.totalFare;
    
    const dayKey = b.createdAt.toISOString().split('T')[0];
    revenueByDay[dayKey] = (revenueByDay[dayKey] || 0) + b.totalFare;
    
    const busType = b.trip.bus.busType;
    revenueByType[busType] = (revenueByType[busType] || 0) + b.totalFare;
    
    const routeKey = `${b.trip.bus.fromCity} → ${b.trip.bus.toCity}`;
    revenueByRoute[routeKey] = (revenueByRoute[routeKey] || 0) + b.totalFare;
    
    busEarnings[b.trip.bus.id] = {
      name: b.trip.bus.name,
      busNumber: b.trip.bus.busNumber,
      earnings: (busEarnings[b.trip.bus.id]?.earnings || 0) + b.totalFare
    };
  }
  
  const topBuses = Object.values(busEarnings).sort((a, b) => b.earnings - a.earnings).slice(0, 5);
  const totalRefunded = cancelledBookings.reduce((sum, b) => sum + b.totalFare, 0);
  
  return { totalRevenue, revenueByDay, revenueByType, revenueByRoute, topBuses, totalRefunded };
}

async function getSettings() {
  let setting = await prisma.siteSetting.findFirst();
  if (!setting) {
    setting = await prisma.siteSetting.create({ data: {} });
  }
  return setting;
}

async function updateSettings(data) {
  let setting = await prisma.siteSetting.findFirst();
  
  if (!setting) {
    setting = await prisma.siteSetting.create({
      data: {
        siteName: data.siteName || 'BusBD',
        supportEmail: data.supportEmail || '',
        supportPhone: data.supportPhone || '',
        homepageBannerImageUri: data.homepageBannerImageUri || '',
        maintenanceMode: Boolean(data.maintenanceMode)
      }
    });
  } else {
    const updateData = {};
    if (data.siteName !== undefined) updateData.siteName = data.siteName;
    if (data.supportEmail !== undefined) updateData.supportEmail = data.supportEmail;
    if (data.supportPhone !== undefined) updateData.supportPhone = data.supportPhone;
    if (data.homepageBannerImageUri !== undefined) updateData.homepageBannerImageUri = data.homepageBannerImageUri;
    if (data.maintenanceMode !== undefined) updateData.maintenanceMode = Boolean(data.maintenanceMode);
    
    setting = await prisma.siteSetting.update({ where: { id: setting.id }, data: updateData });
  }
  
  return setting;
}

module.exports = {
  getDashboard, getAllBuses, createBus, updateBus, deleteBus,
  getAllTrips, createTrip, createTripsRange, cancelTrip,
  getAllBookings, cancelAdminBooking, getAllUsers, toggleUserStatus,
  getAllWaitlist, promoteWaitlist, deleteWaitlistEntry,
  blockSeat, unblockSeat, changeSeatType,
  getRevenue, getSettings, updateSettings
};
