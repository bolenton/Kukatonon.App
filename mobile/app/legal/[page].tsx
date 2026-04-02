import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../constants/ThemeContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kukatonon.app';

const pages: Record<string, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
};

export default function LegalPage() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const { colors } = useTheme();
  const title = pages[page] || page;
  const url = `${API_BASE}/${page}`;

  return (
    <>
      <Stack.Screen options={{ title }} />
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <WebView
          source={{ uri: url }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.earth.gold} />
            </View>
          )}
          // Hide the site header/footer, show only the content
          injectedJavaScript={`
            (function() {
              var header = document.querySelector('header');
              var footer = document.querySelector('footer');
              var pwa = document.querySelector('[class*="PWA"]');
              if (header) header.style.display = 'none';
              if (footer) footer.style.display = 'none';
              if (pwa) pwa.style.display = 'none';
              document.body.style.background = '${colors.bg}';
            })();
            true;
          `}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
});
