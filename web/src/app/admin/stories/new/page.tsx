"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ImageUploader from "@/components/editor/ImageUploader";
import VideoUploader from "@/components/editor/VideoUploader";
import { isValidYouTubeUrl } from "@/lib/youtube";
import type { MediaItem } from "@/types/database";

const TiptapEditor = dynamic(() => import("@/components/editor/TiptapEditor"), {
  ssr: false,
  loading: () => <div className="border rounded-xl p-6 min-h-[200px] bg-white" />,
});

export default function CreateStoryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [honoreeName, setHonoreeName] = useState("");
  const [summary, setSummary] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [youtubeInput, setYoutubeInput] = useState("");

  const handleCreate = async () => {
    setSaving(true);
    setError("");

    const res = await fetch("/api/admin/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        honoree_name: honoreeName,
        summary: summary || undefined,
        content_html: contentHtml || undefined,
        youtube_urls: youtubeUrls,
        media_items: mediaItems,
        cover_image_url: coverImageUrl || undefined,
        is_featured: isFeatured,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/stories/${data.id}`);
    } else {
      const data = await res.json();
      if (data.errors) {
        setError(data.errors.map((e: { message: string }) => e.message).join(", "));
      } else {
        setError(data.error || "Failed to create story");
      }
    }
    setSaving(false);
  };

  const images = mediaItems.filter((m) => m.type === "image");
  const videos = mediaItems.filter((m) => m.type === "video");

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 text-sm mb-2 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 font-serif">
          Create Story
        </h1>
        <p className="text-gray-500 mt-1">Create a new memorial story directly as admin.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Honoree Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={honoreeName}
              onChange={(e) => setHonoreeName(e.target.value)}
              placeholder="Full name of the person being remembered"
              maxLength={120}
              className="w-full px-4 py-2.5 rounded-lg border focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A title for this memorial"
              maxLength={140}
              className="w-full px-4 py-2.5 rounded-lg border focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              placeholder="A brief summary (optional)"
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

        <div className="bg-white rounded-xl border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <TiptapEditor content={contentHtml} onChange={setContentHtml} />
        </div>

        <div className="bg-white rounded-xl border p-6 space-y-6">
          <ImageUploader
            onUpload={(item) => {
              setMediaItems((prev) => [...prev, item]);
              if (!coverImageUrl) setCoverImageUrl(item.url);
            }}
            existingItems={images}
            onRemove={(index) => {
              const img = images[index];
              setMediaItems((prev) => prev.filter((m) => m !== img));
              if (img.url === coverImageUrl) setCoverImageUrl("");
            }}
          />
          <VideoUploader
            onUpload={(item) => setMediaItems((prev) => [...prev, item])}
            existingItems={videos}
            onRemove={(index) => {
              const vid = videos[index];
              setMediaItems((prev) => prev.filter((m) => m !== vid));
            }}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">YouTube Videos</label>
            {youtubeUrls.map((url, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600 truncate flex-1">{url}</span>
                <button onClick={() => setYoutubeUrls((p) => p.filter((_, idx) => idx !== i))} className="text-red-500 text-sm">Remove</button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={youtubeInput}
                onChange={(e) => setYoutubeInput(e.target.value)}
                placeholder="YouTube URL"
                className="flex-1 px-4 py-2 rounded-lg border focus:border-earth-gold outline-none text-sm"
              />
              <button
                onClick={() => {
                  if (youtubeInput && isValidYouTubeUrl(youtubeInput)) {
                    setYoutubeUrls((p) => [...p, youtubeInput]);
                    setYoutubeInput("");
                  }
                }}
                className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={saving}
          className="px-8 py-3 bg-earth-gold text-earth-darkest rounded-lg font-semibold hover:bg-earth-amber disabled:opacity-60 transition-colors text-lg"
        >
          {saving ? "Creating..." : "Create & Publish Story"}
        </button>
      </div>
    </div>
  );
}
