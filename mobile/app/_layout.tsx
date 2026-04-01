import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" backgroundColor={colors.earth.darkest} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.earth.darkest,
          },
          headerTintColor: colors.earth.cream,
          headerTitleStyle: {
            fontFamily: 'Georgia',
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: colors.earth.light,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="story/[id]"
          options={{
            title: 'Memorial Story',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  );
}
