import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

export const revalidate = 60

async function getTenants() {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'tenants',
      where: { isActive: { equals: true } },
      sort: 'name',
      limit: 50,
    })
    return result.docs
  } catch {
    return []
  }
}

export default async function HomePage() {
  const tenants = await getTenants()

  return (
    <>
      <header className="site-header">
        <div className="container inner">
          <span className="logo">🗾 フォーラム</span>
          <nav>
            <Link href="/admin">管理画面</Link>
          </nav>
        </div>
      </header>

      <main>
        <div className="container">
          <div className="hero">
            <h1>日本語マルチテナントフォーラム</h1>
            <p>
              複数のコミュニティ・組織が独立したフォーラムを持てるプラットフォームです。
            </p>
            <Link href="/admin" className="btn btn-primary">
              管理画面を開く
            </Link>
          </div>

          <div className="section-header">
            <h2>コミュニティ一覧</h2>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              {tenants.length} 件
            </span>
          </div>

          {tenants.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <p>まだコミュニティが作成されていません。</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                <Link href="/admin/collections/tenants/create">管理画面</Link> からコミュニティを作成してください。
              </p>
            </div>
          ) : (
            <div className="tenant-grid">
              {tenants.map((tenant: any) => (
                <Link
                  key={tenant.id}
                  href={`/${tenant.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="tenant-card">
                    <h2>{tenant.name}</h2>
                    {tenant.description && (
                      <p>{tenant.description}</p>
                    )}
                    <span className="badge badge-published">フォーラムを見る →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>Powered by Payload CMS v3 + Next.js 15 | 日本語対応マルチテナントフォーラム</p>
        </div>
      </footer>
    </>
  )
}
