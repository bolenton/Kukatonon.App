import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../constants/ThemeContext';

interface AudioPlayerProps {
  url: string;
}

export default function AudioPlayer({ url }: AudioPlayerProps) {
  const { colors } = useTheme();
  const player = useAudioPlayer(url);
  const status = useAudioPlayerStatus(player);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function togglePlayback() {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  const progress = status.duration > 0 ? status.currentTime / status.duration : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.earth.gold + '12', borderColor: colors.earth.gold + '33' }]}>
      <View style={styles.header}>
        <MaterialIcons name="graphic-eq" size={16} color={colors.earth.gold} />
        <Text style={[styles.label, { color: colors.earth.gold }]}>VOICE NARRATION</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.playBtn, { backgroundColor: colors.earth.gold }]}
          onPress={togglePlayback}
        >
          <MaterialIcons
            name={status.playing ? 'pause' : 'play-arrow'}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>

        <View style={styles.trackArea}>
          {/* Progress bar */}
          <View style={[styles.trackBg, { backgroundColor: colors.earth.gold + '33' }]}>
            <View style={[styles.trackFill, { backgroundColor: colors.earth.gold, width: `${progress * 100}%` }]} />
          </View>
          {/* Time */}
          <View style={styles.timeRow}>
            <Text style={[styles.time, { color: colors.textMuted }]}>{formatTime(status.currentTime)}</Text>
            {status.duration > 0 && (
              <Text style={[styles.time, { color: colors.textMuted }]}>{formatTime(status.duration)}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackArea: {
    flex: 1,
    gap: 4,
  },
  trackBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
});
