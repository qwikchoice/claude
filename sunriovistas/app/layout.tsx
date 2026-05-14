import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import SessionWrapper from '@/components/layout/SessionWrapper'

export const metadata: Metadata = {
  title: 'SunRioVistas | Luxury RV Glamping Near Folsom Lake',
  description:
    'Experience luxury RV glamping without driving an RV. Pre-setup premium RV experiences near Folsom Lake, Northern California.',
  keywords: [
    'rv glamping folsom lake',
    'glamping sacramento',
    'luxury camping california',
    'stationary rv rental',
    'rv airbnb folsom',
  ],
  openGraph: {
    title: 'SunRioVistas | Luxury RV Glamping Near Folsom Lake',
    description:
      'Experience luxury RV glamping without driving an RV. Pre-setup premium RV experiences near Folsom Lake, Northern California.',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    siteName: 'SunRioVistas',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'SunRioVistas Luxury RV Glamping near Folsom Lake',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SunRioVistas | Luxury RV Glamping Near Folsom Lake',
    description:
      'Experience luxury RV glamping without driving an RV. Pre-setup premium RV experiences near Folsom Lake, Northern California.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#d97706',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <SessionWrapper>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SessionWrapper>
      </body>
    </html>
  )
}
