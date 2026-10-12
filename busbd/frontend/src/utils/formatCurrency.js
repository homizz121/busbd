export function formatCurrency(amount) {
  return `Tk ${Number(amount).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
