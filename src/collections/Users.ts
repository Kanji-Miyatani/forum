import type { CollectionConfig, Access, Where } from 'payload'
import { isSuperAdmin } from '../access/isSuperAdmin'

const readAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true
  if (user.roles?.includes('tenant-admin')) {
    const tenantId = user.tenant !== null && typeof user.tenant === 'object'
      ? (user.tenant as { id: number }).id
      : user.tenant
    if (!tenantId) return false
    return { tenant: { equals: tenantId } } as Where
  }
  return { id: { equals: (user as any).id } } as Where
}

const updateAccess: Access = ({ req: { user }, id }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true
  if (user.roles?.includes('tenant-admin')) {
    const tenantId = user.tenant !== null && typeof user.tenant === 'object'
      ? (user.tenant as { id: number }).id
      : user.tenant
    if (!tenantId) return false
    return { tenant: { equals: tenantId } } as Where
  }
  return ((user as any).id === id) as boolean
}

const deleteAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  return Boolean(
    user.roles?.includes('super-admin') || user.roles?.includes('tenant-admin'),
  )
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: '管理ユーザー',
    plural: '管理ユーザー一覧',
  },
  admin: {
    useAsTitle: 'email',
    description: 'CMSの管理ユーザーを管理します。',
    group: 'システム設定',
    defaultColumns: ['email', 'name', 'roles', 'tenant', 'updatedAt'],
  },
  auth: true,
  access: {
    read: readAccess,
    create: isSuperAdmin,
    update: updateAccess,
    delete: deleteAccess,
  },
  fields: [
    {
      name: 'name',
      label: '氏名',
      type: 'text',
      required: true,
    },
    {
      name: 'roles',
      label: 'ロール',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'スーパー管理者', value: 'super-admin' },
        { label: 'サイト管理者', value: 'tenant-admin' },
        { label: '編集者', value: 'tenant-member' },
      ],
      defaultValue: ['tenant-member'],
      access: {
        update: ({ req: { user } }) => Boolean(user?.roles?.includes('super-admin')),
      },
      admin: {
        description: 'スーパー管理者のみ変更可能',
      },
    },
    {
      name: 'tenant',
      label: '担当サイト',
      type: 'relationship',
      relationTo: 'tenants',
      hasMany: false,
      admin: {
        description: 'このユーザーが管理するサイト',
        condition: (data) => !data?.roles?.includes('super-admin'),
      },
    },
    {
      name: 'avatar',
      label: 'アバター',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ operation, data, req }) => {
        if (operation === 'create') {
          const count = await req.payload.count({ collection: 'users', overrideAccess: true })
          if (count.totalDocs === 0) {
            return { ...data, roles: ['super-admin'] }
          }
        }
        return data
      },
    ],
  },
  timestamps: true,
}
