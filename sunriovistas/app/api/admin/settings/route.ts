import { NextResponse } from 'next/server'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await prisma.siteSetting.findMany()
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]))

  return NextResponse.json({ data: settings })
}

export async function PATCH(request: Request) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, string>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Body must be a key/value object' }, { status: 400 })
  }

  const updates = await Promise.all(
    Object.entries(body).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  )

  const settings = Object.fromEntries(updates.map((r) => [r.key, r.value]))
  return NextResponse.json({ data: settings })
}
