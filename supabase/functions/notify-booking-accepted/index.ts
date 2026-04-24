import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendEmail, layout, btn } from '../_shared/email.ts'

const APP_URL = Deno.env.get('APP_URL') ?? 'https://skilllink.no'

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const booking = payload.record
    const oldBooking = payload.old_record

    // Only fire when status transitions to 'accepted'
    if (
      payload.type !== 'UPDATE' ||
      booking?.status !== 'accepted' ||
      oldBooking?.status === 'accepted'
    ) {
      return new Response('ignored', { status: 200 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Fetch poster email
    const { data: posterAuth } = await supabase.auth.admin.getUserById(booking.poster_id)
    const posterEmail = posterAuth?.user?.email
    if (!posterEmail) return new Response('no poster email', { status: 200 })

    // Fetch helper display name
    const { data: helper } = await supabase
      .from('profiles').select('display_name').eq('id', booking.helper_id).single()
    const helperName = helper?.display_name ?? 'Your helper'

    const subject = `${helperName} accepted your request!`
    const html = layout(subject, `
      <p style="margin:0 0 8px;">Great news!</p>
      <p style="margin:0 0 16px;">
        <strong>${helperName}</strong> has accepted your booking request on SkillLink.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td style="padding:8px 0;color:#71717a;width:120px;">Task</td>
          <td style="padding:8px 0;font-weight:600;">${booking.title ?? 'Your task'}</td>
        </tr>
        ${booking.date ? `
        <tr>
          <td style="padding:8px 0;color:#71717a;">Date</td>
          <td style="padding:8px 0;">${booking.date}</td>
        </tr>` : ''}
      </table>
      <p style="margin:0;">You can now message ${helperName} directly through the chat.</p>
      ${btn('Open Chat', `${APP_URL}/chat/${booking.id}`)}
    `)

    await sendEmail(posterEmail, subject, html)
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(String(err), { status: 500 })
  }
})
