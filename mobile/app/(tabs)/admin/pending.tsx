import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../constants/AuthContext';
import { useTheme } from '../../../constants/ThemeContext';
import { fetchPendingStories, type AdminStory } from '../../../lib/adminApi';
import AdminStoryCard from '../../../components/admin/AdminStoryCard';
import { fonts } from '../../../constants/theme';

export default function PendingScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const [stories, setStories] = useState<AdminStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session?.token) return;
    try {
      const data = await fetchPendingStories(session.token);
      setStories(data);
    } catch (err) {
      console.error('Failed to load pending:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.token]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.earth.gold} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.list}
      data={stories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AdminStoryCard
          story={item}
          onPress={() => router.push(`/(tabs)/admin/story/${item.id}`)}
        />
      )}
      ListHeaderComponent={
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {stories.length} {stories.length === 1 ? 'submission' : 'submissions'} waiting
        </Text>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <MaterialIcons name="check-circle" size={48} color={colors.earth.gold} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>All caught up!</Text>
          <Text style={[styles.emptyDesc, { color: colors.textMuted }]}>No pending submissions.</Text>
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.earth.gold} colors={[colors.earth.gold]} />
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  subtitle: { fontSize: 13, marginBottom: 12 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '700', marginTop: 16 },
  emptyDesc: { fontSize: 14, marginTop: 4 },
});
