import Link from 'next/link'

const experienceLinks = [
  { label: 'All RV Experiences', href: '/rvs' },
  { label: '🌙 Lunaris — Cozy & Family', href: '/rvs/lunaris' },
  { label: '✨ Stellaris — Wellness & Soulful', href: '/rvs/stellaris' },
  { label: '☀️ Solaris — Adventure & Free Spirit', href: '/rvs/solaris' },
]

const destinationLinks = [
  { label: 'All Destinations', href: '/destinations' },
  { label: '🌊 Beals Point / Folsom Lake', href: '/destinations/beals-point-folsom-lake' },
  { label: '🏔️ Placerville RV Resort', href: '/destinations/placerville-rv-resort' },
  { label: '🎰 Red Hawk Casino', href: '/destinations/red-hawk-casino' },
  { label: '🍷 Harvest Hosts / Wineries', href: '/destinations/harvest-hosts-wineries' },
  { label: '⛏️ Auburn / Gold Country', href: '/destinations/auburn-gold-country' },
]

const companyLinks = [
  { label: 'FAQ', href: '/faq' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Contact', href: '/contact' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Book Now', href: '/book' },
]

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-100">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <span className="text-2xl" aria-hidden="true">⛺</span>
              <span className="font-serif text-2xl font-bold text-amber-400 group-hover:text-amber-300 transition-colors">
                SunRioVistas
              </span>
            </Link>
            <p className="text-stone-300 text-sm font-medium mb-2 leading-snug">
              Luxury RV Glamping Without Driving an RV.
            </p>
            <p className="text-stone-400 text-sm mb-6">
              Near Folsom Lake, Northern California
            </p>
            {/* Social Placeholders */}
            <div className="flex gap-3">
              {['Instagram', 'Facebook', 'TikTok'].map((social) => (
                <span
                  key={social}
                  title={social}
                  className="w-9 h-9 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-amber-400 hover:border-amber-400 cursor-pointer transition-colors text-xs font-bold"
                >
                  {social[0]}
                </span>
              ))}
            </div>
          </div>

          {/* Experiences Column */}
          <div>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
              Experiences
            </h3>
            <ul className="space-y-2.5">
              {experienceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 hover:text-amber-300 text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations Column */}
          <div>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
              Destinations
            </h3>
            <ul className="space-y-2.5">
              {destinationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-stone-400 hover:text-amber-300 text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors duration-200 ${
                      link.label === 'Book Now'
                        ? 'text-amber-400 hover:text-amber-300 font-medium'
                        : 'text-stone-400 hover:text-amber-300'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Campground Fee Disclaimer */}
      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-stone-500 text-xs text-center leading-relaxed">
            ⚠️ Campground fees are paid directly to the campground/host and are not included in booking totals.
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-stone-500 text-sm">
              © 2025 SunRioVistas · All rights reserved
            </p>
            <div className="flex items-center gap-4">
              <Link href="/terms" className="text-stone-500 hover:text-amber-400 text-xs transition-colors">
                Terms & Conditions
              </Link>
              <Link href="/contact" className="text-stone-500 hover:text-amber-400 text-xs transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
