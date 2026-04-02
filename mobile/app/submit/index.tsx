import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Switch,
  StyleSheet, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../constants/ThemeContext';
import { fonts } from '../../constants/theme';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kukatonon.app';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

export default function SubmitStoryScreen() {
  const { colors } = useTheme();
  const [honoreeName, setHonoreeName] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [storyText, setStoryText] = useState('');
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [youtubeInput, setYoutubeInput] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [submitterName, setSubmitterName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const scrollRef = useRef<ScrollView>(null);

  // Android: scroll to focused input
  const handleFocus = (y: number) => {
    if (Platform.OS === 'android') {
      setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, y - 120), animated: true }), 300);
    }
  };

  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (result.canceled) return;

    for (const asset of result.assets) {
      try {
        // Get upload URL
        const res = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: asset.fileName || 'photo.jpg', contentType: asset.mimeType || 'image/jpeg', type: 'image' }),
        });
        const { signedUrl, publicUrl } = await res.json();

        // Upload
        const file = { uri: asset.uri, name: asset.fileName || 'photo.jpg', type: asset.mimeType || 'image/jpeg' } as unknown as Blob;
        await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': asset.mimeType || 'image/jpeg' } });

        setMediaItems(prev => [...prev, { type: 'image', url: publicUrl }]);
      } catch {
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  }

  function addYoutube() {
    const url = youtubeInput.trim();
    if (!url) return;
    const ytRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    if (!ytRegex.test(url)) {
      setErrors(prev => ({ ...prev, youtube: 'Invalid YouTube URL' }));
      return;
    }
    setYoutubeUrls(prev => [...prev, url]);
    setYoutubeInput('');
    setErrors(prev => { const n = { ...prev }; delete n.youtube; return n; });
  }

  async function handleSubmit() {
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          honoree_name: honoreeName,
          title,
          summary: summary || undefined,
          content_html: storyText ? `<p>${storyText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>` : undefined,
          youtube_urls: youtubeUrls.length > 0 ? youtubeUrls : undefined,
          media_items: mediaItems.length > 0 ? mediaItems : undefined,
          cover_image_url: mediaItems.find(m => m.type === 'image')?.url || undefined,
          submitted_by_name: submitterName,
          submitted_by_phone: phone || undefined,
          submitted_by_whatsapp: whatsapp || undefined,
          submitted_by_email: email || undefined,
          consent_confirmed: consent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          const map: Record<string, string> = {};
          data.errors.forEach((e: { field: string; message: string }) => { map[e.field] = e.message; });
          setErrors(map);
        } else {
          setErrors({ form: data.error || 'Something went wrong' });
        }
        return;
      }
      setSubmitted(true);
    } catch {
      setErrors({ form: 'Failed to submit. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <>
        <Stack.Screen options={{ title: 'Thank You' }} />
        <View style={[styles.successContainer, { backgroundColor: colors.bg }]}>
          <MaterialIcons name="check-circle" size={64} color={colors.earth.gold} />
          <Text style={[styles.successTitle, { color: colors.text }]}>Thank You</Text>
          <Text style={[styles.successText, { color: colors.textSecondary }]}>
            Your memorial story has been submitted successfully. Our team will review it and make it available once approved.
          </Text>
          <TouchableOpacity style={[styles.successBtn, { backgroundColor: colors.earth.gold }]} onPress={() => router.back()}>
            <Text style={styles.successBtnText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Share a Story' }} />
        <ScrollView
          ref={scrollRef}
          style={[styles.container, { backgroundColor: colors.bg }]}
          contentContainerStyle={[styles.content, Platform.OS === 'android' && { paddingBottom: 300 }]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          keyboardDismissMode="interactive"
        >

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerLabel, { color: colors.earth.gold }]}>SHARE A MEMORY</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Submit a Memorial Story</Text>
            <Text style={[styles.headerDesc, { color: colors.textMuted }]}>
              Help us honor the memory of those who were lost. Your submission will be reviewed before publishing.
            </Text>
          </View>

          {errors.form && (
            <View style={styles.errorBanner}><Text style={styles.errorBannerText}>{errors.form}</Text></View>
          )}

          {/* Honoree Info */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>About the Person Being Honored</Text>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Honoree Name *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={honoreeName} onChangeText={setHonoreeName} placeholder="Full name" placeholderTextColor={colors.textMuted} />
            {errors.honoree_name && <Text style={styles.errorText}>{errors.honoree_name}</Text>}

            <Text style={[styles.label, { color: colors.textSecondary }]}>Story Title *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={title} onChangeText={setTitle} placeholder="A title for this memorial" placeholderTextColor={colors.textMuted} />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            <Text style={[styles.label, { color: colors.textSecondary }]}>Brief Summary</Text>
            <TextInput style={[styles.input, styles.multiline, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={summary} onChangeText={setSummary} placeholder="Optional summary" placeholderTextColor={colors.textMuted} multiline numberOfLines={2} />
          </View>

          {/* Story Content */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>The Story</Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>Share text, photos, or YouTube links. At least one is required.</Text>
            {errors.content && <Text style={styles.errorText}>{errors.content}</Text>}

            <Text style={[styles.label, { color: colors.textSecondary }]}>Written Story</Text>
            <TextInput style={[styles.input, styles.storyInput, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={storyText} onChangeText={setStoryText}
              placeholder="Tell their story... Share memories, describe who they were..."
              placeholderTextColor={colors.textMuted} multiline textAlignVertical="top" />

            {/* Photos */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Photos</Text>
            <View style={styles.mediaGrid}>
              {mediaItems.filter(m => m.type === 'image').map((item, i) => (
                <View key={i} style={styles.mediaThumb}>
                  <Image source={{ uri: item.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  <TouchableOpacity style={styles.mediaRemove} onPress={() => setMediaItems(prev => prev.filter((_, idx) => idx !== i))}>
                    <MaterialIcons name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={[styles.addMedia, { borderColor: colors.border }]} onPress={pickImages}>
                <MaterialIcons name="add-photo-alternate" size={28} color={colors.textMuted} />
                <Text style={[styles.addMediaText, { color: colors.textMuted }]}>Add Photos</Text>
              </TouchableOpacity>
            </View>

            {/* YouTube */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>YouTube Videos</Text>
            {youtubeUrls.map((url, i) => (
              <View key={i} style={[styles.ytRow, { borderColor: colors.border }]}>
                <Text style={[styles.ytUrl, { color: colors.textSecondary }]} numberOfLines={1}>{url}</Text>
                <TouchableOpacity onPress={() => setYoutubeUrls(prev => prev.filter((_, idx) => idx !== i))}>
                  <MaterialIcons name="close" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.ytInputRow}>
              <TextInput style={[styles.input, { flex: 1, backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={youtubeInput} onChangeText={setYoutubeInput} placeholder="Paste YouTube URL" placeholderTextColor={colors.textMuted}
                onSubmitEditing={addYoutube} returnKeyType="done" />
              <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.earth.gold }]} onPress={addYoutube}>
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
            {errors.youtube && <Text style={styles.errorText}>{errors.youtube}</Text>}
          </View>

          {/* Your Info */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Your Information</Text>
            <Text style={[styles.hint, { color: colors.textMuted }]}>Private — only visible to our team, never shown publicly.</Text>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Your Name *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={submitterName} onChangeText={setSubmitterName} placeholder="Your full name" placeholderTextColor={colors.textMuted} />
            {errors.submitted_by_name && <Text style={styles.errorText}>{errors.submitted_by_name}</Text>}

            <Text style={[styles.hint, { color: colors.textMuted, marginTop: 8 }]}>At least one contact method required.</Text>
            {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}

            <Text style={[styles.label, { color: colors.textSecondary }]}>Phone</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={phone} onChangeText={setPhone} placeholder="+231..." placeholderTextColor={colors.textMuted} keyboardType="phone-pad" />

            <Text style={[styles.label, { color: colors.textSecondary }]}>WhatsApp</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={whatsapp} onChangeText={setWhatsapp} placeholder="+231..." placeholderTextColor={colors.textMuted} keyboardType="phone-pad" />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
              value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={colors.textMuted} keyboardType="email-address" autoCapitalize="none" />
            {errors.submitted_by_email && <Text style={styles.errorText}>{errors.submitted_by_email}</Text>}
          </View>

          {/* Consent */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.consentRow} onPress={() => setConsent(!consent)}>
              <MaterialIcons name={consent ? 'check-box' : 'check-box-outline-blank'} size={24} color={consent ? colors.earth.gold : colors.textMuted} />
              <Text style={[styles.consentText, { color: colors.text }]}>
                I confirm that the information I have shared is truthful and I have the right to share this story and any accompanying media.
              </Text>
            </TouchableOpacity>
            {errors.consent_confirmed && <Text style={styles.errorText}>{errors.consent_confirmed}</Text>}
          </View>

          {/* Submit */}
          <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.earth.gold }]} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : (
              <>
                <MaterialIcons name="send" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>Submit Story</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 20, paddingTop: 8 },
  headerLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  headerTitle: { fontFamily: fonts.serif, fontSize: 26, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  headerDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  errorBanner: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorBannerText: { color: '#dc2626', fontSize: 13, textAlign: 'center' },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 14 },
  cardTitle: { fontFamily: fonts.serif, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  hint: { fontSize: 12, marginBottom: 10 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  multiline: { minHeight: 60, textAlignVertical: 'top' },
  storyInput: { minHeight: 140, textAlignVertical: 'top' },
  errorText: { color: '#dc2626', fontSize: 12, marginTop: 2 },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  mediaThumb: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden' },
  mediaRemove: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: 2 },
  addMedia: { width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  addMediaText: { fontSize: 9, marginTop: 2 },
  ytRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderWidth: 1, borderRadius: 8, marginBottom: 6 },
  ytUrl: { flex: 1, fontSize: 12 },
  ytInputRow: { flexDirection: 'row', gap: 8 },
  addBtn: { borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  consentText: { flex: 1, fontSize: 13, lineHeight: 20 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 14, marginTop: 4 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successTitle: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  successText: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  successBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  successBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
