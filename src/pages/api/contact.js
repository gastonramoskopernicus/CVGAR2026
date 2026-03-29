import nodemailer from 'nodemailer'

// Simple in-memory rate limit: max 3 requests per IP per hour
const rateLimitMap = new Map()

function checkRateLimit(ip) {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 hour
  const maxRequests = 3

  const entry = rateLimitMap.get(ip)
  if (!entry) {
    rateLimitMap.set(ip, { count: 1, start: now })
    return true
  }

  if (now - entry.start > windowMs) {
    rateLimitMap.set(ip, { count: 1, start: now })
    return true
  }

  if (entry.count >= maxRequests) return false

  entry.count++
  return true
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Rate limit
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Intentá de nuevo en un momento.' })
  }

  const { nombre, email, empresa, telefono, mensaje, _trap } = req.body

  // Honeypot — bots fill this; humans leave it empty
  if (_trap) {
    return res.status(200).json({ ok: true }) // silent reject
  }

  // Basic server-side validation
  if (!nombre?.trim() || !email?.trim() || !mensaje?.trim()) {
    return res.status(400).json({ error: 'Campos requeridos incompletos.' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Formato de email inválido.' })
  }

  // Check SMTP credentials are configured
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('SMTP_USER / SMTP_PASS no configurados')
    return res.status(500).json({ error: 'Servicio de email no configurado.' })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const htmlBody = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="font-size: 1.2rem; color: #1a1a1a; margin-bottom: 1.5rem;">
        Nuevo contacto desde el sitio
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 0.6rem 0; border-bottom: 1px solid #eee; color: #666; width: 120px; vertical-align: top;">Nombre</td><td style="padding: 0.6rem 0; border-bottom: 1px solid #eee; color: #1a1a1a;">${nombre}</td></tr>
        <tr><td style="padding: 0.6rem 0; border-bottom: 1px solid #eee; color: #666; vertical-align: top;">Email</td><td style="padding: 0.6rem 0; border-bottom: 1px solid #eee; color: #1a1a1a;">${email}</td></tr>
        ${empresa ? `<tr><td style="padding: 0.6rem 0; border-bottom: 1px solid #eee; color: #666; vertical-align: top;">Empresa</td><td style="padding: 0.6rem 0; border-bottom: 1px solid #eee; color: #1a1a1a;">${empresa}</td></tr>` : ''}
        ${telefono ? `<tr><td style="padding: 0.6rem 0; border-bottom: 1px solid #eee; color: #666; vertical-align: top;">Teléfono</td><td style="padding: 0.6rem 0; border-bottom: 1px solid #eee; color: #1a1a1a;">${telefono}</td></tr>` : ''}
        <tr><td style="padding: 0.6rem 0; color: #666; vertical-align: top;">Mensaje</td><td style="padding: 0.6rem 0; color: #1a1a1a; white-space: pre-line;">${mensaje}</td></tr>
      </table>
      <p style="margin-top: 2rem; font-size: 0.8rem; color: #999;">Enviado desde gaston-portfolio.vercel.app</p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"Portfolio GAR" <${process.env.SMTP_USER}>`,
      to: 'gaston.alejandro.ramos@gmail.com',
      replyTo: email,
      subject: `Nuevo contacto desde el sitio — ${nombre}`,
      html: htmlBody,
    })
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Error enviando email:', err)
    return res.status(500).json({ error: 'No se pudo enviar el mensaje. Intentá de nuevo.' })
  }
}
