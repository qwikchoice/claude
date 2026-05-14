import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

export interface CreatePaymentLinkParams {
  bookingId: string
  amount: number // in cents
  description: string
  customerEmail: string
  metadata: Record<string, string>
  successUrl: string
  cancelUrl: string
}

export interface PaymentLinkResult {
  url: string
  id: string
}

/**
 * Creates a Stripe Payment Link for a booking.
 * The payment link can be sent to the customer via email.
 *
 * @param params - Payment link configuration
 * @returns The payment link URL and ID
 */
export async function createPaymentLink(
  params: CreatePaymentLinkParams
): Promise<PaymentLinkResult> {
  // Create a product for this booking
  const product = await stripe.products.create({
    name: `SunRioVistas Booking #${params.bookingId.slice(-8).toUpperCase()}`,
    description: params.description,
    metadata: params.metadata,
  })

  // Create a one-time price for the booking amount
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: params.amount,
    currency: 'usd',
  })

  // Create the payment link
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    metadata: params.metadata,
    after_completion: {
      type: 'redirect',
      redirect: { url: params.successUrl },
    },
    customer_creation: 'always',
    phone_number_collection: { enabled: true },
  })

  return { url: paymentLink.url, id: paymentLink.id }
}

/**
 * Retrieves a Stripe Payment Intent by ID.
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId)
}

/**
 * Creates a refund for a payment intent.
 *
 * @param paymentIntentId - The Stripe Payment Intent ID
 * @param amountInCents - Amount to refund in cents (omit for full refund)
 * @param reason - Reason for refund
 */
export async function createRefund(
  paymentIntentId: string,
  amountInCents?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> {
  const params: Stripe.RefundCreateParams = {
    payment_intent: paymentIntentId,
    reason: reason ?? 'requested_by_customer',
  }

  if (amountInCents !== undefined) {
    params.amount = amountInCents
  }

  return stripe.refunds.create(params)
}

/**
 * Constructs a Stripe webhook event from the raw body and signature.
 * Use this in the webhook route handler.
 */
export function constructWebhookEvent(
  rawBody: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
}

/**
 * Converts a dollar amount to cents for Stripe.
 */
export function toCents(dollars: number): number {
  return Math.round(dollars * 100)
}

/**
 * Converts cents to a dollar amount.
 */
export function fromCents(cents: number): number {
  return cents / 100
}
