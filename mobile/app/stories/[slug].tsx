import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { fetchStories } from '../../lib/api';
import { colors } from '../../constants/theme';

/**
 * Deep link handler for https://kukatonon.app/stories/{slug}
 * Resolves the slug to a story ID and redirects to the story detail screen.
 */
export default function StoryBySlugScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [error, setError] = useState(false);

  useEffect(() => {
    async function resolve() {
      try {
        const res = await fetchStories({ limit: 100 });
        const story = res.stories.find((s) => s.slug === slug);
        if (story) {
          router.replace(`/story/${story.id}`);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
    }
    resolve();
  }, [slug]);

  if (error) {
    // Story not found — go to stories list
    router.replace('/(tabs)/stories');
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Loading...' }} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.earth.light }}>
        <ActivityIndicator size="large" color={colors.earth.gold} />
      </View>
    </>
  );
}
