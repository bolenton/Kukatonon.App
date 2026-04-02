"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="border-b"
      style={{
        backgroundColor: "var(--site-header-bg)",
        color: "var(--site-header-text)",
        borderColor: "var(--site-header-border)",
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Kukatonon" className="h-10 w-10 rounded-lg object-cover" />
            <div>
              <h1 className="text-lg sm:text-xl font-bold font-serif tracking-wide" style={{ color: "var(--site-header-text)" }}>
                Kukatonon
              </h1>
              <p className="text-[10px] sm:text-xs tracking-widest uppercase hidden sm:block" style={{ color: "var(--site-header-link)" }}>
                Memorial
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/stories" className="text-sm font-medium transition-colors" style={{ color: "var(--site-header-link)" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--site-header-link-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--site-header-link)"}
            >
              Stories
            </Link>
            <Link href="/about" className="text-sm font-medium transition-colors" style={{ color: "var(--site-header-link)" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--site-header-link-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--site-header-link)"}
            >
              About
            </Link>
            <Link
              href="/submit"
              className="bg-earth-amber hover:bg-earth-orange text-earth-darkest px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Share a Story
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            style={{ color: "var(--site-header-link)" }}
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
          <div className="md:hidden pb-4 pt-4 space-y-3" style={{ borderTopColor: "var(--site-header-border)", borderTopWidth: "1px" }}>
            <Link href="/stories" className="block py-2 font-medium" style={{ color: "var(--site-header-link)" }} onClick={() => setMobileMenuOpen(false)}>
              Stories
            </Link>
            <Link href="/about" className="block py-2 font-medium" style={{ color: "var(--site-header-link)" }} onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <Link
              href="/submit"
              className="block bg-earth-amber hover:bg-earth-orange text-earth-darkest px-5 py-2 rounded-lg text-sm font-semibold text-center"
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
