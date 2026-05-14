'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Calendar,
  Home,
  MapPin,
  DollarSign,
  Package,
  CalendarX,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
  { label: 'RV Experiences', href: '/admin/rvs', icon: Home },
  { label: 'Destinations', href: '/admin/destinations', icon: MapPin },
  { label: 'Pricing Rules', href: '/admin/pricing', icon: DollarSign },
  { label: 'Add-Ons', href: '/admin/addons', icon: Package },
  { label: 'Calendar & Blockouts', href: '/admin/calendar', icon: CalendarX },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

interface AdminSidebarClientProps {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

function NavItem({
  item,
  pathname,
  onClick,
}: {
  item: (typeof navItems)[0]
  pathname: string
  onClick?: () => void
}) {
  const isActive = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + '/')

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
        isActive
          ? 'bg-amber-500 text-white shadow-sm'
          : 'text-stone-400 hover:text-white hover:bg-stone-700'
      }`}
    >
      <item.icon
        size={18}
        className={isActive ? 'text-white' : 'text-stone-500 group-hover:text-white'}
      />
      <span>{item.label}</span>
      {isActive && <ChevronRight size={14} className="ml-auto opacity-70" />}
    </Link>
  )
}

export default function AdminSidebarClient({ user }: AdminSidebarClientProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'A'

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-stone-700">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="text-2xl">⛺</span>
          <div>
            <p className="text-white font-serif font-bold text-base leading-tight">SunRioVistas</p>
            <p className="text-amber-400 text-xs font-medium">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            pathname={pathname}
            onClick={() => setMobileOpen(false)}
          />
        ))}

        {/* Separator */}
        <div className="my-3 border-t border-stone-700" />

        {/* View Site */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-700 transition-all duration-150 group"
        >
          <ExternalLink size={18} className="text-stone-500 group-hover:text-white" />
          <span>View Site</span>
        </a>

        {/* Sign Out */}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-400 hover:text-red-400 hover:bg-stone-700 transition-all duration-150 group"
        >
          <LogOut size={18} className="text-stone-500 group-hover:text-red-400" />
          <span>Sign Out</span>
        </button>
      </nav>

      {/* User Footer */}
      <div className="px-4 py-4 border-t border-stone-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user.name || 'Admin'}</p>
            <p className="text-stone-400 text-xs truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-stone-900 border-b border-stone-700 px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl">⛺</span>
          <span className="text-white font-serif font-bold text-base">SunRioVistas Admin</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-40 w-64 bg-stone-900 transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-stone-900 border-r border-stone-700">
        {sidebarContent}
      </aside>

      {/* Mobile top bar spacer */}
      <div className="lg:hidden h-14 shrink-0" />
    </>
  )
}
