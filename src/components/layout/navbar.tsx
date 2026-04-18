'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/',            label: 'Home' },
  { href: '/chat',        label: 'AI Chat' },
  { href: '/report',      label: 'Report Issue' },
  { href: '/map',         label: 'Issue Map' },
  { href: '/leaderboard', label: '🏆 Leaderboard' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100/80 bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="container flex h-16 items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/logo.svg" alt="CityFix AI" className="h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-105" />
          <span className="text-[15px] font-black tracking-tight text-gray-900">
            CityFix <span className="text-blue-600">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150',
                pathname === link.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link href="/admin/login">
            <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600">
              <Shield className="h-3.5 w-3.5" />
              Admin
            </Button>
          </Link>
          <Link href="/chat">
            <Button size="sm" variant="outline" className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50">
              <MessageSquare className="h-3.5 w-3.5" />
              AI Chat
            </Button>
          </Link>
          <Link href="/report">
            <Button size="sm" variant="cityfix" className="gap-1.5">
              + Report Issue
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              )}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 space-y-2 border-t border-gray-100 mt-2">
            <Link href="/admin/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">Admin Login</Button>
            </Link>
            <Link href="/chat" onClick={() => setMobileOpen(false)}>
              <Button size="sm" variant="outline" className="w-full border-blue-200 text-blue-700">
                <MessageSquare className="h-3.5 w-3.5 mr-2" /> AI Chat
              </Button>
            </Link>
            <Link href="/report" onClick={() => setMobileOpen(false)}>
              <Button size="sm" variant="cityfix" className="w-full">Report Issue</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
