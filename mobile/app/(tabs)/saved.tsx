import { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import StoryCard from '../../components/StoryCard';
import { getBookmarkedStories } from '../../lib/bookmarks';
import { colors as staticColors, fonts } from '../../constants/theme';
import { useTheme } from '../../constants/ThemeContext';
import type { PublicStory } from '../../lib/api';

export default function SavedScreen() {
  const { colors } = useTheme();
  const [stories, setStories] = useState<PublicStory[]>([]);
  const [loading, setLoading] = useState(true);

  // Reload bookmarks every time the tab is focused
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      getBookmarkedStories()
        .then(setStories)
        .finally(() => setLoading(false));
    }, [])
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.earth.gold} />
      </View>
    );
  }

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={stories.length === 0 ? styles.emptyContent : styles.listContent}
      data={stories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <StoryCard story={item} />}
      ListHeaderComponent={
        stories.length > 0 ? (
          <View style={styles.header}>
            <Text style={styles.headerLabel}>YOUR COLLECTION</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Saved Stories</Text>
            <Text style={[styles.headerDesc, { color: colors.textMuted }]}>
              {stories.length} {stories.length === 1 ? 'story' : 'stories'} saved for offline reading
            </Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.earth.gold + '18' }]}>
            <Text style={styles.emptyIconText}>{'<3'}</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Saved Stories</Text>
          <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>
            Bookmark stories while reading to save them here for offline access.
          </Text>
        </View>
      }
    />
  );
}

const sc = staticColors;
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  emptyContent: { flex: 1, padding: 16 },
  header: { alignItems: 'center', marginBottom: 16, paddingTop: 8 },
  headerLabel: { color: sc.earth.gold, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '700', marginBottom: 8 },
  headerDesc: { fontSize: 14, textAlign: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyIconText: { fontSize: 28 },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '700', marginBottom: 8 },
  emptyDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
