import { useEffect, useState } from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { colors as staticColors, fonts } from '../constants/theme';

interface StoryClusterMarkerProps {
  latitude: number;
  longitude: number;
  count: number;
  onPress: () => void;
}

// Cluster marker shown when multiple stories are in close proximity. Tapping
// it zooms the map in to separate the underlying individual story markers.
// On Android, Google Maps can snapshot the marker view before layout has
// committed, capturing an empty bitmap. We briefly track view changes on
// mount and then freeze, matching StoryMapMarker's pattern.
export default function StoryClusterMarker({
  latitude,
  longitude,
  count,
  onPress,
}: StoryClusterMarkerProps) {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    const delay = Platform.OS === 'android' ? 400 : 100;
    const t = setTimeout(() => setTracksViewChanges(false), delay);
    return () => clearTimeout(t);
  }, [count]);

  // Bigger bubble for larger clusters so density is visible at a glance.
  const size = count < 10 ? 44 : count < 50 ? 52 : 60;

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
    >
      <View style={styles.wrapper}>
        <View
          style={[
            styles.outerRing,
            { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 },
          ]}
        />
        <View
          style={[
            styles.bubble,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={styles.count}>{count}</Text>
        </View>
      </View>
    </Marker>
  );
}

const GOLD = staticColors.earth.gold;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    backgroundColor: GOLD,
    opacity: 0.25,
  },
  bubble: {
    backgroundColor: GOLD,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  count: {
    color: '#fff',
    fontFamily: fonts.serif,
    fontSize: 16,
    fontWeight: '700',
  },
});
