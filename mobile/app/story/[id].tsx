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
import YoutubePlayer from 'react-native-youtube-iframe';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchStory, type PublicStory, type ContentBlock } from '../../lib/api';
import { extractVideoId } from '../../lib/youtube';
import { colors as sc, fonts } from '../../constants/theme';
import { useTheme } from '../../constants/ThemeContext';
import ShareStory from '../../components/ShareStory';
import BookmarkButton from '../../components/BookmarkButton';
import StoryLocationMap from '../../components/StoryLocationMap';
import AudioPlayer from '../../components/AudioPlayer';
import VideoPlayer from '../../components/VideoPlayer';
import OfflineBanner from '../../components/OfflineBanner';

export default function StoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [story, setStory] = useState<PublicStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchStory(id);
        setStory(data);
        setOffline(!!data.offline);
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
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
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

        {offline && (
          <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
            <OfflineBanner />
          </View>
        )}

        {/* Summary */}
        {story.summary && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>{story.summary}</Text>
          </View>
        )}

        {/* Content — block-based or legacy */}
        {(() => { console.log('[StoryDetail] RENDER: content_blocks=', story.content_blocks?.length ?? 'null', 'using blocks:', !!(story.content_blocks && story.content_blocks.length > 0)); return null; })()}
        {story.content_blocks?.map((block) => {
          switch (block.type) {
            case 'text':
              return (
                <View key={block.id} style={styles.htmlContainer}>
                  <RenderHtml
                    contentWidth={width - 40}
                    source={{ html: block.html }}
                    baseStyle={{ fontSize: 15, lineHeight: 26, color: colors.earth.dark }}
                    tagsStyles={htmlTagStyles}
                  />
                </View>
              );
            case 'image':
              return (
                <View key={block.id} style={styles.blockImageContainer}>
                  <Pressable onPress={() => setSelectedImage(block.url)}>
                    <Image
                      source={{ uri: block.url }}
                      style={styles.blockImage}
                      contentFit="cover"
                      transition={200}
                    />
                  </Pressable>
                  {block.caption ? <Text style={styles.blockCaption}>{block.caption}</Text> : null}
                </View>
              );
            case 'video':
              return (
                <View key={block.id} style={styles.blockMediaContainer}>
                  <VideoPlayer url={block.url} />
                  {block.caption ? <Text style={styles.blockCaption}>{block.caption}</Text> : null}
                </View>
              );
            case 'youtube': {
              const vid = extractVideoId(block.url);
              if (!vid) return null;
              return (
                <View key={block.id} style={styles.blockMediaContainer}>
                  <View style={styles.videoContainer}>
                    <YoutubePlayer
                      height={Math.round((width - 40) * 9 / 16)}
                      videoId={vid}
                      webViewProps={{ androidLayerType: 'hardware' }}
                    />
                  </View>
                  {block.caption ? <Text style={styles.blockCaption}>{block.caption}</Text> : null}
                </View>
              );
            }
            case 'audio':
              return (
                <AudioPlayer key={block.id} url={block.url} />
              );
          }
        })}

        {/* Location Map */}
        {story.show_event_location && story.event_latitude != null && story.event_longitude != null && (
          <StoryLocationMap
            latitude={story.event_latitude}
            longitude={story.event_longitude}
            locationName={story.event_location_name}
          />
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <View
        style={[
          styles.floatingActionsWrap,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.floatingActions,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <BookmarkButton story={story} size={22} />
          <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />
          <ShareStory
            storyId={story.id}
            storySlug={story.slug}
            honoreeName={story.honoree_name}
          />
        </View>
      </View>

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
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: sc.earth.light },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: sc.earth.warm, textAlign: 'center' },
  coverContainer: { width: '100%', aspectRatio: 16 / 9, position: 'relative' },
  coverImage: { width: '100%', height: '100%' },
  coverOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', backgroundColor: 'transparent' },
  coverContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(26, 15, 10, 0.7)' },
  noCoverHeader: { backgroundColor: sc.earth.darkest, padding: 24, paddingTop: 16 },
  memoryLabel: { color: sc.earth.amber, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  coverName: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '700', color: sc.earth.cream, marginBottom: 4 },
  coverTitle: { fontSize: 15, color: sc.earth.cream, opacity: 0.9 },
  meta: { padding: 20, paddingBottom: 8 },
  metaText: { fontSize: 12, color: sc.earth.warm, opacity: 0.6 },
  summaryContainer: { marginHorizontal: 20, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: sc.earth.gold, paddingLeft: 14 },
  summaryText: { fontFamily: fonts.serif, fontSize: 16, fontStyle: 'italic', color: sc.earth.warm, lineHeight: 26 },
  htmlContainer: { paddingHorizontal: 20, marginBottom: 16 },
  videoContainer: { marginHorizontal: 20, marginBottom: 16, borderRadius: 12, overflow: 'hidden', aspectRatio: 16 / 9 },
  webview: { flex: 1 },
  galleryContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  galleryImage: { width: '48%', aspectRatio: 4 / 3, borderRadius: 12, overflow: 'hidden' },
  lightbox: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  lightboxImage: { width: '100%', height: '80%' },
  lightboxClose: { color: sc.white, marginTop: 20, opacity: 0.6, fontSize: 14 },
  blockImageContainer: { marginHorizontal: 20, marginBottom: 16 },
  blockImage: { width: '100%', aspectRatio: 16 / 10, borderRadius: 12 },
  blockCaption: { fontSize: 13, color: sc.earth.warm, opacity: 0.7, textAlign: 'center', marginTop: 6, fontStyle: 'italic' },
  blockMediaContainer: { marginBottom: 16 },
  floatingActionsWrap: {
    position: 'absolute',
    right: 20,
    bottom: 0,
    alignItems: 'flex-end',
  },
  floatingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  actionDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
});

const htmlTagStyles = {
  p: { marginBottom: 12 },
  h2: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '700' as const, marginTop: 16, marginBottom: 8 },
  h3: { fontFamily: fonts.serif, fontSize: 18, fontWeight: '700' as const, marginTop: 12, marginBottom: 6 },
  blockquote: { borderLeftWidth: 4, borderLeftColor: sc.earth.gold, paddingLeft: 14, fontStyle: 'italic' as const, color: sc.earth.warm },
  strong: { fontWeight: '700' as const },
  a: { color: sc.earth.gold },
};
