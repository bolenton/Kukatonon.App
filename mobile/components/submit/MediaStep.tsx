import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../constants/ThemeContext';
import { fonts } from '../../constants/theme';
import LocationPicker, { type LocationData } from '../LocationPicker';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kukatonon.app';

interface MediaItem {
  type: 'image';
  url: string;
}

export interface MediaData {
  images: MediaItem[];
  youtubeUrls: string[];
  eventLocation: LocationData | null;
}

interface MediaStepProps {
  data: MediaData;
  onChange: (data: MediaData) => void;
}

export default function MediaStep({ data, onChange }: MediaStepProps) {
  const { colors } = useTheme();
  const [youtubeInput, setYoutubeInput] = useState('');
  const [ytError, setYtError] = useState('');

  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (result.canceled) return;

    for (const asset of result.assets) {
      try {
        const res = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: asset.fileName || 'photo.jpg',
            contentType: asset.mimeType || 'image/jpeg',
            type: 'image',
          }),
        });
        const { signedUrl, publicUrl } = await res.json();

        const file = {
          uri: asset.uri,
          name: asset.fileName || 'photo.jpg',
          type: asset.mimeType || 'image/jpeg',
        } as unknown as Blob;
        await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': asset.mimeType || 'image/jpeg' },
        });

        onChange({ ...data, images: [...data.images, { type: 'image', url: publicUrl }] });
      } catch {
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  }

  function removeImage(index: number) {
    onChange({ ...data, images: data.images.filter((_, i) => i !== index) });
  }

  function addYoutube() {
    const url = youtubeInput.trim();
    if (!url) return;
    const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    if (!ytRegex.test(url)) {
      setYtError('Invalid YouTube URL');
      return;
    }
    onChange({ ...data, youtubeUrls: [...data.youtubeUrls, url] });
    setYoutubeInput('');
    setYtError('');
  }

  function removeYoutube(index: number) {
    onChange({ ...data, youtubeUrls: data.youtubeUrls.filter((_, i) => i !== index) });
  }

  return (
    <View>
      {/* Photos */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardLabel, { color: colors.earth.gold }]}>STEP 3 OF 4</Text>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Add Photos & Details</Text>
        <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
          Add photos, YouTube links, or mark the location on a map.
        </Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Photos</Text>
        <View style={styles.imageGrid}>
          {data.images.map((item, i) => (
            <View key={i} style={styles.imageThumb}>
              <Image source={{ uri: item.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              <TouchableOpacity style={styles.imageRemove} onPress={() => removeImage(i)}>
                <MaterialIcons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={[styles.addImage, { borderColor: colors.border }]} onPress={pickImages}>
            <MaterialIcons name="add-photo-alternate" size={28} color={colors.textMuted} />
            <Text style={[styles.addImageText, { color: colors.textMuted }]}>Add Photos</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* YouTube */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>YouTube Videos</Text>
        {data.youtubeUrls.map((url, i) => (
          <View key={i} style={[styles.ytRow, { borderColor: colors.border }]}>
            <MaterialIcons name="smart-display" size={18} color={colors.earth.gold} />
            <Text style={[styles.ytUrl, { color: colors.textSecondary }]} numberOfLines={1}>{url}</Text>
            <TouchableOpacity onPress={() => removeYoutube(i)}>
              <MaterialIcons name="close" size={18} color="#dc2626" />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.ytInputRow}>
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            value={youtubeInput}
            onChangeText={setYoutubeInput}
            placeholder="Paste YouTube URL"
            placeholderTextColor={colors.textMuted}
            onSubmitEditing={addYoutube}
            returnKeyType="done"
          />
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.earth.gold }]} onPress={addYoutube}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
        {ytError ? <Text style={styles.errorText}>{ytError}</Text> : null}
      </View>

      {/* Location */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Event Location</Text>
        <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
          Optionally mark where the events took place.
        </Text>
        <LocationPicker
          value={data.eventLocation}
          onChange={(loc) => onChange({ ...data, eventLocation: loc })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 14 },
  cardLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  cardTitle: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  cardDesc: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  errorText: { color: '#dc2626', fontSize: 12, marginTop: 4 },

  // Images
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageThumb: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden' },
  imageRemove: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: 2,
  },
  addImage: {
    width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  addImageText: { fontSize: 9, marginTop: 2 },

  // YouTube
  ytRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderWidth: 1, borderRadius: 8, marginBottom: 6,
  },
  ytUrl: { flex: 1, fontSize: 12 },
  ytInputRow: { flexDirection: 'row', gap: 8 },
  addBtn: { borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
