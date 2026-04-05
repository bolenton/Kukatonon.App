import { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { isBookmarked, toggleBookmark } from '../lib/bookmarks';
import { useTheme } from '../constants/ThemeContext';
import { tapMedium, notifySuccess } from '../lib/haptics';
import type { PublicStory } from '../lib/api';

interface BookmarkButtonProps {
  story: PublicStory;
  size?: number;
  onToggle?: (bookmarked: boolean) => void;
}

export default function BookmarkButton({ story, size = 20, onToggle }: BookmarkButtonProps) {
  const { colors } = useTheme();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    isBookmarked(story.id).then(setSaved);
  }, [story.id]);

  async function handlePress() {
    tapMedium();
    const newState = await toggleBookmark(story);
    if (newState) notifySuccess();
    setSaved(newState);
    onToggle?.(newState);
  }

  return (
    <TouchableOpacity onPress={handlePress} style={[styles.button, { backgroundColor: colors.earth.gold + '22' }]}>
      <MaterialIcons
        name={saved ? 'bookmark' : 'bookmark-border'}
        size={size}
        color={colors.earth.gold}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
