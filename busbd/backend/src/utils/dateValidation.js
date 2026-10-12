function isValidDate(dateStr) {
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}

function isFutureOrToday(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d >= today;
}

function isValidTime(timeStr) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(timeStr);
}

function isValidBangladeshiPhone(phone) {
  return /^(\+880)?1[0-9]{9}$/.test(phone.replace(/-/g, '').replace(/ /g, ''));
}

module.exports = { isValidDate, isFutureOrToday, isValidTime, isValidBangladeshiPhone };
