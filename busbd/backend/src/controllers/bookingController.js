const bookingService = require('../services/bookingService');
const { success, error } = require('../utils/apiResponse');

async function createBooking(req, res, next) {
  try {
    const data = { ...req.body, userId: req.user.id };
    const booking = await bookingService.createBooking(data);
    success(res, 'Booking confirmed successfully', { booking }, 201);
  } catch (err) {
    const status = err.message.includes('already booked') || err.message.includes('not available') ? 409 : 400;
    error(res, err.message, [], status);
  }
}

async function getMyBookings(req, res, next) {
  try {
    const bookings = await bookingService.getMyBookings(req.user.id);
    success(res, 'OK', { bookings });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function getBookingById(req, res, next) {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user.id);
    if (!booking) return error(res, 'Booking not found', [], 404);
    success(res, 'OK', { booking });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function cancelBooking(req, res, next) {
  try {
    const result = await bookingService.cancelBooking(req.params.id, req.user.id);
    success(res, 'Booking cancelled successfully', result);
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

async function getTicket(req, res, next) {
  try {
    const booking = await bookingService.getTicket(req.params.id, req.user.id);
    if (!booking) return error(res, 'Booking not found', [], 404);
    success(res, 'OK', { booking });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking, getTicket };
