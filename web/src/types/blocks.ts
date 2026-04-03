export type ContentBlockType = 'text' | 'image' | 'video' | 'youtube' | 'audio';

interface BaseBlock {
  id: string;
  type: ContentBlockType;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  html: string;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface VideoBlock extends BaseBlock {
  type: 'video';
  url: string;
  caption?: string;
}

export interface YouTubeBlock extends BaseBlock {
  type: 'youtube';
  url: string;
  caption?: string;
}

export interface AudioBlock extends BaseBlock {
  type: 'audio';
  url: string;
  caption?: string;
}

export type ContentBlock = TextBlock | ImageBlock | VideoBlock | YouTubeBlock | AudioBlock;
