'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

const featurePills = [
  '✓ No RV Insurance',
  '✓ No Towing',
  '✓ No Mileage Fees',
  '✓ No Setup Stress',
]

export default function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        aria-label="Hero section"
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-amber-700"
          style={{
            backgroundImage: "url('/images/hero-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          aria-hidden="true"
        />

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-900/60 to-stone-900/40"
          aria-hidden="true"
        />

        {/* Animated floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-10 animate-float"
              style={{
                width: `${60 + i * 40}px`,
                height: `${60 + i * 40}px`,
                background: 'radial-gradient(circle, #fbbf24, transparent)',
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 1.2}s`,
                animationDuration: `${5 + i}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div
          className={`relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 text-amber-200 text-sm font-medium px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
            <span>🌿</span>
            <span>Northern California's Premier RV Glamping</span>
          </div>

          {/* H1 */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Luxury RV Glamping
            <br />
            <span className="text-amber-400">Without Driving an RV</span>
          </h1>

          {/* Subheadline */}
          <p className="text-stone-200 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto mb-8 leading-relaxed">
            Skip RV insurance, gas costs, towing, and stressful driving. Arrive in your own car to a fully setup premium RV experience near Folsom Lake.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {featurePills.map((pill) => (
              <span
                key={pill}
                className="inline-flex items-center px-4 py-1.5 rounded-full border border-amber-400/60 text-amber-200 text-sm font-medium bg-amber-500/10 backdrop-blur-sm"
              >
                {pill}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/book"
              className="btn-primary px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 min-w-[220px] text-center"
            >
              Check Availability
            </Link>
            <Link
              href="/rvs"
              className="btn-outline px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-all duration-200 min-w-[220px] text-center border-2 border-white text-white hover:bg-white/10"
            >
              Explore RV Experiences
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="text-amber-300/70" size={32} />
        </div>
      </section>

      {/* Social Proof Bar */}
      <div className="bg-amber-600 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white text-sm font-medium">
          <span className="flex items-center gap-2">
            <span>⭐️⭐️⭐️⭐️⭐️</span>
            <span>Loved by 50+ families</span>
          </span>
          <span className="hidden sm:block text-amber-300">·</span>
          <span>3 Luxury RVs Available</span>
          <span className="hidden sm:block text-amber-300">·</span>
          <span>Near Folsom Lake, Northern California</span>
        </div>
      </div>
    </>
  )
}
