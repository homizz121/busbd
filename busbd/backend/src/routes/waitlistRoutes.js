const express = require('express');
const router = express.Router();
const { z } = require('zod');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { joinWaitlist, getMyWaitlist, getWaitlistByTrip, leaveWaitlist } = require('../controllers/waitlistController');

const waitlistSchema = z.object({
  tripId: z.number().int().positive()
});

router.use(auth);
router.post('/', validate(waitlistSchema), joinWaitlist);
router.get('/my', getMyWaitlist);
router.get('/:tripId', getWaitlistByTrip);
router.delete('/:id', leaveWaitlist);

module.exports = router;
