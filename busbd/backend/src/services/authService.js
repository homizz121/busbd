const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

async function register(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error('Email already registered');
  }
  
  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: 'PASSENGER'
    }
  });
  
  const token = generateToken(user);
  return { user, token };
}

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  if (!user.isActive) {
    throw new Error('Account is deactivated. Contact support.');
  }
  
  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }
  
  const token = generateToken(user);
  return { user, token };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true }
  });
  return user;
}

module.exports = { register, login, getMe };
