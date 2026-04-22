import type { CollectionConfig, Access, Where } from 'payload'
import { isSuperAdmin } from '../access/isSuperAdmin'

const userReadAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true
  if (user.roles?.includes('tenant-admin')) {
    const tenantId = typeof user.tenant === 'object'
      ? (user.tenant as { id: string }).id
      : user.tenant
    if (!tenantId) return false
    return { tenant: { equals: tenantId } } as Where
  }
  return { id: { equals: user.id } } as Where
}

const userCreateAccess: Access = ({ req: { user } }) => {
  if (!user) return true // 新規登録を許可
  return Boolean(user.roles?.includes('super-admin') || user.roles?.includes('tenant-admin'))
}

const userUpdateAccess: Access = ({ req: { user }, id }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true
  if (user.roles?.includes('tenant-admin')) {
    const tenantId = typeof user.tenant === 'object'
      ? (user.tenant as { id: string }).id
      : user.tenant
    if (!tenantId) return false
    return { tenant: { equals: tenantId } } as Where
  }
  return (user.id === id) as boolean
}

const userDeleteAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  return Boolean(
    user.roles?.includes('super-admin') || user.roles?.includes('tenant-admin'),
  )
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'ユーザー',
    plural: 'ユーザー一覧',
  },
  admin: {
    useAsTitle: 'email',
    description: 'フォーラムのユーザーを管理します。',
    group: 'ユーザー管理',
    defaultColumns: ['email', 'displayName', 'roles', 'tenant', 'updatedAt'],
  },
  auth: true,
  access: {
    read: userReadAccess,
    create: userCreateAccess,
    update: userUpdateAccess,
    delete: userDeleteAccess,
  },
  fields: [
    {
      name: 'displayName',
      label: '表示名',
      type: 'text',
      required: true,
      admin: {
        description: 'フォーラムで表示されるニックネーム',
      },
    },
    {
      name: 'roles',
      label: 'ロール',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'スーパー管理者', value: 'super-admin' },
        { label: 'テナント管理者', value: 'tenant-admin' },
        { label: 'テナントメンバー', value: 'tenant-member' },
      ],
      defaultValue: ['tenant-member'],
      access: {
        update: ({ req: { user } }) =>
          Boolean(user?.roles?.includes('super-admin')),
      },
      admin: {
        description: 'ユーザーの権限ロール（スーパー管理者のみ変更可能）',
      },
    },
    {
      name: 'tenant',
      label: '所属テナント',
      type: 'relationship',
      relationTo: 'tenants',
      hasMany: false,
      admin: {
        description: 'このユーザーが所属するテナント',
        condition: (data) => !data?.roles?.includes('super-admin'),
      },
    },
    {
      name: 'bio',
      label: '自己紹介',
      type: 'textarea',
      admin: {
        description: 'プロフィールの自己紹介文',
      },
    },
    {
      name: 'avatar',
      label: 'アバター',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'プロフィール画像',
      },
    },
  ],
  timestamps: true,
}
