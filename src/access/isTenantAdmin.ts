import type { Access } from 'payload'

export const isTenantAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true
  return Boolean(user.roles?.includes('tenant-admin'))
}
