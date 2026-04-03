"use client";

import type { ContentBlock } from "@/types/blocks";
import BlockList from "./BlockList";
import AddBlockMenu from "./AddBlockMenu";

interface StoryComposerProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export default function StoryComposer({
  blocks,
  onChange,
}: StoryComposerProps) {
  function addBlock(block: ContentBlock) {
    onChange([...blocks, block]);
  }

  return (
    <div className="space-y-4">
      {/* Block list */}
      <BlockList
        blocks={blocks}
        onChange={onChange}
      />

      {/* Add block menu */}
      <AddBlockMenu onAdd={addBlock} />
    </div>
  );
}
