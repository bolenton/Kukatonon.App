"use client";

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
  const images = mediaItems.filter((m) => m.type === "image");
  const videos = mediaItems.filter((m) => m.type === "video");
  const audioItems = mediaItems.filter((m) => m.type === "audio");
  const hasContent = contentHtml || images.length > 0 || videos.length > 0 || audioItems.length > 0 || youtubeUrls.length > 0;

  if (!hasContent) return null;

  return (
    <div className="space-y-4">
      {/* Submitted text */}
      {contentHtml && (
        <div className="bg-white rounded-xl border p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Text</span>
            <button
              onClick={() => onAddBlock({ id: makeId(), type: "text", html: contentHtml })}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add
            </button>
          </div>
          <div
            className="text-xs text-gray-600 max-h-24 overflow-y-auto leading-relaxed prose-memorial"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      )}

      {/* Submitted images */}
      {images.length > 0 && (
        <div className="bg-white rounded-xl border p-3">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Images ({images.length})
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => onAddBlock({ id: makeId(), type: "image", url: img.url, width: img.width, height: img.height })}
                className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100"
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span className="text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100">+ Add</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submitted videos */}
      {videos.length > 0 && (
        <div className="bg-white rounded-xl border p-3">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Videos ({videos.length})
          </span>
          <div className="space-y-1.5">
            {videos.map((vid, i) => (
              <button
                key={i}
                onClick={() => onAddBlock({ id: makeId(), type: "video", url: vid.url })}
                className="w-full flex items-center gap-2 bg-gray-50 hover:bg-purple-50 rounded-lg p-2 text-left transition-colors"
              >
                <svg className="w-4 h-4 text-purple-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-xs text-gray-600 truncate flex-1">Video {i + 1}</span>
                <span className="text-[10px] text-blue-600 font-medium shrink-0">+ Add</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submitted audio */}
      {audioItems.length > 0 && (
        <div className="bg-white rounded-xl border p-3">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Audio ({audioItems.length})
          </span>
          <div className="space-y-2">
            {audioItems.map((a, i) => (
              <div key={i} className="bg-orange-50 rounded-lg p-2">
                <audio src={a.url} controls className="w-full h-8" preload="metadata" />
                <button
                  onClick={() => onAddBlock({ id: makeId(), type: "audio", url: a.url })}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium mt-1 flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add to story
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submitted YouTube URLs */}
      {youtubeUrls.length > 0 && (
        <div className="bg-white rounded-xl border p-3">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            YouTube ({youtubeUrls.length})
          </span>
          <div className="space-y-1.5">
            {youtubeUrls.map((url, i) => (
              <button
                key={i}
                onClick={() => onAddBlock({ id: makeId(), type: "youtube", url })}
                className="w-full flex items-center gap-2 bg-gray-50 hover:bg-red-50 rounded-lg p-2 text-left transition-colors"
              >
                <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-gray-600 truncate flex-1">{url}</span>
                <span className="text-[10px] text-blue-600 font-medium shrink-0">+ Add</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
