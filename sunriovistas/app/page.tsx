import type { Metadata } from 'next'
import Hero from '@/components/marketing/Hero'
import WhyDifferent from '@/components/marketing/WhyDifferent'
import PricingAnchor from '@/components/marketing/PricingAnchor'
import RVCards from '@/components/marketing/RVCards'
import DestinationCards from '@/components/marketing/DestinationCards'
import HowItWorks from '@/components/marketing/HowItWorks'
import Testimonials from '@/components/marketing/Testimonials'
import FAQ from '@/components/marketing/FAQ'
import Scarcity from '@/components/marketing/Scarcity'
import FinalCTA from '@/components/marketing/FinalCTA'
import LeadCapture from '@/components/marketing/LeadCapture'

export const metadata: Metadata = {
  title: 'SunRioVistas | Luxury RV Glamping Near Folsom Lake',
  description:
    'Experience luxury RV glamping without driving an RV. Pre-setup premium RV experiences near Folsom Lake, Northern California. No insurance, no towing, no stress.',
  keywords: [
    'rv glamping near folsom lake',
    'glamping near sacramento',
    'luxury camping california',
    'winery glamping california',
    'family glamping northern california',
    'stationary rv rental',
    'rv airbnb folsom',
  ],
  openGraph: {
    title: 'SunRioVistas | Luxury RV Glamping Near Folsom Lake',
    description:
      'Arrive in your own car. The RV is already set up. Luxury glamping near Folsom Lake, Northern California — no driving, no towing, no stress.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <main>
      {/* 1. Hero */}
      <Hero />

      {/* 2. Why Different — white bg */}
      <div className="bg-white">
        <WhyDifferent />
      </div>

      {/* 3. RV Cards — amber-50 bg */}
      <div className="bg-amber-50">
        <RVCards />
      </div>

      {/* 4. How It Works — white bg */}
      <div className="bg-white">
        <HowItWorks />
      </div>

      {/* 5. Destination Cards — amber-50 bg */}
      <div className="bg-amber-50">
        <DestinationCards />
      </div>

      {/* 6. Pricing Anchor — dark stone-900 bg */}
      <div className="bg-stone-900">
        <PricingAnchor />
      </div>

      {/* 7. Testimonials — white bg */}
      <div className="bg-white">
        <Testimonials />
      </div>

      {/* 8. Scarcity — amber-50 bg */}
      <div className="bg-amber-50">
        <Scarcity />
      </div>

      {/* 9. FAQ — white bg */}
      <div className="bg-white">
        <FAQ />
      </div>

      {/* 10. Lead Capture — amber-50 bg */}
      <div className="bg-amber-50">
        <LeadCapture />
      </div>

      {/* 11. Final CTA — gradient */}
      <FinalCTA />
    </main>
  )
}
