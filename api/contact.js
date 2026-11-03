// Vercel serverless function: POST /api/contact → emails the message via Resend.
// Needs env vars on Vercel: RESEND_API_KEY (and optionally CONTACT_TO).
import { validate } from './_validate.js'

const TO = process.env.CONTACT_TO || 'eiuol.web@gmail.com'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' })

  const body = req.body ?? {}
  // Honeypot: real visitors never see or fill the "company" field.
  if (body.company) return res.status(200).json({ ok: true })

  const { error, value } = validate(body)
  if (error) return res.status(400).json({ error })

  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({ error: 'The contact form is not set up yet.' })
  }

  // ponytail: no rate limiting; add Vercel Firewall rate rules if spam shows up.
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Portfolio <onboarding@resend.dev>',
      to: [TO],
      reply_to: value.email,
      subject: `Portfolio message from ${value.name}`,
      text: `${value.message}\n\n— ${value.name} <${value.email}>`,
    }),
  })

  if (!r.ok) return res.status(502).json({ error: 'The message could not be sent.' })
  return res.status(200).json({ ok: true })
}
