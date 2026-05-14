import Link from 'next/link'

const steps = [
  {
    number: 1,
    emoji: '🏕️',
    title: 'Choose Your RV',
    description:
      'Browse Lunaris, Stellaris, or Solaris. Each is a unique glamping experience curated for a different travel style.',
  },
  {
    number: 2,
    emoji: '📍',
    title: 'Pick a Destination',
    description:
      'Select from Folsom Lake, wineries, resorts, or other Northern California escapes. We partner with 5 curated locations.',
  },
  {
    number: 3,
    emoji: '📅',
    title: 'Request Your Dates',
    description:
      'Submit your preferred dates through our booking form. Include any special requests — pets, group size, occasions.',
  },
  {
    number: 4,
    emoji: '✅',
    title: 'Get Approved & Pay',
    description:
      'After manual review, we confirm your dates and send a secure Stripe payment link by email. No upfront payment until approved.',
  },
  {
    number: 5,
    emoji: '🚗',
    title: 'Drive Your Car & Arrive',
    description:
      'The RV is fully setup and ready at the campground. Just drive your own car, unpack, and start relaxing immediately.',
  },
]

export default function HowItWorks() {
  return (
    <section className="section-padding bg-white" aria-labelledby="how-it-works-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 id="how-it-works-title" className="section-title mb-4">
            Easier Than You Think
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            No RV license. No hookup knowledge. No stress. Just show up and relax.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number}>
              {/* Step Card */}
              <div className="flex gap-6 items-start group">
                {/* Number + Line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-amber-600 text-white font-serif font-bold text-xl flex items-center justify-center shadow-md group-hover:bg-amber-700 transition-colors duration-200 relative z-10">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-12 bg-amber-200 mt-1" aria-hidden="true" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl" aria-hidden="true">{step.emoji}</span>
                    <h3 className="font-serif text-xl font-bold text-stone-900">{step.title}</h3>
                  </div>
                  <p className="text-stone-600 leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Callout between steps 4 and 5 */}
              {step.number === 4 && (
                <div className="ml-20 mb-8">
                  <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0" aria-hidden="true">🚗</span>
                      <div>
                        <p className="font-bold text-amber-900 text-base mb-1">
                          You will NEVER drive the RV.
                        </p>
                        <p className="text-amber-800 text-sm leading-relaxed">
                          You drive YOUR car to the campground. The RV is already there, fully
                          setup and waiting for you. No RV license. No towing. No hookups. Just
                          arrive and enjoy.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-4">
          <p className="text-stone-500 mb-2">
            Questions? We&apos;re here to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-semibold text-base underline underline-offset-2 hover:no-underline transition-colors"
          >
            Contact Us →
          </Link>
        </div>
      </div>
    </section>
  )
}
