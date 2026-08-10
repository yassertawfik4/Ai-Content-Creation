export function maskEmail(email) {
  if (!email || !email.includes('@')) return email
  const [local, domain] = email.split('@')
  const head = local[0]
  const tail = local.length > 1 ? local[local.length - 1] : ''
  const stars = '*'.repeat(local.length > 3 ? Math.min(4, local.length - 2) : Math.max(1, local.length - (tail ? 2 : 1)))
  return `${head}${stars}${tail}@${domain}`
}