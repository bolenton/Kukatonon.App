import { useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, router, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { setAudioModeAsync } from 'expo-audio';
import { ThemeProvider, useTheme } from '../constants/ThemeContext';
import { AuthProvider } from '../constants/AuthContext';

function RootStack() {
  const { mode, colors } = useTheme();

  // Configure the audio session once at app startup so voice narration keeps
  // playing when the phone is locked or the user switches apps, and so the
  // iOS lock screen / Control Center shows transport controls for whichever
  // story the user is listening to.
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      // Lock-screen controls require 'doNotMix' on iOS — otherwise the OS
      // may not associate the Now Playing info with our player.
      interruptionMode: 'doNotMix',
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
    }).catch((err) => {
      console.warn('Failed to configure audio mode:', err);
    });
  }, []);

  function renderHomeHeaderLeft() {
    return (
      <Pressable
        style={styles.headerButton}
        hitSlop={8}
        onPress={() => router.replace('/(tabs)')}
      >
        <MaterialIcons
          name="arrow-back-ios-new"
          size={20}
          color={colors.headerText}
        />
      </Pressable>
    );
  }

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
            headerBackButtonDisplayMode: 'minimal',
            headerLeft: router.canGoBack() ? undefined : renderHomeHeaderLeft,
          }}
        />
        <Stack.Screen
          name="stories/[slug]"
          options={{
            title: 'Loading...',
            headerBackButtonDisplayMode: 'minimal',
            headerLeft: router.canGoBack() ? undefined : renderHomeHeaderLeft,
          }}
        />
        <Stack.Screen
          name="submit"
          options={{
            title: 'Share a Story',
            headerBackButtonDisplayMode: 'minimal',
            headerLeft: router.canGoBack() ? undefined : renderHomeHeaderLeft,
          }}
        />
        <Stack.Screen
          name="legal/[page]"
          options={{
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  errorBoundaryContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#120b08',
  },
  errorBoundaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8f3ee',
    marginBottom: 12,
  },
  errorBoundaryMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: '#e7d9ca',
    marginBottom: 20,
  },
  errorBoundaryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#b88746',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorBoundaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <RootStack />
      </ThemeProvider>
    </AuthProvider>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View style={styles.errorBoundaryContainer}>
      <Text style={styles.errorBoundaryTitle}>Startup Error</Text>
      <Text style={styles.errorBoundaryMessage}>
        {error.message || 'Unknown error'}
      </Text>
      <Pressable onPress={retry} style={styles.errorBoundaryButton}>
        <Text style={styles.errorBoundaryButtonText}>Retry</Text>
      </Pressable>
    </View>
  );
}
