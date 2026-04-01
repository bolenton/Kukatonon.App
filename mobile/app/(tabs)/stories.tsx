import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import StoryCard from '../../components/StoryCard';
import { fetchStories, type PublicStory } from '../../lib/api';
import { colors, fonts } from '../../constants/theme';

export default function StoriesScreen() {
  const [stories, setStories] = useState<PublicStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStories = useCallback(async () => {
    try {
      const res = await fetchStories({ limit: 50 });
      setStories(res.stories);
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.earth.gold} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={stories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <StoryCard story={item} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerLabel}>MEMORIAL STORIES</Text>
          <Text style={styles.headerTitle}>Lives Remembered</Text>
          <Text style={styles.headerDesc}>
            {stories.length > 0
              ? `${stories.length} ${stories.length === 1 ? 'story' : 'stories'} shared in memory.`
              : 'Stories will appear here once shared and approved.'}
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Stories Yet</Text>
          <Text style={styles.emptyDesc}>
            Visit kukatonon.app to be the first to share a memorial story.
          </Text>
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadStories();
          }}
          tintColor={colors.earth.gold}
          colors={[colors.earth.gold]}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.earth.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.earth.light,
  },
  listContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  headerLabel: {
    color: colors.earth.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  headerTitle: {
    fontFamily: fonts.serif,
    fontSize: 28,
    fontWeight: '700',
    color: colors.earth.dark,
    marginBottom: 8,
  },
  headerDesc: {
    fontSize: 14,
    color: colors.earth.warm,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.serif,
    fontSize: 20,
    color: colors.earth.warm,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.earth.warm,
    opacity: 0.6,
    textAlign: 'center',
  },
});
