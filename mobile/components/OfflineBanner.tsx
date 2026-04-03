import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../constants/ThemeContext';

export default function OfflineBanner() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.earth.warm + '18' }]}>
      <MaterialIcons name="cloud-off" size={14} color={colors.earth.warm} />
      <Text style={[styles.text, { color: colors.earth.warm }]}>
        Offline — showing cached stories
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
