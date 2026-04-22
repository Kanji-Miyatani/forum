import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

export const revalidate = 60

type Props = {
  params: Promise<{ tenant: string }>
}

async function getTenantData(slug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'tenants',
    where: {
      and: [
        { slug: { equals: slug } },
        { isActive: { equals: true } },
      ],
    },
    limit: 1,
  })
  return result.docs[0] ?? null
}

async function getPosts(tenantId: string | number) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { tenant: { equals: tenantId } },
        { status: { equals: 'published' } },
      ],
    },
    sort: '-isPinned,-createdAt',
    limit: 20,
    depth: 2,
  })
  return result.docs
}

async function getCategories(tenantId: string | number) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'categories',
    where: { tenant: { equals: tenantId } },
    sort: 'sortOrder',
    limit: 50,
  })
  return result.docs
}

const statusLabels: Record<string, string> = {
  draft: '下書き',
  pending: '承認待ち',
  published: '公開',
  archived: '非公開',
}

export default async function TenantPage({ params }: Props) {
  const { tenant: tenantSlug } = await params
  const tenant = await getTenantData(tenantSlug)

  if (!tenant) notFound()

  const [posts, categories] = await Promise.all([
    getPosts(tenant.id),
    getCategories(tenant.id),
  ])

  return (
    <>
      <header className="site-header">
        <div className="container inner">
          <Link href="/" className="logo" style={{ textDecoration: 'none' }}>
            ← {(tenant as any).name}
          </Link>
          <nav>
            <Link href={`/${tenantSlug}`}>トップ</Link>
            <Link href="/admin">管理</Link>
          </nav>
        </div>
      </header>

      <main>
        <div className="container">
          {/* テナントヘッダー */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {(tenant as any).name}
            </h1>
            {(tenant as any).description && (
              <p style={{ color: 'var(--color-text-muted)' }}>{(tenant as any).description}</p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: '1.5rem' }}>
            {/* 投稿一覧 */}
            <div>
              <div className="section-header">
                <h2>投稿一覧</h2>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  {posts.length} 件
                </span>
              </div>

              {posts.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <p>まだ投稿がありません。</p>
                </div>
              ) : (
                <div className="post-list">
                  {posts.map((post: any) => (
                    <div key={post.id} className="card post-card">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {post.isPinned && (
                          <span title="固定表示" style={{ fontSize: '0.85rem' }}>📌</span>
                        )}
                        <h3 className="post-title">{post.title}</h3>
                      </div>
                      <div className="post-meta">
                        {post.category && (
                          <span className="post-category">
                            {(post.category as any).name}
                          </span>
                        )}
                        <span>
                          投稿者: {typeof post.author === 'object'
                            ? (post.author as any).displayName ?? (post.author as any).email
                            : post.author}
                        </span>
                        <span>{new Date(post.createdAt).toLocaleDateString('ja-JP')}</span>
                        <span className={`badge badge-${post.status}`}>
                          {statusLabels[post.status] ?? post.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* サイドバー */}
            <div>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>カテゴリー</h3>
                {categories.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    カテゴリーなし
                  </p>
                ) : (
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {categories.map((cat: any) => (
                      <li key={cat.id}>
                        <span
                          className="post-category"
                          style={{ cursor: 'default' }}
                        >
                          {cat.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="card">
                <h3 style={{ fontWeight: '600', marginBottom: '0.75rem' }}>クイックリンク</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem' }}>
                  <li>
                    <Link href="/admin/collections/posts/create">+ 新規投稿</Link>
                  </li>
                  <li>
                    <Link href="/admin/collections/categories/create">+ カテゴリー追加</Link>
                  </li>
                  <li>
                    <Link href="/admin">管理画面</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>{(tenant as any).name} | Powered by Payload CMS + Next.js</p>
        </div>
      </footer>
    </>
  )
}

export async function generateMetadata({ params }: Props) {
  const { tenant: tenantSlug } = await params
  const tenant = await getTenantData(tenantSlug)
  if (!tenant) return { title: '見つかりません' }
  return {
    title: `${(tenant as any).name} - フォーラム`,
    description: (tenant as any).description ?? `${(tenant as any).name} のフォーラム`,
  }
}
