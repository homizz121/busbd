export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
export function validatePassword(password) {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must have an uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must have a lowercase letter'
  if (!/[0-9]/.test(password)) return 'Password must have a number'
  return null
}
export function validateBangladeshiPhone(phone) {
  return /^(\+880)?1[0-9]{9}$/.test(phone.replace(/-/g, '').replace(/ /g, ''))
}
export function validateName(name) {
  return name.trim().length >= 2
}
