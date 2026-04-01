"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Story, StoryStatus } from "@/types/database";

export default function AdminStoriesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-earth-gold border-t-transparent rounded-full animate-spin" /></div>}>
      <AdminStoriesContent />
    </Suspense>
  );
}

function AdminStoriesContent() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StoryStatus | "all">("all");
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status") as StoryStatus | null;
    if (status) setFilter(status);
  }, [searchParams]);

  useEffect(() => {
    loadStories();
  }, [filter]);

  async function loadStories() {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("stories")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    setStories(data || []);
    setLoading(false);
  }

  async function toggleFeatured(id: string, current: boolean) {
    const res = await fetch(`/api/admin/stories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_featured: !current }),
    });
    if (res.ok) {
      setStories((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_featured: !current } : s))
      );
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">
            All Stories
          </h1>
          <p className="text-gray-500 mt-1">{stories.length} stories</p>
        </div>
        <Link
          href="/admin/stories/new"
          className="px-4 py-2 bg-earth-gold text-earth-darkest rounded-lg text-sm font-medium hover:bg-earth-amber transition-colors"
        >
          + Create Story
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === status
                ? "bg-earth-gold text-earth-darkest"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-earth-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stories.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-400">No stories found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Honoree</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Featured</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stories.map((story) => (
                <tr key={story.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">{story.honoree_name}</p>
                    <p className="text-xs text-gray-500 md:hidden">{story.title}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell max-w-xs truncate">
                    {story.title}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[story.status]}`}>
                      {story.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <button
                      onClick={() => toggleFeatured(story.id, story.is_featured)}
                      className={`w-8 h-5 rounded-full transition-colors ${
                        story.is_featured ? "bg-earth-gold" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          story.is_featured ? "translate-x-3.5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                    {new Date(story.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/stories/${story.id}`}
                      className="text-earth-gold hover:text-earth-amber text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
