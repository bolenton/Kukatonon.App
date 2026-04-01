"use client";

export default function OfflinePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-earth-gold/10 flex items-center justify-center">
        <svg className="w-10 h-10 text-earth-gold/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3" />
        </svg>
      </div>
      <h1 className="font-serif text-3xl font-bold text-earth-dark mb-4">
        You&apos;re Offline
      </h1>
      <p className="text-earth-warm text-lg mb-6">
        Please check your internet connection and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-earth-gold hover:bg-earth-amber text-earth-darkest px-6 py-2.5 rounded-lg font-semibold transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
