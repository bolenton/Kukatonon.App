"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { Story } from "@/types/database";

export default function PendingPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    const supabase = createClient();
    const { data } = await supabase
      .from("stories")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    setStories(data || []);
    setLoading(false);
  }

  async function handleApprove(id: string) {
    const res = await fetch(`/api/admin/stories/${id}/approve`, { method: "POST" });
    if (res.ok) {
      setStories((prev) => prev.filter((s) => s.id !== id));
    }
  }

  async function handleReject(id: string) {
    const notes = window.prompt("Review notes (optional):");
    const res = await fetch(`/api/admin/stories/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_notes: notes }),
    });
    if (res.ok) {
      setStories((prev) => prev.filter((s) => s.id !== id));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-earth-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">
          Pending Review
        </h1>
        <p className="text-gray-500 mt-1">
          {stories.length} {stories.length === 1 ? "submission" : "submissions"} waiting for review.
        </p>
      </div>

      {stories.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-400">No pending submissions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <div key={story.id} className="bg-white rounded-xl border p-6">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{story.honoree_name}</h3>
                  <p className="text-gray-600 text-sm">{story.title}</p>
                  {story.summary && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{story.summary}</p>
                  )}

                  {/* Contact info (admin only) */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Submitted by</p>
                    <p className="text-sm text-gray-700 font-medium">{story.submitted_by_name}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                      {story.submitted_by_phone && <span>Phone: {story.submitted_by_phone}</span>}
                      {story.submitted_by_whatsapp && <span>WhatsApp: {story.submitted_by_whatsapp}</span>}
                      {story.submitted_by_email && <span>Email: {story.submitted_by_email}</span>}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Submitted {new Date(story.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2 lg:flex-col">
                  <Link
                    href={`/admin/stories/${story.id}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                  >
                    Review
                  </Link>
                  <button
                    onClick={() => handleApprove(story.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(story.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
