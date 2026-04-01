"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ImageUploader from "@/components/editor/ImageUploader";
import VideoUploader from "@/components/editor/VideoUploader";
import { isValidYouTubeUrl } from "@/lib/youtube";
import type { MediaItem } from "@/types/database";

const TiptapEditor = dynamic(() => import("@/components/editor/TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-earth-cream rounded-xl p-6 bg-white min-h-[200px] flex items-center justify-center">
      <span className="text-earth-warm/60 text-sm">Loading editor...</span>
    </div>
  ),
});

interface FormData {
  title: string;
  honoree_name: string;
  summary: string;
  content_html: string;
  youtube_urls: string[];
  cover_image_url: string;
  submitted_by_name: string;
  submitted_by_phone: string;
  submitted_by_whatsapp: string;
  submitted_by_email: string;
  consent_confirmed: boolean;
}

export default function SubmitStoryPage() {
  const [form, setForm] = useState<FormData>({
    title: "",
    honoree_name: "",
    summary: "",
    content_html: "",
    youtube_urls: [],
    cover_image_url: "",
    submitted_by_name: "",
    submitted_by_phone: "",
    submitted_by_whatsapp: "",
    submitted_by_email: "",
    consent_confirmed: false,
  });
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [youtubeInput, setYoutubeInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateField = (field: keyof FormData, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const addYoutubeUrl = () => {
    if (!youtubeInput.trim()) return;
    if (!isValidYouTubeUrl(youtubeInput)) {
      setErrors((prev) => ({ ...prev, youtube: "Please enter a valid YouTube URL" }));
      return;
    }
    updateField("youtube_urls", [...form.youtube_urls, youtubeInput.trim()]);
    setYoutubeInput("");
    setErrors((prev) => {
      const next = { ...prev };
      delete next.youtube;
      return next;
    });
  };

  const removeYoutubeUrl = (index: number) => {
    updateField(
      "youtube_urls",
      form.youtube_urls.filter((_, i) => i !== index)
    );
  };

  const handleImageUpload = (item: MediaItem) => {
    setMediaItems((prev) => [...prev, item]);
    // Set first image as cover if none set
    if (!form.cover_image_url) {
      updateField("cover_image_url", item.url);
    }
  };

  const handleVideoUpload = (item: MediaItem) => {
    setMediaItems((prev) => [...prev, item]);
  };

  const removeMedia = (index: number) => {
    const removed = mediaItems[index];
    setMediaItems((prev) => prev.filter((_, i) => i !== index));
    if (removed.url === form.cover_image_url) {
      const nextImage = mediaItems.find((m, i) => i !== index && m.type === "image");
      updateField("cover_image_url", nextImage?.url || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          media_items: mediaItems,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const errorMap: Record<string, string> = {};
          data.errors.forEach((err: { field: string; message: string }) => {
            errorMap[err.field] = err.message;
          });
          setErrors(errorMap);
        } else {
          setErrors({ form: data.error || "Something went wrong" });
        }
        return;
      }

      setSubmitted(true);
    } catch {
      setErrors({ form: "Failed to submit. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-earth-olive/10 flex items-center justify-center">
          <svg className="w-10 h-10 text-earth-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold text-earth-dark mb-4">
          Thank You
        </h1>
        <p className="text-earth-warm text-lg mb-2">
          Your memorial story has been submitted successfully.
        </p>
        <p className="text-earth-warm/70 mb-8">
          Our team will review it and make it available once approved.
          Thank you for helping us remember.
        </p>
        <a
          href="/"
          className="inline-block bg-earth-gold hover:bg-earth-amber text-earth-darkest px-6 py-2.5 rounded-lg font-semibold transition-colors"
        >
          Return Home
        </a>
      </div>
    );
  }

  const images = mediaItems.filter((m) => m.type === "image");
  const videos = mediaItems.filter((m) => m.type === "video");

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <p className="text-earth-gold text-sm tracking-[0.2em] uppercase mb-2">
          Share a Memory
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-earth-dark mb-4">
          Submit a Memorial Story
        </h1>
        <p className="text-earth-warm/80 max-w-xl mx-auto">
          Help us honor the memory of those who were lost. Your submission will be
          reviewed by our team before being published.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {errors.form && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {errors.form}
          </div>
        )}

        {/* Honoree Information */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-earth-cream">
          <h2 className="font-serif text-xl font-bold text-earth-dark mb-4">
            About the Person Being Honored
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-earth-dark mb-1">
                Honoree Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.honoree_name}
                onChange={(e) => updateField("honoree_name", e.target.value)}
                placeholder="Full name of the person being remembered"
                maxLength={120}
                className="w-full px-4 py-2.5 rounded-lg border border-earth-cream focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none transition-colors"
              />
              {errors.honoree_name && (
                <p className="text-red-600 text-sm mt-1">{errors.honoree_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-dark mb-1">
                Story Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="A title for this memorial"
                maxLength={140}
                className="w-full px-4 py-2.5 rounded-lg border border-earth-cream focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none transition-colors"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-earth-dark mb-1">
                Brief Summary
              </label>
              <textarea
                value={form.summary}
                onChange={(e) => updateField("summary", e.target.value)}
                placeholder="A short summary (optional)"
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg border border-earth-cream focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </section>

        {/* Story Content */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-earth-cream">
          <h2 className="font-serif text-xl font-bold text-earth-dark mb-4">
            The Story
          </h2>
          <p className="text-earth-warm/70 text-sm mb-4">
            Share the story in their memory. You can include text, photos, videos, and YouTube links.
            At least one type of content is required.
          </p>

          {errors.content && (
            <p className="text-red-600 text-sm mb-4">{errors.content}</p>
          )}

          <div className="space-y-6">
            {/* Rich text editor */}
            <div>
              <label className="block text-sm font-medium text-earth-dark mb-2">
                Written Story
              </label>
              <TiptapEditor
                content={form.content_html}
                onChange={(html) => updateField("content_html", html)}
                placeholder="Tell their story... Share memories, describe who they were, how they lived..."
              />
            </div>

            {/* Image upload */}
            <ImageUploader
              onUpload={handleImageUpload}
              existingItems={images}
              onRemove={(index) => {
                const imageIndex = mediaItems.findIndex(
                  (m) => m.type === "image" && m === images[index]
                );
                if (imageIndex >= 0) removeMedia(imageIndex);
              }}
            />

            {/* Video upload */}
            <VideoUploader
              onUpload={handleVideoUpload}
              existingItems={videos}
              onRemove={(index) => {
                const videoIndex = mediaItems.findIndex(
                  (m) => m.type === "video" && m === videos[index]
                );
                if (videoIndex >= 0) removeMedia(videoIndex);
              }}
            />

            {/* YouTube URLs */}
            <div>
              <label className="block text-sm font-medium text-earth-dark mb-2">
                YouTube Videos
              </label>
              {form.youtube_urls.length > 0 && (
                <div className="space-y-2 mb-3">
                  {form.youtube_urls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-earth-light rounded-lg px-3 py-2"
                    >
                      <span className="text-sm text-earth-warm truncate flex-1">
                        {url}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeYoutubeUrl(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  placeholder="Paste YouTube URL"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-earth-cream focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addYoutubeUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addYoutubeUrl}
                  className="px-4 py-2.5 bg-earth-cream hover:bg-earth-gold hover:text-earth-darkest text-earth-warm rounded-lg transition-colors text-sm font-medium"
                >
                  Add
                </button>
              </div>
              {errors.youtube && (
                <p className="text-red-600 text-sm mt-1">{errors.youtube}</p>
              )}
            </div>
          </div>
        </section>

        {/* Your Information */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-earth-cream">
          <h2 className="font-serif text-xl font-bold text-earth-dark mb-2">
            Your Information
          </h2>
          <p className="text-earth-warm/70 text-sm mb-4">
            Your contact information is private and will only be visible to our team.
            It will never be shared publicly.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-earth-dark mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.submitted_by_name}
                onChange={(e) => updateField("submitted_by_name", e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 rounded-lg border border-earth-cream focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none transition-colors"
              />
              {errors.submitted_by_name && (
                <p className="text-red-600 text-sm mt-1">{errors.submitted_by_name}</p>
              )}
            </div>

            <p className="text-earth-warm/60 text-xs">
              At least one contact method is required (phone, WhatsApp, or email).
            </p>

            {errors.contact && (
              <p className="text-red-600 text-sm">{errors.contact}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-earth-dark mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.submitted_by_phone}
                  onChange={(e) => updateField("submitted_by_phone", e.target.value)}
                  placeholder="+231..."
                  className="w-full px-4 py-2.5 rounded-lg border border-earth-cream focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-dark mb-1">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={form.submitted_by_whatsapp}
                  onChange={(e) => updateField("submitted_by_whatsapp", e.target.value)}
                  placeholder="+231..."
                  className="w-full px-4 py-2.5 rounded-lg border border-earth-cream focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-earth-dark mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.submitted_by_email}
                  onChange={(e) => updateField("submitted_by_email", e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-earth-cream focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none transition-colors"
                />
                {errors.submitted_by_email && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.submitted_by_email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Consent */}
        <section className="bg-white rounded-xl p-6 shadow-sm border border-earth-cream">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.consent_confirmed}
              onChange={(e) => updateField("consent_confirmed", e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-earth-cream text-earth-gold focus:ring-earth-gold"
            />
            <span className="text-sm text-earth-dark leading-relaxed">
              I confirm this story is submitted respectfully and I have permission
              to share this content. <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.consent_confirmed && (
            <p className="text-red-600 text-sm mt-2">{errors.consent_confirmed}</p>
          )}
        </section>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            disabled={submitting}
            className="bg-earth-gold hover:bg-earth-amber disabled:opacity-60 disabled:cursor-not-allowed text-earth-darkest px-10 py-3 rounded-lg font-semibold transition-colors text-lg inline-flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-earth-darkest border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Story"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
