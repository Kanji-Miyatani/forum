import type { Access } from 'payload'

export const isSuperAdmin: Access = ({ req: { user } }) => {
  return Boolean(user?.roles?.includes('super-admin'))
}
