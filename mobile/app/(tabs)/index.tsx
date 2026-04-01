import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Link } from 'expo-router';
import StoryCard from '../../components/StoryCard';
import { fetchStories, type PublicStory } from '../../lib/api';
import { colors, fonts } from '../../constants/theme';

export default function HomeScreen() {
  const [featured, setFeatured] = useState<PublicStory[]>([]);
  const [latest, setLatest] = useState<PublicStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [featuredRes, latestRes] = await Promise.all([
        fetchStories({ featured: true, limit: 2 }),
        fetchStories({ limit: 10 }),
      ]);
      setFeatured(featuredRes.stories);
      setLatest(latestRes.stories);
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.earth.gold} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.earth.gold}
          colors={[colors.earth.gold]}
        />
      }
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroSubtitle}>
          A NATIONAL ACT OF MEMORY, HEALING, AND COLLECTIVE RESPONSIBILITY
        </Text>
        <Text style={styles.heroTitle}>Kukatonon</Text>
        <Text style={styles.heroDesc}>
          Liberian Civil War Victims Memorial
        </Text>
        <Text style={styles.heroBody}>
          Every life lost deserves to be remembered.{'\n'}
          Every story deserves to be told.
        </Text>
      </View>

      {/* Featured */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FEATURED MEMORIALS</Text>
          <Text style={styles.sectionTitle}>Stories That Must Be Told</Text>
          {featured.map((story) => (
            <StoryCard key={story.id} story={story} featured />
          ))}
        </View>
      )}

      {/* Latest */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>RECENT MEMORIALS</Text>
        <Text style={styles.sectionTitle}>Latest Stories</Text>
        {latest.length > 0 ? (
          latest
            .filter((s) => !featured.find((f) => f.id === s.id))
            .map((story) => <StoryCard key={story.id} story={story} />)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Stories Coming Soon</Text>
            <Text style={styles.emptyDesc}>
              Visit kukatonon.app to share a memorial story.
            </Text>
          </View>
        )}

        <Link href="/stories" style={styles.viewAll}>
          <Text style={styles.viewAllText}>View All Stories</Text>
        </Link>
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Help Us Remember</Text>
        <Text style={styles.ctaDesc}>
          Every story shared is a life honored. Visit kukatonon.app to submit a memorial story.
        </Text>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
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
  hero: {
    backgroundColor: colors.earth.darkest,
    padding: 32,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroSubtitle: {
    color: colors.earth.amber,
    fontSize: 10,
    letterSpacing: 3,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  heroTitle: {
    fontFamily: fonts.serif,
    fontSize: 42,
    fontWeight: '700',
    color: colors.earth.cream,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 16,
    color: colors.earth.cream,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 12,
  },
  heroBody: {
    fontSize: 14,
    color: colors.earth.cream,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    padding: 20,
    paddingTop: 28,
  },
  sectionLabel: {
    color: colors.earth.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 24,
    fontWeight: '700',
    color: colors.earth.dark,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    color: colors.earth.warm,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.earth.warm,
    opacity: 0.7,
    textAlign: 'center',
  },
  viewAll: {
    alignSelf: 'center',
    marginTop: 8,
    borderWidth: 2,
    borderColor: colors.earth.gold,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  viewAllText: {
    color: colors.earth.gold,
    fontWeight: '600',
    fontSize: 14,
  },
  cta: {
    backgroundColor: colors.earth.darkest,
    margin: 20,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  ctaTitle: {
    fontFamily: fonts.serif,
    fontSize: 22,
    fontWeight: '700',
    color: colors.earth.cream,
    marginBottom: 12,
  },
  ctaDesc: {
    fontSize: 14,
    color: colors.earth.cream,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
});
