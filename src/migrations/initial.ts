import type { MigrateUpArgs } from '@payloadcms/db-postgres'

export const name = '0001_initial'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const adapter = payload.db as any
  const { pushSchema } = adapter.requireDrizzleKit()
  const { apply, hasDataLoss, warnings } = await pushSchema(
    adapter.schema,
    adapter.drizzle,
    adapter.schemaName ? [adapter.schemaName] : undefined,
    adapter.tablesFilter,
  )
  if (warnings?.length) {
    for (const warning of warnings) {
      payload.logger.warn({ msg: `Schema push warning: ${warning}` })
    }
  }
  if (hasDataLoss) {
    throw new Error(
      'Schema push aborted: data loss detected. Review schema changes manually.',
    )
  }
  await apply()
}

export async function down(): Promise<void> {}
