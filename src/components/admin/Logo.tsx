'use client'

export default function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="28" height="28" rx="6" fill="#0ea5e9" />
        <path d="M7 8h14M7 14h9M7 20h11" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.01em', color: 'var(--theme-text)' }}>
        Headless CMS
      </span>
    </div>
  )
}
