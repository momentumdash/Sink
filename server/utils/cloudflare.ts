import type { H3Event } from 'h3'
import type { Compilable } from 'kysely'

export function useWAE(event: H3Event, query: Compilable) {
  const { cfAccountId, cfApiToken } = useRuntimeConfig(event)
  if (!cfAccountId || !cfApiToken) {
    // Without both values every query silently returns nothing, which looks
    // identical to "no traffic". Log presence (never the token value) so a
    // blank analytics dashboard is diagnosable from the Worker logs.
    console.warn('useWAE: analytics query skipped, missing runtime config', {
      cfAccountId: Boolean(cfAccountId),
      cfApiToken: Boolean(cfApiToken),
    })
    return { data: [] }
  }

  const compiledQuery = compileAnalyticsQuery(query)

  if (import.meta.dev)
    console.info('useWAE', compiledQuery)

  return $fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/analytics_engine/sql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfApiToken}`,
    },
    body: compiledQuery,
    retry: 1,
    retryDelay: 100, // ms
  })
}
