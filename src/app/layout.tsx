import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CMS管理',
  description: '日本語対応マルチテナントヘッドレスCMS',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
