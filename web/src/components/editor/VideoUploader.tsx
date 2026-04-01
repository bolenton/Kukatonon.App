"use client";

import { useState, useRef } from "react";
import { validateVideoFile } from "@/lib/media";
import type { MediaItem } from "@/types/database";

interface VideoUploaderProps {
  onUpload: (item: MediaItem) => void;
  existingItems?: MediaItem[];
  onRemove?: (index: number) => void;
}

export default function VideoUploader({
  onUpload,
  existingItems = [],
  onRemove,
}: VideoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateVideoFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Get signed upload URL
      const signRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          type: "video",
        }),
      });

      if (!signRes.ok) throw new Error("Failed to get upload URL");
      const { signedUrl, publicUrl } = await signRes.json();

      // Upload with progress tracking via XMLHttpRequest
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.setRequestHeader("x-upsert", "true");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error("Upload failed"));
          }
        };

        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(file);
      });

      onUpload({
        type: "video",
        url: publicUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-earth-dark mb-2">
        Video
      </label>

      {/* Existing videos */}
      {existingItems.length > 0 && (
        <div className="space-y-3 mb-4">
          {existingItems.map((item, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden bg-black aspect-video">
              <video src={item.url} controls preload="metadata" className="w-full h-full" />
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-earth-cream rounded-xl p-6 text-center cursor-pointer hover:border-earth-gold transition-colors"
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="space-y-3">
            <div className="w-full bg-earth-cream rounded-full h-3 overflow-hidden">
              <div
                className="bg-earth-gold h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-earth-warm text-sm">Uploading... {progress}%</p>
          </div>
        ) : (
          <>
            <svg
              className="w-8 h-8 mx-auto text-earth-gold/60 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-earth-warm text-sm">Click to upload a video</p>
            <p className="text-earth-warm/60 text-xs mt-1">MP4, MOV, or WebM (max 500MB)</p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={handleFileSelect}
      />

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
