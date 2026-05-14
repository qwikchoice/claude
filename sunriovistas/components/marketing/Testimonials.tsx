const testimonials = [
  {
    name: 'Sarah M.',
    location: 'Folsom, CA',
    stars: 5,
    quote:
      'We had zero RV experience and were nervous. But we just drove our Prius to Folsom Lake and the RV was already set up and beautiful. It was the most relaxing family weekend we've had in years.',
    avatar: 'SM',
    avatarBg: 'bg-amber-100',
    avatarText: 'text-amber-700',
    highlight: 'just drove our Prius to Folsom Lake',
  },
  {
    name: 'Jake & Priya K.',
    location: 'Sacramento, CA',
    stars: 5,
    quote:
      'The Stellaris experience was exactly what we needed. No phones, no stress, just nature and each other. The yoga mats and meditation corner were a perfect touch.',
    avatar: 'JP',
    avatarBg: 'bg-purple-100',
    avatarText: 'text-purple-700',
    highlight: 'No phones, no stress',
  },
  {
    name: 'Tyler B.',
    location: 'San Francisco, CA',
    stars: 5,
    quote:
      'Took the Solaris to a winery through Harvest Hosts. We showed up with wine glasses and left with stories. Way better than a hotel and way easier than renting an RV.',
    avatar: 'TB',
    avatarBg: 'bg-orange-100',
    avatarText: 'text-orange-700',
    highlight: 'way easier than renting an RV',
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-amber-400 text-lg" aria-hidden="true">
          ⭐
        </span>
      ))}
    </div>
  )
}

function QuoteMark() {
  return (
    <svg
      className="text-amber-200 mb-3"
      width="40"
      height="32"
      viewBox="0 0 40 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0 32V19.733C0 8.8 6.4 2.667 19.2 0L20.8 3.2C14.667 4.8 11.467 8 11.2 12.8H18V32H0zm22 0V19.733C22 8.8 28.4 2.667 41.2 0L42.8 3.2C36.667 4.8 33.467 8 33.2 12.8H40V32H22z" />
    </svg>
  )
}

export default function Testimonials() {
  return (
    <section className="section-padding bg-white" aria-labelledby="testimonials-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 id="testimonials-title" className="section-title mb-4">
            Real Glampers. Real Stories.
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Families, couples, and adventurers who left their RV worries at home.
          </p>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((t) => (
            <article
              key={t.name}
              className="card flex flex-col p-8 border border-stone-100 group hover:border-amber-200 transition-colors"
            >
              <QuoteMark />
              <StarRating count={t.stars} />

              <blockquote className="flex-1 mt-4 mb-6">
                <p className="text-stone-600 text-base leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </blockquote>

              {/* Reviewer */}
              <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
                <div
                  className={`w-10 h-10 rounded-full ${t.avatarBg} ${t.avatarText} flex items-center justify-center text-sm font-bold flex-shrink-0`}
                  aria-hidden="true"
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-stone-900 text-sm">{t.name}</p>
                  <p className="text-stone-400 text-xs">{t.location}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* UGC / Instagram Placeholder */}
        <div className="border-2 border-dashed border-amber-200 rounded-2xl p-10 text-center bg-amber-50">
          <p className="text-2xl mb-3" aria-hidden="true">📸</p>
          <p className="font-semibold text-stone-700 mb-2">
            Share your SunRioVistas experience!
          </p>
          <p className="text-stone-500 text-sm mb-4">
            Tag us on Instagram to be featured here.
          </p>
          <div className="bg-white border border-amber-200 rounded-xl p-4 max-w-md mx-auto">
            <p className="text-stone-400 text-sm italic">
              Placeholder for customer photos — connect your Instagram or upload images in admin
              settings.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
