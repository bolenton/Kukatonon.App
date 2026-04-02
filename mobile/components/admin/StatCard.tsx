import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { fonts } from '../../constants/theme';

interface Props {
  icon: keyof typeof MaterialIcons.glyphMap;
  count: number | null;
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
}

export default function StatCard({ icon, count, label, color, bg, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <MaterialIcons name={icon} size={22} color={color} />
        <Text style={[styles.count, { color }]}>{count ?? '...'}</Text>
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: 16, borderRadius: 16, minWidth: '45%' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  count: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '600', opacity: 0.8 },
});
