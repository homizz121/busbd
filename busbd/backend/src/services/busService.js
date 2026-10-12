const prisma = require('../config/db');

async function getBuses(filters = {}) {
  const where = { isActive: true };
  
  if (filters.fromCity) where.fromCity = filters.fromCity;
  if (filters.toCity) where.toCity = filters.toCity;
  if (filters.busType) where.busType = filters.busType;
  if (filters.minPrice) where.baseFare = { gte: Number(filters.minPrice) };
  if (filters.maxPrice) where.baseFare = { lte: Number(filters.maxPrice) };
  if (filters.operator) where.operator = filters.operator;
  
  const buses = await prisma.bus.findMany({
    where,
    orderBy: { baseFare: 'asc' },
    include: {
      trips: {
        where: { status: 'SCHEDULED' },
        orderBy: { travelDate: 'asc' },
        take: 1
      }
    }
  });
  
  return buses;
}

async function getBusById(id) {
  const bus = await prisma.bus.findUnique({
    where: { id: Number(id) },
    include: {
      trips: {
        where: { status: 'SCHEDULED' },
        orderBy: { travelDate: 'asc' }
      },
      seats: true
    }
  });
  return bus;
}

async function getSeatMap(busId, dateStr) {
  const date = new Date(dateStr);
  
  const trip = await prisma.trip.findUnique({
    where: { busId_travelDate: { busId: Number(busId), travelDate: date } },
    include: { bookings: { where: { status: 'CONFIRMED' } } }
  });
  
  if (!trip) return null;
  
  const seats = await prisma.seat.findMany({
    where: { busId: Number(busId) },
    orderBy: { seatNumber: 'asc' }
  });
  
  const bookedSeats = [];
  for (const booking of trip.bookings) {
    try {
      const nums = JSON.parse(booking.seatNumbers);
      bookedSeats.push(...nums);
    } catch(e) {}
  }
  
  const seatMap = seats.map(seat => ({
    id: seat.id,
    seatNumber: seat.seatNumber,
    seatType: seat.seatType,
    isBlocked: seat.isBlocked,
    isBooked: bookedSeats.includes(seat.seatNumber),
    row: Math.ceil(seat.seatNumber / 4),
    col: ((seat.seatNumber - 1) % 4) + 1
  }));
  
  return { trip, seats: seatMap, bookedSeats };
}

async function getFilters() {
  const buses = await prisma.bus.findMany({ where: { isActive: true }, select: { operator: true, busType: true } });
  const operators = [...new Set(buses.map(b => b.operator))].filter(Boolean);
  const cities = ['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', "Cox's Bazar", 'Rangpur', 'Mymensingh', 'Barishal'];
  
  return { operators, cities, busTypes: ['REGULAR', 'AC', 'SLEEPER'] };
}

async function getPopularRoutes() {
  const routes = [
    { fromCity: 'Dhaka', toCity: 'Chattogram' },
    { fromCity: 'Dhaka', toCity: 'Sylhet' },
    { fromCity: 'Dhaka', toCity: 'Rajshahi' },
    { fromCity: 'Dhaka', toCity: 'Khulna' },
    { fromCity: 'Dhaka', toCity: "Cox's Bazar" },
    { fromCity: 'Dhaka', toCity: 'Rangpur' },
    { fromCity: 'Chattogram', toCity: "Cox's Bazar" },
    { fromCity: 'Sylhet', toCity: 'Dhaka' }
  ];
  
  const results = [];
  for (const route of routes) {
    const bus = await prisma.bus.findFirst({
      where: { isActive: true, fromCity: route.fromCity, toCity: route.toCity },
      orderBy: { baseFare: 'asc' }
    });
    if (bus) results.push(bus);
  }
  
  return results;
}

module.exports = { getBuses, getBusById, getSeatMap, getFilters, getPopularRoutes };
