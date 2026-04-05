import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, Switch, Modal, Pressable,
  StyleSheet, ActivityIndicator, Alert, Linking, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import {
  useAudioRecorder, useAudioRecorderState,
  requestRecordingPermissionsAsync, setAudioModeAsync, RecordingPresets,
} from 'expo-audio';
import { useAuth } from '../../../../constants/AuthContext';
import { useTheme } from '../../../../constants/ThemeContext';
import {
  fetchAdminStory, approveStory, rejectStory, updateStoryMeta,
  fetchAdminCategories, uploadMedia, type AdminStory, type ContentBlock,
} from '../../../../lib/adminApi';
import StatusBadge from '../../../../components/admin/StatusBadge';
import AudioPlayer from '../../../../components/AudioPlayer';
import StoryLocationMap from '../../../../components/StoryLocationMap';
import VideoPlayer from '../../../../components/VideoPlayer';
import LocationPicker, { type LocationData } from '../../../../components/LocationPicker';
import RenderHtml from 'react-native-render-html';
import YoutubePlayer from 'react-native-youtube-iframe';
import { extractVideoId } from '../../../../lib/youtube';
import { fonts } from '../../../../constants/theme';

function makeId() { return Math.random().toString(36).substring(2, 15); }

export default function StoryReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const { session } = useAuth();
  const { colors } = useTheme();
  const [story, setStory] = useState<AdminStory | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [showEventLocation, setShowEventLocation] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [coverUrl, setCoverUrl] = useState('');
  const [showFab, setShowFab] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showFullText, setShowFullText] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showAudioOptions, setShowAudioOptions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 500);

  const load = useCallback(async () => {
    if (!session?.token) return;
    try {
      const [s, cats] = await Promise.all([
        fetchAdminStory(session.token, id),
        fetchAdminCategories(session.token),
      ]);
      setStory(s);
      setReviewNotes(s.review_notes || '');
      setIsFeatured(s.is_featured);
      setShowEventLocation(!!s.show_event_location);
      setLocation(
        s.event_latitude != null && s.event_longitude != null
          ? { latitude: s.event_latitude, longitude: s.event_longitude, name: s.event_location_name || '' }
          : null
      );
      setSelectedCats(s.category_ids || []);
      setBlocks((s.content_blocks as ContentBlock[]) || []);
      setCoverUrl(s.cover_image_url || '');
      setCategories(cats);
    } catch {
      Alert.alert('Error', 'Failed to load story');
      router.back();
    } finally { setLoading(false); }
  }, [session?.token, id]);

  useEffect(() => { load(); }, [load]);

  // Block operations
  function addBlock(block: ContentBlock) { setBlocks([...blocks, block]); setShowFab(false); }
  function removeBlock(i: number) { setBlocks(blocks.filter((_, idx) => idx !== i)); }
  function moveBlock(i: number, dir: -1 | 1) {
    const t = i + dir;
    if (t < 0 || t >= blocks.length) return;
    const n = [...blocks]; [n[i], n[t]] = [n[t], n[i]]; setBlocks(n);
  }
  function updateBlock(i: number, b: ContentBlock) {
    const n = [...blocks]; n[i] = b; setBlocks(n);
  }

  function autoGenBlocks() {
    const nb: ContentBlock[] = [];
    if (story?.content_html) nb.push({ id: makeId(), type: 'text', html: story.content_html });
    for (const m of story?.media_items || []) {
      if (m.type === 'image') nb.push({ id: makeId(), type: 'image', url: m.url });
      else if (m.type === 'video') nb.push({ id: makeId(), type: 'video', url: m.url });
      else if (m.type === 'audio') nb.push({ id: makeId(), type: 'audio', url: m.url });
    }
    for (const u of story?.youtube_urls || []) {
      nb.push({ id: makeId(), type: 'youtube', url: u });
    }
    setBlocks(nb);
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const url = await uploadMedia(session!.token, asset.uri, asset.fileName || 'photo.jpg', asset.mimeType || 'image/jpeg', 'image');
      addBlock({ id: makeId(), type: 'image', url });
    } catch { Alert.alert('Error', 'Upload failed'); }
    finally { setUploading(false); }
  }

  async function pickVideo() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'] });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const url = await uploadMedia(session!.token, asset.uri, asset.fileName || 'video.mp4', asset.mimeType || 'video/mp4', 'video');
      addBlock({ id: makeId(), type: 'video', url });
    } catch { Alert.alert('Error', 'Upload failed'); }
    finally { setUploading(false); }
  }

  async function pickAudioFile() {
    setShowAudioOptions(false);
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled || !result.assets[0] || !session?.token) return;

    const asset = result.assets[0];
    setUploadingAudio(true);
    try {
      const filename = asset.name || `audio_${Date.now()}.m4a`;
      const mimeType = asset.mimeType || 'audio/mp4';
      const url = await uploadMedia(session.token, asset.uri, filename, mimeType, 'audio');
      addBlock({ id: makeId(), type: 'audio', url });
    } catch {
      Alert.alert('Error', 'Audio upload failed.');
    } finally {
      setUploadingAudio(false);
    }
  }

  async function startAudioRecording() {
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

  async function stopAudioRecording() {
    if (!session?.token) return;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false });
    const uri = recorder.uri;
    if (!uri) return;

    setUploadingAudio(true);
    try {
      const filename = `narration_${Date.now()}.m4a`;
      const url = await uploadMedia(session.token, uri, filename, 'audio/mp4', 'audio');
      setShowAudioOptions(false);
      addBlock({ id: makeId(), type: 'audio', url });
    } catch {
      Alert.alert('Error', 'Failed to upload audio recording.');
    } finally {
      setUploadingAudio(false);
    }
  }

  async function handleSave() {
    if (!session?.token || !story) return;
    setSaving(true);
    try {
      const updated = await updateStoryMeta(session.token, story.id, {
        review_notes: reviewNotes || undefined,
        category_ids: selectedCats,
        is_featured: isFeatured,
        show_event_location: location ? showEventLocation : false,
        event_latitude: location?.latitude ?? null,
        event_longitude: location?.longitude ?? null,
        event_location_name: location?.name?.trim() || null,
        content_blocks: blocks.length > 0 ? blocks : null,
        cover_image_url: coverUrl || null,
      });
      setStory(updated);
      Alert.alert('Saved', 'Changes saved.');
    } catch { Alert.alert('Error', 'Failed to save'); }
    finally { setSaving(false); }
  }

  async function handleApprove() {
    Alert.alert('Approve Story', `Approve "${story?.honoree_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', onPress: async () => {
        if (!session?.token || !story) return;
        try { setStory(await approveStory(session.token, story.id)); } catch { Alert.alert('Error', 'Failed'); }
      }},
    ]);
  }

  async function handleReject() {
    Alert.alert('Reject Story', `Reject "${story?.honoree_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reject', style: 'destructive', onPress: async () => {
        if (!session?.token || !story) return;
        try { setStory(await rejectStory(session.token, story.id, reviewNotes)); } catch { Alert.alert('Error', 'Failed'); }
      }},
    ]);
  }

  function toggleCategory(catId: string) {
    if (selectedCats.includes(catId)) setSelectedCats(selectedCats.filter((c) => c !== catId));
    else if (selectedCats.length < 5) setSelectedCats([...selectedCats, catId]);
  }

  function sameLocation(a: LocationData | null, b: LocationData | null) {
    if (!a || !b) return false;
    return a.latitude === b.latitude && a.longitude === b.longitude && a.name === b.name;
  }

  function handleLocationChange(next: LocationData | null) {
    if (!location || !next || sameLocation(location, next)) {
      setLocation(next);
      if (!next) setShowEventLocation(false);
      return;
    }

    Alert.alert(
      'Overwrite location?',
      'This will overwrite the previous location for this story.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Overwrite', style: 'destructive', onPress: () => setLocation(next) },
      ]
    );
  }

  const htmlTagStyles = {
    p: { marginBottom: 8 },
    h2: { fontFamily: fonts.serif, fontSize: 20, fontWeight: '700' as const },
    h3: { fontFamily: fonts.serif, fontSize: 17, fontWeight: '700' as const },
    blockquote: { borderLeftWidth: 3, borderLeftColor: colors.earth.gold, paddingLeft: 10, fontStyle: 'italic' as const, color: colors.textSecondary },
  };

  if (loading || !story) {
    return <View style={[styles.center, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color={colors.earth.gold} /></View>;
  }

  const sourceImages = story.media_items?.filter(m => m.type === 'image') || [];
  const sourceVideos = story.media_items?.filter(m => m.type === 'video') || [];
  const sourceAudio = story.media_items?.filter(m => m.type === 'audio') || [];
  const hasLocation = location != null;

  return (
    <>
      <Stack.Screen options={{ title: story.honoree_name, headerRight: () => (
        <TouchableOpacity onPress={() => setShowPreview(true)} style={{ marginRight: 8 }}>
          <MaterialIcons name="visibility" size={24} color={colors.headerText} />
        </TouchableOpacity>
      )}} />

      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* Status + Featured */}
        <View style={[styles.statusRow, { borderBottomColor: colors.border }]}>
          <StatusBadge status={story.status} />
          <View style={styles.statusToggles}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Featured</Text>
              <Switch value={isFeatured} onValueChange={setIsFeatured} trackColor={{ true: colors.earth.gold, false: '#e5e7eb' }} />
            </View>
            {hasLocation && (
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Show location</Text>
                <Switch value={showEventLocation} onValueChange={setShowEventLocation} trackColor={{ true: colors.earth.gold, false: '#e5e7eb' }} />
              </View>
            )}
          </View>
        </View>

        {/* Cover */}
        {coverUrl ? (
          <View>
            <Image source={{ uri: coverUrl }} style={styles.cover} contentFit="cover" />
            <View style={styles.coverActions}>
              <TouchableOpacity style={styles.coverActionBtn} onPress={() => setShowCoverPicker(true)}>
                <MaterialIcons name="swap-horiz" size={16} color="#fff" />
                <Text style={styles.coverActionText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.coverActionBtn} onPress={() => setCoverUrl('')}>
                <MaterialIcons name="close" size={16} color="#fff" />
                <Text style={styles.coverActionText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.coverEmpty, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => setShowCoverPicker(true)}
          >
            <MaterialIcons name="add-photo-alternate" size={36} color={colors.textMuted} />
            <Text style={[styles.coverEmptyTitle, { color: colors.text }]}>Cover Image</Text>
            <Text style={[styles.coverEmptyHint, { color: colors.textMuted }]}>Tap to choose from submitted photos or upload</Text>
          </TouchableOpacity>
        )}

        {/* Story Info */}
        <View style={styles.section}>
          <Text style={[styles.memLabel, { color: colors.earth.gold }]}>IN MEMORY OF</Text>
          <Text style={[styles.name, { color: colors.text }]}>{story.honoree_name}</Text>
          <Text style={[styles.title, { color: colors.textSecondary }]}>{story.title}</Text>
        </View>

        {/* Submitter Contact */}
        {story.source_type === 'public_submission' && (
          <View style={[styles.contactCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
            <Text style={styles.contactTitle}>Submitter</Text>
            <Text style={styles.contactName}>{story.submitted_by_name}</Text>
            {story.submitted_by_phone && <TouchableOpacity onPress={() => Linking.openURL(`tel:${story.submitted_by_phone}`)}><Text style={styles.contactLink}>Phone: {story.submitted_by_phone}</Text></TouchableOpacity>}
            {story.submitted_by_email && <TouchableOpacity onPress={() => Linking.openURL(`mailto:${story.submitted_by_email}`)}><Text style={styles.contactLink}>Email: {story.submitted_by_email}</Text></TouchableOpacity>}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Event Location</Text>
          <LocationPicker value={location} onChange={handleLocationChange} />
          {hasLocation && (
            <View style={{ marginTop: 10 }}>
              <View style={styles.locationMeta}>
                <Text style={[styles.locationMetaText, { color: colors.textSecondary }]}>
                  {showEventLocation ? 'Location is enabled for the public story' : 'Location is hidden from the public story'}
                </Text>
              </View>
              <StoryLocationMap
                latitude={location.latitude}
                longitude={location.longitude}
                locationName={location.name}
              />
            </View>
          )}
        </View>

        {/* Source media button */}
        {(story.content_html || sourceImages.length > 0 || sourceVideos.length > 0 || sourceAudio.length > 0 || (story.youtube_urls?.length || 0) > 0) && (
          <TouchableOpacity style={[styles.sourceBtn, { borderColor: '#93c5fd' }]} onPress={() => setShowSource(true)}>
            <MaterialIcons name="inventory-2" size={18} color="#2563eb" />
            <Text style={{ color: '#2563eb', fontSize: 13, fontWeight: '600' }}>View Submitted Content ({sourceImages.length + sourceVideos.length + sourceAudio.length + (story.youtube_urls?.length || 0)} items)</Text>
          </TouchableOpacity>
        )}

        {/* Auto-generate */}
        {blocks.length === 0 && (story.content_html || sourceImages.length > 0) && (
          <TouchableOpacity style={[styles.autoBtn, { borderColor: colors.earth.gold + '66' }]} onPress={autoGenBlocks}>
            <MaterialIcons name="auto-fix-high" size={18} color={colors.earth.gold} />
            <Text style={{ color: colors.earth.gold, fontSize: 13, fontWeight: '600' }}>Auto-generate blocks from submission</Text>
          </TouchableOpacity>
        )}

        {/* Content Blocks */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Content Blocks ({blocks.length})</Text>
          {blocks.length === 0 ? (
            <View style={[styles.emptyBlocks, { borderColor: colors.border }]}>
              <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>No blocks yet. Tap + to add content, or use submitted content above.</Text>
            </View>
          ) : blocks.map((block, i) => (
            <View key={block.id} style={[styles.blockCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.blockHeader}>
                <Text style={[styles.blockType, {
                  color: block.type === 'text' ? '#6b7280' : block.type === 'image' ? '#16a34a' : block.type === 'video' ? '#7c3aed' : block.type === 'audio' ? '#ea580c' : '#dc2626',
                  backgroundColor: block.type === 'text' ? '#f3f4f6' : block.type === 'image' ? '#dcfce7' : block.type === 'video' ? '#f3e8ff' : block.type === 'audio' ? '#fff7ed' : '#fee2e2',
                }]}>{block.type.toUpperCase()}</Text>
                <View style={styles.blockActions}>
                  <TouchableOpacity onPress={() => moveBlock(i, -1)} disabled={i === 0}><MaterialIcons name="arrow-upward" size={18} color={i === 0 ? '#d1d5db' : '#6b7280'} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => moveBlock(i, 1)} disabled={i === blocks.length - 1}><MaterialIcons name="arrow-downward" size={18} color={i === blocks.length - 1 ? '#d1d5db' : '#6b7280'} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => removeBlock(i)}><MaterialIcons name="delete-outline" size={18} color="#dc2626" /></TouchableOpacity>
                </View>
              </View>
              {block.type === 'text' && (
                <TextInput
                  style={[styles.blockTextInput, { color: colors.text, borderColor: colors.border }]}
                  value={block.html} onChangeText={(t) => updateBlock(i, { ...block, html: t })}
                  multiline placeholder="Enter text or paste HTML..." placeholderTextColor={colors.textMuted}
                />
              )}
              {block.type === 'image' && block.url ? (
                <Image source={{ uri: block.url }} style={styles.blockImage} contentFit="cover" />
              ) : block.type === 'image' ? <Text style={{ color: colors.textMuted, fontSize: 12, padding: 12 }}>No image set</Text> : null}
              {block.type === 'video' && block.url && (
                <View style={{ padding: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialIcons name="videocam" size={18} color="#7c3aed" />
                    <Text style={{ color: colors.textMuted, fontSize: 12, flex: 1 }} numberOfLines={1}>{block.url}</Text>
                  </View>
                </View>
              )}
              {block.type === 'audio' && block.url && (
                <View style={{ padding: 8 }}>
                  <AudioPlayer url={block.url} />
                </View>
              )}
              {block.type === 'youtube' && (
                <TextInput
                  style={[styles.blockUrlInput, { color: colors.text, borderColor: colors.border }]}
                  value={block.url} onChangeText={(u) => updateBlock(i, { ...block, url: u })}
                  placeholder="YouTube URL" placeholderTextColor={colors.textMuted}
                />
              )}
            </View>
          ))}
        </View>

        {/* Categories */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Categories</Text>
            <View style={styles.catGrid}>
              {categories.map((cat) => {
                const sel = selectedCats.includes(cat.id);
                return (
                  <TouchableOpacity key={cat.id} onPress={() => toggleCategory(cat.id)}
                    style={[styles.catPill, sel && { backgroundColor: colors.earth.gold + '22', borderColor: colors.earth.gold + '44', borderWidth: 1 }]}>
                    <Text style={[styles.catText, sel && { color: colors.earth.gold }]}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Review Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Review Notes</Text>
          <TextInput style={[styles.notesInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={reviewNotes} onChangeText={setReviewNotes} placeholder="Internal notes..." placeholderTextColor={colors.textMuted} multiline />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {story.status !== 'approved' && (
            <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
              <MaterialIcons name="check-circle" size={20} color="#fff" /><Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
          )}
          {story.status !== 'rejected' && (
            <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
              <MaterialIcons name="cancel" size={20} color="#dc2626" /><Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.earth.gold }]} onPress={handleSave} disabled={saving}>
            <Text style={[styles.saveBtnText, { color: '#fff' }]}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.earth.gold }]} onPress={() => setShowFab(true)}>
        {uploading || uploadingAudio ? <ActivityIndicator color="#fff" /> : <MaterialIcons name="add" size={28} color="#fff" />}
      </TouchableOpacity>

      {/* FAB Menu */}
      <Modal visible={showFab} transparent animationType="fade" onRequestClose={() => setShowFab(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowFab(false)}>
          <View style={[styles.fabMenu, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.fabItem} onPress={() => { addBlock({ id: makeId(), type: 'text', html: '' }); }}>
              <MaterialIcons name="text-fields" size={22} color="#6b7280" /><Text style={styles.fabItemText}>Text</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabItem} onPress={() => { setShowFab(false); pickImage(); }}>
              <MaterialIcons name="image" size={22} color="#16a34a" /><Text style={styles.fabItemText}>Image (Gallery)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabItem} onPress={() => { setShowFab(false); pickVideo(); }}>
              <MaterialIcons name="videocam" size={22} color="#7c3aed" /><Text style={styles.fabItemText}>Video (Gallery)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabItem} onPress={() => { setShowFab(false); setShowAudioOptions(true); }}>
              <MaterialIcons name="graphic-eq" size={22} color="#ea580c" /><Text style={styles.fabItemText}>Voice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabItem} onPress={() => { addBlock({ id: makeId(), type: 'youtube', url: '' }); }}>
              <MaterialIcons name="smart-display" size={22} color="#dc2626" /><Text style={styles.fabItemText}>YouTube</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Audio Source Modal */}
      <Modal visible={showAudioOptions} transparent animationType="fade" onRequestClose={() => setShowAudioOptions(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowAudioOptions(false)}>
          <View style={[styles.fabMenu, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.fabItem} onPress={pickAudioFile}>
              <MaterialIcons name="upload-file" size={22} color="#ea580c" /><Text style={styles.fabItemText}>Upload from device</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabItem}
              onPress={recorderState.isRecording ? stopAudioRecording : startAudioRecording}
            >
              <MaterialIcons name={recorderState.isRecording ? 'stop-circle' : 'mic'} size={22} color={recorderState.isRecording ? '#dc2626' : '#ea580c'} />
              <Text style={styles.fabItemText}>{recorderState.isRecording ? 'Stop recording' : 'Record now with mic'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.fabItem} onPress={() => { setShowAudioOptions(false); setShowSource(true); }}>
              <MaterialIcons name="library-music" size={22} color="#2563eb" /><Text style={styles.fabItemText}>Use submitted voice</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Source Media Modal */}
      <Modal visible={showSource} transparent animationType="slide" onRequestClose={() => setShowSource(false)}>
        <View style={[styles.sourceModal, { backgroundColor: colors.bg }]}>
          <View style={[styles.sourceHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sourceTitle, { color: colors.text }]}>Submitted Content</Text>
            <TouchableOpacity onPress={() => setShowSource(false)}><MaterialIcons name="close" size={24} color={colors.textSecondary} /></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {story.content_html && (
              <View style={{ marginBottom: 16 }}>
                <View style={styles.sourceItemHeader}><Text style={styles.sourceItemLabel}>TEXT</Text>
                  <TouchableOpacity onPress={() => { addBlock({ id: makeId(), type: 'text', html: story.content_html! }); setShowSource(false); }}>
                    <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: '600' }}>+ Add to blocks</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[styles.sourcePreview, { borderColor: colors.border }]}
                  onPress={() => setShowFullText(true)}
                  activeOpacity={0.7}
                >
                  <RenderHtml contentWidth={width - 64} source={{ html: story.content_html.substring(0, 500) }} baseStyle={{ fontSize: 13, color: colors.textSecondary }} />
                  <View style={styles.readMoreRow}>
                    <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: '600' }}>Tap to read full text</Text>
                    <MaterialIcons name="open-in-full" size={14} color="#2563eb" />
                  </View>
                </TouchableOpacity>
              </View>
            )}
            {sourceImages.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.sourceItemLabel}>IMAGES ({sourceImages.length})</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {sourceImages.map((img, i) => (
                    <TouchableOpacity key={i} onPress={() => { addBlock({ id: makeId(), type: 'image', url: img.url }); setShowSource(false); }}
                      style={{ width: '31%', aspectRatio: 1, borderRadius: 8, overflow: 'hidden' }}>
                      <Image source={{ uri: img.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                      <View style={styles.sourceOverlay}><Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>+ Add</Text></View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            {sourceVideos.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.sourceItemLabel}>VIDEOS ({sourceVideos.length})</Text>
                {sourceVideos.map((vid, i) => (
                  <TouchableOpacity key={i} style={[styles.sourceUrlRow, { borderColor: colors.border }]}
                    onPress={() => { addBlock({ id: makeId(), type: 'video', url: vid.url }); setShowSource(false); }}>
                    <MaterialIcons name="videocam" size={18} color="#7c3aed" />
                    <Text style={{ flex: 1, fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>Video {i + 1}</Text>
                    <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: '600' }}>+ Add</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {sourceAudio.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.sourceItemLabel}>AUDIO NARRATION ({sourceAudio.length})</Text>
                {sourceAudio.map((a, i) => (
                  <View key={i} style={{ marginBottom: 8 }}>
                    <AudioPlayer url={a.url} />
                    <TouchableOpacity
                      style={[styles.sourceUrlRow, { borderColor: colors.border, marginTop: 4 }]}
                      onPress={() => { addBlock({ id: makeId(), type: 'audio', url: a.url }); setShowSource(false); }}
                    >
                      <MaterialIcons name="add-circle-outline" size={18} color="#2563eb" />
                      <Text style={{ flex: 1, fontSize: 12, color: '#2563eb', fontWeight: '600' }}>+ Add to story blocks</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            {(story.youtube_urls?.length || 0) > 0 && (
              <View>
                <Text style={styles.sourceItemLabel}>YOUTUBE ({story.youtube_urls.length})</Text>
                {story.youtube_urls.map((url, i) => (
                  <TouchableOpacity key={i} style={[styles.sourceUrlRow, { borderColor: colors.border }]}
                    onPress={() => { addBlock({ id: makeId(), type: 'youtube', url }); setShowSource(false); }}>
                    <Text style={{ flex: 1, fontSize: 12, color: colors.textSecondary }} numberOfLines={1}>{url}</Text>
                    <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: '600' }}>+ Add</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal visible={showPreview} animationType="slide" onRequestClose={() => setShowPreview(false)}>
        <View style={[styles.previewContainer, { backgroundColor: colors.bg }]}>
          <View style={[styles.previewHeader, { backgroundColor: colors.headerBg }]}>
            <Text style={[styles.previewTitle, { color: colors.headerText }]}>Preview</Text>
            <TouchableOpacity onPress={() => setShowPreview(false)}>
              <MaterialIcons name="close" size={24} color={colors.headerText} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            {coverUrl ? <Image source={{ uri: coverUrl }} style={styles.cover} contentFit="cover" /> : null}
            <View style={{ padding: 20 }}>
              <Text style={{ color: colors.earth.gold, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 4 }}>IN MEMORY OF</Text>
              <Text style={{ fontFamily: fonts.serif, fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 4 }}>{story.honoree_name}</Text>
              <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 16 }}>{story.title}</Text>
              {story.summary && (
                <View style={{ borderLeftWidth: 4, borderLeftColor: colors.earth.gold, paddingLeft: 12, marginBottom: 16 }}>
                  <Text style={{ fontFamily: fonts.serif, fontStyle: 'italic', fontSize: 15, color: colors.textSecondary, lineHeight: 24 }}>{story.summary}</Text>
                </View>
              )}
            </View>
            {blocks.map((block) => (
              <View key={block.id} style={{ marginBottom: 16 }}>
                {block.type === 'text' && block.html ? (
                  <View style={{ paddingHorizontal: 20 }}>
                    <RenderHtml contentWidth={width - 40} source={{ html: block.html }} baseStyle={{ fontSize: 15, lineHeight: 26, color: colors.text }} tagsStyles={htmlTagStyles} />
                  </View>
                ) : block.type === 'image' && block.url ? (
                  <Image source={{ uri: block.url }} style={{ width: '100%', aspectRatio: 16 / 10 }} contentFit="cover" />
                ) : block.type === 'video' && block.url ? (
                  <VideoPlayer url={block.url} />
                ) : block.type === 'audio' && block.url ? (
                  <AudioPlayer url={block.url} />
                ) : block.type === 'youtube' && block.url ? (
                  <View style={{ marginHorizontal: 20 }}>
                    {extractVideoId(block.url) && <YoutubePlayer height={Math.round((width - 40) * 9 / 16)} videoId={extractVideoId(block.url)!} />}
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Full Text Reading Modal */}
      <Modal visible={showFullText} animationType="slide" onRequestClose={() => setShowFullText(false)}>
        <View style={[styles.previewContainer, { backgroundColor: colors.bg }]}>
          <View style={[styles.previewHeader, { backgroundColor: colors.headerBg }]}>
            <Text style={[styles.previewTitle, { color: colors.headerText }]}>Submitted Text</Text>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => {
                if (story.content_html) {
                  addBlock({ id: makeId(), type: 'text', html: story.content_html });
                  setShowFullText(false);
                  setShowSource(false);
                }
              }}>
                <Text style={{ color: colors.earth.gold, fontSize: 14, fontWeight: '700' }}>+ Add to blocks</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowFullText(false)}>
                <MaterialIcons name="close" size={24} color={colors.headerText} />
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
            {story.content_html && (
              <RenderHtml
                contentWidth={width - 40}
                source={{ html: story.content_html }}
                baseStyle={{ fontSize: 16, lineHeight: 28, color: colors.text }}
                tagsStyles={htmlTagStyles}
              />
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Cover Image Picker Modal */}
      <Modal visible={showCoverPicker} transparent animationType="fade" onRequestClose={() => setShowCoverPicker(false)}>
        <Pressable style={styles.coverPickerOverlay} onPress={() => setShowCoverPicker(false)}>
          <View style={[styles.coverPickerMenu, { backgroundColor: colors.card }]}>
            <Text style={[styles.coverPickerTitle, { color: colors.text }]}>Choose Cover Image</Text>

            {/* Submitted images */}
            {sourceImages.length > 0 && (
              <>
                <Text style={[styles.coverPickerLabel, { color: colors.textMuted }]}>FROM SUBMISSION</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.coverPickerScroll}>
                  {sourceImages.map((img, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.coverPickerThumb, coverUrl === img.url && { borderColor: colors.earth.gold, borderWidth: 2 }]}
                      onPress={() => { setCoverUrl(img.url); setShowCoverPicker(false); }}
                    >
                      <Image source={{ uri: img.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                      {coverUrl === img.url && (
                        <View style={styles.coverPickerCheck}>
                          <MaterialIcons name="check-circle" size={20} color={colors.earth.gold} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Upload from device */}
            <TouchableOpacity
              style={[styles.coverPickerUploadBtn, { borderColor: colors.border }]}
              onPress={async () => {
                setShowCoverPicker(false);
                const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
                if (result.canceled || !result.assets[0]) return;
                const asset = result.assets[0];
                setUploading(true);
                try {
                  const url = await uploadMedia(session!.token, asset.uri, asset.fileName || 'cover.jpg', asset.mimeType || 'image/jpeg', 'image');
                  setCoverUrl(url);
                } catch { Alert.alert('Error', 'Upload failed'); }
                finally { setUploading(false); }
              }}
            >
              <MaterialIcons name="file-upload" size={20} color={colors.text} />
              <Text style={[styles.coverPickerUploadText, { color: colors.text }]}>Upload from device</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.coverPickerCancel} onPress={() => setShowCoverPicker(false)}>
              <Text style={{ color: colors.textMuted, fontSize: 15 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  statusToggles: { alignItems: 'flex-end', gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 13, fontWeight: '600' },
  cover: { width: '100%', aspectRatio: 16 / 9 },
  coverRemove: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, padding: 4 },
  section: { padding: 16 },
  memLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  name: { fontFamily: fonts.serif, fontSize: 24, fontWeight: '700', marginBottom: 4 },
  title: { fontSize: 15, marginBottom: 8 },
  contactCard: { marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  contactTitle: { fontSize: 12, fontWeight: '700', color: '#1e40af', marginBottom: 4 },
  contactName: { fontSize: 15, fontWeight: '600', color: '#1e3a5f', marginBottom: 6 },
  contactLink: { fontSize: 14, color: '#2563eb', marginBottom: 4 },
  locationMeta: { paddingHorizontal: 16, paddingBottom: 8 },
  locationMetaText: { fontSize: 12, fontWeight: '500' },
  sourceBtn: { marginHorizontal: 16, padding: 12, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#eff6ff', marginBottom: 4 },
  autoBtn: { marginHorizontal: 16, padding: 12, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  emptyBlocks: { padding: 24, borderWidth: 1, borderStyle: 'dashed', borderRadius: 12 },
  blockCard: { borderWidth: 1, borderRadius: 12, marginBottom: 10, overflow: 'hidden' },
  blockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, backgroundColor: '#f9fafb' },
  blockType: { fontSize: 9, fontWeight: '800', letterSpacing: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  blockActions: { flexDirection: 'row', gap: 10 },
  blockTextInput: { padding: 12, fontSize: 14, minHeight: 60, textAlignVertical: 'top', borderTopWidth: 1 },
  blockImage: { width: '100%', aspectRatio: 16 / 10 },
  setCoverBtn: { padding: 8, alignItems: 'center' },
  blockUrlInput: { padding: 10, fontSize: 13, borderTopWidth: 1 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6' },
  catText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  notesInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, minHeight: 60, textAlignVertical: 'top' },
  actions: { padding: 16, gap: 10 },
  approveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#16a34a', padding: 14, borderRadius: 12 },
  approveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rejectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: '#dc2626', padding: 14, borderRadius: 12 },
  rejectBtnText: { color: '#dc2626', fontSize: 16, fontWeight: '700' },
  saveBtn: { alignItems: 'center', padding: 14, borderRadius: 12 },
  saveBtnText: { fontSize: 16, fontWeight: '700' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 5 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end', alignItems: 'flex-end', padding: 24, paddingBottom: 90 },
  fabMenu: { borderRadius: 16, padding: 8, minWidth: 200, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  fabItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  fabItemText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  sourceModal: { flex: 1, paddingTop: 50 },
  sourceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  sourceTitle: { fontSize: 18, fontWeight: '700', fontFamily: fonts.serif },
  sourceItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sourceItemLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: '#6b7280', marginBottom: 6 },
  sourcePreview: { borderWidth: 1, borderRadius: 10, padding: 10, maxHeight: 120, overflow: 'hidden' },
  sourceOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  sourceUrlRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderWidth: 1, borderRadius: 8, marginBottom: 6 },
  previewContainer: { flex: 1 },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 50 },
  previewTitle: { fontSize: 18, fontWeight: '700', fontFamily: fonts.serif },
  readMoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 8, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e7eb' },
  coverEmpty: { margin: 16, borderWidth: 1, borderStyle: 'dashed', borderRadius: 14, paddingVertical: 32, alignItems: 'center', gap: 6 },
  coverEmptyTitle: { fontSize: 16, fontWeight: '700', fontFamily: fonts.serif },
  coverEmptyHint: { fontSize: 12 },
  coverActions: { position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', gap: 6 },
  coverActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  coverActionText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  coverPickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  coverPickerMenu: { borderRadius: 20, padding: 20, width: '90%', maxHeight: '70%' },
  coverPickerTitle: { fontSize: 18, fontWeight: '700', fontFamily: fonts.serif, marginBottom: 16 },
  coverPickerLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  coverPickerScroll: { marginBottom: 16 },
  coverPickerThumb: { width: 90, height: 90, borderRadius: 10, overflow: 'hidden', marginRight: 8, borderWidth: 2, borderColor: 'transparent' },
  coverPickerCheck: { position: 'absolute', top: 4, right: 4 },
  coverPickerUploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderRadius: 10, paddingVertical: 12, marginBottom: 8 },
  coverPickerUploadText: { fontSize: 14, fontWeight: '600' },
  coverPickerCancel: { alignItems: 'center', paddingVertical: 10 },
});
