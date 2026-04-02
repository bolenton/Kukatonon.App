import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import StoryCard from '../../components/StoryCard';
import { fetchStories, fetchCategories, type PublicStory, type CategoryInfo } from '../../lib/api';
import { colors, fonts } from '../../constants/theme';

export default function StoriesScreen() {
  const [stories, setStories] = useState<PublicStory[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  const loadStories = useCallback(async () => {
    try {
      const res = await fetchStories({
        limit: 50,
        search: activeSearch || undefined,
        category: activeCategory || undefined,
      });
      setStories(res.stories);
      setTotal(res.pagination.total);
    } catch (err) {
      console.error('Failed to load stories:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeSearch, activeCategory]);

  useEffect(() => {
    setLoading(true);
    loadStories();
  }, [loadStories]);

  function handleSearch() {
    setActiveSearch(searchText.trim());
  }

  function handleCategoryPress(catId: string) {
    setActiveCategory(activeCategory === catId ? '' : catId);
  }

  function handleClear() {
    setSearchText('');
    setActiveSearch('');
    setActiveCategory('');
  }

  const hasFilters = activeSearch || activeCategory;

  if (loading && !refreshing) {
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
        <View>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerLabel}>MEMORIAL STORIES</Text>
            <Text style={styles.headerTitle}>Lives Remembered</Text>
            <Text style={styles.headerDesc}>
              {total > 0
                ? `${total} ${total === 1 ? 'story' : 'stories'} shared in memory.`
                : 'Stories will appear here once shared and approved.'}
            </Text>
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or title..."
              placeholderTextColor={colors.gray[400]}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Categories */}
          {categories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesRow}
              contentContainerStyle={styles.categoriesContent}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => handleCategoryPress(cat.id)}
                  style={[
                    styles.categoryPill,
                    activeCategory === cat.id && styles.categoryPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      activeCategory === cat.id && styles.categoryPillTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Active filters indicator */}
          {hasFilters && (
            <TouchableOpacity style={styles.clearRow} onPress={handleClear}>
              <Text style={styles.clearText}>
                {activeSearch ? `Searching "${activeSearch}"` : ''}
                {activeSearch && activeCategory ? ' in ' : ''}
                {activeCategory ? categories.find(c => c.id === activeCategory)?.name || '' : ''}
              </Text>
              <Text style={styles.clearButton}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            {hasFilters ? 'No Stories Found' : 'No Stories Yet'}
          </Text>
          <Text style={styles.emptyDesc}>
            {hasFilters
              ? 'Try a different search or category.'
              : 'Visit kukatonon.app to be the first to share a memorial story.'}
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
    marginBottom: 16,
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
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.earth.dark,
  },
  searchButton: {
    backgroundColor: colors.earth.gold,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: colors.earth.darkest,
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesRow: {
    marginBottom: 12,
  },
  categoriesContent: {
    gap: 8,
  },
  categoryPill: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  categoryPillActive: {
    backgroundColor: colors.earth.gold + '22',
    borderWidth: 1,
    borderColor: colors.earth.gold + '44',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray[600],
  },
  categoryPillTextActive: {
    color: colors.earth.gold,
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.earth.gold + '11',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  clearText: {
    fontSize: 12,
    color: colors.earth.warm,
    flex: 1,
  },
  clearButton: {
    fontSize: 12,
    color: colors.earth.gold,
    fontWeight: '600',
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
