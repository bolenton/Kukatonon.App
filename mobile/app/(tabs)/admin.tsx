import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../constants/AuthContext';
import { useTheme } from '../../constants/ThemeContext';
import { fonts } from '../../constants/theme';

export default function AdminScreen() {
  const { session } = useAuth();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <MaterialIcons name="admin-panel-settings" size={48} color={colors.earth.gold} />
      <Text style={[styles.title, { color: colors.text }]}>Admin Panel</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Welcome, {session?.full_name || session?.email || 'Admin'}
      </Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Admin features coming soon.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  hint: {
    fontSize: 13,
    marginTop: 20,
    opacity: 0.6,
  },
});
