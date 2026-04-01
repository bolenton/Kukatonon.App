import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Image } from 'expo-image';
import RenderHtml from 'react-native-render-html';
import { WebView } from 'react-native-webview';
import { fetchStory, type PublicStory } from '../../lib/api';
import { getEmbedUrl } from '../../lib/youtube';
import { colors, fonts } from '../../constants/theme';

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const [story, setStory] = useState<PublicStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchStory(id);
        setStory(data);
      } catch {
        setError('Story not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.earth.gold} />
      </View>
    );
  }

  if (error || !story) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
      </View>
    );
  }

  const images = story.media_items?.filter((m) => m.type === 'image') || [];
  const videos = story.media_items?.filter((m) => m.type === 'video') || [];

  return (
    <>
      <Stack.Screen
        options={{
          title: story.honoree_name,
        }}
      />
      <ScrollView style={styles.container}>
        {/* Cover Image */}
        {story.cover_image_url ? (
          <View style={styles.coverContainer}>
            <Image
              source={{ uri: story.cover_image_url }}
              style={styles.coverImage}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.coverOverlay} />
            <View style={styles.coverContent}>
              <Text style={styles.memoryLabel}>IN MEMORY OF</Text>
              <Text style={styles.coverName}>{story.honoree_name}</Text>
              <Text style={styles.coverTitle}>{story.title}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noCoverHeader}>
            <Text style={styles.memoryLabel}>IN MEMORY OF</Text>
            <Text style={[styles.coverName, { color: colors.earth.cream }]}>
              {story.honoree_name}
            </Text>
            <Text style={[styles.coverTitle, { color: colors.earth.cream, opacity: 0.8 }]}>
              {story.title}
            </Text>
          </View>
        )}

        {/* Meta */}
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {new Date(story.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
            {story.submitted_by_name ? ` \u00b7 by ${story.submitted_by_name}` : ''}
          </Text>
        </View>

        {/* Summary */}
        {story.summary && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>{story.summary}</Text>
          </View>
        )}

        {/* HTML Content */}
        {story.content_html && (
          <View style={styles.htmlContainer}>
            <RenderHtml
              contentWidth={width - 40}
              source={{ html: story.content_html }}
              baseStyle={{
                fontSize: 15,
                lineHeight: 26,
                color: colors.earth.dark,
              }}
              tagsStyles={{
                p: { marginBottom: 12 },
                h2: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '700', marginTop: 16, marginBottom: 8 },
                h3: { fontFamily: fonts.serif, fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 6 },
                blockquote: {
                  borderLeftWidth: 4,
                  borderLeftColor: colors.earth.gold,
                  paddingLeft: 14,
                  fontStyle: 'italic',
                  color: colors.earth.warm,
                },
                strong: { fontWeight: '700' },
                a: { color: colors.earth.gold },
              }}
            />
          </View>
        )}

        {/* YouTube Embeds */}
        {story.youtube_urls?.map((url, index) => {
          const embedUrl = getEmbedUrl(url);
          if (!embedUrl) return null;
          return (
            <View key={index} style={styles.videoContainer}>
              <WebView
                source={{ uri: embedUrl }}
                style={styles.webview}
                allowsFullscreenVideo
                javaScriptEnabled
              />
            </View>
          );
        })}

        {/* Image Gallery */}
        {images.length > 0 && (
          <View style={styles.galleryContainer}>
            {images.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => setSelectedImage(item.url)}
                style={styles.galleryImage}
              >
                <Image
                  source={{ uri: item.url }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={200}
                />
              </Pressable>
            ))}
          </View>
        )}

        {/* Video Players */}
        {videos.map((item, index) => (
          <View key={index} style={styles.videoContainer}>
            <WebView
              source={{ uri: item.url }}
              style={styles.webview}
              allowsFullscreenVideo
            />
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Lightbox */}
      {selectedImage && (
        <Pressable
          style={styles.lightbox}
          onPress={() => setSelectedImage(null)}
        >
          <Image
            source={{ uri: selectedImage }}
            style={styles.lightboxImage}
            contentFit="contain"
            transition={200}
          />
          <Text style={styles.lightboxClose}>Tap to close</Text>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.earth.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.earth.light,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.earth.warm,
    textAlign: 'center',
  },
  coverContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: 'transparent',
    // Gradient effect via layered views
  },
  coverContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(26, 15, 10, 0.7)',
  },
  noCoverHeader: {
    backgroundColor: colors.earth.darkest,
    padding: 24,
    paddingTop: 16,
  },
  memoryLabel: {
    color: colors.earth.amber,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 6,
  },
  coverName: {
    fontFamily: fonts.serif,
    fontSize: 28,
    fontWeight: '700',
    color: colors.earth.cream,
    marginBottom: 4,
  },
  coverTitle: {
    fontSize: 15,
    color: colors.earth.cream,
    opacity: 0.9,
  },
  meta: {
    padding: 20,
    paddingBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: colors.earth.warm,
    opacity: 0.6,
  },
  summaryContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.earth.gold,
    paddingLeft: 14,
  },
  summaryText: {
    fontFamily: fonts.serif,
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.earth.warm,
    lineHeight: 26,
  },
  htmlContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  videoContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
  },
  webview: {
    flex: 1,
  },
  galleryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  galleryImage: {
    width: '48%',
    aspectRatio: 4 / 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  lightbox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  lightboxImage: {
    width: '100%',
    height: '80%',
  },
  lightboxClose: {
    color: colors.white,
    marginTop: 20,
    opacity: 0.6,
    fontSize: 14,
  },
});
