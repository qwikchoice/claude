import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerAuthSession } from '@/lib/auth'
import { calculatePrice, isRangeAvailable } from '@/lib/pricing'
import { sendEmail, bookingRequestReceivedTemplate, adminNewBookingTemplate } from '@/lib/email'

// ─────────────────────────────────────────────
// Schema
// ─────────────────────────────────────────────

const createBookingSchema = z.object({
  rvId: z.string().min(1, 'RV ID is required'),
  destinationId: z.string().min(1, 'Destination ID is required'),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid check-in date (YYYY-MM-DD)'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid check-out date (YYYY-MM-DD)'),
  guests: z.number().int().min(1).max(10),
  addOnIds: z.array(z.string()).default([]),
  petRequest: z.boolean().default(false),
  petNotes: z.string().optional(),
  specialRequests: z.string().optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms & Conditions.' }),
  }),
  termsVersion: z.string().min(1),
  termsUrl: z.string().url(),
})

// ─────────────────────────────────────────────
// POST /api/bookings — create booking
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createBookingSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? 'Invalid request data.'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const {
      rvId,
      destinationId,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      guests,
      addOnIds,
      petRequest,
      petNotes,
      specialRequests,
      termsAccepted,
      termsVersion,
      termsUrl,
    } = parsed.data

    const checkIn = new Date(checkInStr)
    const checkOut = new Date(checkOutStr)

    // Validate minimum 2-night stay
    const nights = Math.round(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (nights < 2) {
      return NextResponse.json(
        { error: 'Minimum 2-night stay required.' },
        { status: 400 }
      )
    }

    if (checkIn <= new Date()) {
      return NextResponse.json(
        { error: 'Check-in date must be in the future.' },
        { status: 400 }
      )
    }

    // Fetch RV (must be active)
    const rv = await prisma.rV.findFirst({
      where: { id: rvId, isActive: true },
      include: { priceRules: { where: { isActive: true } } },
    })
    if (!rv) {
      return NextResponse.json({ error: 'RV not found or not available.' }, { status: 404 })
    }

    // Fetch destination (must be active)
    const destination = await prisma.destination.findFirst({
      where: { id: destinationId, isActive: true },
    })
    if (!destination) {
      return NextResponse.json(
        { error: 'Destination not found or not available.' },
        { status: 404 }
      )
    }

    // Check availability — blockouts + active bookings
    const [blockouts, existingBookings] = await Promise.all([
      prisma.calendarBlockout.findMany({ where: { rvId } }),
      prisma.booking.findMany({
        where: {
          rvId,
          status: { in: ['PENDING', 'APPROVED', 'AWAITING_PAYMENT', 'CONFIRMED'] },
        },
        select: { checkIn: true, checkOut: true, status: true },
      }),
    ])

    const available = isRangeAvailable(
      checkIn,
      checkOut,
      blockouts.map((b) => ({ startDate: b.startDate, endDate: b.endDate })),
      existingBookings.map((b) => ({
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        status: b.status,
      }))
    )

    if (!available) {
      return NextResponse.json(
        { error: 'Selected dates are not available. Please choose different dates.' },
        { status: 409 }
      )
    }

    // Fetch selected add-ons
    const selectedAddOns = addOnIds.length > 0
      ? await prisma.addOn.findMany({
          where: { id: { in: addOnIds }, isActive: true },
          include: { priceRules: { where: { isActive: true } } },
        })
      : []

    // Fetch site settings
    const settingsRaw = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            'cleaning_fee',
            'deposit_enabled',
            'deposit_percent',
            'tax_enabled',
            'tax_percent',
            'admin_email',
          ],
        },
      },
    })
    const settings = Object.fromEntries(settingsRaw.map((s) => [s.key, s.value]))

    // Calculate price
    const priceBreakdown = calculatePrice({
      rv,
      checkIn,
      checkOut,
      selectedAddOns,
      settings,
    })

    // Get IP address for terms
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      null

    // Fetch active terms document for linking
    const termsDoc = await prisma.termsDocument.findFirst({
      where: { version: termsVersion, isActive: true },
    })

    // Create booking + line items + add-on records in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId: session.user.id,
          rvId,
          destinationId,
          checkIn,
          checkOut,
          nights,
          guests,
          petRequest,
          petNotes: petNotes ?? null,
          specialRequests: specialRequests ?? null,
          status: 'PENDING',
          nightlyRateSnapshot: priceBreakdown.subtotal / nights,
          subtotal: priceBreakdown.subtotal,
          cleaningFee: priceBreakdown.cleaningFee,
          addOnTotal: priceBreakdown.addOnTotal,
          depositAmount: priceBreakdown.depositAmount > 0 ? priceBreakdown.depositAmount : null,
          depositPercent:
            priceBreakdown.depositAmount > 0
              ? parseInt(settings['deposit_percent'] ?? '0', 10)
              : null,
          taxAmount: priceBreakdown.taxAmount > 0 ? priceBreakdown.taxAmount : null,
          taxPercent:
            priceBreakdown.taxAmount > 0
              ? parseInt(settings['tax_percent'] ?? '0', 10)
              : null,
          total: priceBreakdown.total,
          termsAccepted,
          termsAcceptedAt: new Date(),
          termsVersion,
          termsUrl,
          termsIpAddress: ip,
        },
      })

      // Create line items
      if (priceBreakdown.lineItems.length > 0) {
        await tx.bookingLineItem.createMany({
          data: priceBreakdown.lineItems.map((item) => ({
            bookingId: newBooking.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            type: item.type,
          })),
        })
      }

      // Create booking add-ons
      for (const addOn of selectedAddOns) {
        const price = priceBreakdown.lineItems.find(
          (li) => li.description === addOn.name && li.type === 'ADDON'
        )?.total ?? Number(addOn.basePrice)

        await tx.bookingAddOn.create({
          data: {
            bookingId: newBooking.id,
            addOnId: addOn.id,
            price,
            quantity: 1,
          },
        })
      }

      // Create TermsAcceptance record if termsDoc exists
      if (termsDoc) {
        await tx.termsAcceptance.create({
          data: {
            bookingId: newBooking.id,
            termsDocumentId: termsDoc.id,
            acceptedAt: new Date(),
            ipAddress: ip,
            userAgent: req.headers.get('user-agent') ?? null,
          },
        })
      }

      return newBooking
    })

    // Fetch user for email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    })

    // Send emails (non-blocking)
    const emailData = {
      bookingId: booking.id,
      customerName: user?.name ?? 'Guest',
      customerEmail: user?.email ?? '',
      rvName: rv.name,
      rvEmoji: rv.emoji,
      destinationName: destination.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights,
      guests,
      total: priceBreakdown.total,
      subtotal: priceBreakdown.subtotal,
      cleaningFee: priceBreakdown.cleaningFee,
      addOnTotal: priceBreakdown.addOnTotal,
      addOns: selectedAddOns.map((a) => ({
        name: a.name,
        price:
          priceBreakdown.lineItems.find((li) => li.description === a.name && li.type === 'ADDON')
            ?.total ?? Number(a.basePrice),
      })),
    }

    const customerEmail = bookingRequestReceivedTemplate(emailData)
    const adminEmail = adminNewBookingTemplate(emailData)
    const adminEmailAddress = settings['admin_email'] ?? process.env.ADMIN_EMAIL ?? ''

    await Promise.all([
      user?.email
        ? sendEmail({
            to: user.email,
            subject: `Booking Request Received — #${booking.id.slice(-8).toUpperCase()} | SunRioVistas`,
            html: customerEmail,
          })
        : Promise.resolve(),
      adminEmailAddress
        ? sendEmail({
            to: adminEmailAddress,
            subject: `[SunRioVistas] New Booking Request #${booking.id.slice(-8).toUpperCase()} — ${user?.name ?? 'Guest'}`,
            html: adminEmail,
          })
        : Promise.resolve(),
    ]).catch((err) => {
      // Log but don't fail the request
      console.error('[bookings] Email send error:', err)
    })

    return NextResponse.json({ data: { id: booking.id, status: booking.status } }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/bookings]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────
// GET /api/bookings — list current user's bookings
// ─────────────────────────────────────────────

export async function GET() {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
        rv: { select: { id: true, name: true, slug: true, emoji: true } },
        destination: { select: { id: true, name: true, slug: true, emoji: true } },
        addOns: { include: { addOn: { select: { id: true, name: true, slug: true } } } },
        payments: { select: { id: true, amount: true, status: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: bookings })
  } catch (err) {
    console.error('[GET /api/bookings]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
