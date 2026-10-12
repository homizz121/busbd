const express = require('express');
const router = express.Router();
const { getBuses, getFilters, getBusById, getSeats, getPopularRoutes } = require('../controllers/busController');

router.get('/', getBuses);
router.get('/filters', getFilters);
router.get('/popular-routes', getPopularRoutes);
router.get('/:id', getBusById);
router.get('/:id/seats', getSeats);

module.exports = router;
