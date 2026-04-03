"use client";

import type { ContentBlock } from "@/types/blocks";

interface AddBlockMenuProps {
  onAdd: (block: ContentBlock) => void;
}

function makeId() {
  return crypto.randomUUID();
}

export default function AddBlockMenu({ onAdd }: AddBlockMenuProps) {
  const buttons = [
    { label: "Text", icon: "M4 6h16M4 12h16M4 18h8", onClick: () => onAdd({ id: makeId(), type: "text", html: "" }) },
    { label: "Image", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", onClick: () => onAdd({ id: makeId(), type: "image", url: "" }) },
    { label: "Video", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", onClick: () => onAdd({ id: makeId(), type: "video", url: "" }) },
    { label: "Voice", icon: "M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3", onClick: () => onAdd({ id: makeId(), type: "audio", url: "" }) },
    { label: "YouTube", icon: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z", onClick: () => onAdd({ id: makeId(), type: "youtube", url: "" }) },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {buttons.map((btn) => (
        <button
          key={btn.label}
          onClick={btn.onClick}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={btn.icon} />
          </svg>
          + {btn.label}
        </button>
      ))}
    </div>
  );
}
