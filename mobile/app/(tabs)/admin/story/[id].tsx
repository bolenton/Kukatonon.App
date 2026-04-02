import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, Switch, Modal, Pressable,
  StyleSheet, ActivityIndicator, Alert, Linking, useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../../constants/AuthContext';
import { useTheme } from '../../../../constants/ThemeContext';
import {
  fetchAdminStory, approveStory, rejectStory, updateStoryMeta,
  fetchAdminCategories, uploadMedia, type AdminStory, type ContentBlock,
} from '../../../../lib/adminApi';
import StatusBadge from '../../../../components/admin/StatusBadge';
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
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [coverUrl, setCoverUrl] = useState('');
  const [showFab, setShowFab] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  async function handleSave() {
    if (!session?.token || !story) return;
    setSaving(true);
    try {
      const updated = await updateStoryMeta(session.token, story.id, {
        review_notes: reviewNotes || undefined,
        category_ids: selectedCats,
        is_featured: isFeatured,
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
          <View style={styles.row}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Featured</Text>
            <Switch value={isFeatured} onValueChange={setIsFeatured} trackColor={{ true: colors.earth.gold, false: '#e5e7eb' }} />
          </View>
        </View>

        {/* Cover */}
        {coverUrl ? (
          <View>
            <Image source={{ uri: coverUrl }} style={styles.cover} contentFit="cover" />
            <TouchableOpacity style={styles.coverRemove} onPress={() => setCoverUrl('')}>
              <MaterialIcons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : null}

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

        {/* Source media button */}
        {(story.content_html || sourceImages.length > 0 || sourceVideos.length > 0 || (story.youtube_urls?.length || 0) > 0) && (
          <TouchableOpacity style={[styles.sourceBtn, { borderColor: '#93c5fd' }]} onPress={() => setShowSource(true)}>
            <MaterialIcons name="inventory-2" size={18} color="#2563eb" />
            <Text style={{ color: '#2563eb', fontSize: 13, fontWeight: '600' }}>View Submitted Content ({sourceImages.length + sourceVideos.length + (story.youtube_urls?.length || 0)} items)</Text>
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
                  color: block.type === 'text' ? '#6b7280' : block.type === 'image' ? '#16a34a' : block.type === 'video' ? '#7c3aed' : '#dc2626',
                  backgroundColor: block.type === 'text' ? '#f3f4f6' : block.type === 'image' ? '#dcfce7' : block.type === 'video' ? '#f3e8ff' : '#fee2e2',
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
                <View>
                  <Image source={{ uri: block.url }} style={styles.blockImage} contentFit="cover" />
                  <TouchableOpacity onPress={() => setCoverUrl(block.url)} style={[styles.setCoverBtn, coverUrl === block.url && { backgroundColor: colors.earth.gold + '22' }]}>
                    <Text style={{ fontSize: 12, color: coverUrl === block.url ? colors.earth.gold : '#6b7280' }}>
                      {coverUrl === block.url ? 'Cover image' : 'Set as cover'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : block.type === 'image' ? <Text style={{ color: colors.textMuted, fontSize: 12 }}>No image set</Text> : null}
              {block.type === 'video' && block.url && <Text style={{ color: colors.textMuted, fontSize: 12 }} numberOfLines={1}>Video: {block.url}</Text>}
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
        {uploading ? <ActivityIndicator color="#fff" /> : <MaterialIcons name="add" size={28} color="#fff" />}
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
            <TouchableOpacity style={styles.fabItem} onPress={() => { addBlock({ id: makeId(), type: 'youtube', url: '' }); }}>
              <MaterialIcons name="smart-display" size={22} color="#dc2626" /><Text style={styles.fabItemText}>YouTube</Text>
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
                    <Text style={{ color: '#2563eb', fontSize: 12, fontWeight: '600' }}>+ Add</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.sourcePreview, { borderColor: colors.border }]}>
                  <RenderHtml contentWidth={width - 64} source={{ html: story.content_html.substring(0, 500) }} baseStyle={{ fontSize: 13, color: colors.textSecondary }} />
                </View>
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
            {blocks.length > 0 ? blocks.map((block) => (
              <View key={block.id} style={{ marginBottom: 16 }}>
                {block.type === 'text' && block.html ? (
                  <View style={{ paddingHorizontal: 20 }}>
                    <RenderHtml contentWidth={width - 40} source={{ html: block.html }} baseStyle={{ fontSize: 15, lineHeight: 26, color: colors.text }} tagsStyles={htmlTagStyles} />
                  </View>
                ) : block.type === 'image' && block.url ? (
                  <Image source={{ uri: block.url }} style={{ width: '100%', aspectRatio: 16 / 10 }} contentFit="cover" />
                ) : block.type === 'youtube' && block.url ? (
                  <View style={{ marginHorizontal: 20 }}>
                    {extractVideoId(block.url) && <YoutubePlayer height={Math.round((width - 40) * 9 / 16)} videoId={extractVideoId(block.url)!} />}
                  </View>
                ) : null}
              </View>
            )) : story.content_html ? (
              <View style={{ paddingHorizontal: 20 }}>
                <RenderHtml contentWidth={width - 40} source={{ html: story.content_html }} baseStyle={{ fontSize: 15, lineHeight: 26, color: colors.text }} tagsStyles={htmlTagStyles} />
              </View>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
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
});
