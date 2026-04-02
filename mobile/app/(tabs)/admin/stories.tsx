import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, ActivityIndicator, ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../constants/AuthContext';
import { useTheme } from '../../../constants/ThemeContext';
import { fetchAdminStories, type AdminStory } from '../../../lib/adminApi';
import AdminStoryCard from '../../../components/admin/AdminStoryCard';
import { fonts } from '../../../constants/theme';

const STATUSES = ['all', 'pending', 'approved', 'rejected'] as const;

export default function AllStoriesScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ status?: string }>();
  const [stories, setStories] = useState<AdminStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState(params.status || 'all');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async (reset = false) => {
    if (!session?.token) return;
    const p = reset ? 1 : page;
    try {
      const data = await fetchAdminStories(session.token, { status, search, page: p });
      setStories(reset ? data.stories : [...stories, ...data.stories]);
      setTotalPages(data.pagination.totalPages);
      if (reset) setPage(1);
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session?.token, status, search, page]);

  useEffect(() => { setLoading(true); load(true); }, [session?.token, status, search]);

  function handleSearch() { setSearch(searchInput.trim()); }
  function handleLoadMore() {
    if (page < totalPages) { setPage(page + 1); load(); }
  }

  if (loading && stories.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.earth.gold} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
    <FlatList
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.list}
      data={stories}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AdminStoryCard story={item} onPress={() => router.push(`/(tabs)/admin/story/${item.id}`)} />
      )}
      ListHeaderComponent={
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={{ gap: 8 }}>
            {STATUSES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setStatus(s)}
                style={[styles.pill, status === s && { backgroundColor: colors.earth.gold + '22', borderColor: colors.earth.gold + '44', borderWidth: 1 }]}
              >
                <Text style={[styles.pillText, status === s && { color: colors.earth.gold }]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.searchRow}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Search..." placeholderTextColor={colors.textMuted}
              value={searchInput} onChangeText={setSearchInput} onSubmitEditing={handleSearch} returnKeyType="search"
            />
            <TouchableOpacity style={[styles.searchBtn, { backgroundColor: colors.earth.gold }]} onPress={handleSearch}>
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>No stories found.</Text>
        </View>
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={colors.earth.gold} colors={[colors.earth.gold]} />
      }
    />
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: colors.earth.gold }]}
      onPress={() => router.push('/(tabs)/admin/new-story')}
    >
      <MaterialIcons name="add" size={28} color="#fff" />
    </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  filters: { marginBottom: 12 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  searchInput: { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  searchBtn: { borderRadius: 10, paddingHorizontal: 14, justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { fontSize: 14 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 5 },
});
