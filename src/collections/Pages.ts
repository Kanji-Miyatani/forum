import type { CollectionConfig, Access, Where } from 'payload'
import { tenantWriteAccess, tenantDeleteAccess } from '../access/tenantAccess'

const readAccess: Access = ({ req: { user } }) => {
  if (!user) return { status: { equals: 'published' } } as Where
  if (user.roles?.includes('super-admin')) return true
  const tenantId = typeof user.tenant === 'object'
    ? (user.tenant as { id: number }).id
    : user.tenant
  if (!tenantId) return false
  return { tenant: { equals: tenantId } } as Where
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'ページ',
    plural: 'ページ一覧',
  },
  admin: {
    useAsTitle: 'title',
    description: 'ホーム・会社概要・お問い合わせなどの固定ページを管理します。',
    group: 'コンテンツ',
    defaultColumns: ['title', 'slug', 'status', 'tenant', 'updatedAt'],
    preview: (doc) => {
      if (!doc?.id) return null
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      return `${serverUrl}/api/pages/${doc.id}`
    },
  },
  versions: {
    drafts: {
      autosave: { interval: 375 },
    },
  },
  access: {
    read: readAccess,
    create: tenantWriteAccess,
    update: tenantWriteAccess,
    delete: tenantDeleteAccess,
  },
  fields: [
    {
      name: 'title',
      label: 'ページタイトル',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      label: 'スラッグ',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URLに使用する識別子（例: about, contact）',
      },
    },
    {
      name: 'content',
      label: 'コンテンツ',
      type: 'richText',
      localized: true,
      required: true,
    },
    {
      name: 'status',
      label: 'ステータス',
      type: 'select',
      options: [
        { label: '下書き', value: 'draft' },
        { label: '公開', value: 'published' },
        { label: '非公開', value: 'archived' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'seo',
      label: 'SEO設定',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          label: 'メタタイトル',
          type: 'text',
          localized: true,
        },
        {
          name: 'metaDescription',
          label: 'メタディスクリプション',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'ogImage',
          label: 'OGP画像',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'tenant',
      label: 'サイト',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
