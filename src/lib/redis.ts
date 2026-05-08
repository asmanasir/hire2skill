import { Redis } from '@upstash/redis'

// Null when env vars are missing — all cache calls become no-ops.
const client: Redis | null =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!client) return null
  try {
    return await client.get<T>(key)
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!client) return
  try {
    await client.set(key, value, { ex: ttlSeconds })
  } catch {}
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (!client || keys.length === 0) return
  try {
    await client.del(...keys)
  } catch {}
}
