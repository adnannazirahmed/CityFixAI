'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/chat', label: 'AI Chat' },
  { href: '/report', label: 'Report Issue' },
  { href: '/map', label: 'Issue Map' },
  { href: '/leaderboard', label: '🏆 Leaderboard' },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.svg" alt="CityFix AI" className="h-9 w-9 object-contain" />
          <span className="text-lg font-black text-gray-900">CityFix <span className="text-blue-600">AI</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-blue-600',
                pathname === link.href ? 'text-blue-700' : 'text-gray-600'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/admin/login">
            <Button variant="outline" size="sm" className="gap-2">
              <Shield className="h-3.5 w-3.5" />
              Admin
            </Button>
          </Link>
          <Link href="/chat">
            <Button size="sm" variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
              <MessageSquare className="h-3.5 w-3.5" />
              AI Chat
            </Button>
          </Link>
          <Link href="/report">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              + Report Issue
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-gray-700"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 space-y-2">
            <Link href="/admin/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">Admin Login</Button>
            </Link>
            <Link href="/chat" onClick={() => setMobileOpen(false)}>
              <Button size="sm" variant="outline" className="w-full border-blue-200 text-blue-700">
                <MessageSquare className="h-3.5 w-3.5 mr-2" /> AI Chat
              </Button>
            </Link>
            <Link href="/report" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Report Issue</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
