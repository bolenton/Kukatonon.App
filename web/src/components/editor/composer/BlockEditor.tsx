"use client";

import dynamic from "next/dynamic";
import ImageUploader from "@/components/editor/ImageUploader";
import VideoUploader from "@/components/editor/VideoUploader";
import { isValidYouTubeUrl } from "@/lib/youtube";
import type { ContentBlock, TextBlock, ImageBlock, VideoBlock, YouTubeBlock } from "@/types/blocks";

const TiptapEditor = dynamic(() => import("@/components/editor/TiptapEditor"), {
  ssr: false,
  loading: () => <div className="border rounded-lg p-4 min-h-[120px] bg-white" />,
});

interface BlockEditorProps {
  block: ContentBlock;
  onChange: (updated: ContentBlock) => void;
  coverImageUrl: string;
  onSetCover: (url: string) => void;
}

export default function BlockEditor({ block, onChange, coverImageUrl, onSetCover }: BlockEditorProps) {
  switch (block.type) {
    case "text":
      return <TextBlockEditor block={block} onChange={onChange} />;
    case "image":
      return <ImageBlockEditor block={block} onChange={onChange} coverImageUrl={coverImageUrl} onSetCover={onSetCover} />;
    case "video":
      return <VideoBlockEditor block={block} onChange={onChange} />;
    case "youtube":
      return <YouTubeBlockEditor block={block} onChange={onChange} />;
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
  coverImageUrl,
  onSetCover,
}: {
  block: ImageBlock;
  onChange: (b: ContentBlock) => void;
  coverImageUrl: string;
  onSetCover: (url: string) => void;
}) {
  const isCover = block.url === coverImageUrl;

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
          onClick={() => onSetCover(block.url)}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium shrink-0 ${
            isCover ? "bg-earth-gold/10 text-earth-gold" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {isCover ? "Cover image" : "Set as cover"}
        </button>
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
