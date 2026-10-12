const busService = require('../services/busService');
const { success, error } = require('../utils/apiResponse');

async function getBuses(req, res, next) {
  try {
    const buses = await busService.getBuses(req.query);
    success(res, 'OK', { buses });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function getFilters(req, res, next) {
  try {
    const filters = await busService.getFilters();
    success(res, 'OK', filters);
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function getBusById(req, res, next) {
  try {
    const bus = await busService.getBusById(req.params.id);
    if (!bus) return error(res, 'Bus not found', [], 404);
    success(res, 'OK', { bus });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function getSeats(req, res, next) {
  try {
    const dateStr = req.query.date;
    if (!dateStr) return error(res, 'Date parameter is required', [], 400);
    
    const result = await busService.getSeatMap(req.params.id, dateStr);
    if (!result) return error(res, 'No trip found for this date', [], 404);
    success(res, 'OK', result);
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function getPopularRoutes(req, res, next) {
  try {
    const routes = await busService.getPopularRoutes();
    success(res, 'OK', { routes });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

module.exports = { getBuses, getFilters, getBusById, getSeats, getPopularRoutes };
