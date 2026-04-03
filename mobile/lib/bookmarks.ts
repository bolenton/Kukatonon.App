import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PublicStory } from './api';

const BOOKMARKS_KEY = 'bookmarked_stories';
const BOOKMARK_DATA_PREFIX = 'bookmark_data_';

interface BookmarkEntry {
  id: string;
  savedAt: string;
}

/** Get all bookmark entries (IDs + timestamps) */
async function getBookmarkEntries(): Promise<BookmarkEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function setBookmarkEntries(entries: BookmarkEntry[]): Promise<void> {
  await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(entries));
}

/** Add a story to bookmarks */
export async function addBookmark(story: PublicStory): Promise<void> {
  const entries = await getBookmarkEntries();
  if (entries.some((e) => e.id === story.id)) return;

  entries.unshift({ id: story.id, savedAt: new Date().toISOString() });
  await setBookmarkEntries(entries);

  // Also store the full story data for offline access
  await AsyncStorage.setItem(`${BOOKMARK_DATA_PREFIX}${story.id}`, JSON.stringify(story));
}

/** Remove a story from bookmarks */
export async function removeBookmark(storyId: string): Promise<void> {
  const entries = await getBookmarkEntries();
  const filtered = entries.filter((e) => e.id !== storyId);
  await setBookmarkEntries(filtered);
  await AsyncStorage.removeItem(`${BOOKMARK_DATA_PREFIX}${storyId}`);
}

/** Check if a story is bookmarked */
export async function isBookmarked(storyId: string): Promise<boolean> {
  const entries = await getBookmarkEntries();
  return entries.some((e) => e.id === storyId);
}

/** Toggle bookmark status, returns the new state */
export async function toggleBookmark(story: PublicStory): Promise<boolean> {
  const bookmarked = await isBookmarked(story.id);
  if (bookmarked) {
    await removeBookmark(story.id);
    return false;
  } else {
    await addBookmark(story);
    return true;
  }
}

/** Get all bookmarked stories with full data */
export async function getBookmarkedStories(): Promise<PublicStory[]> {
  const entries = await getBookmarkEntries();
  const stories: PublicStory[] = [];

  for (const entry of entries) {
    try {
      const raw = await AsyncStorage.getItem(`${BOOKMARK_DATA_PREFIX}${entry.id}`);
      if (raw) stories.push(JSON.parse(raw));
    } catch {
      // Skip corrupted entries
    }
  }

  return stories;
}

/** Get the count of bookmarked stories */
export async function getBookmarkCount(): Promise<number> {
  const entries = await getBookmarkEntries();
  return entries.length;
}
