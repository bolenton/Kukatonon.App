import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, LayoutAnimation, Platform, UIManager, Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  useAudioRecorder, useAudioRecorderState, useAudioPlayer, useAudioPlayerStatus,
  requestRecordingPermissionsAsync, setAudioModeAsync, RecordingPresets,
} from 'expo-audio';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Image } from 'expo-image';
import { useTheme } from '../../constants/ThemeContext';
import { fonts } from '../../constants/theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kukatonon.app';

export type StoryMode = 'write' | 'speak' | 'record' | null;

export interface StoryData {
  storyText: string;
  audioUrl: string | null;
  audioLocalUri: string | null;
  videoParts: { url: string; thumbnailUri?: string }[];
}

interface StoryStepProps {
  data: StoryData;
  onChange: (data: StoryData) => void;
  errors: Record<string, string>;
}

export default function StoryStep({ data, onChange, errors }: StoryStepProps) {
  const { colors } = useTheme();
  const [activeMode, setActiveMode] = useState<StoryMode>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ─── Audio Recording (expo-audio hooks) ───
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 500);

  // Audio playback for preview
  const player = useAudioPlayer(data.audioLocalUri ?? undefined);
  const playerStatus = useAudioPlayerStatus(player);

  // Pulse animation for record button
  useEffect(() => {
    if (recorderState.isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [recorderState.isRecording, pulseAnim]);

  function selectMode(mode: StoryMode) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveMode(activeMode === mode ? null : mode);
  }

  function formatTime(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ─── Audio Recording ───

  async function startRecording() {
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Microphone access is required to record audio.');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    } catch {
      Alert.alert('Error', 'Could not start recording.');
    }
  }

  async function stopRecording() {
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false });
    const uri = recorder.uri;

    if (!uri) return;

    // Upload the audio
    setUploadingAudio(true);
    try {
      const filename = `narration_${Date.now()}.m4a`;
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, contentType: 'audio/mp4', type: 'audio' }),
      });
      const { signedUrl, publicUrl } = await res.json();

      const file = { uri, name: filename, type: 'audio/mp4' } as unknown as Blob;
      await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': 'audio/mp4' } });

      onChange({ ...data, audioUrl: publicUrl, audioLocalUri: uri });
    } catch {
      Alert.alert('Error', 'Failed to upload audio recording.');
    } finally {
      setUploadingAudio(false);
    }
  }

  function playAudio() {
    player.play();
  }

  function pauseAudio() {
    player.pause();
  }

  function clearAudio() {
    player.pause();
    onChange({ ...data, audioUrl: null, audioLocalUri: null });
  }

  // ─── Video Recording ───

  async function recordVideo() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to record video.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      videoMaxDuration: 120,
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
    });
    if (result.canceled || !result.assets[0]) return;
    await handleVideoAsset(result.assets[0]);
  }

  async function handleVideoAsset(asset: ImagePicker.ImagePickerAsset) {
    setUploadingVideo(true);
    try {
      const contentType = asset.mimeType || 'video/mp4';
      const filename = asset.fileName || `video_${Date.now()}.mp4`;

      const res = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, contentType, type: 'video' }),
      });
      const { signedUrl, publicUrl } = await res.json();

      const file = { uri: asset.uri, name: filename, type: contentType } as unknown as Blob;
      await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': contentType } });

      let thumbnailUri: string | undefined;
      try {
        const thumb = await VideoThumbnails.getThumbnailAsync(asset.uri, { time: 1000 });
        thumbnailUri = thumb.uri;
      } catch {
        // Not critical
      }

      onChange({ ...data, videoParts: [...data.videoParts, { url: publicUrl, thumbnailUri }] });
    } catch {
      Alert.alert('Error', 'Failed to upload video.');
    } finally {
      setUploadingVideo(false);
    }
  }

  function removeVideo(index: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onChange({ ...data, videoParts: data.videoParts.filter((_, i) => i !== index) });
  }

  // ─── Mode Cards ───

  const modes = [
    { key: 'write' as const, icon: 'edit' as const, label: 'Write', desc: 'Type their story' },
    { key: 'speak' as const, icon: 'mic' as const, label: 'Speak', desc: 'Record narration' },
    { key: 'record' as const, icon: 'videocam' as const, label: 'Record', desc: 'Record a video' },
  ];

  return (
    <View>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardLabel, { color: colors.earth.gold }]}>STEP 2 OF 4</Text>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Tell Their Story</Text>
        <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
          Choose how you'd like to share this memory. You can use more than one.
        </Text>
        {errors.content && <Text style={styles.errorText}>{errors.content}</Text>}

        {/* Mode selector */}
        <View style={styles.modeRow}>
          {modes.map((mode) => {
            const isActive = activeMode === mode.key;
            const hasContent =
              (mode.key === 'write' && data.storyText.length > 0) ||
              (mode.key === 'speak' && data.audioUrl) ||
              (mode.key === 'record' && data.videoParts.length > 0);

            return (
              <TouchableOpacity
                key={mode.key}
                style={[
                  styles.modeCard,
                  { borderColor: isActive ? colors.earth.gold : colors.border },
                  isActive && { backgroundColor: colors.earth.gold + '12' },
                ]}
                onPress={() => selectMode(mode.key)}
                activeOpacity={0.7}
              >
                <View style={[styles.modeIconWrap, { backgroundColor: isActive ? colors.earth.gold : colors.border }]}>
                  <MaterialIcons name={mode.icon} size={20} color={isActive ? '#fff' : colors.textMuted} />
                </View>
                <Text style={[styles.modeLabel, { color: isActive ? colors.earth.gold : colors.text }]}>{mode.label}</Text>
                {hasContent && (
                  <View style={[styles.modeDot, { backgroundColor: colors.earth.gold }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ─── Write Mode ─── */}
      {activeMode === 'write' && (
        <View style={[styles.card, styles.modeContent, { backgroundColor: colors.card, borderColor: colors.earth.gold + '44' }]}>
          <View style={styles.modeContentHeader}>
            <MaterialIcons name="edit" size={18} color={colors.earth.gold} />
            <Text style={[styles.modeContentTitle, { color: colors.text }]}>Written Story</Text>
          </View>
          <TextInput
            style={[styles.textArea, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            value={data.storyText}
            onChangeText={(v) => onChange({ ...data, storyText: v })}
            placeholder="Tell their story... Share memories, describe who they were, what happened..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
          />
          {data.storyText.length > 0 && (
            <Text style={[styles.charCount, { color: colors.textMuted }]}>
              {data.storyText.length.toLocaleString()} characters
            </Text>
          )}
        </View>
      )}

      {/* ─── Speak Mode ─── */}
      {activeMode === 'speak' && (
        <View style={[styles.card, styles.modeContent, { backgroundColor: colors.card, borderColor: colors.earth.gold + '44' }]}>
          <View style={styles.modeContentHeader}>
            <MaterialIcons name="mic" size={18} color={colors.earth.gold} />
            <Text style={[styles.modeContentTitle, { color: colors.text }]}>Voice Narration</Text>
          </View>

          {data.audioUrl ? (
            // Playback state
            <View style={styles.audioPlayback}>
              <View style={[styles.audioWaveform, { backgroundColor: colors.earth.gold + '18' }]}>
                <MaterialIcons name="graphic-eq" size={40} color={colors.earth.gold} />
              </View>
              <Text style={[styles.audioLabel, { color: colors.text }]}>Recording saved</Text>
              <View style={styles.audioControls}>
                <TouchableOpacity
                  style={[styles.audioBtn, { backgroundColor: colors.earth.gold }]}
                  onPress={playerStatus.playing ? pauseAudio : playAudio}
                >
                  <MaterialIcons name={playerStatus.playing ? 'stop' : 'play-arrow'} size={22} color="#fff" />
                  <Text style={styles.audioBtnText}>{playerStatus.playing ? 'Stop' : 'Play'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.audioBtn, { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border }]}
                  onPress={clearAudio}
                >
                  <MaterialIcons name="refresh" size={18} color={colors.text} />
                  <Text style={[styles.audioBtnText, { color: colors.text }]}>Re-record</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : uploadingAudio ? (
            <View style={styles.audioCenter}>
              <ActivityIndicator size="large" color={colors.earth.gold} />
              <Text style={[styles.audioLabel, { color: colors.textMuted }]}>Uploading recording...</Text>
            </View>
          ) : (
            // Record state
            <View style={styles.audioCenter}>
              {recorderState.isRecording && (
                <Text style={[styles.recTimer, { color: colors.earth.gold }]}>
                  {formatTime(recorderState.durationMillis)}
                </Text>
              )}

              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={[
                    styles.recButton,
                    { backgroundColor: recorderState.isRecording ? '#dc2626' : colors.earth.gold },
                  ]}
                  onPress={recorderState.isRecording ? stopRecording : startRecording}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={recorderState.isRecording ? 'stop' : 'mic'}
                    size={36}
                    color="#fff"
                  />
                </TouchableOpacity>
              </Animated.View>

              <Text style={[styles.recHint, { color: colors.textMuted }]}>
                {recorderState.isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
              </Text>

              {recorderState.isRecording && (
                <View style={[styles.recLive, { backgroundColor: '#dc2626' + '22' }]}>
                  <View style={styles.recDot} />
                  <Text style={styles.recLiveText}>Recording</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* ─── Record Video Mode ─── */}
      {activeMode === 'record' && (
        <View style={[styles.card, styles.modeContent, { backgroundColor: colors.card, borderColor: colors.earth.gold + '44' }]}>
          <View style={styles.modeContentHeader}>
            <MaterialIcons name="videocam" size={18} color={colors.earth.gold} />
            <Text style={[styles.modeContentTitle, { color: colors.text }]}>Video Recording</Text>
          </View>

          {/* Existing video thumbnails */}
          {data.videoParts.length > 0 && (
            <View style={styles.videoGrid}>
              {data.videoParts.map((v, i) => (
                <View key={i} style={styles.videoThumb}>
                  {v.thumbnailUri ? (
                    <Image source={{ uri: v.thumbnailUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  ) : (
                    <View style={[styles.videoPlaceholder, { backgroundColor: colors.earth.brown }]}>
                      <MaterialIcons name="videocam" size={24} color={colors.earth.gold} />
                    </View>
                  )}
                  <View style={styles.videoOverlay}>
                    <MaterialIcons name="play-circle-outline" size={28} color="#fff" />
                  </View>
                  <TouchableOpacity style={styles.videoRemove} onPress={() => removeVideo(i)}>
                    <MaterialIcons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {uploadingVideo ? (
            <View style={styles.audioCenter}>
              <ActivityIndicator size="large" color={colors.earth.gold} />
              <Text style={[styles.audioLabel, { color: colors.textMuted }]}>Uploading video...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.recordVideoBtn, { backgroundColor: colors.earth.gold }]}
              onPress={recordVideo}
            >
              <MaterialIcons name="videocam" size={22} color="#fff" />
              <Text style={styles.recordVideoBtnText}>
                {data.videoParts.length > 0 ? 'Record Another Video' : 'Open Camera'}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.recHint, { color: colors.textMuted, marginTop: 8 }]}>
            Maximum 2 minutes per recording
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 14 },
  cardLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  cardTitle: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  cardDesc: { fontSize: 13, lineHeight: 19, marginBottom: 16 },
  errorText: { color: '#dc2626', fontSize: 12, marginTop: 2, marginBottom: 8 },

  // Mode selector row
  modeRow: { flexDirection: 'row', gap: 10 },
  modeCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  modeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeLabel: { fontSize: 13, fontWeight: '700' },
  modeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Expanded mode content
  modeContent: { borderWidth: 1.5 },
  modeContentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  modeContentTitle: { fontFamily: fonts.serif, fontSize: 16, fontWeight: '700' },

  // Write
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 180,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  charCount: { fontSize: 11, textAlign: 'right', marginTop: 4 },

  // Speak / Audio
  audioCenter: { alignItems: 'center', paddingVertical: 20, gap: 12 },
  recTimer: { fontSize: 32, fontWeight: '300', fontVariant: ['tabular-nums'] },
  recButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  recHint: { fontSize: 13, textAlign: 'center' },
  recLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#dc2626' },
  recLiveText: { color: '#dc2626', fontSize: 12, fontWeight: '700' },

  // Audio playback
  audioPlayback: { alignItems: 'center', paddingVertical: 12, gap: 10 },
  audioWaveform: {
    width: 120,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioLabel: { fontSize: 14, fontWeight: '600' },
  audioControls: { flexDirection: 'row', gap: 10, marginTop: 4 },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  audioBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Video
  videoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  videoThumb: { width: 100, height: 100, borderRadius: 12, overflow: 'hidden' },
  videoPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  videoOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  videoRemove: {
    position: 'absolute',
    top: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 2,
  },
  recordVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  recordVideoBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
