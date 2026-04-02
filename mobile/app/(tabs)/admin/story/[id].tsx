import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity, Switch,
  StyleSheet, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../../constants/AuthContext';
import { useTheme } from '../../../../constants/ThemeContext';
import {
  fetchAdminStory, approveStory, rejectStory, updateStoryMeta,
  fetchAdminCategories, type AdminStory,
} from '../../../../lib/adminApi';
import StatusBadge from '../../../../components/admin/StatusBadge';
import { fonts } from '../../../../constants/theme';

export default function StoryReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { colors } = useTheme();
  const [story, setStory] = useState<AdminStory | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

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
      setCategories(cats);
    } catch {
      Alert.alert('Error', 'Failed to load story');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [session?.token, id]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove() {
    Alert.alert('Approve Story', `Approve "${story?.honoree_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve', style: 'default', onPress: async () => {
          if (!session?.token || !story) return;
          try {
            const updated = await approveStory(session.token, story.id);
            setStory(updated);
          } catch { Alert.alert('Error', 'Failed to approve'); }
        },
      },
    ]);
  }

  async function handleReject() {
    Alert.alert('Reject Story', `Reject "${story?.honoree_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive', onPress: async () => {
          if (!session?.token || !story) return;
          try {
            const updated = await rejectStory(session.token, story.id, reviewNotes);
            setStory(updated);
          } catch { Alert.alert('Error', 'Failed to reject'); }
        },
      },
    ]);
  }

  async function handleSave() {
    if (!session?.token || !story) return;
    setSaving(true);
    try {
      const updated = await updateStoryMeta(session.token, story.id, {
        review_notes: reviewNotes || undefined,
        category_ids: selectedCats,
        is_featured: isFeatured,
      });
      setStory(updated);
      Alert.alert('Saved', 'Changes saved successfully.');
    } catch { Alert.alert('Error', 'Failed to save'); }
    finally { setSaving(false); }
  }

  function toggleCategory(catId: string) {
    if (selectedCats.includes(catId)) {
      setSelectedCats(selectedCats.filter((c) => c !== catId));
    } else if (selectedCats.length < 5) {
      setSelectedCats([...selectedCats, catId]);
    }
  }

  if (loading || !story) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.earth.gold} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: story.honoree_name }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* Status + Featured */}
        <View style={[styles.statusRow, { borderBottomColor: colors.border }]}>
          <StatusBadge status={story.status} />
          <View style={styles.featuredRow}>
            <Text style={[styles.featuredLabel, { color: colors.textSecondary }]}>Featured</Text>
            <Switch
              value={isFeatured}
              onValueChange={setIsFeatured}
              trackColor={{ true: colors.earth.gold, false: '#e5e7eb' }}
            />
          </View>
        </View>

        {/* Cover Image */}
        {story.cover_image_url && (
          <Image source={{ uri: story.cover_image_url }} style={styles.cover} contentFit="cover" />
        )}

        {/* Story Info */}
        <View style={styles.section}>
          <Text style={[styles.memLabel, { color: colors.earth.gold }]}>IN MEMORY OF</Text>
          <Text style={[styles.name, { color: colors.text }]}>{story.honoree_name}</Text>
          <Text style={[styles.title, { color: colors.textSecondary }]}>{story.title}</Text>
          {story.summary && (
            <View style={[styles.summary, { borderLeftColor: colors.earth.gold }]}>
              <Text style={[styles.summaryText, { color: colors.textSecondary }]}>{story.summary}</Text>
            </View>
          )}
        </View>

        {/* Submitter Contact (public submissions) */}
        {story.source_type === 'public_submission' && (
          <View style={[styles.contactCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
            <Text style={styles.contactTitle}>Submitter</Text>
            <Text style={styles.contactName}>{story.submitted_by_name}</Text>
            {story.submitted_by_phone && (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${story.submitted_by_phone}`)}>
                <Text style={styles.contactLink}>Phone: {story.submitted_by_phone}</Text>
              </TouchableOpacity>
            )}
            {story.submitted_by_whatsapp && (
              <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${story.submitted_by_whatsapp?.replace(/\D/g, '')}`)}>
                <Text style={styles.contactLink}>WhatsApp: {story.submitted_by_whatsapp}</Text>
              </TouchableOpacity>
            )}
            {story.submitted_by_email && (
              <TouchableOpacity onPress={() => Linking.openURL(`mailto:${story.submitted_by_email}`)}>
                <Text style={styles.contactLink}>Email: {story.submitted_by_email}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Categories (up to 5)</Text>
            <View style={styles.catGrid}>
              {categories.map((cat) => {
                const sel = selectedCats.includes(cat.id);
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => toggleCategory(cat.id)}
                    style={[styles.catPill, sel && { backgroundColor: colors.earth.gold + '22', borderColor: colors.earth.gold + '44', borderWidth: 1 }]}
                  >
                    <Text style={[styles.catText, sel && { color: colors.earth.gold }]}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Review Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Review Notes (internal)</Text>
          <TextInput
            style={[styles.notesInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={reviewNotes}
            onChangeText={setReviewNotes}
            placeholder="Internal notes..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {story.status !== 'approved' && (
            <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
              <MaterialIcons name="check-circle" size={20} color="#fff" />
              <Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
          )}
          {story.status !== 'rejected' && (
            <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
              <MaterialIcons name="cancel" size={20} color="#dc2626" />
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.earth.gold }]} onPress={handleSave} disabled={saving}>
            <Text style={[styles.saveBtnText, { color: colors.earth.darkest }]}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  featuredRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featuredLabel: { fontSize: 13, fontWeight: '600' },
  cover: { width: '100%', aspectRatio: 16 / 9 },
  section: { padding: 16 },
  memLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  name: { fontFamily: fonts.serif, fontSize: 24, fontWeight: '700', marginBottom: 4 },
  title: { fontSize: 15, marginBottom: 12 },
  summary: { borderLeftWidth: 4, paddingLeft: 12, marginTop: 8 },
  summaryText: { fontFamily: fonts.serif, fontSize: 15, fontStyle: 'italic', lineHeight: 24 },
  contactCard: { marginHorizontal: 16, padding: 14, borderRadius: 12, borderWidth: 1 },
  contactTitle: { fontSize: 12, fontWeight: '700', color: '#1e40af', marginBottom: 4 },
  contactName: { fontSize: 15, fontWeight: '600', color: '#1e3a5f', marginBottom: 6 },
  contactLink: { fontSize: 14, color: '#2563eb', marginBottom: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f3f4f6' },
  catText: { fontSize: 13, fontWeight: '500', color: '#6b7280' },
  notesInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, minHeight: 80, textAlignVertical: 'top' },
  actions: { padding: 16, gap: 10 },
  approveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#16a34a', padding: 14, borderRadius: 12 },
  approveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  rejectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 2, borderColor: '#dc2626', padding: 14, borderRadius: 12 },
  rejectBtnText: { color: '#dc2626', fontSize: 16, fontWeight: '700' },
  saveBtn: { alignItems: 'center', padding: 14, borderRadius: 12 },
  saveBtnText: { fontSize: 16, fontWeight: '700' },
});
