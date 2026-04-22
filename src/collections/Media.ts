import type { CollectionConfig } from 'payload'
import { tenantWriteAccess, tenantDeleteAccess } from '../access/tenantAccess'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'メディア',
    plural: 'メディア一覧',
  },
  admin: {
    useAsTitle: 'filename',
    description: '画像・ファイルなどのメディアアセットを管理します。',
    group: 'コンテンツ',
  },
  access: {
    read: () => true,
    create: tenantWriteAccess,
    update: tenantWriteAccess,
    delete: tenantDeleteAccess,
  },
  upload: {
    staticDir: process.env.MEDIA_DIR || '../public/media',
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 432, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    focalPoint: true,
  },
  fields: [
    {
      name: 'alt',
      label: 'alt テキスト',
      type: 'text',
      localized: true,
      required: true,
      admin: { description: 'アクセシビリティ・SEOのための代替テキスト' },
    },
    {
      name: 'caption',
      label: 'キャプション',
      type: 'text',
      localized: true,
    },
    {
      name: 'tenant',
      label: '担当サイト',
      type: 'relationship',
      relationTo: 'tenants',
      admin: { position: 'sidebar' },
    },
  ],
  timestamps: true,
}
