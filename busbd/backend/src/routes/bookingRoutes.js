const express = require('express');
const router = express.Router();
const { z } = require('zod');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createBooking, getMyBookings, getBookingById, cancelBooking, getTicket } = require('../controllers/bookingController');

const bookingSchema = z.object({
  tripId: z.number().int().positive(),
  seatNumbers: z.array(z.number().int().min(1).max(40)).min(1).max(4),
  passengerName: z.string().min(2).max(100),
  passengerPhone: z.string().regex(/^(\+880)?1[0-9]{9}$/, 'Invalid phone'),
  paymentMethod: z.enum(['DEMO_BKASH', 'DEMO_NAGAD', 'DEMO_CARD']).optional()
});

router.use(auth);
router.post('/', validate(bookingSchema), createBooking);
router.get('/my', getMyBookings);
router.get('/:id', getBookingById);
router.delete('/:id', cancelBooking);
router.get('/:id/ticket', getTicket);

module.exports = router;
