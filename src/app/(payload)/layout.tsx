import React from 'react'

export const metadata = {
  description: 'Payload CMS 管理画面',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
