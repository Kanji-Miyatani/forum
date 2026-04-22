import React from 'react'

export const metadata = {
  title: 'CMS管理画面',
  description: 'ヘッドレスCMS管理画面',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
