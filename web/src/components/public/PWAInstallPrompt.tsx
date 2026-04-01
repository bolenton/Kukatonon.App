"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after a short delay so it doesn't feel intrusive
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-in slide-in-from-bottom">
      <div className="bg-earth-darkest text-earth-cream rounded-2xl shadow-2xl p-5 border border-earth-gold/20">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-earth-gold rounded-xl flex items-center justify-center shrink-0">
            <span className="text-earth-darkest font-bold text-xl font-serif">K</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Install Kukatonon</h3>
            <p className="text-earth-cream/70 text-xs mt-1">
              Install this app on your device for quick access to memorial stories.
            </p>
          </div>
          <button onClick={handleDismiss} className="text-earth-cream/50 hover:text-earth-cream">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <button
          onClick={handleInstall}
          className="w-full mt-3 bg-earth-gold hover:bg-earth-amber text-earth-darkest py-2 rounded-lg font-semibold text-sm transition-colors"
        >
          Install App
        </button>
      </div>
    </div>
  );
}
