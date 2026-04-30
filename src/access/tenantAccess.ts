import type { Access, Where } from 'payload'

export const tenantReadAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true
  const tenantId = user.tenant !== null && typeof user.tenant === 'object'
    ? (user.tenant as { id: number }).id
    : user.tenant
  if (!tenantId) return false
  return { tenant: { equals: tenantId } } as Where
}

export const tenantWriteAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true
  const tenantId = user.tenant !== null && typeof user.tenant === 'object'
    ? (user.tenant as { id: number }).id
    : user.tenant
  if (!tenantId) return false
  if (user.roles?.includes('tenant-admin') || user.roles?.includes('tenant-member')) {
    return { tenant: { equals: tenantId } } as Where
  }
  return false
}

export const tenantDeleteAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true
  const tenantId = user.tenant !== null && typeof user.tenant === 'object'
    ? (user.tenant as { id: number }).id
    : user.tenant
  if (!tenantId) return false
  if (user.roles?.includes('tenant-admin')) {
    return { tenant: { equals: tenantId } } as Where
  }
  return false
}
