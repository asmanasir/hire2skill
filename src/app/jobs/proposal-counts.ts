import type { SupabaseClient } from '@supabase/supabase-js'

const JOB_PREFIX_RE = /^\s*\[JOB:([0-9a-f-]{36})\]/i

function emptyCounts(postIds: string[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const id of postIds) counts[id] = 0
  return counts
}

/**
 * Prefer RPC (accurate under RLS). Falls back to direct SELECT when RPC is not deployed.
 */
export async function loadProposalCountsForPosts(
  supabase: SupabaseClient,
  postIds: string[],
  posterIds: string[],
): Promise<Record<string, number>> {
  if (postIds.length === 0) return {}

  const { data: rpcData, error: rpcError } = await supabase.rpc('count_proposals_per_post', {
    post_ids: postIds,
  })

  if (!rpcError && rpcData) {
    const counts = emptyCounts(postIds)
    for (const row of rpcData as { post_id: string; proposal_count: number | string }[]) {
      if (row.post_id in counts) counts[row.post_id] = Number(row.proposal_count)
    }
    return counts
  }

  return fetchProposalCountsForPosts(supabase, postIds, posterIds)
}

function isMissingPostIdColumnError(msg?: string | null) {
  if (!msg) return false
  const lower = msg.toLowerCase()
  return (
    lower.includes('post_id') &&
    (lower.includes('column') || lower.includes('schema cache') || lower.includes('could not find'))
  )
}

/**
 * Count non-cancelled proposals per post (bookings linked by post_id and legacy [JOB:uuid] prefix).
 */
export async function fetchProposalCountsForPosts(
  supabase: SupabaseClient,
  postIds: string[],
  posterIds: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {}
  for (const id of postIds) counts[id] = 0
  if (postIds.length === 0) return counts

  const postIdSet = new Set(postIds)
  const seenBookingIds = new Set<string>()

  const bump = (postId: string) => {
    if (postIdSet.has(postId)) counts[postId] = (counts[postId] ?? 0) + 1
  }

  const { data: rowsByPostId, error: errByPost } = await supabase
    .from('bookings')
    .select('id, post_id, message')
    .in('post_id', postIds)
    .not('status', 'eq', 'cancelled')

  if (!errByPost && rowsByPostId) {
    for (const row of rowsByPostId) {
      if (!row.id || seenBookingIds.has(row.id)) continue
      const pid = row.post_id as string | null
      if (!pid || !postIdSet.has(pid)) continue
      seenBookingIds.add(row.id)
      bump(pid)
    }
  }

  const useFallback = errByPost && isMissingPostIdColumnError(errByPost.message)

  if (useFallback && posterIds.length > 0) {
    const { data: rows } = await supabase
      .from('bookings')
      .select('id, post_id, message')
      .in('poster_id', posterIds)
      .not('status', 'eq', 'cancelled')

    for (const row of rows ?? []) {
      if (!row.id || seenBookingIds.has(row.id)) continue
      let pid = row.post_id as string | null
      if (!pid || !postIdSet.has(pid)) {
        const m = typeof row.message === 'string' ? row.message.match(JOB_PREFIX_RE) : null
        pid = m && postIdSet.has(m[1]) ? m[1] : null
      }
      if (!pid) continue
      seenBookingIds.add(row.id)
      bump(pid)
    }
    return counts
  }

  if (posterIds.length > 0) {
    const { data: legacy, error: legErr } = await supabase
      .from('bookings')
      .select('id, post_id, message')
      .in('poster_id', posterIds)
      .is('post_id', null)
      .not('status', 'eq', 'cancelled')

    if (!legErr) {
      for (const row of legacy ?? []) {
        if (!row.id || seenBookingIds.has(row.id)) continue
        const m = typeof row.message === 'string' ? row.message.match(JOB_PREFIX_RE) : null
        if (!m || !postIdSet.has(m[1])) continue
        seenBookingIds.add(row.id)
        bump(m[1])
      }
    }
  }

  return counts
}
