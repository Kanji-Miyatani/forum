import type { CollectionConfig, Access, Where } from 'payload'
import { tenantWriteAccess, tenantDeleteAccess } from '../access/tenantAccess'

const readAccess: Access = ({ req: { user } }) => {
  if (!user) return { status: { equals: 'published' } } as Where
  if (user.roles?.includes('super-admin')) return true
  const tenantId = user.tenant !== null && typeof user.tenant === 'object'
    ? (user.tenant as { id: number }).id
    : user.tenant
  if (!tenantId) return false
  return { tenant: { equals: tenantId } } as Where
}

const updateAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true
  const tenantId = user.tenant !== null && typeof user.tenant === 'object'
    ? (user.tenant as { id: number }).id
    : user.tenant
  if (!tenantId) return false
  if (user.roles?.includes('tenant-admin')) {
    return { tenant: { equals: tenantId } } as Where
  }
  return {
    and: [
      { tenant: { equals: tenantId } },
      { author: { equals: (user as any).id } },
    ],
  } as Where
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: '記事',
    plural: '記事一覧',
  },
  admin: {
    useAsTitle: 'title',
    description: 'ニュース・お知らせ・ブログ記事などのコンテンツを管理します。',
    group: 'コンテンツ',
    defaultColumns: ['title', 'category', 'status', 'publishedAt', 'tenant'],
    preview: (doc) => {
      if (!doc?.id) return null
      const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      return `${serverUrl}/api/articles/${doc.id}`
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
    update: updateAccess,
    delete: tenantDeleteAccess,
  },
  fields: [
    {
      name: 'title',
      label: 'タイトル',
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
        description: 'URLに使用する識別子（英数字・ハイフンのみ）',
      },
    },
    {
      name: 'excerpt',
      label: '概要',
      type: 'textarea',
      localized: true,
      admin: {
        description: '一覧・OGPなどに使用する短い説明文',
      },
    },
    {
      name: 'content',
      label: '本文',
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
        { label: 'レビュー中', value: 'review' },
        { label: '公開', value: 'published' },
        { label: 'アーカイブ', value: 'archived' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      label: '公開日時',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'yyyy/MM/dd HH:mm',
        },
      },
    },
    {
      name: 'featuredImage',
      label: 'アイキャッチ画像',
      type: 'upload',
      relationTo: 'media',
      admin: { position: 'sidebar' },
    },
    {
      name: 'category',
      label: 'カテゴリー',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'tags',
      label: 'タグ',
      type: 'array',
      admin: { position: 'sidebar' },
      fields: [
        {
          name: 'tag',
          label: 'タグ',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'isFeatured',
      label: 'トップ掲載',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'ホームページのトップに表示します',
      },
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
          admin: { description: '空欄の場合は記事タイトルを使用' },
        },
        {
          name: 'metaDescription',
          label: 'メタディスクリプション',
          type: 'textarea',
          localized: true,
          admin: { description: '空欄の場合は概要を使用（推奨: 120〜160文字）' },
        },
        {
          name: 'ogImage',
          label: 'OGP画像',
          type: 'upload',
          relationTo: 'media',
          admin: { description: '空欄の場合はアイキャッチ画像を使用' },
        },
      ],
    },
    {
      name: 'author',
      label: '著者',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar' },
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
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user && !req.user.roles?.includes('super-admin')) {
          const userTenant = req.user.tenant !== null && typeof req.user.tenant === 'object'
            ? (req.user.tenant as { id: number }).id
            : req.user.tenant
          if (userTenant) data.tenant = userTenant
          if (!data.author) data.author = (req.user as any).id
        }
        if (!data.publishedAt && data.status === 'published') {
          data.publishedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
  timestamps: true,
}
