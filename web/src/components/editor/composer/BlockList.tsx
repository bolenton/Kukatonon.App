"use client";

import type { ContentBlock } from "@/types/blocks";
import BlockEditor from "./BlockEditor";

interface BlockListProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  text: { label: "Text", color: "bg-gray-100 text-gray-700" },
  image: { label: "Image", color: "bg-green-50 text-green-700" },
  video: { label: "Video", color: "bg-purple-50 text-purple-700" },
  youtube: { label: "YouTube", color: "bg-red-50 text-red-700" },
  audio: { label: "Audio", color: "bg-orange-50 text-orange-700" },
};

export default function BlockList({ blocks, onChange }: BlockListProps) {
  function updateBlock(index: number, updated: ContentBlock) {
    const next = [...blocks];
    next[index] = updated;
    onChange(next);
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  if (blocks.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
        No blocks yet. Add blocks from the submitted content above, or use the buttons below.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => {
        const meta = typeLabels[block.type];
        return (
          <div key={block.id} className="bg-white rounded-xl border group">
            {/* Block header */}
            <div className="flex items-center gap-2 px-4 py-2 border-b bg-gray-50/50 rounded-t-xl">
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${meta.color}`}>
                {meta.label}
              </span>
              <span className="text-xs text-gray-400">Block {index + 1}</span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => moveBlock(index, -1)}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="Move up"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => moveBlock(index, 1)}
                  disabled={index === blocks.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="Move down"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => removeBlock(index)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Remove block"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Block content */}
            <div className="p-4">
              <BlockEditor
                block={block}
                onChange={(updated) => updateBlock(index, updated)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
