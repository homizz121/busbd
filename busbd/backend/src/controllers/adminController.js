const adminService = require('../services/adminService');
const { success, error } = require('../utils/apiResponse');

async function getDashboard(req, res, next) {
  try {
    const data = await adminService.getDashboard();
    success(res, 'OK', data);
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

// Bus management
async function getAllBuses(req, res, next) {
  try {
    const buses = await adminService.getAllBuses();
    success(res, 'OK', { buses });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function createBus(req, res, next) {
  try {
    const bus = await adminService.createBus(req.body);
    success(res, 'Bus created successfully', { bus }, 201);
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

async function updateBus(req, res, next) {
  try {
    const bus = await adminService.updateBus(req.params.id, req.body);
    success(res, 'Bus updated successfully', { bus });
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

async function deleteBus(req, res, next) {
  try {
    const result = await adminService.deleteBus(req.params.id);
    success(res, 'Bus deleted successfully', result);
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

// Trip management
async function getAllTrips(req, res, next) {
  try {
    const trips = await adminService.getAllTrips();
    success(res, 'OK', { trips });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function createTrip(req, res, next) {
  try {
    const trip = await adminService.createTrip(req.body.busId, req.body.travelDate);
    success(res, 'Trip created successfully', { trip }, 201);
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

async function createTripsRange(req, res, next) {
  try {
    const result = await adminService.createTripsRange(req.body.busId, req.body.startDate, req.body.endDate);
    success(res, `Created ${result.count} trips`, result);
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

async function cancelTrip(req, res, next) {
  try {
    const result = await adminService.cancelTrip(req.params.id);
    success(res, 'Trip cancelled', result);
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

// Booking management
async function getAllBookings(req, res, next) {
  try {
    const bookings = await adminService.getAllBookings(req.query);
    success(res, 'OK', { bookings });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const result = await adminService.cancelAdminBooking(req.params.id, req.user.id);
    success(res, 'Booking cancelled', result);
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

// User management
async function getAllUsers(req, res, next) {
  try {
    const users = await adminService.getAllUsers();
    success(res, 'OK', { users });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function toggleUserStatus(req, res, next) {
  try {
    const user = await adminService.toggleUserStatus(req.params.id, req.user.id);
    success(res, 'User status updated', { user });
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

// Waitlist management
async function getAllWaitlist(req, res, next) {
  try {
    const entries = await adminService.getAllWaitlist();
    success(res, 'OK', { entries });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function promoteWaitlist(req, res, next) {
  try {
    const result = await adminService.promoteWaitlist(req.params.id);
    success(res, 'Passenger promoted successfully', result);
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

async function deleteWaitlistEntry(req, res, next) {
  try {
    const result = await adminService.deleteWaitlistEntry(req.params.id);
    success(res, 'Waitlist entry removed', result);
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

// Seat management
async function blockSeat(req, res, next) {
  try {
    const result = await adminService.blockSeat(req.params.id, req.body.seatNumbers);
    success(res, 'Seats blocked', result);
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

async function unblockSeat(req, res, next) {
  try {
    const result = await adminService.unblockSeat(req.params.id, req.params.seatNumber);
    success(res, 'Seat unblocked', result);
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

async function changeSeatType(req, res, next) {
  try {
    const result = await adminService.changeSeatType(req.params.id, req.params.seatNumber, req.body.seatType);
    success(res, 'Seat type updated', result);
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

// Revenue
async function getRevenue(req, res, next) {
  try {
    const data = await adminService.getRevenue(req.query.from, req.query.to);
    success(res, 'OK', data);
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

// Settings
async function getSettings(req, res, next) {
  try {
    const settings = await adminService.getSettings();
    success(res, 'OK', { settings });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function updateSettings(req, res, next) {
  try {
    const settings = await adminService.updateSettings(req.body);
    success(res, 'Settings updated', { settings });
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

module.exports = {
  getDashboard, getAllBuses, createBus, updateBus, deleteBus,
  getAllTrips, createTrip, createTripsRange, cancelTrip,
  getAllBookings, cancelBooking, getAllUsers, toggleUserStatus,
  getAllWaitlist, promoteWaitlist, deleteWaitlistEntry,
  blockSeat, unblockSeat, changeSeatType,
  getRevenue, getSettings, updateSettings
};
