"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-earth-gold rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg font-serif">K</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold font-serif tracking-wide text-gray-900">
                Kukatonon
              </h1>
              <p className="text-[10px] sm:text-xs text-gray-400 tracking-widest uppercase hidden sm:block">
                Memorial
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/stories"
              className="text-gray-600 hover:text-earth-gold transition-colors text-sm font-medium"
            >
              Stories
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-earth-gold transition-colors text-sm font-medium"
            >
              About
            </Link>
            <Link
              href="/submit"
              className="bg-earth-gold hover:bg-earth-amber text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Share a Story
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-4 space-y-3">
            <Link
              href="/stories"
              className="block text-gray-600 hover:text-earth-gold py-2 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Stories
            </Link>
            <Link
              href="/about"
              className="block text-gray-600 hover:text-earth-gold py-2 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/submit"
              className="block bg-earth-gold hover:bg-earth-amber text-white px-5 py-2 rounded-lg text-sm font-semibold text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Share a Story
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
