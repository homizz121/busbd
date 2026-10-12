const express = require('express');
const router = express.Router();
const { z } = require('zod');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { register, login, me, logout } = require('../controllers/authController');

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^(\+880)?1[0-9]{9}$/, 'Invalid Bangladeshi phone number'),
  password: z.string().min(8).regex(/[A-Z]/, 'Must have uppercase').regex(/[a-z]/, 'Must have lowercase').regex(/[0-9]/, 'Must have a number')
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', auth, me);
router.post('/logout', auth, logout);

module.exports = router;
