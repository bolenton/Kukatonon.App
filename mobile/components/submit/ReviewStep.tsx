import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../constants/ThemeContext';
import { fonts } from '../../constants/theme';
import type { InfoData } from './InfoStep';
import type { StoryData } from './StoryStep';
import type { MediaData } from './MediaStep';

interface ReviewStepProps {
  info: InfoData;
  story: StoryData;
  media: MediaData;
  consent: boolean;
  onConsentChange: (value: boolean) => void;
  errors: Record<string, string>;
}

export default function ReviewStep({ info, story, media, consent, onConsentChange, errors }: ReviewStepProps) {
  const { colors } = useTheme();

  const hasText = story.storyText.length > 0;
  const hasAudio = !!story.audioUrl;
  const hasVideo = story.videoParts.length > 0 || media.videos.length > 0;
  const totalVideos = story.videoParts.length + media.videos.length;
  const hasImages = media.images.length > 0;
  const hasYouTube = media.youtubeUrls.length > 0;
  const hasLocation = !!media.eventLocation;

  return (
    <View>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardLabel, { color: colors.earth.gold }]}>STEP 4 OF 4</Text>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Review & Submit</Text>
        <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
          Please review your submission before sending.
        </Text>

        {/* Honoree summary */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.earth.gold }]}>IN MEMORY OF</Text>
          <Text style={[styles.honoreeName, { color: colors.text }]}>{info.honoreeName}</Text>
          <Text style={[styles.storyTitle, { color: colors.textSecondary }]}>{info.title}</Text>
          {info.summary ? (
            <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={2}>
              {info.summary}
            </Text>
          ) : null}
        </View>

        {/* Content summary */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Story Content</Text>
          <View style={styles.contentChecks}>
            <ContentCheck label="Written text" active={hasText} detail={hasText ? `${story.storyText.length} characters` : undefined} colors={colors} />
            <ContentCheck label="Voice narration" active={hasAudio} colors={colors} />
            <ContentCheck label="Videos" active={hasVideo} detail={hasVideo ? `${totalVideos} clip${totalVideos > 1 ? 's' : ''}` : undefined} colors={colors} />
            <ContentCheck label="Photos" active={hasImages} detail={hasImages ? `${media.images.length} photo${media.images.length > 1 ? 's' : ''}` : undefined} colors={colors} />
            <ContentCheck label="YouTube links" active={hasYouTube} detail={hasYouTube ? `${media.youtubeUrls.length} link${media.youtubeUrls.length > 1 ? 's' : ''}` : undefined} colors={colors} />
            <ContentCheck label="Event location" active={hasLocation} detail={hasLocation ? media.eventLocation!.name || 'Pin placed' : undefined} colors={colors} />
          </View>
        </View>

        {/* Image preview row */}
        {hasImages && (
          <View style={styles.imagePreviewRow}>
            {media.images.slice(0, 4).map((img, i) => (
              <View key={i} style={styles.imagePreview}>
                <Image source={{ uri: img.url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              </View>
            ))}
            {media.images.length > 4 && (
              <View style={[styles.imagePreview, styles.moreImages, { backgroundColor: colors.earth.brown }]}>
                <Text style={styles.moreImagesText}>+{media.images.length - 4}</Text>
              </View>
            )}
          </View>
        )}

        {/* Submitter */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Submitted by</Text>
          <Text style={[styles.submitterName, { color: colors.textSecondary }]}>{info.submitterName}</Text>
          {info.phone ? <Text style={[styles.contactLine, { color: colors.textMuted }]}>Phone: {info.phone}</Text> : null}
          {info.whatsapp ? <Text style={[styles.contactLine, { color: colors.textMuted }]}>WhatsApp: {info.whatsapp}</Text> : null}
          {info.email ? <Text style={[styles.contactLine, { color: colors.textMuted }]}>Email: {info.email}</Text> : null}
        </View>
      </View>

      {/* Consent */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.consentRow} onPress={() => onConsentChange(!consent)}>
          <MaterialIcons
            name={consent ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color={consent ? colors.earth.gold : colors.textMuted}
          />
          <Text style={[styles.consentText, { color: colors.text }]}>
            I confirm that the information I have shared is truthful and I have the right to share this story and any accompanying media.
          </Text>
        </TouchableOpacity>
        {errors.consent_confirmed && <Text style={styles.errorText}>{errors.consent_confirmed}</Text>}
      </View>
    </View>
  );
}

function ContentCheck({ label, active, detail, colors }: { label: string; active: boolean; detail?: string; colors: any }) {
  return (
    <View style={styles.checkRow}>
      <MaterialIcons
        name={active ? 'check-circle' : 'radio-button-unchecked'}
        size={18}
        color={active ? colors.earth.gold : colors.border}
      />
      <Text style={[styles.checkLabel, { color: active ? colors.text : colors.textMuted }]}>{label}</Text>
      {detail && <Text style={[styles.checkDetail, { color: colors.textMuted }]}>{detail}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 14 },
  cardLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  cardTitle: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  cardDesc: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  errorText: { color: '#dc2626', fontSize: 12, marginTop: 4 },

  section: { borderTopWidth: 1, paddingTop: 14, marginTop: 14 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  honoreeName: { fontFamily: fonts.serif, fontSize: 24, fontWeight: '700', marginBottom: 2 },
  storyTitle: { fontSize: 15, fontWeight: '500' },
  summary: { fontSize: 13, marginTop: 6, lineHeight: 19 },

  contentChecks: { gap: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkLabel: { fontSize: 14, fontWeight: '500' },
  checkDetail: { fontSize: 12, marginLeft: 'auto' },

  imagePreviewRow: { flexDirection: 'row', gap: 6, marginTop: 14 },
  imagePreview: { width: 56, height: 56, borderRadius: 8, overflow: 'hidden' },
  moreImages: { justifyContent: 'center', alignItems: 'center' },
  moreImagesText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  submitterName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  contactLine: { fontSize: 13, marginTop: 1 },

  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  consentText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
