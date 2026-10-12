const waitlistService = require('../services/waitlistService');
const { success, error } = require('../utils/apiResponse');

async function joinWaitlist(req, res, next) {
  try {
    const entry = await waitlistService.joinWaitlist(req.user.id, req.body.tripId);
    success(res, 'Joined waiting list successfully', { entry }, 201);
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

async function getMyWaitlist(req, res, next) {
  try {
    const entries = await waitlistService.getMyWaitlist(req.user.id);
    success(res, 'OK', { entries });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function getWaitlistByTrip(req, res, next) {
  try {
    const entries = await waitlistService.getWaitlistByTrip(req.params.tripId);
    success(res, 'OK', { entries });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function leaveWaitlist(req, res, next) {
  try {
    const result = await waitlistService.leaveWaitlist(req.params.id, req.user.id);
    success(res, 'Left waiting list', result);
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

module.exports = { joinWaitlist, getMyWaitlist, getWaitlistByTrip, leaveWaitlist };
