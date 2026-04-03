import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PublicStory, StoriesResponse } from './api';

const STORIES_CACHE_KEY = 'offline_stories_cache';
const STORY_CACHE_PREFIX = 'offline_story_';
const CACHE_TIMESTAMP_KEY = 'offline_cache_timestamp';

/** Cache a list response (home/stories screens) */
export async function cacheStoriesResponse(key: string, data: StoriesResponse): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORIES_CACHE_KEY}_${key}`, JSON.stringify(data));
    await AsyncStorage.setItem(`${CACHE_TIMESTAMP_KEY}_${key}`, Date.now().toString());
  } catch {
    // Silent fail — caching is best-effort
  }
}

/** Get a cached list response */
export async function getCachedStoriesResponse(key: string): Promise<StoriesResponse | null> {
  try {
    const raw = await AsyncStorage.getItem(`${STORIES_CACHE_KEY}_${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Cache a single story (for offline reading) */
export async function cacheStory(story: PublicStory): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORY_CACHE_PREFIX}${story.id}`, JSON.stringify(story));
  } catch {
    // Silent fail
  }
}

/** Get a single cached story */
export async function getCachedStory(id: string): Promise<PublicStory | null> {
  try {
    const raw = await AsyncStorage.getItem(`${STORY_CACHE_PREFIX}${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Get the timestamp of when a cache key was last updated */
export async function getCacheTimestamp(key: string): Promise<number | null> {
  try {
    const raw = await AsyncStorage.getItem(`${CACHE_TIMESTAMP_KEY}_${key}`);
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

/** Cache multiple stories at once (from list responses) */
export async function cacheStories(stories: PublicStory[]): Promise<void> {
  try {
    const pairs: [string, string][] = stories.map((s) => [
      `${STORY_CACHE_PREFIX}${s.id}`,
      JSON.stringify(s),
    ]);
    await AsyncStorage.multiSet(pairs);
  } catch {
    // Silent fail
  }
}

/** Get all individually cached story IDs */
export async function getAllCachedStoryIds(): Promise<string[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys
      .filter((k) => k.startsWith(STORY_CACHE_PREFIX))
      .map((k) => k.replace(STORY_CACHE_PREFIX, ''));
  } catch {
    return [];
  }
}

/** Get all individually cached stories (for offline search) */
export async function getAllCachedStories(): Promise<PublicStory[]> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const storyKeys = keys.filter((k) => k.startsWith(STORY_CACHE_PREFIX));
    if (storyKeys.length === 0) return [];
    const pairs = await AsyncStorage.multiGet(storyKeys);
    const stories: PublicStory[] = [];
    for (const [, value] of pairs) {
      if (value) {
        try { stories.push(JSON.parse(value)); } catch { /* skip */ }
      }
    }
    return stories;
  } catch {
    return [];
  }
}
