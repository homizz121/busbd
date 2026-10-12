export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })
}
export function formatDateShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-BD', { month: 'short', day: 'numeric', year: 'numeric' })
}
