import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import StoryMapMarker from '../../components/StoryMapMarker';
import OfflineBanner from '../../components/OfflineBanner';
import { fetchStories, type PublicStory } from '../../lib/api';
import { colors as staticColors, fonts } from '../../constants/theme';
import { useTheme } from '../../constants/ThemeContext';

const LIBERIA_REGION: Region = {
  latitude: 6.4281,
  longitude: -9.4295,
  latitudeDelta: 4.5,
  longitudeDelta: 4.5,
};

export default function MapScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [stories, setStories] = useState<PublicStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [selectedStory, setSelectedStory] = useState<PublicStory | null>(null);

  const loadMapStories = useCallback(async () => {
    try {
      const res = await fetchStories({ limit: 200, has_location: true });
      // Defensive client-side filter in case older cached data lacks the filter
      const withLocation = res.stories.filter(
        (s) =>
          s.event_latitude != null &&
          s.event_longitude != null &&
          s.show_event_location === true
      );
      setStories(withLocation);
      setOffline(!!res.offline);
    } catch (err) {
      console.error('Failed to load map stories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMapStories();
  }, [loadMapStories]);

  function handleMarkerPress(story: PublicStory) {
    setSelectedStory(story);
  }

  function handleMapPress() {
    setSelectedStory(null);
  }

  function handleCardPress() {
    if (selectedStory) {
      router.push(`/story/${selectedStory.id}`);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={LIBERIA_REGION}
        onPress={handleMapPress}
        showsUserLocation={false}
        showsCompass={true}
        showsScale={true}
      >
        {stories.map((story) => (
          <StoryMapMarker
            key={story.id}
            story={story}
            onPress={() => handleMarkerPress(story)}
          />
        ))}
      </MapView>

      {/* Offline banner */}
      {offline && (
        <View style={[styles.bannerOverlay, { top: insets.top + 8 }]}>
          <OfflineBanner />
        </View>
      )}

      {/* Loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.earth.gold} />
        </View>
      )}

      {/* Empty state */}
      {!loading && stories.length === 0 && (
        <View pointerEvents="none" style={styles.emptyOverlay}>
          <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
            <MaterialIcons name="place" size={32} color={colors.earth.gold} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No story locations yet
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Approved stories with visible locations will appear here.
            </Text>
          </View>
        </View>
      )}

      {/* Preview card */}
      {selectedStory && (
        <Pressable
          onPress={handleCardPress}
          style={[
            styles.previewCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              bottom: 16,
            },
          ]}
        >
          {selectedStory.cover_image_url ? (
            <Image
              source={{ uri: selectedStory.cover_image_url }}
              style={styles.previewImage}
            />
          ) : (
            <View style={[styles.previewImage, styles.previewImageFallback]}>
              <MaterialIcons name="image" size={28} color="#fff" />
            </View>
          )}
          <View style={styles.previewContent}>
            <Text
              style={[styles.previewHonoree, { color: colors.earth.gold }]}
              numberOfLines={1}
            >
              {selectedStory.honoree_name}
            </Text>
            <Text
              style={[styles.previewTitle, { color: colors.text }]}
              numberOfLines={2}
            >
              {selectedStory.title}
            </Text>
            {selectedStory.event_location_name ? (
              <View style={styles.previewLocationRow}>
                <MaterialIcons
                  name="place"
                  size={12}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    styles.previewLocation,
                    { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {selectedStory.event_location_name}
                </Text>
              </View>
            ) : null}
          </View>
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={colors.textMuted}
          />
        </Pressable>
      )}
    </View>
  );
}

const sc = staticColors;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  bannerOverlay: {
    position: 'absolute',
    left: 12,
    right: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  emptyOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyCard: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    maxWidth: 320,
  },
  emptyTitle: {
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.8,
  },
  previewCard: {
    position: 'absolute',
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  previewImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: sc.gray[200],
  },
  previewImageFallback: {
    backgroundColor: sc.earth.warm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContent: {
    flex: 1,
    justifyContent: 'center',
  },
  previewHonoree: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  previewTitle: {
    fontFamily: fonts.serif,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  previewLocation: {
    fontSize: 11,
    flex: 1,
  },
});
