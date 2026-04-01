"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-earth-darkest text-earth-cream border-b border-earth-gold/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-earth-gold rounded-lg flex items-center justify-center">
              <span className="text-earth-darkest font-bold text-lg font-serif">K</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold font-serif tracking-wide">
                Kukatonon
              </h1>
              <p className="text-[10px] sm:text-xs text-earth-amber/80 tracking-widest uppercase hidden sm:block">
                Memorial App
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/stories"
              className="text-earth-cream/80 hover:text-earth-amber transition-colors text-sm tracking-wide"
            >
              Stories
            </Link>
            <Link
              href="/about"
              className="text-earth-cream/80 hover:text-earth-amber transition-colors text-sm tracking-wide"
            >
              About
            </Link>
            <Link
              href="/submit"
              className="bg-earth-gold hover:bg-earth-amber text-earth-darkest px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Share a Story
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-earth-cream/80"
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
          <div className="md:hidden pb-4 border-t border-earth-gold/20 pt-4 space-y-3">
            <Link
              href="/stories"
              className="block text-earth-cream/80 hover:text-earth-amber py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Stories
            </Link>
            <Link
              href="/about"
              className="block text-earth-cream/80 hover:text-earth-amber py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/submit"
              className="block bg-earth-gold hover:bg-earth-amber text-earth-darkest px-5 py-2 rounded-lg text-sm font-semibold text-center"
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
