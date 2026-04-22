import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { ja as jaTranslations } from '@payloadcms/translations/languages/ja'
import * as initialMigration from './migrations/initial'

import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'
import { Articles } from './collections/Articles'
import { Pages } from './collections/Pages'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— CMS',
      description: 'ヘッドレスCMS管理画面',
    },
    dateFormat: 'yyyy/MM/dd HH:mm',
    components: {
      graphics: {
        Logo: '@/components/admin/Logo',
        Icon: '@/components/admin/Icon',
      },
    },
  },

  collections: [Articles, Pages, Categories, Media, Tenants, Users],

  editor: lexicalEditor(),

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
    push: true,
    prodMigrations: [initialMigration],
  }),

  localization: {
    locales: [
      { code: 'ja', label: '日本語' },
      { code: 'en', label: 'English' },
    ],
    defaultLocale: 'ja',
    fallback: true,
  },

  i18n: {
    supportedLanguages: { ja: jaTranslations },
    fallbackLanguage: 'ja',
  },

  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',

  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  upload: {
    limits: { fileSize: 10_000_000 },
  },

  cors: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'].filter(Boolean),
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'].filter(Boolean),

  sharp,
})
