import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { ja as jaTranslations } from '@payloadcms/translations/languages/ja'

import { Tenants } from './collections/Tenants'
import { Users } from './collections/Users'
import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // ===== 管理画面設定 =====
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '- フォーラム管理',
      description: '日本語対応マルチテナントフォーラム',
    },
  },

  // ===== コレクション =====
  collections: [Tenants, Users, Posts, Categories, Media],

  // ===== エディタ設定 =====
  editor: lexicalEditor(),

  // ===== データベース設定（SQLite） =====
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./forum.db',
    },
  }),

  // ===== 多言語（ロケール）設定 =====
  localization: {
    locales: [
      {
        code: 'ja',
        label: '日本語',
      },
      {
        code: 'en',
        label: 'English',
      },
    ],
    defaultLocale: 'ja',
    fallback: true,
  },

  // ===== 管理画面UI言語（日本語） =====
  i18n: {
    supportedLanguages: { ja: jaTranslations },
    fallbackLanguage: 'ja',
  },

  // ===== シークレットキー =====
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',

  // ===== TypeScript 型定義出力先 =====
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // ===== アップロードファイル設定 =====
  upload: {
    limits: {
      fileSize: 5000000, // 5MB
    },
  },

  // ===== CORS設定 =====
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'],

  // ===== CSRF設定 =====
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'],

  // ===== Sharp（画像リサイズ）=====
  sharp,
})
