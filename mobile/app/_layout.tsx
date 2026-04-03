import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, router, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../constants/ThemeContext';
import { AuthProvider } from '../constants/AuthContext';

function RootStack() {
  const { mode, colors } = useTheme();

  function renderBackOrHomeHeaderLeft() {
    const canGoBack = router.canGoBack();

    return (
      <Pressable
        hitSlop={8}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }

          router.replace('/(tabs)');
        }}
      >
        <Text style={[styles.headerLink, { color: colors.headerText }]}>
          {`< ${canGoBack ? 'Back' : 'Home'}`}
        </Text>
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
            headerBackVisible: false,
            headerLeft: renderBackOrHomeHeaderLeft,
          }}
        />
        <Stack.Screen
          name="stories/[slug]"
          options={{
            title: 'Loading...',
            headerBackVisible: false,
            headerLeft: renderBackOrHomeHeaderLeft,
          }}
        />
        <Stack.Screen
          name="submit"
          options={{
            title: 'Share a Story',
            headerBackVisible: false,
            headerLeft: renderBackOrHomeHeaderLeft,
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
  headerLink: {
    fontSize: 16,
    fontWeight: '600',
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
