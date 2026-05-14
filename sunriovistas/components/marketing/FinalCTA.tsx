import Link from 'next/link'

const trustBadges = [
  { icon: '🔒', label: 'Secure Booking' },
  { icon: '📧', label: 'Quick Response' },
  { icon: '🌟', label: '5-Star Experiences' },
  { icon: '✅', label: 'Manual Approval for Quality' },
]

export default function FinalCTA() {
  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="final-cta-title"
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700"
        aria-hidden="true"
      />

      {/* Decorative circles */}
      <div
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, white, transparent)' }}
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, white, transparent)' }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
        {/* Eyebrow */}
        <p className="text-amber-100 text-sm font-semibold uppercase tracking-widest mb-6">
          Ready when you are
        </p>

        {/* Headline */}
        <h2
          id="final-cta-title"
          className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
        >
          Your RV Getaway Should Feel Relaxing
          <br />
          <span className="text-amber-100">Before You Even Arrive.</span>
        </h2>

        {/* Subheadline */}
        <p className="text-amber-50 text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed">
          No driving. No towing. No setup. Just pack your bags, grab your people, and go.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-white text-amber-700 font-bold px-10 py-4 rounded-full text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 min-w-[260px] justify-center"
          >
            Request Your Weekend Escape
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border-2 border-white text-white font-semibold px-10 py-4 rounded-full text-lg hover:bg-white/10 hover:scale-105 transition-all duration-200 min-w-[220px] justify-center"
          >
            Ask Us a Question
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 text-amber-100 text-sm font-medium"
            >
              <span aria-hidden="true">{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
