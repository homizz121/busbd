export function getSeatLayout(totalSeats = 40) {
  const rows = []
  for (let r = 1; r <= Math.ceil(totalSeats / 4); r++) {
    const row = []
    for (let c = 1; c <= 4; c++) {
      const seatNum = (r - 1) * 4 + c
      if (seatNum <= totalSeats) row.push(seatNum)
    }
    rows.push(row)
  }
  return rows
}

export function getSeatColor(seat, selectedSeats) {
  if (seat.isBooked) return 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
  if (seat.isBlocked) return 'bg-red-200 dark:bg-red-900 cursor-not-allowed'
  if (selectedSeats.includes(seat.seatNumber)) return 'bg-green-500 text-white ring-2 ring-green-300'
  if (seat.seatType === 'LADIES') return 'bg-pink-100 dark:bg-pink-900 border-pink-300 hover:bg-pink-200'
  if (seat.seatType === 'WINDOW') return 'bg-blue-100 dark:bg-blue-900 border-blue-300 hover:bg-blue-200'
  if (seat.seatType === 'EXTRA_LEGROOM') return 'bg-purple-100 dark:bg-purple-900 border-purple-300 hover:bg-purple-200'
  return 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-500 hover:bg-green-100 dark:hover:bg-green-900'
}

export function getSeatTypeIcon(type) {
  switch (type) {
    case 'WINDOW': return '🪟'
    case 'LADIES': return '👩'
    case 'EXTRA_LEGROOM': return '📐'
    default: return ''
  }
}
