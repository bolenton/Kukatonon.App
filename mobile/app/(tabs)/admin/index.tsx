import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../../constants/AuthContext';
import { useTheme } from '../../../constants/ThemeContext';
import { fetchDashboardStats } from '../../../lib/adminApi';
import StatCard from '../../../components/admin/StatCard';
import { fonts } from '../../../constants/theme';

export default function AdminDashboard() {
  const { session } = useAuth();
  const { colors } = useTheme();
  const [stats, setStats] = useState<{ pending: number; approved: number; rejected: number; featured: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!session?.token) return;
    try {
      const data = await fetchDashboardStats(session.token);
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [session?.token]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.earth.gold} colors={[colors.earth.gold]} />}
    >
      <Text style={[styles.welcome, { color: colors.text }]}>
        Hey, {session?.full_name || session?.email?.split('@')[0] || 'Admin'}
      </Text>
      <Text style={[styles.role, { color: colors.textMuted }]}>
        {session?.role === 'super_admin' ? 'Super Admin' : 'Moderator'}
      </Text>

      <View style={styles.grid}>
        <StatCard
          icon="pending-actions" count={stats?.pending ?? null} label="Pending"
          color="#92400e" bg="#fef3c7"
          onPress={() => router.push('/(tabs)/admin/pending')}
        />
        <StatCard
          icon="check-circle" count={stats?.approved ?? null} label="Approved"
          color="#166534" bg="#dcfce7"
          onPress={() => router.push({ pathname: '/(tabs)/admin/stories', params: { status: 'approved' } })}
        />
        <StatCard
          icon="cancel" count={stats?.rejected ?? null} label="Rejected"
          color="#991b1b" bg="#fee2e2"
          onPress={() => router.push({ pathname: '/(tabs)/admin/stories', params: { status: 'rejected' } })}
        />
        <StatCard
          icon="star" count={stats?.featured ?? null} label="Featured"
          color="#1e40af" bg="#dbeafe"
          onPress={() => router.push({ pathname: '/(tabs)/admin/stories', params: { status: 'approved' } })}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Quick Actions</Text>

      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: colors.earth.gold }]}
        onPress={() => router.push('/(tabs)/admin/pending')}
      >
        <MaterialIcons name="rate-review" size={20} color={colors.earth.darkest} />
        <Text style={[styles.actionText, { color: colors.earth.darkest }]}>Review Pending</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtnSecondary, { borderColor: colors.border }]}
        onPress={() => router.push('/(tabs)/admin/stories')}
      >
        <MaterialIcons name="library-books" size={20} color={colors.textSecondary} />
        <Text style={[styles.actionTextSecondary, { color: colors.textSecondary }]}>All Stories</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionBtnSecondary, { borderColor: colors.border }]}
        onPress={() => router.push('/(tabs)/admin/profile')}
      >
        <MaterialIcons name="person" size={20} color={colors.textSecondary} />
        <Text style={[styles.actionTextSecondary, { color: colors.textSecondary }]}>My Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  welcome: { fontFamily: fonts.serif, fontSize: 26, fontWeight: '700', marginBottom: 2 },
  role: { fontSize: 13, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  sectionTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 14, marginBottom: 10 },
  actionText: { fontSize: 15, fontWeight: '700' },
  actionBtnSecondary: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  actionTextSecondary: { fontSize: 15, fontWeight: '600' },
});
