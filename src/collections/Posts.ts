import type { CollectionConfig, Access, Where } from 'payload'
import { tenantDeleteAccess } from '../access/tenantAccess'

const readAccess: Access = ({ req: { user } }) => {
  if (!user) return { status: { equals: 'published' } } as Where
  if (user.roles?.includes('super-admin')) return true
  const tenantId = typeof user.tenant === 'object'
    ? (user.tenant as { id: string }).id
    : user.tenant
  if (!tenantId) return false
  return { tenant: { equals: tenantId } } as Where
}

const createAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  return Boolean(
    user.roles?.includes('super-admin') ||
      user.roles?.includes('tenant-admin') ||
      user.roles?.includes('tenant-member'),
  )
}

const updateAccess: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true
  const tenantId = typeof user.tenant === 'object'
    ? (user.tenant as { id: string }).id
    : user.tenant
  if (!tenantId) return false
  if (user.roles?.includes('tenant-admin')) {
    return { tenant: { equals: tenantId } } as Where
  }
  // 一般メンバーは自分の投稿のみ編集可能
  return {
    and: [
      { tenant: { equals: tenantId } },
      { author: { equals: user.id } },
    ],
  } as Where
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: '投稿',
    plural: '投稿一覧',
  },
  admin: {
    useAsTitle: 'title',
    description: 'フォーラムの投稿を管理します。',
    group: 'コンテンツ管理',
    defaultColumns: ['title', 'author', 'category', 'status', 'tenant', 'createdAt'],
  },
  versions: {
    drafts: true,
  },
  access: {
    read: readAccess,
    create: createAccess,
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
      admin: {
        description: '投稿のタイトル',
      },
    },
    {
      name: 'content',
      label: '本文',
      type: 'richText',
      localized: true,
      required: true,
      admin: {
        description: '投稿の本文（リッチテキスト対応）',
      },
    },
    {
      name: 'status',
      label: 'ステータス',
      type: 'select',
      options: [
        { label: '下書き', value: 'draft' },
        { label: '承認待ち', value: 'pending' },
        { label: '公開', value: 'published' },
        { label: '非公開', value: 'archived' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      label: '投稿者',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        position: 'sidebar',
        description: '投稿したユーザー',
      },
    },
    {
      name: 'category',
      label: 'カテゴリー',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        position: 'sidebar',
        description: '投稿のカテゴリー',
      },
    },
    {
      name: 'tenant',
      label: '所属テナント',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'この投稿が属するテナント',
      },
    },
    {
      name: 'tags',
      label: 'タグ',
      type: 'array',
      admin: {
        description: '投稿に付けるタグ（複数可）',
      },
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
      name: 'featuredImage',
      label: 'サムネイル画像',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
        description: '投稿のサムネイル画像',
      },
    },
    {
      name: 'viewCount',
      label: '閲覧数',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: '投稿が閲覧された回数（自動更新）',
      },
    },
    {
      name: 'isPinned',
      label: '固定表示',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'チェックすると一覧の先頭に固定表示されます',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user && !req.user.roles?.includes('super-admin')) {
          const userTenant = typeof req.user.tenant === 'object'
            ? (req.user.tenant as { id: string }).id
            : req.user.tenant
          if (userTenant) data.tenant = userTenant
          if (!data.author) data.author = req.user.id
        }
        return data
      },
    ],
  },
  timestamps: true,
}
