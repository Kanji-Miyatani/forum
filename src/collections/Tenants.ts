import type { CollectionConfig, Access, Where } from 'payload'
import { isSuperAdmin } from '../access/isSuperAdmin'

const tenantReadForOwner: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true
  const tenantId = typeof user.tenant === 'object'
    ? (user.tenant as { id: string }).id
    : user.tenant
  if (!tenantId) return false
  return { id: { equals: tenantId } } as Where
}

const tenantUpdateForOwner: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.roles?.includes('super-admin')) return true
  if (user.roles?.includes('tenant-admin')) {
    const tenantId = typeof user.tenant === 'object'
      ? (user.tenant as { id: string }).id
      : user.tenant
    if (!tenantId) return false
    return { id: { equals: tenantId } } as Where
  }
  return false
}

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  labels: {
    singular: 'テナント',
    plural: 'テナント一覧',
  },
  admin: {
    useAsTitle: 'name',
    description: 'フォーラムのテナント（組織・コミュニティ）を管理します。',
    group: 'マルチテナント設定',
  },
  access: {
    read: tenantReadForOwner,
    create: isSuperAdmin,
    update: tenantUpdateForOwner,
    delete: isSuperAdmin,
  },
  fields: [
    {
      name: 'name',
      label: 'テナント名',
      type: 'text',
      required: true,
      admin: {
        description: 'テナント（コミュニティ・組織）の表示名',
      },
    },
    {
      name: 'slug',
      label: 'スラッグ',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URLで使用する識別子（英数字・ハイフンのみ）',
      },
      validate: (val: string | null | undefined) => {
        if (!val) return 'スラッグは必須です'
        if (!/^[a-z0-9-]+$/.test(val)) {
          return 'スラッグは英小文字・数字・ハイフンのみ使用できます'
        }
        return true
      },
    },
    {
      name: 'description',
      label: '説明',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'テナントの説明（多言語対応）',
      },
    },
    {
      name: 'domain',
      label: 'カスタムドメイン',
      type: 'text',
      admin: {
        description: 'カスタムドメインを設定する場合に入力（例: forum.example.com）',
      },
    },
    {
      name: 'isActive',
      label: '有効',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'テナントを無効にするとユーザーがアクセスできなくなります',
      },
    },
    {
      name: 'settings',
      label: 'テナント設定',
      type: 'group',
      fields: [
        {
          name: 'allowPublicPosts',
          label: '未ログインユーザーの投稿閲覧を許可',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'requireApproval',
          label: '投稿を管理者承認制にする',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'maxPostsPerDay',
          label: '1日の最大投稿数',
          type: 'number',
          defaultValue: 10,
          min: 1,
          max: 1000,
        },
      ],
    },
  ],
  timestamps: true,
}
