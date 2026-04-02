import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../constants/AuthContext';
import { useTheme } from '../../../constants/ThemeContext';
import { fetchAdminProfile, updateAdminProfile, type AdminProfile } from '../../../lib/adminApi';
import { fonts } from '../../../constants/theme';

export default function ProfileScreen() {
  const { session, logout } = useAuth();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const load = useCallback(async () => {
    if (!session?.token) return;
    try {
      const data = await fetchAdminProfile(session.token);
      setProfile(data);
      setFullName(data.full_name || '');
    } catch {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    if (!session?.token) return;
    if (password && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password && password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    try {
      const updates: { full_name?: string; password?: string } = { full_name: fullName };
      if (password) updates.password = password;
      await updateAdminProfile(session.token, updates);
      setPassword('');
      setConfirmPassword('');
      Alert.alert('Saved', 'Profile updated.');
    } catch {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.earth.gold} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.earth.gold + '22' }]}>
          <MaterialIcons name="person" size={40} color={colors.earth.gold} />
        </View>
        <View style={[styles.roleBadge, { backgroundColor: profile?.role === 'super_admin' ? '#f3e8ff' : '#dbeafe' }]}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: profile?.role === 'super_admin' ? '#7c3aed' : '#2563eb' }}>
            {profile?.role === 'super_admin' ? 'Super Admin' : 'Moderator'}
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
        <View style={[styles.readOnly, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Text style={[styles.readOnlyText, { color: colors.textMuted }]}>{profile?.email}</Text>
        </View>

        <View style={[styles.divider, { borderTopColor: colors.border }]} />
        <Text style={[styles.sectionHint, { color: colors.textMuted }]}>Leave blank to keep current password</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>New Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={password}
          onChangeText={setPassword}
          placeholder="Min 8 characters"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.earth.gold }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={[styles.saveBtnText, { color: '#fff' }]}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { borderTopColor: colors.border }]} />

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <MaterialIcons name="logout" size={20} color="#dc2626" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1 },
  content: { padding: 24 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  roleBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 12 },
  form: { gap: 4 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  readOnly: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  readOnlyText: { fontSize: 15 },
  sectionHint: { fontSize: 12, marginTop: 4 },
  saveBtn: { marginTop: 20, alignItems: 'center', padding: 14, borderRadius: 12 },
  saveBtnText: { fontSize: 16, fontWeight: '700' },
  divider: { borderTopWidth: 1, marginVertical: 24 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fef2f2', padding: 14, borderRadius: 12 },
  logoutText: { color: '#dc2626', fontSize: 16, fontWeight: '700' },
});
