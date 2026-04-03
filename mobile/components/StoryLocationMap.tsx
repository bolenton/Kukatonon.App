import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../constants/ThemeContext';
import { fonts } from '../constants/theme';

interface StoryLocationMapProps {
  latitude: number;
  longitude: number;
  locationName?: string | null;
}

export default function StoryLocationMap({ latitude, longitude, locationName }: StoryLocationMapProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <View style={styles.header}>
        <MaterialIcons name="place" size={16} color={colors.earth.gold} />
        <Text style={[styles.label, { color: colors.earth.gold }]}>WHERE IT HAPPENED</Text>
      </View>
      {locationName ? (
        <Text style={[styles.locationName, { color: colors.text }]}>{locationName}</Text>
      ) : null}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          region={{
            latitude,
            longitude,
            latitudeDelta: 0.3,
            longitudeDelta: 0.3,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Marker coordinate={{ latitude, longitude }} />
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  locationName: {
    fontFamily: fonts.serif,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  mapContainer: {
    height: 180,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
