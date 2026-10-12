const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const {
  getDashboard, getAllBuses, createBus, updateBus, deleteBus,
  getAllTrips, createTrip, createTripsRange, cancelTrip,
  getAllBookings, cancelBooking, getAllUsers, toggleUserStatus,
  getAllWaitlist, promoteWaitlist, deleteWaitlistEntry,
  blockSeat, unblockSeat, changeSeatType,
  getRevenue, getSettings, updateSettings
} = require('../controllers/adminController');

router.use(auth);
router.use(adminOnly);

// Dashboard
router.get('/dashboard', getDashboard);

// Buses
router.get('/buses', getAllBuses);
router.post('/buses', createBus);
router.put('/buses/:id', updateBus);
router.delete('/buses/:id', deleteBus);

// Trips
router.get('/trips', getAllTrips);
router.post('/trips', createTrip);
router.post('/trips/range', createTripsRange);
router.delete('/trips/:id', cancelTrip);

// Bookings
router.get('/bookings', getAllBookings);
router.delete('/bookings/:id', cancelBooking);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id/status', toggleUserStatus);

// Waitlist
router.get('/waitlist', getAllWaitlist);
router.post('/waitlist/:id/promote', promoteWaitlist);
router.delete('/waitlist/:id', deleteWaitlistEntry);

// Seats
router.post('/buses/:id/seats/block', blockSeat);
router.delete('/buses/:id/seats/block/:seatNumber', unblockSeat);
router.put('/buses/:id/seats/:seatNumber/type', changeSeatType);

// Revenue
router.get('/revenue', getRevenue);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

module.exports = router;
