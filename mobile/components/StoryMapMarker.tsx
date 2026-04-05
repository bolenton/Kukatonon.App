import { useEffect, useRef, useState } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Marker } from 'react-native-maps';
import type { PublicStory } from '../lib/api';
import { colors as staticColors, fonts } from '../constants/theme';

// iOS Apple Maps captures the marker snapshot quickly once the image paints,
// so we can freeze shortly after onLoad.
const IOS_FREEZE_AFTER_LOAD_MS = 150;
// Android Google Maps doesn't reliably re-snapshot on expo-image paint when
// the image is already in the in-memory cache (onLoad fires synchronously
// before GoogleMap has laid out the marker view). Instead of listening to
// onLoad, we track view changes for a fixed window after mount — long
// enough for GoogleMap to rasterize at least one post-layout frame.
const ANDROID_TRACK_WINDOW_MS = 1200;
const IOS_SAFETY_TIMEOUT_MS = 2000;

interface StoryMapMarkerProps {
  story: PublicStory;
  onPress: () => void;
}

// react-native-maps rasterizes Marker children into a snapshot. If the
// snapshot is taken before the remote image has painted, the marker shows
// a blank circle. `tracksViewChanges={true}` tells the map to keep
// re-snapshotting, but we must turn it off once the image is visible or
// we pay a permanent performance cost and get flicker.
export default function StoryMapMarker({ story, onPress }: StoryMapMarkerProps) {
  const hasImage = !!story.cover_image_url;
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const frozenRef = useRef(false);

  useEffect(() => {
    // If there's no image we don't need to track at all — the view is static.
    if (!hasImage) {
      frozenRef.current = true;
      setTracksViewChanges(false);
      return;
    }

    // Reset for a new URL.
    frozenRef.current = false;
    setTracksViewChanges(true);

    // Android: hard-coded track window. Don't listen to onLoad because
    // expo-image fires it synchronously from the in-memory cache before
    // GoogleMap has laid out the marker view.
    // iOS: just a safety timeout; onLoad handles the freeze faster.
    const delay =
      Platform.OS === 'android' ? ANDROID_TRACK_WINDOW_MS : IOS_SAFETY_TIMEOUT_MS;
    const timer = setTimeout(() => {
      if (!frozenRef.current) {
        frozenRef.current = true;
        setTracksViewChanges(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [story.cover_image_url, hasImage]);

  const handleImageLoad = () => {
    // Android: ignore — the useEffect timer owns freeze timing.
    if (Platform.OS === 'android') return;
    if (frozenRef.current) return;
    // iOS: setTimeout (not requestAnimationFrame) so the paint commits
    // *before* we freeze the snapshot.
    setTimeout(() => {
      if (frozenRef.current) return;
      frozenRef.current = true;
      setTracksViewChanges(false);
    }, IOS_FREEZE_AFTER_LOAD_MS);
  };

  if (story.event_latitude == null || story.event_longitude == null) {
    return null;
  }

  const initial = story.honoree_name?.trim()?.charAt(0)?.toUpperCase() || '?';

  return (
    <Marker
      coordinate={{
        latitude: story.event_latitude,
        longitude: story.event_longitude,
      }}
      onPress={onPress}
      tracksViewChanges={tracksViewChanges}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.wrapper}>
        <View style={styles.circle}>
          {hasImage ? (
            <Image
              source={story.cover_image_url as string}
              style={styles.image}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={0}
              onLoad={handleImageLoad}
              onError={() => {
                frozenRef.current = true;
                setTracksViewChanges(false);
              }}
            />
          ) : (
            <View style={[styles.image, styles.fallback]}>
              <Text style={styles.fallbackText}>{initial}</Text>
            </View>
          )}
        </View>
        <View style={styles.tail} />
      </View>
    </Marker>
  );
}

const GOLD = staticColors.earth.gold;
const SIZE = 48;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  circle: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 2,
    borderColor: GOLD,
    backgroundColor: '#fff',
    overflow: 'hidden',
    // Shadow for visibility over map
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    backgroundColor: staticColors.earth.warm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#fff',
    fontFamily: fonts.serif,
    fontSize: 20,
    fontWeight: '700',
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: GOLD,
    marginTop: -1,
  },
});
