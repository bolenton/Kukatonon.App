import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../constants/ThemeContext';

function RootStack() {
  const { mode, colors } = useTheme();

  return (
    <>
      <StatusBar style={mode === 'earth' ? 'light' : 'dark'} backgroundColor={colors.headerBg} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.headerBg,
          },
          headerTintColor: colors.headerText,
          headerTitleStyle: {
            fontFamily: 'Georgia',
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: colors.bg,
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

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}
