const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const CITIES = [
  'Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna',
  "Cox's Bazar", 'Rangpur', 'Mymensingh', 'Barishal'
];

const AMENITIES = {
  REGULAR: ['Water', 'Charging Port'],
  AC: ['AC', 'Wi-Fi', 'Charging Port', 'Water', 'Blanket', 'CCTV'],
  SLEEPER: ['AC', 'Wi-Fi', 'Charging Port', 'Water', 'Blanket', 'CCTV', 'Extra Legroom']
};

const BUS_IMAGES = [
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
  'https://images.unsplash.com/photo-1570125909232-eb768e963888?w=800&q=80',
  'https://images.unsplash.com/photo-1474487548411-1a8eaa67d6b2?w=800&q=80',
  'https://images.unsplash.com/photo-1425982360923-414e8f8da960?w=800&q=80',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80',
  'https://images.unsplash.com/photo-1570125909232-eb768e963888?w=800&q=80'
];

const BUSES = [
  { busNumber: 'BD-101', name: 'Green Line Express', operator: 'Green Line Coach', fromCity: 'Dhaka', toCity: 'Chattogram', departureTime: '06:00', arrivalTime: '14:30', durationMinutes: 510, busType: 'AC', baseFare: 1200 },
  { busNumber: 'BD-102', name: 'Red Star Super', operator: 'Red Star Bus', fromCity: 'Dhaka', toCity: 'Sylhet', departureTime: '07:30', arrivalTime: '15:00', durationMinutes: 450, busType: 'AC', baseFare: 1000 },
  { busNumber: 'BD-103', name: 'Blue Bird Regular', operator: 'Blue Bird Transport', fromCity: 'Dhaka', toCity: 'Rajshahi', departureTime: '08:00', arrivalTime: '14:00', durationMinutes: 360, busType: 'REGULAR', baseFare: 500 },
  { busNumber: 'BD-104', name: 'Golden Crown AC', operator: 'Golden Crown Coach', fromCity: 'Dhaka', toCity: 'Khulna', departureTime: '09:00', arrivalTime: '15:30', durationMinutes: 390, busType: 'AC', baseFare: 900 },
  { busNumber: 'BD-105', name: 'Coastal Cruiser', operator: 'Coastal Bus Lines', fromCity: 'Dhaka', toCity: "Cox's Bazar", departureTime: '22:00', arrivalTime: '07:00', durationMinutes: 540, busType: 'SLEEPER', baseFare: 1800 },
  { busNumber: 'BD-106', name: 'Northern Express', operator: 'Northern Star Bus', fromCity: 'Dhaka', toCity: 'Rangpur', departureTime: '05:30', arrivalTime: '12:00', durationMinutes: 390, busType: 'REGULAR', baseFare: 600 },
  { busNumber: 'BD-107', name: 'Mymensingh Flyer', operator: 'Flyer Bus Co.', fromCity: 'Dhaka', toCity: 'Mymensingh', departureTime: '10:00', arrivalTime: '14:30', durationMinutes: 270, busType: 'REGULAR', baseFare: 500 },
  { busNumber: 'BD-108', name: 'Barishal Express AC', operator: 'Southern Coach', fromCity: 'Dhaka', toCity: 'Barishal', departureTime: '11:00', arrivalTime: '17:30', durationMinutes: 390, busType: 'AC', baseFare: 850 },
  { busNumber: 'BD-109', name: 'Chattogram Local AC', operator: 'Seaside Express', fromCity: 'Chattogram', toCity: "Cox's Bazar", departureTime: '07:00', arrivalTime: '13:00', durationMinutes: 360, busType: 'AC', baseFare: 800 },
  { busNumber: 'BD-110', name: 'Sylhet Return AC', operator: 'Red Star Bus', fromCity: 'Sylhet', toCity: 'Dhaka', departureTime: '16:00', arrivalTime: '23:30', durationMinutes: 450, busType: 'AC', baseFare: 1000 },
  { busNumber: 'BD-111', name: 'Rajshahi Return', operator: 'Blue Bird Transport', fromCity: 'Rajshahi', toCity: 'Dhaka', departureTime: '14:00', arrivalTime: '20:00', durationMinutes: 360, busType: 'REGULAR', baseFare: 550 },
  { busNumber: 'BD-112', name: 'Khulna Return AC', operator: 'Golden Crown Coach', fromCity: 'Khulna', toCity: 'Dhaka', departureTime: '15:00', arrivalTime: '21:30', durationMinutes: 390, busType: 'AC', baseFare: 950 },
  { busNumber: 'BD-113', name: 'Bazar Return Sleeper', operator: 'Coastal Bus Lines', fromCity: "Cox's Bazar", toCity: 'Dhaka', departureTime: '18:00', arrivalTime: '03:00', durationMinutes: 540, busType: 'SLEEPER', baseFare: 2000 },
  { busNumber: 'BD-114', name: 'Mymensingh Return', operator: 'Flyer Bus Co.', fromCity: 'Mymensingh', toCity: 'Dhaka', departureTime: '16:00', arrivalTime: '20:30', durationMinutes: 270, busType: 'REGULAR', baseFare: 550 },
  { busNumber: 'BD-115', name: 'Barishal Return AC', operator: 'Southern Coach', fromCity: 'Barishal', toCity: 'Dhaka', departureTime: '17:00', arrivalTime: '23:30', durationMinutes: 390, busType: 'AC', baseFare: 900 },
  { busNumber: 'BD-116', name: 'Dhaka-Chattogram Sleeper', operator: 'Green Line Coach', fromCity: 'Dhaka', toCity: 'Chattogram', departureTime: '21:00', arrivalTime: '05:30', durationMinutes: 510, busType: 'SLEEPER', baseFare: 2200 },
  { busNumber: 'BD-117', name: 'Dhaka-Sylhet Sleeper', operator: 'Northern Star Bus', fromCity: 'Dhaka', toCity: 'Sylhet', departureTime: '23:00', arrivalTime: '06:30', durationMinutes: 450, busType: 'SLEEPER', baseFare: 1500 },
];

function getSeatType(row, col) {
  if (row >= 32 && row <= 35) return 'LADIES';
  if (col === 1 || col === 4) return 'WINDOW';
  if (row >= 36 && row <= 40) return 'EXTRA_LEGROOM';
  return 'AISLE';
}

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.waitlistEntry.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteSetting.deleteMany();

  // Create admin user
  const adminHash = await bcrypt.hash('Admin@12345', 10);
  const passengerHash = await bcrypt.hash('Passenger@12345', 10);

  await prisma.user.create({
    data: {
      name: 'BusBD Admin',
      email: 'admin@busbd.com',
      phone: '+8801700000001',
      passwordHash: adminHash,
      role: 'ADMIN'
    }
  });

  await prisma.user.create({
    data: {
      name: 'Demo Passenger',
      email: 'passenger@busbd.com',
      phone: '+8801700000002',
      passwordHash: passengerHash,
      role: 'PASSENGER'
    }
  });

  // Create site settings
  await prisma.siteSetting.create({
    data: {
      siteName: 'BusBD',
      supportEmail: 'support@busbd.com',
      supportPhone: '+8801700000000',
      homepageBannerImageUri: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80',
      maintenanceMode: false
    }
  });

  // Create buses and seats
  const busIds = [];
  for (let i = 0; i < BUSES.length; i++) {
    const busData = BUSES[i];
    const amenities = AMENITIES[busData.busType] || AMENITIES.REGULAR;

    const bus = await prisma.bus.create({
      data: {
        busNumber: busData.busNumber,
        name: busData.name,
        operator: busData.operator,
        fromCity: busData.fromCity,
        toCity: busData.toCity,
        departureTime: busData.departureTime,
        arrivalTime: busData.arrivalTime,
        durationMinutes: busData.durationMinutes,
        busType: busData.busType,
        totalSeats: 40,
        baseFare: busData.baseFare,
        amenities: JSON.stringify(amenities),
        imageUri: BUS_IMAGES[i % BUS_IMAGES.length],
        isActive: true
      }
    });
    busIds.push(bus.id);

    // Create 40 seats for each bus
    const seats = [];
    for (let s = 1; s <= 40; s++) {
      const row = Math.ceil(s / 4);
      const col = ((s - 1) % 4) + 1;
      seats.push({
        busId: bus.id,
        seatNumber: s,
        seatType: getSeatType(row, col),
        isBlocked: false
      });
    }
    await prisma.seat.createMany({ data: seats });
  }

  // Create trips for next 14 days
  const today = new Date();
  for (let d = 0; d < 14; d++) {
    const travelDate = new Date(today);
    travelDate.setDate(today.getDate() + d);
    travelDate.setHours(0, 0, 0, 0);

    for (const busId of busIds) {
      try {
        await prisma.trip.create({
          data: {
            busId,
            travelDate,
            status: 'SCHEDULED'
          }
        });
      } catch (e) {
        // Skip if already exists
      }
    }
  }

  console.log('Seeding complete!');
  console.log(`Created ${BUSES.length} buses, ${busIds.length * 40} seats, ${busIds.length * 14} trips`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
