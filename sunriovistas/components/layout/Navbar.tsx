'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Experiences', href: '/rvs' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-amber-100'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="SunRioVistas Home"
          >
            <span className="text-2xl" aria-hidden="true">⛺</span>
            <span className="font-serif text-xl md:text-2xl font-bold text-amber-600 group-hover:text-amber-700 transition-colors">
              SunRioVistas
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-stone-700 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/book"
              className="btn-primary px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-stone-700 hover:text-amber-600 hover:bg-amber-50 transition-colors"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-screen opacity-100 pb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-amber-100 pt-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  pathname === link.href || pathname.startsWith(link.href + '/')
                    ? 'text-amber-600 bg-amber-50'
                    : 'text-stone-700 hover:text-amber-600 hover:bg-amber-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 px-4">
              <Link
                href="/book"
                className="btn-primary block w-full text-center py-3 rounded-full text-base font-semibold"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
