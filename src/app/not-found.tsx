import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <header className="site-header">
        <div className="container inner">
          <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
            フォーラム
          </Link>
        </div>
      </header>
      <main>
        <div className="container">
          <div className="hero">
            <h1>404 - ページが見つかりません</h1>
            <p>お探しのページは存在しないか、削除された可能性があります。</p>
            <Link href="/" className="btn btn-primary">
              トップページに戻る
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
