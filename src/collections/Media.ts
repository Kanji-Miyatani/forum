import type { CollectionConfig } from 'payload'
import { tenantReadAccess, tenantWriteAccess, tenantDeleteAccess } from '../access/tenantAccess'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'メディア',
    plural: 'メディア一覧',
  },
  admin: {
    useAsTitle: 'filename',
    description: 'アップロードされたメディアファイルを管理します。',
    group: 'コンテンツ管理',
  },
  access: {
    read: () => true, // メディアは公開
    create: tenantWriteAccess,
    update: tenantWriteAccess,
    delete: tenantDeleteAccess,
  },
  upload: {
    staticDir: process.env.MEDIA_DIR || '../public/media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 576,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: '代替テキスト（alt属性）',
      type: 'text',
      localized: true,
      admin: {
        description: '画像のアクセシビリティのための説明文',
      },
    },
    {
      name: 'caption',
      label: 'キャプション',
      type: 'text',
      localized: true,
    },
    {
      name: 'tenant',
      label: '所属テナント',
      type: 'relationship',
      relationTo: 'tenants',
      admin: {
        description: 'このメディアが属するテナント（未設定の場合は共有）',
      },
    },
  ],
  timestamps: true,
}
