import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendEmail, layout, btn } from '../_shared/email.ts'

const APP_URL = Deno.env.get('APP_URL') ?? 'https://skilllink.no'

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    // Database Webhook payload: { type: 'INSERT', record: {...}, old_record: null }
    const booking = payload.record
    if (!booking || payload.type !== 'INSERT') {
      return new Response('ignored', { status: 200 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Fetch helper email
    const { data: helperAuth } = await supabase.auth.admin.getUserById(booking.helper_id)
    const helperEmail = helperAuth?.user?.email
    if (!helperEmail) return new Response('no helper email', { status: 200 })

    // Fetch poster display name
    const { data: poster } = await supabase
      .from('profiles').select('display_name').eq('id', booking.poster_id).single()
    const posterName = poster?.display_name ?? 'Someone'

    const subject = `New task request from ${posterName}`
    const html = layout(subject, `
      <p style="margin:0 0 8px;">Hi there,</p>
      <p style="margin:0 0 16px;">
        <strong>${posterName}</strong> has sent you a booking request on SkillLink.
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <td style="padding:8px 0;color:#71717a;width:120px;">Title</td>
          <td style="padding:8px 0;font-weight:600;">${booking.title ?? 'Task request'}</td>
        </tr>
        ${booking.date ? `
        <tr>
          <td style="padding:8px 0;color:#71717a;">Date</td>
          <td style="padding:8px 0;">${booking.date}</td>
        </tr>` : ''}
        ${booking.location ? `
        <tr>
          <td style="padding:8px 0;color:#71717a;">Location</td>
          <td style="padding:8px 0;">${booking.location}</td>
        </tr>` : ''}
      </table>
      <p style="margin:0;">Log in to accept or decline the request.</p>
      ${btn('View Request', `${APP_URL}/dashboard`)}
    `)

    await sendEmail(helperEmail, subject, html)
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(String(err), { status: 500 })
  }
})
