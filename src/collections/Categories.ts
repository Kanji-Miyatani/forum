import type { CollectionConfig, Access, Where } from 'payload'
import { tenantWriteAccess, tenantDeleteAccess } from '../access/tenantAccess'

const categoryReadAccess: Access = ({ req: { user } }) => {
  if (!user) return true // 公開カテゴリーは未ログインでも閲覧可能
  if (user.roles?.includes('super-admin')) return true
  const tenantId = typeof user.tenant === 'object'
    ? (user.tenant as { id: string }).id
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
    description: '投稿のカテゴリーを管理します。',
    group: 'コンテンツ管理',
    defaultColumns: ['name', 'slug', 'tenant', 'updatedAt'],
  },
  access: {
    read: categoryReadAccess,
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
      admin: {
        description: 'カテゴリーの表示名（多言語対応）',
      },
    },
    {
      name: 'slug',
      label: 'スラッグ',
      type: 'text',
      required: true,
      admin: {
        description: 'URLで使用する識別子（英数字・ハイフンのみ）',
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
      label: '所属テナント',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'このカテゴリーが属するテナント',
      },
    },
    {
      name: 'sortOrder',
      label: '表示順',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: '数値が小さいほど先に表示されます',
      },
    },
  ],
  timestamps: true,
}
