"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StoryComposer from "@/components/editor/composer/StoryComposer";
import type { Story } from "@/types/database";
import type { ContentBlock } from "@/types/blocks";

export default function AdminStoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [honoreeName, setHonoreeName] = useState("");
  const [summary, setSummary] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/stories/${id}`);
      if (!res.ok) {
        router.push("/admin/stories");
        return;
      }
      const data: Story = await res.json();
      setStory(data);
      setTitle(data.title);
      setHonoreeName(data.honoree_name);
      setSummary(data.summary || "");
      setCoverImageUrl(data.cover_image_url || "");
      setIsFeatured(data.is_featured);
      setReviewNotes(data.review_notes || "");
      setContentBlocks(data.content_blocks || []);
      setLoading(false);
    }
    load();
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/admin/stories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        honoree_name: honoreeName,
        summary: summary || null,
        cover_image_url: coverImageUrl || null,
        is_featured: isFeatured,
        review_notes: reviewNotes || null,
        content_blocks: contentBlocks.length > 0 ? contentBlocks : null,
        // Preserve original source material
        content_html: story?.content_html || null,
        youtube_urls: story?.youtube_urls || [],
        media_items: story?.media_items || [],
      }),
    });
    if (res.ok) {
      setMessage("Saved successfully");
      const updated = await res.json();
      setStory(updated);
    } else {
      setMessage("Failed to save");
    }
    setSaving(false);
  };

  const handleApprove = async () => {
    const res = await fetch(`/api/admin/stories/${id}/approve`, { method: "POST" });
    if (res.ok) {
      setMessage("Story approved");
      const updated = await res.json();
      setStory(updated);
    }
  };

  const handleReject = async () => {
    const res = await fetch(`/api/admin/stories/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ review_notes: reviewNotes }),
    });
    if (res.ok) {
      setMessage("Story rejected");
      const updated = await res.json();
      setStory(updated);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-earth-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!story) return null;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 text-sm mb-2 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Edit Story</h1>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          story.status === "approved" ? "bg-green-100 text-green-800" :
          story.status === "rejected" ? "bg-red-100 text-red-800" :
          "bg-amber-100 text-amber-800"
        }`}>
          {story.status}
        </span>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${
          message.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
        }`}>
          {message}
        </div>
      )}

      {/* Contact info (for submissions) */}
      {story.source_type === "public_submission" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-blue-900 text-sm mb-2">Submitter Contact Info</h3>
          <p className="text-sm text-blue-800">{story.submitted_by_name}</p>
          <div className="flex flex-wrap gap-4 mt-1 text-sm text-blue-700">
            {story.submitted_by_phone && <span>Phone: {story.submitted_by_phone}</span>}
            {story.submitted_by_whatsapp && <span>WhatsApp: {story.submitted_by_whatsapp}</span>}
            {story.submitted_by_email && <span>Email: {story.submitted_by_email}</span>}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic fields */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Honoree Name</label>
            <input
              type="text"
              value={honoreeName}
              onChange={(e) => setHonoreeName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Featured</label>
            <button
              type="button"
              onClick={() => setIsFeatured(!isFeatured)}
              className={`w-10 h-6 rounded-full transition-colors ${isFeatured ? "bg-earth-gold" : "bg-gray-200"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isFeatured ? "translate-x-4.5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        {/* Cover image preview */}
        {coverImageUrl && (
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Cover Image</span>
              <button onClick={() => setCoverImageUrl("")} className="text-xs text-red-600 hover:text-red-800">Remove</button>
            </div>
            <img src={coverImageUrl} alt="Cover" className="h-32 rounded-lg object-cover" />
          </div>
        )}

        {/* Story Composer */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Story Content</h2>
          <StoryComposer
            blocks={contentBlocks}
            onChange={setContentBlocks}
            sourceContentHtml={story.content_html}
            sourceMediaItems={story.media_items || []}
            sourceYoutubeUrls={story.youtube_urls || []}
            coverImageUrl={coverImageUrl}
            onCoverImageChange={setCoverImageUrl}
          />
        </div>

        {/* Review Notes */}
        <div className="bg-white rounded-xl border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes (internal)</label>
          <textarea
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none resize-none"
            placeholder="Internal notes about this submission..."
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-earth-amber text-earth-darkest rounded-lg font-medium hover:bg-earth-orange disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {story.status !== "approved" && (
            <button
              onClick={handleApprove}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
          )}

          {story.status !== "rejected" && (
            <button
              onClick={handleReject}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
