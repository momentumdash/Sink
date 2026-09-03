import type { H3Event } from 'h3'
import type { Compilable } from 'kysely'

export function useWAE(event: H3Event, query: Compilable) {
  const { cfAccountId, cfAnalyticsApiToken } = useRuntimeConfig(event)
  if (!cfAccountId || !cfAnalyticsApiToken)
    return { data: [] }

  const compiledQuery = compileAnalyticsQuery(query)

  if (import.meta.dev)
    console.info('useWAE', compiledQuery)

  return $fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/analytics_engine/sql`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfAnalyticsApiToken}`,
    },
    body: compiledQuery,
    retry: 1,
    retryDelay: 100, // ms
  })
}
