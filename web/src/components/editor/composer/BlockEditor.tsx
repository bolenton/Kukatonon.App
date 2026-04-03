"use client";

import dynamic from "next/dynamic";
import ImageUploader from "@/components/editor/ImageUploader";
import VideoUploader from "@/components/editor/VideoUploader";
import { isValidYouTubeUrl } from "@/lib/youtube";
import type { ContentBlock, TextBlock, ImageBlock, VideoBlock, YouTubeBlock, AudioBlock } from "@/types/blocks";

const TiptapEditor = dynamic(() => import("@/components/editor/TiptapEditor"), {
  ssr: false,
  loading: () => <div className="border rounded-lg p-4 min-h-[120px] bg-white" />,
});

interface BlockEditorProps {
  block: ContentBlock;
  onChange: (updated: ContentBlock) => void;
}

export default function BlockEditor({ block, onChange }: BlockEditorProps) {
  switch (block.type) {
    case "text":
      return <TextBlockEditor block={block} onChange={onChange} />;
    case "image":
      return <ImageBlockEditor block={block} onChange={onChange} />;
    case "video":
      return <VideoBlockEditor block={block} onChange={onChange} />;
    case "youtube":
      return <YouTubeBlockEditor block={block} onChange={onChange} />;
    case "audio":
      return <AudioBlockEditor block={block} onChange={onChange} />;
  }
}

function TextBlockEditor({ block, onChange }: { block: TextBlock; onChange: (b: ContentBlock) => void }) {
  return (
    <TiptapEditor
      content={block.html}
      onChange={(html) => onChange({ ...block, html })}
      placeholder="Write or paste text here..."
    />
  );
}

function ImageBlockEditor({
  block,
  onChange,
}: {
  block: ImageBlock;
  onChange: (b: ContentBlock) => void;
}) {
  if (!block.url) {
    return (
      <div className="space-y-2">
        <ImageUploader
          onUpload={(item) => onChange({ ...block, url: item.url, width: item.width, height: item.height })}
          existingItems={[]}
          onRemove={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative rounded-lg overflow-hidden bg-gray-100">
        <img src={block.url} alt={block.caption || ""} className="max-h-64 w-auto mx-auto" />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={block.caption || ""}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          placeholder="Caption (optional)"
          className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none"
        />
        <button
          onClick={() => onChange({ ...block, url: "", width: undefined, height: undefined })}
          className="text-xs text-red-600 hover:text-red-800 font-medium"
        >
          Change
        </button>
      </div>
    </div>
  );
}

function VideoBlockEditor({ block, onChange }: { block: VideoBlock; onChange: (b: ContentBlock) => void }) {
  if (!block.url) {
    return (
      <VideoUploader
        onUpload={(item) => onChange({ ...block, url: item.url })}
        existingItems={[]}
        onRemove={() => {}}
      />
    );
  }

  return (
    <div className="space-y-2">
      <video src={block.url} controls preload="metadata" className="w-full rounded-lg max-h-64" />
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={block.caption || ""}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          placeholder="Caption (optional)"
          className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none"
        />
        <button
          onClick={() => onChange({ ...block, url: "" })}
          className="text-xs text-red-600 hover:text-red-800 font-medium"
        >
          Change
        </button>
      </div>
    </div>
  );
}

function YouTubeBlockEditor({ block, onChange }: { block: YouTubeBlock; onChange: (b: ContentBlock) => void }) {
  if (!block.url) {
    return (
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Paste YouTube URL..."
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:border-earth-gold outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = e.currentTarget.value.trim();
              if (val && isValidYouTubeUrl(val)) {
                onChange({ ...block, url: val });
              }
            }
          }}
          onBlur={(e) => {
            const val = e.currentTarget.value.trim();
            if (val && isValidYouTubeUrl(val)) {
              onChange({ ...block, url: val });
            }
          }}
        />
      </div>
    );
  }

  // Extract video ID for embed preview
  const match = block.url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  const embedUrl = match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;

  return (
    <div className="space-y-2">
      {embedUrl && (
        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={block.caption || ""}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          placeholder="Caption (optional)"
          className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:border-earth-gold focus:ring-1 focus:ring-earth-gold outline-none"
        />
        <button
          onClick={() => onChange({ ...block, url: "" })}
          className="text-xs text-red-600 hover:text-red-800 font-medium"
        >
          Change
        </button>
      </div>
    </div>
  );
}

function AudioBlockEditor({ block, onChange }: { block: AudioBlock; onChange: (b: ContentBlock) => void }) {
  if (!block.url) {
    return (
      <div className="flex gap-2">
        <input
          type="text"
          value={block.url}
          onChange={(e) => onChange({ ...block, url: e.target.value })}
          placeholder="Paste audio URL or add from submitted content..."
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:border-earth-gold outline-none"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="bg-orange-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <span className="text-xs font-semibold text-orange-700">Voice Narration</span>
        </div>
        <audio src={block.url} controls className="w-full" preload="metadata" />
      </div>
    </div>
  );
}
