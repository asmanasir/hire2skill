const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM = 'SkillLink <no-reply@skilllink.no>'

export async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error ${res.status}: ${err}`)
  }
  return res.json()
}

export function layout(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 36px;">
              <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">SkillLink</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px;color:#18181b;font-size:15px;line-height:1.6;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px;background:#f4f4f5;color:#71717a;font-size:12px;">
              © 2026 SkillLink. You received this email because you have an account on SkillLink.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function btn(label: string, href: string) {
  return `<a href="${href}"
    style="display:inline-block;margin-top:24px;padding:12px 28px;background:linear-gradient(135deg,#6366f1,#8b5cf6);
           color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
    ${label}
  </a>`
}
