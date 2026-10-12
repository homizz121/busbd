const prisma = require('../config/db');
const { generateBookingCode } = require('../utils/bookingCode');

async function createBooking(data) {
  const { userId, tripId, seatNumbers, passengerName, passengerPhone, paymentMethod } = data;
  
  return prisma.$transaction(async (tx) => {
    // Verify trip exists and is scheduled
    const trip = await tx.trip.findUnique({
      where: { id: Number(tripId) },
      include: { bus: true }
    });
    
    if (!trip || trip.status !== 'SCHEDULED') {
      throw new Error('Trip not found or not available');
    }
    
    const bus = trip.bus;
    
    // Verify seats
    const seatObjs = await tx.seat.findMany({
      where: { busId: bus.id, seatNumber: { in: seatNumbers } }
    });
    
    if (seatObjs.length !== seatNumbers.length) {
      throw new Error('Some selected seats do not exist');
    }
    
    for (const seat of seatObjs) {
      if (seat.isBlocked) {
        throw new Error(`Seat ${seat.seatNumber} is blocked`);
      }
    }
    
    // Check if seats are already booked in this trip
    const existingBookings = await tx.booking.findMany({
      where: { tripId: Number(tripId), status: 'CONFIRMED' },
      select: { seatNumbers: true }
    });
    
    const bookedSeats = [];
    for (const b of existingBookings) {
      try {
        const nums = JSON.parse(b.seatNumbers);
        bookedSeats.push(...nums);
      } catch(e) {}
    }
    
    for (const seatNum of seatNumbers) {
      if (bookedSeats.includes(seatNum)) {
        throw new Error(`Seat ${seatNum} is already booked`);
      }
    }
    
    // Check user hasn't booked same seats for this trip
    const userExisting = await tx.booking.findMany({
      where: { userId, tripId: Number(tripId), status: 'CONFIRMED' },
      select: { seatNumbers: true }
    });
    
    for (const b of userExisting) {
      try {
        const nums = JSON.parse(b.seatNumbers);
        for (const num of seatNumbers) {
          if (nums.includes(num)) {
            throw new Error('You have already booked this seat for this trip');
          }
        }
      } catch(e) {}
    }
    
    // Calculate fare
    const serviceFee = 50;
    const baseFare = bus.baseFare * seatNumbers.length;
    const totalFare = baseFare + serviceFee;
    
    const bookingCode = generateBookingCode();
    
    const booking = await tx.booking.create({
      data: {
        bookingCode,
        userId,
        tripId: Number(tripId),
        passengerName,
        passengerPhone,
        seatNumbers: JSON.stringify(seatNumbers),
        seatCount: seatNumbers.length,
        baseFare,
        serviceFee,
        totalFare,
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paymentMethod: paymentMethod || 'DEMO_BKASH'
      },
      include: { trip: { include: { bus: true } } }
    });
    
    // Audit log
    await tx.auditLog.create({
      data: {
        userId,
        action: 'BOOKING_CREATED',
        entityType: 'Booking',
        entityId: booking.id,
        details: JSON.stringify({ bookingCode, tripId, seatNumbers })
      }
    });
    
    return booking;
  });
}

async function getMyBookings(userId) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { trip: { include: { bus: true } } }
  });
  return bookings;
}

async function getBookingById(id, userId) {
  const booking = await prisma.booking.findFirst({
    where: { id: Number(id), userId },
    include: { trip: { include: { bus: true } } }
  });
  return booking;
}

async function cancelBooking(bookingId, userId) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: { id: Number(bookingId), userId },
      include: { trip: true }
    });
    
    if (!booking) throw new Error('Booking not found');
    if (booking.status === 'CANCELLED') throw new Error('Booking already cancelled');
    
    // Check travel date is in the future
    const now = new Date();
    if (booking.trip.travelDate < now) {
      throw new Error('Cannot cancel a past booking');
    }
    
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'REFUNDED',
        cancelledAt: new Date()
      }
    });
    
    // Try to promote waiting list
    const waitlist = await tx.waitlistEntry.findFirst({
      where: { tripId: booking.tripId, status: 'WAITING' },
      orderBy: { position: 'asc' }
    });
    
    if (waitlist) {
      const seats = await tx.seat.findMany({
        where: { busId: booking.trip.busId, isBlocked: false }
      });
      
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
        // Promote waitlist user
        const bus = await tx.bus.findUnique({ where: { id: booking.trip.busId } });
        const serviceFee = 50;
        const baseFare = bus.baseFare;
        const totalFare = baseFare + serviceFee;
        
        const newBookingCode = generateBookingCode();
        
        await tx.booking.create({
          data: {
            bookingCode: newBookingCode,
            userId: waitlist.userId,
            tripId: booking.tripId,
            passengerName: 'Waitlist Promotion',
            passengerPhone: '',
            seatNumbers: JSON.stringify([availableSeat.seatNumber]),
            seatCount: 1,
            baseFare,
            serviceFee,
            totalFare,
            status: 'CONFIRMED',
            paymentStatus: 'UNPAID',
            paymentMethod: null
          }
        });
        
        await tx.waitlistEntry.update({
          where: { id: waitlist.id },
          data: { status: 'PROMOTED' }
        });
      }
    }
    
    // Audit log
    await tx.auditLog.create({
      data: {
        userId,
        action: 'BOOKING_CANCELLED',
        entityType: 'Booking',
        entityId: booking.id,
        details: JSON.stringify({ bookingCode: booking.bookingCode })
      }
    });
    
    return { success: true };
  });
}

async function getTicket(bookingId, userId) {
  const booking = await prisma.booking.findFirst({
    where: { id: Number(bookingId), userId },
    include: { trip: { include: { bus: true } } }
  });
  return booking;
}

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking, getTicket };
