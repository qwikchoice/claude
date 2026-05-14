import nodemailer from 'nodemailer'
import { format } from 'date-fns'

// ─────────────────────────────────────────────
// Transporter
// ─────────────────────────────────────────────

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// ─────────────────────────────────────────────
// sendEmail utility
// ─────────────────────────────────────────────

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? 'SunRioVistas <noreply@sunriovistas.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  })
}

// ─────────────────────────────────────────────
// Shared template helpers
// ─────────────────────────────────────────────

interface BookingEmailData {
  bookingId: string
  customerName: string
  customerEmail: string
  rvName: string
  rvEmoji?: string
  destinationName: string
  checkIn: Date | string
  checkOut: Date | string
  nights: number
  guests: number
  total: number
  subtotal?: number
  cleaningFee?: number
  addOnTotal?: number
  paymentLinkUrl?: string
  rejectionReason?: string
  refundAmount?: number
  adminNotes?: string
  addOns?: { name: string; price: number }[]
}

function formatBookingDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'EEEE, MMMM d, yyyy')
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SunRioVistas</title>
</head>
<body style="margin:0;padding:0;background-color:#fef3c7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1c1917;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef3c7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#d97706,#b45309);padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;letter-spacing:0.05em;">🌄</p>
              <h1 style="margin:8px 0 4px;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:0.03em;">SunRioVistas</h1>
              <p style="margin:0;color:#fde68a;font-size:14px;letter-spacing:0.1em;text-transform:uppercase;">Luxury RV Glamping · Folsom Lake</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#fffbeb;padding:24px 40px;text-align:center;border-top:1px solid #fde68a;">
              <p style="margin:0 0 8px;color:#78716c;font-size:13px;">
                Questions? Email us at
                <a href="mailto:admin@sunriovistas.com" style="color:#d97706;text-decoration:none;">admin@sunriovistas.com</a>
              </p>
              <p style="margin:0;color:#a8a29e;font-size:12px;">
                © ${new Date().getFullYear()} SunRioVistas · Luxury RV Glamping Near Folsom Lake, CA
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

function bookingDetailsTable(booking: BookingEmailData): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border-radius:12px;padding:20px;margin:20px 0;">
  <tr>
    <td style="padding:6px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#78716c;font-size:14px;padding:5px 0;">RV</td>
          <td style="color:#1c1917;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${booking.rvEmoji ?? ''} ${booking.rvName}</td>
        </tr>
        <tr>
          <td style="color:#78716c;font-size:14px;padding:5px 0;">Destination</td>
          <td style="color:#1c1917;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${booking.destinationName}</td>
        </tr>
        <tr>
          <td style="color:#78716c;font-size:14px;padding:5px 0;">Check-In</td>
          <td style="color:#1c1917;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${formatBookingDate(booking.checkIn)}</td>
        </tr>
        <tr>
          <td style="color:#78716c;font-size:14px;padding:5px 0;">Check-Out</td>
          <td style="color:#1c1917;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${formatBookingDate(booking.checkOut)}</td>
        </tr>
        <tr>
          <td style="color:#78716c;font-size:14px;padding:5px 0;">Duration</td>
          <td style="color:#1c1917;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${booking.nights} night${booking.nights !== 1 ? 's' : ''}</td>
        </tr>
        <tr>
          <td style="color:#78716c;font-size:14px;padding:5px 0;">Guests</td>
          <td style="color:#1c1917;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${booking.guests} guest${booking.guests !== 1 ? 's' : ''}</td>
        </tr>
        ${
          booking.addOns && booking.addOns.length > 0
            ? booking.addOns
                .map(
                  (a) => `
        <tr>
          <td style="color:#78716c;font-size:14px;padding:5px 0;">${a.name}</td>
          <td style="color:#1c1917;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${formatMoney(a.price)}</td>
        </tr>`
                )
                .join('')
            : ''
        }
        <tr>
          <td colspan="2" style="border-top:1px solid #fde68a;padding-top:10px;margin-top:8px;"></td>
        </tr>
        <tr>
          <td style="color:#92400e;font-size:15px;font-weight:700;padding:6px 0;">Total</td>
          <td style="color:#92400e;font-size:15px;font-weight:700;text-align:right;padding:6px 0;">${formatMoney(booking.total)}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`
}

function ctaButton(text: string, url: string, color = '#d97706'): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td align="center">
      <a href="${url}"
         style="display:inline-block;background-color:${color};color:#ffffff;font-size:16px;font-weight:700;padding:16px 36px;border-radius:50px;text-decoration:none;letter-spacing:0.02em;">
        ${text}
      </a>
    </td>
  </tr>
</table>
`
}

// ─────────────────────────────────────────────
// Customer Templates
// ─────────────────────────────────────────────

export function bookingRequestReceivedTemplate(booking: BookingEmailData): string {
  const content = `
<h2 style="margin:0 0 8px;color:#1c1917;font-size:22px;font-weight:700;">We received your booking request! 🎉</h2>
<p style="margin:0 0 20px;color:#44403c;font-size:15px;line-height:1.6;">
  Hi ${booking.customerName},<br/><br/>
  Thank you for choosing SunRioVistas! We've received your glamping request and our team is reviewing the details.
  You'll hear back from us within <strong>24–48 hours</strong> with an approval decision.
</p>
<p style="margin:0 0 4px;color:#78716c;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Booking Reference</p>
<p style="margin:0 0 20px;color:#d97706;font-size:18px;font-weight:700;font-family:monospace;">#${booking.bookingId.slice(-8).toUpperCase()}</p>

${bookingDetailsTable(booking)}

<p style="margin:20px 0 0;color:#78716c;font-size:14px;line-height:1.6;">
  <strong>What happens next?</strong><br/>
  Our team will review your request and confirm availability. Once approved, you'll receive a secure payment link to complete your booking.
  Please note that your dates are <em>not confirmed</em> until payment is received.
</p>
<p style="margin:16px 0 0;color:#78716c;font-size:14px;">
  Have questions? Reply to this email or contact us at
  <a href="mailto:admin@sunriovistas.com" style="color:#d97706;">admin@sunriovistas.com</a>
</p>
`
  return emailWrapper(content)
}

export function bookingApprovedTemplate(booking: BookingEmailData): string {
  const content = `
<h2 style="margin:0 0 8px;color:#16a34a;font-size:22px;font-weight:700;">Your booking is approved! ✅</h2>
<p style="margin:0 0 20px;color:#44403c;font-size:15px;line-height:1.6;">
  Exciting news, ${booking.customerName}! Your SunRioVistas glamping request has been approved.
  Please complete your booking by clicking the payment link below. <strong>Your dates are reserved for 48 hours</strong> — after that, the hold may be released.
</p>
<p style="margin:0 0 4px;color:#78716c;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Booking Reference</p>
<p style="margin:0 0 20px;color:#d97706;font-size:18px;font-weight:700;font-family:monospace;">#${booking.bookingId.slice(-8).toUpperCase()}</p>

${bookingDetailsTable(booking)}

${booking.paymentLinkUrl ? ctaButton('Complete Payment Now →', booking.paymentLinkUrl) : ''}

<p style="margin:20px 0 0;color:#78716c;font-size:13px;line-height:1.6;">
  The payment link above will take you to our secure Stripe checkout. Your booking will be confirmed immediately upon successful payment.
  If you have any questions, reply to this email or contact us at
  <a href="mailto:admin@sunriovistas.com" style="color:#d97706;">admin@sunriovistas.com</a>
</p>
`
  return emailWrapper(content)
}

export function bookingConfirmedTemplate(booking: BookingEmailData): string {
  const content = `
<h2 style="margin:0 0 8px;color:#16a34a;font-size:22px;font-weight:700;">Payment confirmed — you're all set! 🌄</h2>
<p style="margin:0 0 20px;color:#44403c;font-size:15px;line-height:1.6;">
  Woohoo, ${booking.customerName}! Your payment has been received and your SunRioVistas glamping experience is officially confirmed.
  We can't wait to welcome you!
</p>
<p style="margin:0 0 4px;color:#78716c;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Booking Confirmation</p>
<p style="margin:0 0 20px;color:#d97706;font-size:18px;font-weight:700;font-family:monospace;">#${booking.bookingId.slice(-8).toUpperCase()}</p>

${bookingDetailsTable(booking)}

<div style="background-color:#f0fdf4;border-left:4px solid #16a34a;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;">
  <p style="margin:0;color:#15803d;font-size:14px;font-weight:600;">What to Expect</p>
  <ul style="margin:8px 0 0;padding-left:20px;color:#166534;font-size:14px;line-height:1.8;">
    <li>You'll receive detailed check-in instructions closer to your arrival date</li>
    <li>The RV will be fully set up and ready when you arrive</li>
    <li>Standard check-in time is 3:00 PM · Checkout is 10:00 AM</li>
    <li>Remember to book your campground site separately if required</li>
  </ul>
</div>

<p style="margin:20px 0 0;color:#78716c;font-size:14px;">
  Questions before your trip? Reach us at
  <a href="mailto:admin@sunriovistas.com" style="color:#d97706;">admin@sunriovistas.com</a>
</p>
`
  return emailWrapper(content)
}

export function bookingRejectedTemplate(booking: BookingEmailData): string {
  const content = `
<h2 style="margin:0 0 8px;color:#dc2626;font-size:22px;font-weight:700;">We're sorry — your booking request was not approved</h2>
<p style="margin:0 0 20px;color:#44403c;font-size:15px;line-height:1.6;">
  Hi ${booking.customerName},<br/><br/>
  Thank you for your interest in SunRioVistas. Unfortunately, we're unable to approve your booking request at this time.
</p>

${
  booking.rejectionReason
    ? `
<div style="background-color:#fff7ed;border-left:4px solid #ea580c;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;">
  <p style="margin:0;color:#9a3412;font-size:14px;font-weight:600;">Reason</p>
  <p style="margin:8px 0 0;color:#9a3412;font-size:14px;">${booking.rejectionReason}</p>
</div>
`
    : ''
}

<p style="margin:20px 0;color:#44403c;font-size:15px;line-height:1.6;">
  We'd love to help you find the right dates or RV for your trip. Please don't hesitate to submit a new booking request
  or reach out to us directly — we'll do our best to accommodate you.
</p>

${ctaButton('Browse Available RVs', `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/rvs`)}

<p style="margin:20px 0 0;color:#78716c;font-size:14px;">
  Contact us at
  <a href="mailto:admin@sunriovistas.com" style="color:#d97706;">admin@sunriovistas.com</a> and we'll be happy to assist.
</p>
`
  return emailWrapper(content)
}

export function bookingCanceledTemplate(booking: BookingEmailData): string {
  const content = `
<h2 style="margin:0 0 8px;color:#1c1917;font-size:22px;font-weight:700;">Your booking has been canceled</h2>
<p style="margin:0 0 20px;color:#44403c;font-size:15px;line-height:1.6;">
  Hi ${booking.customerName},<br/><br/>
  Your SunRioVistas booking has been canceled. We're sorry to see you go!
</p>
<p style="margin:0 0 4px;color:#78716c;font-size:13px;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Canceled Booking</p>
<p style="margin:0 0 20px;color:#d97706;font-size:18px;font-weight:700;font-family:monospace;">#${booking.bookingId.slice(-8).toUpperCase()}</p>

${bookingDetailsTable(booking)}

${
  booking.refundAmount && booking.refundAmount > 0
    ? `
<div style="background-color:#f0fdf4;border-left:4px solid #16a34a;padding:16px 20px;border-radius:0 8px 8px 0;margin:20px 0;">
  <p style="margin:0;color:#15803d;font-size:14px;font-weight:600;">Refund Information</p>
  <p style="margin:8px 0 0;color:#166534;font-size:14px;">
    A refund of <strong>${formatMoney(booking.refundAmount)}</strong> has been issued to your original payment method.
    Please allow 5–10 business days for it to appear on your statement.
  </p>
</div>
`
    : ''
}

<p style="margin:20px 0;color:#44403c;font-size:15px;line-height:1.6;">
  We hope to welcome you to SunRioVistas in the future. If you have any questions about this cancellation, please contact us.
</p>

${ctaButton('Book a New Trip', `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/book`)}
`
  return emailWrapper(content)
}

// ─────────────────────────────────────────────
// Admin Templates
// ─────────────────────────────────────────────

export function adminNewBookingTemplate(booking: BookingEmailData): string {
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/admin/bookings/${booking.bookingId}`
  const content = `
<h2 style="margin:0 0 8px;color:#1c1917;font-size:22px;font-weight:700;">New Booking Request 🔔</h2>
<p style="margin:0 0 20px;color:#44403c;font-size:15px;line-height:1.6;">
  A new glamping booking request has been submitted and requires your review.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fffbeb;border-radius:12px;padding:20px;margin:20px 0;">
  <tr>
    <td>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#78716c;font-size:14px;padding:5px 0;">Customer</td>
          <td style="color:#1c1917;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${booking.customerName}</td>
        </tr>
        <tr>
          <td style="color:#78716c;font-size:14px;padding:5px 0;">Email</td>
          <td style="color:#1c1917;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">
            <a href="mailto:${booking.customerEmail}" style="color:#d97706;">${booking.customerEmail}</a>
          </td>
        </tr>
        <tr>
          <td style="color:#78716c;font-size:14px;padding:5px 0;">RV</td>
          <td style="color:#1c1917;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${booking.rvEmoji ?? ''} ${booking.rvName}</td>
        </tr>
        <tr>
          <td style="color:#78716c;font-size:14px;padding:5px 0;">Destination</td>
          <td style="color:#1c1917;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${booking.destinationName}</td>
        </tr>
        <tr>
          <td style="color:#78716c;font-size:14px;padding:5px 0;">Check-In</td>
          <td style="color:#1c1917;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${formatBookingDate(booking.checkIn)}</td>
        </tr>
        <tr>
          <td style="color:#78716c;font-size:14px;padding:5px 0;">Check-Out</td>
          <td style="color:#1c1917;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${formatBookingDate(booking.checkOut)}</td>
        </tr>
        <tr>
          <td style="color:#78716c;font-size:14px;padding:5px 0;">Nights / Guests</td>
          <td style="color:#1c1917;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${booking.nights} nights · ${booking.guests} guests</td>
        </tr>
        <tr>
          <td colspan="2" style="border-top:1px solid #fde68a;padding-top:10px;"></td>
        </tr>
        <tr>
          <td style="color:#92400e;font-size:15px;font-weight:700;padding:6px 0;">Total</td>
          <td style="color:#92400e;font-size:15px;font-weight:700;text-align:right;padding:6px 0;">${formatMoney(booking.total)}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

${ctaButton('Review & Approve Booking →', adminUrl)}

<p style="margin:16px 0 0;color:#78716c;font-size:13px;">
  Booking ID: <code style="background:#f5f5f4;padding:2px 6px;border-radius:4px;font-size:12px;">${booking.bookingId}</code>
</p>
`
  return emailWrapper(content)
}

export function adminPaymentCompleteTemplate(booking: BookingEmailData): string {
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/admin/bookings/${booking.bookingId}`
  const content = `
<h2 style="margin:0 0 8px;color:#16a34a;font-size:22px;font-weight:700;">Payment Received! 💰</h2>
<p style="margin:0 0 20px;color:#44403c;font-size:15px;line-height:1.6;">
  A customer has completed payment for their SunRioVistas booking. The booking is now <strong>CONFIRMED</strong>.
</p>

<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #86efac;">
  <tr>
    <td>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#15803d;font-size:14px;padding:5px 0;">Customer</td>
          <td style="color:#14532d;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${booking.customerName} (${booking.customerEmail})</td>
        </tr>
        <tr>
          <td style="color:#15803d;font-size:14px;padding:5px 0;">RV</td>
          <td style="color:#14532d;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${booking.rvEmoji ?? ''} ${booking.rvName}</td>
        </tr>
        <tr>
          <td style="color:#15803d;font-size:14px;padding:5px 0;">Destination</td>
          <td style="color:#14532d;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${booking.destinationName}</td>
        </tr>
        <tr>
          <td style="color:#15803d;font-size:14px;padding:5px 0;">Dates</td>
          <td style="color:#14532d;font-size:14px;font-weight:600;text-align:right;padding:5px 0;">${formatBookingDate(booking.checkIn)} → ${formatBookingDate(booking.checkOut)}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-top:1px solid #86efac;padding-top:10px;"></td>
        </tr>
        <tr>
          <td style="color:#15803d;font-size:15px;font-weight:700;padding:6px 0;">Amount Paid</td>
          <td style="color:#14532d;font-size:15px;font-weight:700;text-align:right;padding:6px 0;">${formatMoney(booking.total)}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>

${ctaButton('View Booking Details →', adminUrl, '#16a34a')}

<p style="margin:16px 0 0;color:#78716c;font-size:13px;">
  Booking ID: <code style="background:#f5f5f4;padding:2px 6px;border-radius:4px;font-size:12px;">${booking.bookingId}</code>
</p>
`
  return emailWrapper(content)
}
