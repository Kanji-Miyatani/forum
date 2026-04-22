import type { CollectionConfig, Access, Where } from 'payload'
import { tenantWriteAccess, tenantDeleteAccess } from '../access/tenantAccess'

const readAccess: Access = ({ req: { user } }) => {
  if (!user) return true
  if (user.roles?.includes('super-admin')) return true
  const tenantId = typeof user.tenant === 'object'
    ? (user.tenant as { id: number }).id
    : user.tenant
  if (!tenantId) return false
  return { tenant: { equals: tenantId } } as Where
}

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: 'カテゴリー',
    plural: 'カテゴリー一覧',
  },
  admin: {
    useAsTitle: 'name',
    description: '記事のカテゴリーを管理します。',
    group: 'コンテンツ',
    defaultColumns: ['name', 'slug', 'tenant', 'updatedAt'],
  },
  access: {
    read: readAccess,
    create: tenantWriteAccess,
    update: tenantWriteAccess,
    delete: tenantDeleteAccess,
  },
  fields: [
    {
      name: 'name',
      label: 'カテゴリー名',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      label: 'スラッグ',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'URLに使用する識別子（英数字・ハイフンのみ）',
      },
    },
    {
      name: 'description',
      label: '説明',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'tenant',
      label: 'サイト',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'sortOrder',
      label: '表示順',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
