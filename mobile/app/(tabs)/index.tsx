import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Link, router } from 'expo-router';
import StoryCard from '../../components/StoryCard';
import { fetchStories, type PublicStory } from '../../lib/api';
import { colors as staticColors, fonts } from '../../constants/theme';
import { useTheme } from '../../constants/ThemeContext';

export default function HomeScreen() {
  const { mode, colors } = useTheme();
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
      <View style={[styles.loadingContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.earth.gold} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
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
      <View style={[styles.hero, { backgroundColor: mode === 'earth' ? colors.earth.darkest : colors.bg }]}>
        <Text style={[styles.heroSubtitle, { color: colors.earth.amber }]}>
          A NATIONAL ACT OF MEMORY, HEALING, AND COLLECTIVE RESPONSIBILITY
        </Text>
        <Text style={[styles.heroTitle, { color: mode === 'earth' ? colors.earth.cream : colors.text }]}>Kukatonon</Text>
        <Text style={[styles.heroDesc, { color: mode === 'earth' ? colors.earth.cream : colors.textSecondary }]}>
          Liberian Civil War Victims Memorial
        </Text>
        <Text style={[styles.heroBody, { color: mode === 'earth' ? colors.earth.cream : colors.textMuted }]}>
          Every life lost deserves to be remembered.{'\n'}
          Every story deserves to be told.
        </Text>
      </View>

      {/* Featured */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>FEATURED MEMORIALS</Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Stories That Must Be Told</Text>
          {featured.map((story) => (
            <StoryCard key={story.id} story={story} featured />
          ))}
        </View>
      )}

      {/* Latest */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>RECENT MEMORIALS</Text>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Latest Stories</Text>
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
      <View style={[styles.cta, mode === 'light' && { backgroundColor: colors.gray[100] }]}>
        <Text style={[styles.ctaTitle, mode === 'light' && { color: colors.text }]}>Help Us Remember</Text>
        <Text style={[styles.ctaDesc, mode === 'light' && { color: colors.textSecondary }]}>
          Every story shared is a life honored. Share a memorial story today.
        </Text>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: colors.earth.gold }]}
          onPress={() => router.push('/submit')}
        >
          <Text style={styles.ctaBtnText}>Share a Story</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const sc = staticColors;
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  hero: { padding: 32, paddingTop: 24, paddingBottom: 40, alignItems: 'center' },
  heroSubtitle: { fontSize: 10, letterSpacing: 3, textAlign: 'center', marginBottom: 16, fontWeight: '600' },
  heroTitle: { fontFamily: fonts.serif, fontSize: 42, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  heroDesc: { fontSize: 16, opacity: 0.8, textAlign: 'center', marginBottom: 12 },
  heroBody: { fontSize: 14, opacity: 0.6, textAlign: 'center', lineHeight: 22 },
  section: { padding: 20, paddingTop: 28 },
  sectionLabel: { color: sc.earth.gold, fontSize: 10, fontWeight: '700', letterSpacing: 2, textAlign: 'center', marginBottom: 4 },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 18, color: sc.earth.warm, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: sc.earth.warm, opacity: 0.7, textAlign: 'center' },
  viewAll: { alignSelf: 'center', marginTop: 8, borderWidth: 2, borderColor: sc.earth.gold, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  viewAllText: { color: sc.earth.gold, fontWeight: '600', fontSize: 14 },
  cta: { backgroundColor: sc.earth.darkest, margin: 20, borderRadius: 20, padding: 28, alignItems: 'center' },
  ctaTitle: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '700', color: sc.earth.cream, marginBottom: 12 },
  ctaDesc: { fontSize: 14, color: sc.earth.cream, opacity: 0.7, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  ctaBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  ctaBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
