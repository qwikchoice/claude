import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request: Request) {
  let body: {
    name: string
    email: string
    phone?: string
    preferredDates?: string
    destination?: string
    groupSize?: string
    experienceType?: string
    message?: string
    source?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.name || !body.email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  const lead = await prisma.leadInquiry.create({
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone ?? null,
      preferredDates: body.preferredDates ?? null,
      destination: body.destination ?? null,
      groupSize: body.groupSize ?? null,
      experienceType: body.experienceType ?? null,
      message: body.message ?? null,
      source: body.source ?? 'website',
    },
  })

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@sunriovistas.com'

  try {
    await sendEmail({
      to: adminEmail,
      subject: `New inquiry from ${body.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#d97706">New SunRioVistas Inquiry</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px;font-weight:bold">Name</td><td style="padding:8px">${body.name}</td></tr>
            <tr style="background:#fef3c7"><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${body.email}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Phone</td><td style="padding:8px">${body.phone ?? '—'}</td></tr>
            <tr style="background:#fef3c7"><td style="padding:8px;font-weight:bold">Preferred Dates</td><td style="padding:8px">${body.preferredDates ?? '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Destination</td><td style="padding:8px">${body.destination ?? '—'}</td></tr>
            <tr style="background:#fef3c7"><td style="padding:8px;font-weight:bold">Group Size</td><td style="padding:8px">${body.groupSize ?? '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Experience Type</td><td style="padding:8px">${body.experienceType ?? '—'}</td></tr>
            <tr style="background:#fef3c7"><td style="padding:8px;font-weight:bold">Message</td><td style="padding:8px">${body.message ?? '—'}</td></tr>
            <tr><td style="padding:8px;font-weight:bold">Source</td><td style="padding:8px">${body.source ?? 'website'}</td></tr>
          </table>
          <p style="margin-top:20px"><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="background:#d97706;color:white;padding:10px 20px;text-decoration:none;border-radius:8px">View in Admin</a></p>
        </div>
      `,
    })
  } catch (err) {
    console.error('Failed to send lead notification email:', err)
  }

  return NextResponse.json({ data: { id: lead.id, success: true } }, { status: 201 })
}
