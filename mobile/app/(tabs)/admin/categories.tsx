import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../constants/AuthContext';
import { useTheme } from '../../../constants/ThemeContext';
import {
  fetchAdminCategories, createCategory, updateCategory, deleteCategory,
  type AdminCategory,
} from '../../../lib/adminApi';
import { fonts } from '../../../constants/theme';

export default function CategoriesScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!session?.token) return;
    try {
      const data = await fetchAdminCategories(session.token);
      setCategories(data);
    } catch {} finally { setLoading(false); }
  }, [session?.token]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd() {
    if (!session?.token || !name.trim()) return;
    setSaving(true);
    try {
      await createCategory(session.token, { name: name.trim(), description: description.trim() || undefined });
      setName(''); setDescription(''); setShowAdd(false);
      await load();
    } catch { Alert.alert('Error', 'Failed to create category'); }
    finally { setSaving(false); }
  }

  async function handleEdit() {
    if (!session?.token || !editingId || !name.trim()) return;
    setSaving(true);
    try {
      await updateCategory(session.token, editingId, { name: name.trim(), description: description.trim() || undefined });
      setEditingId(null); setName(''); setDescription('');
      await load();
    } catch { Alert.alert('Error', 'Failed to update'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!session?.token) return;
    Alert.alert('Delete Category', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteCategory(session.token, id); await load(); }
        catch { Alert.alert('Error', 'Failed to delete'); }
      }},
    ]);
  }

  function startEdit(cat: AdminCategory) {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setShowAdd(false);
  }

  function cancelEdit() {
    setEditingId(null); setShowAdd(false); setName(''); setDescription('');
  }

  if (loading) {
    return <View style={[styles.center, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color={colors.earth.gold} /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Add/Edit form */}
      {(showAdd || editingId) && (
        <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            value={name} onChangeText={setName} placeholder="Category name" placeholderTextColor={colors.textMuted}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            value={description} onChangeText={setDescription} placeholder="Description (optional)" placeholderTextColor={colors.textMuted}
          />
          <View style={styles.formActions}>
            <TouchableOpacity style={[styles.formBtn, { backgroundColor: colors.earth.gold }]} onPress={editingId ? handleEdit : handleAdd} disabled={saving}>
              <Text style={[styles.formBtnText, { color: '#fff' }]}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelEdit}>
              <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardContent}>
              <Text style={[styles.catName, { color: colors.text }]}>{item.name}</Text>
              {item.description && <Text style={[styles.catDesc, { color: colors.textMuted }]}>{item.description}</Text>}
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => startEdit(item)} style={styles.iconBtn}>
                <MaterialIcons name="edit" size={18} color={colors.earth.gold} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                <MaterialIcons name="delete-outline" size={18} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="label-off" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No categories yet</Text>
          </View>
        }
      />

      {/* FAB */}
      {!showAdd && !editingId && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.earth.gold }]}
          onPress={() => { setShowAdd(true); setName(''); setDescription(''); }}
        >
          <MaterialIcons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  list: { padding: 16 },
  form: { margin: 16, padding: 16, borderRadius: 14, borderWidth: 1, gap: 10 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  formActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  formBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  formBtnText: { fontSize: 14, fontWeight: '700' },
  cancelText: { fontSize: 14 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  cardContent: { flex: 1 },
  catName: { fontSize: 15, fontWeight: '600' },
  catDesc: { fontSize: 12, marginTop: 2 },
  cardActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14, marginTop: 12 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
});
