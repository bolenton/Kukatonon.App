import { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import type { PublicStory } from '../lib/api';
import { colors as staticColors, fonts } from '../constants/theme';

interface StoryMapMarkerProps {
  story: PublicStory;
  onPress: () => void;
}

export default function StoryMapMarker({ story, onPress }: StoryMapMarkerProps) {
  // tracksViewChanges must start true so the image can render into the marker bitmap
  // on Android, then flip to false for performance once loaded.
  const [tracks, setTracks] = useState(true);

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
      tracksViewChanges={tracks}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.wrapper}>
        <View style={styles.circle}>
          {story.cover_image_url ? (
            <Image
              source={{ uri: story.cover_image_url }}
              style={styles.image}
              onLoad={() => setTracks(false)}
              onError={() => setTracks(false)}
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
