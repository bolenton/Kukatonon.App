"use client";

import { useState, useRef } from "react";
import { validateImageFile, generateStoragePath } from "@/lib/media";
import type { MediaItem } from "@/types/database";

interface ImageUploaderProps {
  onUpload: (item: MediaItem) => void;
  existingItems?: MediaItem[];
  onRemove?: (index: number) => void;
}

export default function ImageUploader({
  onUpload,
  existingItems = [],
  onRemove,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      await uploadFile(files[i]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Get signed upload URL
      const signRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          type: "image",
        }),
      });

      if (!signRes.ok) throw new Error("Failed to get upload URL");
      const { signedUrl, token, publicUrl } = await signRes.json();

      // Upload to Supabase Storage
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "x-upsert": "true",
        },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");

      // Get dimensions
      const dimensions = await getImageDimensions(file);

      onUpload({
        type: "image",
        url: publicUrl,
        width: dimensions.width,
        height: dimensions.height,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-earth-dark mb-2">
        Photos
      </label>

      {/* Existing images */}
      {existingItems.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
          {existingItems.map((item, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover"
              />
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
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
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-earth-gold border-t-transparent rounded-full animate-spin" />
            <span className="text-earth-warm text-sm">Uploading...</span>
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-earth-warm text-sm">Click to upload photos</p>
            <p className="text-earth-warm/60 text-xs mt-1">JPEG, PNG, WebP, or GIF</p>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}
