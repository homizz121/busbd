const authService = require('../services/authService');
const { success, error } = require('../utils/apiResponse');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    success(res, 'Registration successful', { user: result.user, token: result.token });
  } catch (err) {
    error(res, err.message, [], 400);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body.email, req.body.password);
    success(res, 'Login successful', { user: result.user, token: result.token });
  } catch (err) {
    error(res, err.message, [], 401);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getMe(req.user.id);
    if (!user) return error(res, 'User not found', [], 404);
    success(res, 'OK', { user });
  } catch (err) {
    error(res, err.message, [], 500);
  }
}

async function logout(req, res, next) {
  success(res, 'Logged out successfully');
}

module.exports = { register, login, me, logout };
