import type { Metadata } from 'next'
import LeadCapture from '@/components/marketing/LeadCapture'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact Us | SunRioVistas',
  description:
    'Get in touch with SunRioVistas. We respond within 24 hours. Ask about our luxury RV glamping experiences near Folsom Lake, Northern California.',
}

export default function ContactPage() {
  return (
    <main className="pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-amber-900 via-orange-800 to-amber-700 py-20 md:py-24 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <span className="text-5xl block mb-4" aria-hidden="true">✉️</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-5">
            Get in Touch
          </h1>
          <p className="text-amber-100 text-lg leading-relaxed">
            Questions about booking, destinations, or our RVs? We&apos;re friendly and fast. Reach
            out — we respond within 24 hours.
          </p>
        </div>
      </section>

      {/* Quick Info Bar */}
      <div className="bg-amber-50 border-b border-amber-100 py-6 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <span className="text-3xl block mb-2" aria-hidden="true">⚡</span>
              <p className="font-semibold text-stone-900 text-sm">Quick Response</p>
              <p className="text-stone-500 text-xs mt-1">We respond within 24 hours</p>
            </div>
            <div className="text-center">
              <span className="text-3xl block mb-2" aria-hidden="true">📧</span>
              <p className="font-semibold text-stone-900 text-sm">Email Us</p>
              <p className="text-stone-500 text-xs mt-1">
                <span className="italic">hello@sunriovistas.com</span>
                <br />
                <span className="text-amber-600 text-xs">(Placeholder — update in admin)</span>
              </p>
            </div>
            <div className="text-center">
              <span className="text-3xl block mb-2" aria-hidden="true">📱</span>
              <p className="font-semibold text-stone-900 text-sm">Call or Text</p>
              <p className="text-stone-500 text-xs mt-1">
                <span className="italic">(XXX) XXX-XXXX</span>
                <br />
                <span className="text-amber-600 text-xs">(Placeholder — update in admin)</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Capture Form */}
      <LeadCapture />

      {/* Instagram Placeholder */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-2xl font-bold text-stone-900 mb-4">
            Follow Us on Instagram
          </h2>
          <p className="text-stone-500 mb-8">
            See real glamper photos, destination previews, and behind-the-scenes content.
          </p>
          <div className="border-2 border-dashed border-amber-200 rounded-2xl p-10 bg-amber-50">
            <span className="text-5xl block mb-3" aria-hidden="true">📸</span>
            <p className="text-stone-500 text-sm italic">
              Instagram feed placeholder — connect your @sunriovistas account in admin settings.
            </p>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:opacity-90 transition-opacity"
            >
              @SunRioVistas on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="py-12 bg-amber-50 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-stone-600 mb-4">
            Looking for quick answers? Check out our FAQ page.
          </p>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 text-amber-700 font-semibold hover:text-amber-800 underline underline-offset-2 hover:no-underline transition-colors"
          >
            View Frequently Asked Questions →
          </Link>
        </div>
      </section>
    </main>
  )
}
