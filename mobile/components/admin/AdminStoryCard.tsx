import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import StatusBadge from './StatusBadge';
import { fonts } from '../../constants/theme';
import { useTheme } from '../../constants/ThemeContext';

interface Props {
  story: {
    id: string;
    honoree_name: string;
    title: string;
    summary: string | null;
    cover_image_url: string | null;
    status: string;
    is_featured: boolean;
    submitted_by_name: string | null;
    source_type: string;
    created_at: string;
  };
  onPress: () => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function AdminStoryCard({ story, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        {story.cover_image_url ? (
          <Image source={{ uri: story.cover_image_url }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]}>
            <Text style={styles.thumbInitial}>{story.honoree_name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.content}>
          <View style={styles.topRow}>
            <StatusBadge status={story.status} />
            {story.is_featured && <MaterialIcons name="star" size={14} color="#f59e0b" />}
          </View>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {story.honoree_name}
          </Text>
          <Text style={[styles.title, { color: colors.textSecondary }]} numberOfLines={1}>
            {story.title}
          </Text>
          <View style={styles.meta}>
            {story.submitted_by_name && (
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {story.submitted_by_name}
              </Text>
            )}
            <Text style={[styles.metaText, { color: colors.textMuted }]}>
              {timeAgo(story.created_at)}
            </Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 52, height: 52, borderRadius: 10 },
  thumbPlaceholder: { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  thumbInitial: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '700', color: '#9ca3af' },
  content: { flex: 1, gap: 2 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  name: { fontSize: 15, fontWeight: '700', fontFamily: fonts.serif },
  title: { fontSize: 13 },
  meta: { flexDirection: 'row', gap: 8, marginTop: 2 },
  metaText: { fontSize: 11 },
});
