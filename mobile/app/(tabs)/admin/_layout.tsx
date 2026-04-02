import { Stack } from 'expo-router';
import { useTheme } from '../../../constants/ThemeContext';

export default function AdminLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBg },
        headerTintColor: colors.headerText,
        headerTitleStyle: { fontFamily: 'Georgia', fontWeight: '700' },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Admin' }} />
      <Stack.Screen name="pending" options={{ title: 'Pending Review' }} />
      <Stack.Screen name="stories" options={{ title: 'All Stories' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="story/[id]" options={{ title: 'Review Story' }} />
    </Stack>
  );
}
