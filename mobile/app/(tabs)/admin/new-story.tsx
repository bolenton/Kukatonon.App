import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../constants/AuthContext';
import { useTheme } from '../../../constants/ThemeContext';
import { adminFetch } from '../../../lib/adminApi';
import { fonts } from '../../../constants/theme';

export default function NewStoryScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const [honoreeName, setHonoreeName] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishNow, setPublishNow] = useState(false);

  async function handleCreate() {
    if (!session?.token) return;
    if (!honoreeName.trim() || !title.trim()) {
      Alert.alert('Required', 'Honoree name and title are required.');
      return;
    }
    setSaving(true);
    try {
      const data = await adminFetch(session.token, '/api/admin/stories', {
        method: 'POST',
        body: JSON.stringify({
          honoree_name: honoreeName.trim(),
          title: title.trim(),
          summary: summary.trim() || undefined,
          status: publishNow ? 'approved' : 'pending',
        }),
      });
      Alert.alert('Created', publishNow ? 'Story published.' : 'Story saved as draft.', [
        { text: 'Edit Story', onPress: () => router.replace(`/(tabs)/admin/story/${data.id}`) },
        { text: 'Done', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'New Story' }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Honoree Name *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            value={honoreeName} onChangeText={setHonoreeName}
            placeholder="Full name of the person being remembered"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Title *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            value={title} onChangeText={setTitle}
            placeholder="A title for this memorial"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={[styles.label, { color: colors.textSecondary }]}>Summary</Text>
          <TextInput
            style={[styles.input, styles.multiline, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            value={summary} onChangeText={setSummary}
            placeholder="Brief summary (optional)"
            placeholderTextColor={colors.textMuted}
            multiline numberOfLines={3}
          />

          <TouchableOpacity style={styles.toggleRow} onPress={() => setPublishNow(!publishNow)}>
            <View>
              <Text style={[styles.toggleLabel, { color: colors.text }]}>Publish immediately</Text>
              <Text style={[styles.toggleHint, { color: colors.textMuted }]}>
                {publishNow ? 'Will be visible to the public' : 'Saved as draft for review'}
              </Text>
            </View>
            <View style={[styles.toggle, { backgroundColor: publishNow ? colors.earth.gold : '#e5e7eb' }]}>
              <View style={[styles.toggleThumb, { transform: [{ translateX: publishNow ? 20 : 2 }] }]} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.earth.gold }]}
          onPress={handleCreate} disabled={saving}
        >
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <MaterialIcons name={publishNow ? 'publish' : 'save'} size={20} color="#fff" />
              <Text style={[styles.createBtnText, { color: '#fff' }]}>
                {publishNow ? 'Create & Publish' : 'Save as Draft'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 4 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e7eb' },
  toggleLabel: { fontSize: 15, fontWeight: '600' },
  toggleHint: { fontSize: 12, marginTop: 2 },
  toggle: { width: 44, height: 24, borderRadius: 12, justifyContent: 'center' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 14, marginTop: 16 },
  createBtnText: { fontSize: 16, fontWeight: '700' },
});
