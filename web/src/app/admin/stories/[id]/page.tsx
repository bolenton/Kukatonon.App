"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StoryComposer from "@/components/editor/composer/StoryComposer";
import SourcePalette from "@/components/editor/composer/SourcePalette";
import StoryBlockRenderer from "@/components/public/StoryBlockRenderer";
import RichTextRenderer from "@/components/public/RichTextRenderer";
import ImageUploader from "@/components/editor/ImageUploader";
import type { Story, Category } from "@/types/database";
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
  const [showEventLocation, setShowEventLocation] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [locationLatitude, setLocationLatitude] = useState("");
  const [locationLongitude, setLocationLongitude] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories").then(r => r.ok ? r.json() : { categories: [] }).then(d => setAllCategories(d.categories || []));
  }, []);

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
      setShowEventLocation(!!data.show_event_location);
      setLocationName(data.event_location_name || "");
      setLocationLatitude(data.event_latitude != null ? String(data.event_latitude) : "");
      setLocationLongitude(data.event_longitude != null ? String(data.event_longitude) : "");
      setReviewNotes(data.review_notes || "");
      setContentBlocks(data.content_blocks || []);
      setCategoryIds(data.category_ids || []);
      setLoading(false);
    }
    load();
  }, [id, router]);

  function addBlock(block: ContentBlock) {
    setContentBlocks([...contentBlocks, block]);
  }

  function handleConvertToBlocks() {
    if (!story) return;
    const newBlocks: ContentBlock[] = [];
    if (story.content_html) {
      newBlocks.push({ id: crypto.randomUUID(), type: "text", html: story.content_html });
    }
    for (const item of story.media_items || []) {
      if (item.type === "image") {
        newBlocks.push({ id: crypto.randomUUID(), type: "image", url: item.url, width: item.width, height: item.height });
      } else if (item.type === "video") {
        newBlocks.push({ id: crypto.randomUUID(), type: "video", url: item.url });
      } else if (item.type === "audio") {
        newBlocks.push({ id: crypto.randomUUID(), type: "audio", url: item.url });
      }
    }
    for (const url of story.youtube_urls || []) {
      newBlocks.push({ id: crypto.randomUUID(), type: "youtube", url });
    }
    setContentBlocks(newBlocks);
  }

  const handleSave = async () => {
    const trimmedLocationName = locationName.trim();
    const nextLatitude = locationLatitude.trim() === "" ? null : Number(locationLatitude);
    const nextLongitude = locationLongitude.trim() === "" ? null : Number(locationLongitude);

    const hasNextLocationInput =
      trimmedLocationName.length > 0 || locationLatitude.trim() !== "" || locationLongitude.trim() !== "";

    if ((nextLatitude != null && Number.isNaN(nextLatitude)) || (nextLongitude != null && Number.isNaN(nextLongitude))) {
      setMessage("Location coordinates must be valid numbers");
      return;
    }

    if ((nextLatitude == null) !== (nextLongitude == null)) {
      setMessage("Location requires both latitude and longitude");
      return;
    }

    const nextLocationName = trimmedLocationName || null;
    const hasExistingLocation = story?.event_latitude != null && story?.event_longitude != null;
    const isReplacingLocation =
      hasExistingLocation &&
      (story.event_latitude !== nextLatitude ||
        story.event_longitude !== nextLongitude ||
        (story.event_location_name || null) !== nextLocationName);

    if (isReplacingLocation && !window.confirm("This will overwrite the previous location for this story. Continue?")) {
      return;
    }

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
        show_event_location: nextLatitude != null && nextLongitude != null ? showEventLocation : false,
        event_latitude: nextLatitude,
        event_longitude: nextLongitude,
        event_location_name: nextLocationName,
        review_notes: reviewNotes || null,
        content_blocks: contentBlocks.length > 0 ? contentBlocks : null,
        category_ids: categoryIds,
        content_html: story?.content_html || null,
        youtube_urls: story?.youtube_urls || [],
        media_items: story?.media_items || [],
      }),
    });
    if (res.ok) {
      setMessage("Saved successfully");
      const updated = await res.json();
      setStory(updated);
      setShowEventLocation(!!updated.show_event_location);
      setLocationName(updated.event_location_name || "");
      setLocationLatitude(updated.event_latitude != null ? String(updated.event_latitude) : "");
      setLocationLongitude(updated.event_longitude != null ? String(updated.event_longitude) : "");
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

  const sourceImages = (story.media_items || []).filter((m) => m.type === "image");
  const hasSourceContent = story.content_html || (story.media_items?.length || 0) > 0 || (story.youtube_urls?.length || 0) > 0;
  const hasLocation = locationLatitude.trim() !== "" && locationLongitude.trim() !== "";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            story.status === "approved" ? "bg-green-100 text-green-800" :
            story.status === "rejected" ? "bg-red-100 text-red-800" :
            "bg-amber-100 text-amber-800"
          }`}>
            {story.status}
          </span>
          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </button>
        </div>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm ${
          message.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
        }`}>
          {message}
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex gap-6">
        {/* Left column: Editor */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Contact info (for submissions) */}
          {story.source_type === "public_submission" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 text-sm mb-2">Submitter Contact Info</h3>
              <p className="text-sm text-blue-800">{story.submitted_by_name}</p>
              <div className="flex flex-wrap gap-4 mt-1 text-sm text-blue-700">
                {story.submitted_by_phone && <span>Phone: {story.submitted_by_phone}</span>}
                {story.submitted_by_whatsapp && <span>WhatsApp: {story.submitted_by_whatsapp}</span>}
                {story.submitted_by_email && <span>Email: {story.submitted_by_email}</span>}
              </div>
            </div>
          )}

          {/* Cover Image */}
          <div className="bg-white rounded-xl border p-4">
            <span className="text-sm font-medium text-gray-700 block mb-3">Cover Image</span>
            {coverImageUrl ? (
              <div className="relative group">
                <img src={coverImageUrl} alt="Cover" className="w-full max-h-48 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setShowCoverPicker(true)}
                    className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-700 shadow hover:bg-gray-50"
                  >
                    Change
                  </button>
                  <button
                    onClick={() => setCoverImageUrl("")}
                    className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-red-600 shadow hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCoverPicker(true)}
                className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-2 text-gray-400 hover:border-earth-gold/40 hover:text-earth-gold transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Choose Cover Image</span>
                <span className="text-xs">From submitted photos or upload your own</span>
              </button>
            )}
          </div>

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

            {hasLocation && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Show location</label>
                <button
                  type="button"
                  onClick={() => setShowEventLocation(!showEventLocation)}
                  className={`w-10 h-6 rounded-full transition-colors ${showEventLocation ? "bg-earth-gold" : "bg-gray-200"}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${showEventLocation ? "translate-x-4.5" : "translate-x-0.5"}`} />
                </button>
              </div>
            )}

            {/* Categories */}
            {allCategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories <span className="text-gray-400 font-normal">(up to 5)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map((cat) => {
                    const selected = categoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          if (selected) {
                            setCategoryIds(categoryIds.filter((c) => c !== cat.id));
                          } else if (categoryIds.length < 5) {
                            setCategoryIds([...categoryIds, cat.id]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          selected
                            ? "bg-earth-gold/15 text-earth-gold border border-earth-gold/30"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                        } ${!selected && categoryIds.length >= 5 ? "opacity-40 cursor-not-allowed" : ""}`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-earth-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-semibold uppercase tracking-wider text-earth-gold">Event Location</span>
            </div>
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Location name"
              className="w-full px-4 py-2.5 rounded-lg border focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="any"
                value={locationLatitude}
                onChange={(e) => setLocationLatitude(e.target.value)}
                placeholder="Latitude"
                className="w-full px-4 py-2.5 rounded-lg border focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none"
              />
              <input
                type="number"
                step="any"
                value={locationLongitude}
                onChange={(e) => setLocationLongitude(e.target.value)}
                placeholder="Longitude"
                className="w-full px-4 py-2.5 rounded-lg border focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none"
              />
            </div>
            {hasLocation ? (
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs text-gray-500">
                  {showEventLocation ? "Visible on the public story page" : "Hidden from the public story page"}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setLocationName("");
                    setLocationLatitude("");
                    setLocationLongitude("");
                    setShowEventLocation(false);
                  }}
                  className="text-xs font-medium text-red-600 hover:text-red-700"
                >
                  Clear location
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500">Add a location here to attach it to the story.</p>
            )}
          </div>

          {/* Story Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-700">Story Content</h2>
              {contentBlocks.length === 0 && hasSourceContent && (
                <button
                  onClick={handleConvertToBlocks}
                  className="text-xs text-earth-gold hover:text-earth-amber font-medium flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Auto-generate from submission
                </button>
              )}
            </div>
            <StoryComposer
              blocks={contentBlocks}
              onChange={setContentBlocks}
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

        {/* Right column: Submitted Content Panel */}
        {hasSourceContent && (
          <div className="w-80 shrink-0">
            <div className="sticky top-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Submitted Content</h3>
              <SourcePalette
                contentHtml={story.content_html}
                mediaItems={story.media_items || []}
                youtubeUrls={story.youtube_urls || []}
                onAddBlock={addBlock}
              />
            </div>
          </div>
        )}
      </div>

      {/* Cover Image Picker Modal */}
      {showCoverPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCoverPicker(false)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold text-gray-900">Choose Cover Image</h2>
              <button onClick={() => setShowCoverPicker(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* From submission */}
            {sourceImages.length > 0 && (
              <div className="mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2">From Submission</span>
                <div className="grid grid-cols-4 gap-2">
                  {sourceImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setCoverImageUrl(img.url); setShowCoverPicker(false); }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                        coverImageUrl === img.url ? "border-earth-gold" : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      {coverImageUrl === img.url && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-earth-gold rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Upload new */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-2">Upload New</span>
              <ImageUploader
                onUpload={(item) => { setCoverImageUrl(item.url); setShowCoverPicker(false); }}
                existingItems={[]}
                onRemove={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-serif text-lg font-bold text-gray-900">Preview</h2>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {coverImageUrl && (
                <img src={coverImageUrl} alt="Cover" className="w-full rounded-xl mb-6 max-h-80 object-cover" />
              )}
              <p className="text-earth-gold text-xs font-semibold uppercase tracking-wider mb-2">In Memory of</p>
              <h1 className="font-serif text-3xl font-bold text-gray-900 mb-2">{honoreeName}</h1>
              <h2 className="text-gray-500 text-lg mb-4">{title}</h2>
              {summary && (
                <div className="border-l-4 border-earth-gold pl-4 mb-6">
                  <p className="text-gray-600 italic font-serif leading-relaxed">{summary}</p>
                </div>
              )}

              <div className="space-y-6">
                {contentBlocks.length > 0 ? (
                  contentBlocks.map((block) => (
                    <StoryBlockRenderer key={block.id} block={block} />
                  ))
                ) : story?.content_html ? (
                  <RichTextRenderer html={story.content_html} />
                ) : (
                  <p className="text-gray-400 italic">No content yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
