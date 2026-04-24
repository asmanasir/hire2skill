import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { sendEmail, layout, btn } from '../_shared/email.ts'

const APP_URL = Deno.env.get('APP_URL') ?? 'https://skilllink.no'

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    const message = payload.record
    if (!message || payload.type !== 'INSERT') {
      return new Response('ignored', { status: 200 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Fetch the booking to find the recipient
    const { data: booking } = await supabase
      .from('bookings')
      .select('poster_id, helper_id')
      .eq('id', message.booking_id)
      .single()
    if (!booking) return new Response('booking not found', { status: 200 })

    const recipientId =
      message.sender_id === booking.poster_id ? booking.helper_id : booking.poster_id

    // Fetch recipient email
    const { data: recipientAuth } = await supabase.auth.admin.getUserById(recipientId)
    const recipientEmail = recipientAuth?.user?.email
    if (!recipientEmail) return new Response('no recipient email', { status: 200 })

    // Fetch sender display name
    const { data: sender } = await supabase
      .from('profiles').select('display_name').eq('id', message.sender_id).single()
    const senderName = sender?.display_name ?? 'Someone'

    // Truncate preview
    const preview = (message.content ?? message.text ?? '').slice(0, 120)

    const subject = `New message from ${senderName}`
    const html = layout(subject, `
      <p style="margin:0 0 8px;">You have a new message from <strong>${senderName}</strong>.</p>
      ${preview ? `
      <blockquote style="margin:16px 0;padding:12px 16px;background:#f4f4f5;border-left:3px solid #8b5cf6;
                         border-radius:0 6px 6px 0;color:#3f3f46;font-style:italic;">
        "${preview}${preview.length === 120 ? '…' : ''}"
      </blockquote>` : ''}
      ${btn('Reply', `${APP_URL}/chat/${message.booking_id}`)}
    `)

    await sendEmail(recipientEmail, subject, html)
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(String(err), { status: 500 })
  }
})
