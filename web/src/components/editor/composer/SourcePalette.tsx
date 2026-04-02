"use client";

import { useState } from "react";
import type { MediaItem } from "@/types/database";
import type { ContentBlock } from "@/types/blocks";

interface SourcePaletteProps {
  contentHtml: string | null;
  mediaItems: MediaItem[];
  youtubeUrls: string[];
  onAddBlock: (block: ContentBlock) => void;
}

function makeId() {
  return crypto.randomUUID();
}

export default function SourcePalette({
  contentHtml,
  mediaItems,
  youtubeUrls,
  onAddBlock,
}: SourcePaletteProps) {
  const [open, setOpen] = useState(true);
  const images = mediaItems.filter((m) => m.type === "image");
  const videos = mediaItems.filter((m) => m.type === "video");
  const hasContent = contentHtml || images.length > 0 || videos.length > 0 || youtubeUrls.length > 0;

  if (!hasContent) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-blue-900"
      >
        <span>Submitted Content</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4">
          {/* Submitted text */}
          {contentHtml && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Text</span>
                <button
                  onClick={() => onAddBlock({ id: makeId(), type: "text", html: contentHtml })}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  + Add to story
                </button>
              </div>
              <div
                className="bg-white rounded-lg p-3 text-sm text-gray-700 max-h-32 overflow-y-auto border border-blue-100 prose-memorial"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
            </div>
          )}

          {/* Submitted images */}
          {images.length > 0 && (
            <div>
              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide block mb-1">
                Images ({images.length})
              </span>
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => onAddBlock({ id: makeId(), type: "image", url: img.url, width: img.width, height: img.height })}
                    className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100"
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/40 transition-colors flex items-center justify-center">
                      <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">+ Add</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submitted videos */}
          {videos.length > 0 && (
            <div>
              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide block mb-1">
                Videos ({videos.length})
              </span>
              <div className="space-y-2">
                {videos.map((vid, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-blue-100">
                    <video src={vid.url} className="w-20 h-14 object-cover rounded" />
                    <span className="text-xs text-gray-500 truncate flex-1">Video {i + 1}</span>
                    <button
                      onClick={() => onAddBlock({ id: makeId(), type: "video", url: vid.url })}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submitted YouTube URLs */}
          {youtubeUrls.length > 0 && (
            <div>
              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide block mb-1">
                YouTube ({youtubeUrls.length})
              </span>
              <div className="space-y-1">
                {youtubeUrls.map((url, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-blue-100">
                    <span className="text-xs text-gray-600 truncate flex-1">{url}</span>
                    <button
                      onClick={() => onAddBlock({ id: makeId(), type: "youtube", url })}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
