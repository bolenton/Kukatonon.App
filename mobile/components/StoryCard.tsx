import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors, fonts } from '../constants/theme';
import type { PublicStory } from '../lib/api';

interface StoryCardProps {
  story: PublicStory;
  featured?: boolean;
}

export default function StoryCard({ story, featured = false }: StoryCardProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/story/${story.id}`)}
      style={({ pressed }) => [
        styles.card,
        featured && styles.featuredCard,
        pressed && styles.pressed,
      ]}
    >
      {/* Cover image */}
      <View style={[styles.imageContainer, featured && styles.featuredImage]}>
        {story.cover_image_url ? (
          <Image
            source={{ uri: story.cover_image_url }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{story.honoree_name.charAt(0)}</Text>
          </View>
        )}
        {story.is_featured && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>FEATURED</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.memoryLabel}>IN MEMORY OF</Text>
        <Text style={[styles.name, featured && styles.featuredName]} numberOfLines={2}>
          {story.honoree_name}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {story.title}
        </Text>
        {story.summary && (
          <Text style={styles.summary} numberOfLines={featured ? 4 : 2}>
            {story.summary}
          </Text>
        )}
        <Text style={styles.date}>
          {new Date(story.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featuredCard: {
    marginBottom: 20,
  },
  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  featuredImage: {
    aspectRatio: 16 / 9,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.earth.brown,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    color: colors.earth.gold,
    fontFamily: fonts.serif,
    fontWeight: '700',
    opacity: 0.4,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.earth.gold,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: colors.earth.darkest,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  content: {
    padding: 16,
  },
  memoryLabel: {
    color: colors.earth.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  name: {
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: '700',
    color: colors.earth.dark,
    marginBottom: 2,
  },
  featuredName: {
    fontSize: 22,
  },
  title: {
    fontSize: 14,
    color: colors.earth.warm,
    fontWeight: '500',
  },
  summary: {
    fontSize: 13,
    color: colors.earth.warm,
    opacity: 0.8,
    marginTop: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 11,
    color: colors.earth.warm,
    opacity: 0.5,
    marginTop: 8,
  },
});
