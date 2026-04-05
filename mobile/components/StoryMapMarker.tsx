import { useEffect, useRef, useState } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Marker } from 'react-native-maps';
import type { PublicStory } from '../lib/api';
import { colors as staticColors, fonts } from '../constants/theme';

// Google Maps on Android rasterizes the Marker's child view into a bitmap
// icon. The decode+compose step lags behind Image.onLoad, so we need a
// longer delay than iOS (which uses Apple Maps and commits faster).
const FREEZE_DELAY_MS = Platform.OS === 'android' ? 600 : 150;
const SAFETY_TIMEOUT_MS = Platform.OS === 'android' ? 4000 : 2000;

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

    // Safety net: if `onLoad` never fires (already-cached fast path, network
    // stall, etc.) freeze tracking after a max delay so markers don't stay in
    // a permanently-tracking state.
    const safety = setTimeout(() => {
      if (!frozenRef.current) {
        frozenRef.current = true;
        setTracksViewChanges(false);
      }
    }, SAFETY_TIMEOUT_MS);

    return () => clearTimeout(safety);
  }, [story.cover_image_url, hasImage]);

  const handleImageLoad = () => {
    if (frozenRef.current) return;
    // setTimeout (not requestAnimationFrame) so the paint commits *before*
    // we freeze the snapshot — rAF fires before the next paint, which was
    // capturing blank circles. Android Google Maps needs a longer delay than
    // iOS Apple Maps to commit the bitmap icon.
    setTimeout(() => {
      if (frozenRef.current) return;
      frozenRef.current = true;
      setTracksViewChanges(false);
    }, FREEZE_DELAY_MS);
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
