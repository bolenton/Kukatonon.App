import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Supercluster from 'supercluster';
import StoryMapMarker from '../../components/StoryMapMarker';
import StoryClusterMarker from '../../components/StoryClusterMarker';
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

// Supercluster configuration. `radius` is the pixel distance within which
// markers get grouped; `maxZoom` is the zoom level above which clustering
// stops and every marker renders individually.
const CLUSTER_RADIUS = 60;
const CLUSTER_MAX_ZOOM = 14;

type StoryPointProps = { storyId: string };
type ClusterFeature =
  | GeoJSON.Feature<GeoJSON.Point, StoryPointProps>
  | GeoJSON.Feature<
      GeoJSON.Point,
      Supercluster.ClusterProperties & { cluster: true }
    >;

// Derive a Google-Maps-style zoom level (0 = whole world, 20 = street level)
// from a react-native-maps Region's longitudeDelta.
function regionToZoom(region: Region): number {
  return Math.round(Math.log2(360 / region.longitudeDelta));
}

export default function MapScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [stories, setStories] = useState<PublicStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [selectedStory, setSelectedStory] = useState<PublicStory | null>(null);
  const [region, setRegion] = useState<Region>(LIBERIA_REGION);
  const lastMarkerPressAt = useRef(0);
  const mapRef = useRef<MapView | null>(null);

  // Build a Supercluster index whenever the stories change. Points are
  // GeoJSON features keyed by story id, which we look up when rendering
  // single-story markers.
  const clusterIndex = useMemo(() => {
    const points: GeoJSON.Feature<GeoJSON.Point, StoryPointProps>[] = stories
      .filter(
        (s) =>
          s.event_latitude != null &&
          s.event_longitude != null &&
          s.show_event_location === true
      )
      .map((s) => ({
        type: 'Feature',
        properties: { storyId: s.id },
        geometry: {
          type: 'Point',
          coordinates: [s.event_longitude as number, s.event_latitude as number],
        },
      }));

    const index = new Supercluster<StoryPointProps>({
      radius: CLUSTER_RADIUS,
      maxZoom: CLUSTER_MAX_ZOOM,
    });
    index.load(points);
    return index;
  }, [stories]);

  const storyById = useMemo(() => {
    const map = new Map<string, PublicStory>();
    for (const s of stories) map.set(s.id, s);
    return map;
  }, [stories]);

  // Query the cluster index for whatever is currently visible. Bounds are a
  // little generous to avoid popping at the edges as the user pans.
  const visibleFeatures = useMemo<ClusterFeature[]>(() => {
    if (stories.length === 0) return [];
    const zoom = regionToZoom(region);
    const west = region.longitude - region.longitudeDelta;
    const east = region.longitude + region.longitudeDelta;
    const south = region.latitude - region.latitudeDelta;
    const north = region.latitude + region.latitudeDelta;
    return clusterIndex.getClusters(
      [west, south, east, north],
      zoom
    ) as ClusterFeature[];
  }, [clusterIndex, region, stories.length]);

  const handleClusterPress = useCallback(
    (clusterId: number, longitude: number, latitude: number) => {
      // Expand the cluster by animating to the zoom level at which its
      // members break apart. Supercluster tells us exactly that level.
      const expansionZoom = Math.min(
        clusterIndex.getClusterExpansionZoom(clusterId),
        20
      );
      // Convert zoom level back to a longitudeDelta so we can animateToRegion.
      const nextDelta = 360 / Math.pow(2, expansionZoom);
      mapRef.current?.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: nextDelta,
          longitudeDelta: nextDelta,
        },
        350
      );
      lastMarkerPressAt.current = Date.now();
    },
    [clusterIndex]
  );

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
      // expo-image's prefetch with memory-disk policy actually warms the
      // in-memory bitmap cache (not just the HTTP/disk cache), so when the
      // marker's <Image> mounts it reads synchronously and the Marker
      // snapshot captures a painted image on first render.
      const coverUrls = withLocation
        .map((story) => story.cover_image_url)
        .filter((url): url is string => !!url);
      if (coverUrls.length > 0) {
        await Image.prefetch(coverUrls, 'memory-disk');
      }
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
    lastMarkerPressAt.current = Date.now();
    console.log('[MapScreen] marker pressed', {
      id: story.id,
      honoree: story.honoree_name,
      coverUrl: story.cover_image_url,
    });
    setSelectedStory(story);
  }

  function handleMapPress() {
    if (Date.now() - lastMarkerPressAt.current < 250) {
      console.log('[MapScreen] map press ignored after marker press');
      return;
    }
    console.log('[MapScreen] map pressed, clearing preview');
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
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={LIBERIA_REGION}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
        showsUserLocation={false}
        showsCompass={true}
        showsScale={true}
      >
        {visibleFeatures.map((feature) => {
          const [longitude, latitude] = feature.geometry.coordinates;
          const props = feature.properties as Supercluster.ClusterProperties & {
            cluster?: boolean;
          } & StoryPointProps;
          if (props.cluster) {
            return (
              <StoryClusterMarker
                key={`cluster-${props.cluster_id}`}
                latitude={latitude}
                longitude={longitude}
                count={props.point_count}
                onPress={() =>
                  handleClusterPress(
                    props.cluster_id as number,
                    longitude,
                    latitude
                  )
                }
              />
            );
          }
          const story = storyById.get(props.storyId);
          if (!story) return null;
          return (
            <StoryMapMarker
              key={story.id}
              story={story}
              onPress={() => handleMarkerPress(story)}
            />
          );
        })}
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
              source={selectedStory.cover_image_url}
              style={styles.previewImage}
              contentFit="cover"
              cachePolicy="memory-disk"
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
