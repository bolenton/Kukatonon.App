"use client";

import { useEffect, useState } from "react";

const themes = [
  {
    id: "nature",
    name: "Nature",
    description: "Sage green, warm yellow, and soft orange on a clean white base.",
    colors: ["#ABC270", "#FEC868", "#FDA769", "#463C33"],
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional gold and amber accents on a clean white base.",
    colors: ["#b8860b", "#daa520", "#c8961e", "#1a0f0a"],
  },
  {
    id: "earth",
    name: "Earth",
    description: "Rich gold accents on a dark, warm background. Bold and dramatic.",
    colors: ["#1a0f0a", "#b8860b", "#daa520", "#faebd7"],
  },
] as const;

export default function AdminSettingsPage() {
  const [currentTheme, setCurrentTheme] = useState("nature");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) return;
        const data = await res.json();
        setCurrentTheme(data.settings?.theme || "nature");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleThemeChange(themeId: string) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: themeId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to update theme." });
        return;
      }
      setCurrentTheme(themeId);

      // Apply theme immediately to current page
      if (themeId === "nature") {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", themeId);
      }

      setMessage({ type: "success", text: "Theme updated. Visitors will see the new theme on their next page load." });
    } catch {
      setMessage({ type: "error", text: "Failed to update theme." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Settings</h1>
        <p className="text-gray-500 mt-1">Configure site-wide settings.</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl border text-sm ${
          message.type === "success"
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Site Theme</h2>
        <p className="text-gray-500 text-sm mb-6">Choose the color scheme for the public-facing site.</p>

        <div className="grid gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              disabled={saving}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                currentTheme === theme.id
                  ? "border-earth-gold ring-2 ring-earth-gold/20"
                  : "border-gray-200 hover:border-gray-300"
              } disabled:opacity-60`}
            >
              <div className="flex items-center gap-4">
                {/* Color swatches */}
                <div className="flex -space-x-1.5">
                  {theme.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{theme.name}</span>
                    {currentTheme === theme.id && (
                      <span className="text-xs bg-earth-gold/10 text-earth-gold px-2 py-0.5 rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{theme.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
