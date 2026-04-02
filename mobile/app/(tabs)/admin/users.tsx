import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../constants/AuthContext';
import { useTheme } from '../../../constants/ThemeContext';
import {
  fetchAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser,
  type AdminUser,
} from '../../../lib/adminApi';
import { fonts } from '../../../constants/theme';

export default function UsersScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'moderator' | 'super_admin'>('moderator');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!session?.token) return;
    try {
      const data = await fetchAdminUsers(session.token);
      setUsers(data);
    } catch { Alert.alert('Error', 'Failed to load users'); }
    finally { setLoading(false); }
  }, [session?.token]);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setEmail(''); setPassword(''); setFullName(''); setRole('moderator');
    setShowAdd(false); setEditingId(null);
  }

  async function handleAdd() {
    if (!session?.token || !email.trim() || !password) return;
    setSaving(true);
    try {
      await createAdminUser(session.token, { email: email.trim(), password, full_name: fullName.trim() || undefined, role });
      resetForm(); await load();
    } catch (err) { Alert.alert('Error', err instanceof Error ? err.message : 'Failed to create user'); }
    finally { setSaving(false); }
  }

  async function handleEdit() {
    if (!session?.token || !editingId) return;
    setSaving(true);
    try {
      await updateAdminUser(session.token, editingId, { full_name: fullName.trim() || undefined, role });
      resetForm(); await load();
    } catch { Alert.alert('Error', 'Failed to update'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!session?.token) return;
    Alert.alert('Delete User', 'This will permanently remove this admin. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteAdminUser(session.token, id); await load(); }
        catch (err) { Alert.alert('Error', err instanceof Error ? err.message : 'Failed to delete'); }
      }},
    ]);
  }

  function startEdit(u: AdminUser) {
    setEditingId(u.id);
    setFullName(u.full_name || '');
    setRole(u.role as 'moderator' | 'super_admin');
    setShowAdd(false);
  }

  if (loading) {
    return <View style={[styles.center, { backgroundColor: colors.bg }]}><ActivityIndicator size="large" color={colors.earth.gold} /></View>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Add/Edit form */}
      {(showAdd || editingId) && (
        <ScrollView style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]} contentContainerStyle={{ gap: 10 }}>
          {showAdd && (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.textMuted}
                keyboardType="email-address" autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
                value={password} onChangeText={setPassword} placeholder="Password (min 8)" placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
            </>
          )}
          <TextInput
            style={[styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }]}
            value={fullName} onChangeText={setFullName} placeholder="Full name" placeholderTextColor={colors.textMuted}
          />
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.rolePill, role === 'moderator' && { backgroundColor: colors.earth.gold + '22', borderColor: colors.earth.gold + '44', borderWidth: 1 }]}
              onPress={() => setRole('moderator')}
            >
              <Text style={[styles.roleText, role === 'moderator' && { color: colors.earth.gold }]}>Moderator</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rolePill, role === 'super_admin' && { backgroundColor: '#f3e8ff', borderColor: '#c084fc', borderWidth: 1 }]}
              onPress={() => setRole('super_admin')}
            >
              <Text style={[styles.roleText, role === 'super_admin' && { color: '#7c3aed' }]}>Super Admin</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity style={[styles.formBtn, { backgroundColor: colors.earth.gold }]} onPress={editingId ? handleEdit : handleAdd} disabled={saving}>
              <Text style={[styles.formBtnText, { color: '#fff' }]}>{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resetForm}>
              <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardContent}>
              <Text style={[styles.userName, { color: colors.text }]}>{item.full_name || 'No name'}</Text>
              <Text style={[styles.userEmail, { color: colors.textMuted }]}>{item.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: item.role === 'super_admin' ? '#f3e8ff' : '#dbeafe' }]}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: item.role === 'super_admin' ? '#7c3aed' : '#2563eb' }}>
                  {item.role === 'super_admin' ? 'Super Admin' : 'Moderator'}
                </Text>
              </View>
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
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>No admin users</Text>
          </View>
        }
      />

      {!showAdd && !editingId && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.earth.gold }]}
          onPress={() => { setShowAdd(true); resetForm(); setShowAdd(true); }}
        >
          <MaterialIcons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  list: { padding: 16 },
  form: { margin: 16, padding: 16, borderRadius: 14, borderWidth: 1, maxHeight: 320 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  roleRow: { flexDirection: 'row', gap: 8 },
  rolePill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6' },
  roleText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  formActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  formBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  formBtnText: { fontSize: 14, fontWeight: '700' },
  cancelText: { fontSize: 14 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  cardContent: { flex: 1, gap: 2 },
  userName: { fontSize: 15, fontWeight: '600' },
  userEmail: { fontSize: 12 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 14 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
});
