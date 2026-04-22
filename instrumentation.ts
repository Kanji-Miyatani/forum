export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { getPayload } = await import('payload')
    const { default: configPromise } = await import('@payload-config')
    await getPayload({ config: configPromise })
  }
}
