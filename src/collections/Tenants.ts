import type { CollectionConfig, Access, Where } from 'payload'
import { isSuperAdmin } from '../access/isSuperAdmin'

const readAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true
  const tenantId = user.tenant !== null && typeof user.tenant === 'object'
    ? (user.tenant as { id: number }).id
    : user.tenant
  if (!tenantId) return false
  return { id: { equals: tenantId } } as Where
}

const updateAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true
  if (user.roles?.includes('tenant-admin')) {
    const tenantId = user.tenant !== null && typeof user.tenant === 'object'
      ? (user.tenant as { id: number }).id
      : user.tenant
    if (!tenantId) return false
    return { id: { equals: tenantId } } as Where
  }
  return false
}

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  labels: {
    singular: 'サイト',
    plural: 'サイト一覧',
  },
  admin: {
    useAsTitle: 'name',
    description: '管理対象のWebサイトを管理します。',
    group: 'システム設定',
  },
  access: {
    read: readAccess,
    create: isSuperAdmin,
    update: updateAccess,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'name',
      label: 'サイト名',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'スラッグ',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: '英数字・ハイフンのみ（例: my-site）',
      },
      validate: (val: string | null | undefined) => {
        if (!val) return 'スラッグは必須です'
        if (!/^[a-z0-9-]+$/.test(val)) return '英小文字・数字・ハイフンのみ使用できます'
        return true
      },
    },
    {
      name: 'description',
      label: '説明',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'domain',
      label: 'ドメイン',
      type: 'text',
      admin: {
        description: '公開サイトのドメイン（例: www.example.com）',
      },
    },
    {
      name: 'isActive',
      label: '有効',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
