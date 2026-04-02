"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  featured: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, featured: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const supabase = createClient();

      const [pending, approved, rejected, featured] = await Promise.all([
        supabase.from("stories").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("stories").select("id", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("stories").select("id", { count: "exact", head: true }).eq("status", "rejected"),
        supabase.from("stories").select("id", { count: "exact", head: true }).eq("is_featured", true).eq("status", "approved"),
      ]);

      setStats({
        pending: pending.count || 0,
        approved: approved.count || 0,
        rejected: rejected.count || 0,
        featured: featured.count || 0,
      });
      setLoading(false);
    }

    loadStats();
  }, []);

  const statCards = [
    { label: "Pending Review", value: stats.pending, color: "bg-amber-50 text-amber-700 border-amber-200", href: "/admin/pending" },
    { label: "Approved", value: stats.approved, color: "bg-green-50 text-green-700 border-green-200", href: "/admin/stories?status=approved" },
    { label: "Rejected", value: stats.rejected, color: "bg-red-50 text-red-700 border-red-200", href: "/admin/stories?status=rejected" },
    { label: "Featured", value: stats.featured, color: "bg-blue-50 text-blue-700 border-blue-200", href: "/admin/stories?featured=true" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">Overview of the Kukatonon memorial platform.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`p-5 rounded-xl border ${card.color} hover:shadow-md transition-shadow`}
          >
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className="text-3xl font-bold mt-1">
              {loading ? "..." : card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/pending"
            className="px-4 py-2 bg-earth-amber text-earth-darkest rounded-lg text-sm font-medium hover:bg-earth-orange transition-colors"
          >
            Review Pending Stories
          </Link>
          <Link
            href="/admin/stories/new"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            Create New Story
          </Link>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            target="_blank"
          >
            View Public Site
          </Link>
        </div>
      </div>
    </div>
  );
}
