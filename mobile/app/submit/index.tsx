import { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Alert, ActivityIndicator, Platform, LayoutAnimation, UIManager, Pressable,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../constants/ThemeContext';
import { fonts } from '../../constants/theme';
import StepIndicator from '../../components/submit/StepIndicator';
import InfoStep, { type InfoData } from '../../components/submit/InfoStep';
import StoryStep, { type StoryData } from '../../components/submit/StoryStep';
import MediaStep, { type MediaData } from '../../components/submit/MediaStep';
import ReviewStep from '../../components/submit/ReviewStep';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://kukatonon.app';
const TOTAL_STEPS = 4;

export default function SubmitStoryScreen() {
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const scrollRef = useRef<ScrollView>(null);

  // ─── Form State ───
  const [info, setInfo] = useState<InfoData>({
    honoreeName: '', title: '', summary: '',
    submitterName: '', phone: '', whatsapp: '', email: '',
  });

  const [story, setStory] = useState<StoryData>({
    storyText: '', audioUrl: null, audioLocalUri: null, videoParts: [],
  });

  const [media, setMedia] = useState<MediaData>({
    images: [], videos: [], youtubeUrls: [], eventLocation: null,
  });

  const [consent, setConsent] = useState(false);

  function renderHeaderLeft() {
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

  // ─── Validation ───
  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {};

    if (s === 0) {
      if (!info.honoreeName.trim()) errs.honoree_name = 'Honoree name is required';
      if (!info.title.trim()) errs.title = 'Story title is required';
      if (!info.submitterName.trim()) errs.submitted_by_name = 'Your name is required';
      const hasContact = info.phone.trim() || info.whatsapp.trim() || info.email.trim();
      if (!hasContact) errs.contact = 'At least one contact method is required';
      if (info.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.email))
        errs.submitted_by_email = 'Please enter a valid email address';
    }

    if (s === 1) {
      const hasContent = story.storyText.trim() || story.audioUrl || story.videoParts.length > 0;
      if (!hasContent) errs.content = 'Please add at least one type of content (text, audio, or video)';
    }

    // Step 2 (media) has no required fields
    // Step 3 (review) validates consent
    if (s === 3) {
      if (!consent) errs.consent_confirmed = 'You must confirm consent to submit a story';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  function goBack() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }

  // ─── Submit ───
  async function handleSubmit() {
    if (!validateStep(3)) return;
    setSubmitting(true);
    setErrors({});

    // Build media_items array
    const mediaItems: { type: string; url: string }[] = [];
    for (const img of media.images) {
      mediaItems.push({ type: 'image', url: img.url });
    }
    for (const vid of story.videoParts) {
      mediaItems.push({ type: 'video', url: vid.url });
    }
    for (const vid of media.videos) {
      mediaItems.push({ type: 'video', url: vid.url });
    }
    if (story.audioUrl) {
      mediaItems.push({ type: 'audio', url: story.audioUrl });
    }

    try {
      const res = await fetch(`${API_BASE}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          honoree_name: info.honoreeName,
          title: info.title,
          summary: info.summary || undefined,
          content_html: story.storyText
            ? `<p>${story.storyText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>`
            : undefined,
          youtube_urls: media.youtubeUrls.length > 0 ? media.youtubeUrls : undefined,
          media_items: mediaItems.length > 0 ? mediaItems : undefined,
          cover_image_url: media.images[0]?.url || undefined,
          submitted_by_name: info.submitterName,
          submitted_by_phone: info.phone || undefined,
          submitted_by_whatsapp: info.whatsapp || undefined,
          submitted_by_email: info.email || undefined,
          consent_confirmed: consent,
          event_latitude: media.eventLocation?.latitude ?? undefined,
          event_longitude: media.eventLocation?.longitude ?? undefined,
          event_location_name: media.eventLocation?.name || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          const map: Record<string, string> = {};
          data.errors.forEach((e: { field: string; message: string }) => {
            map[e.field] = e.message;
          });
          setErrors(map);
          // Navigate back to the step with the first error
          if (map.honoree_name || map.title || map.submitted_by_name || map.contact || map.submitted_by_email) setStep(0);
          else if (map.content) setStep(1);
        } else {
          setErrors({ form: data.error || 'Something went wrong' });
        }
        return;
      }
      setSubmitted(true);
    } catch {
      setErrors({ form: 'Failed to submit. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  // ─── Success Screen ───
  if (submitted) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Thank You',
            headerBackVisible: false,
            headerLeft: renderHeaderLeft,
          }}
        />
        <View style={[styles.successContainer, { backgroundColor: colors.bg }]}>
          <View style={[styles.successIcon, { backgroundColor: colors.earth.gold + '18' }]}>
            <MaterialIcons name="check-circle" size={64} color={colors.earth.gold} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Story Submitted</Text>
          <Text style={[styles.successText, { color: colors.textSecondary }]}>
            Thank you for honoring {info.honoreeName}'s memory. Our team will review your submission and make it available once approved.
          </Text>
          <TouchableOpacity
            style={[styles.successBtn, { backgroundColor: colors.earth.gold }]}
            onPress={() => router.back()}
          >
            <Text style={styles.successBtnText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  // ─── Wizard ───
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Share a Story',
          headerBackVisible: false,
          headerLeft: renderHeaderLeft,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        {/* Step indicator */}
        <StepIndicator currentStep={step} />

        {/* Scrollable content */}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, Platform.OS === 'android' && { paddingBottom: 300 }]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          keyboardDismissMode="interactive"
        >
          {errors.form && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{errors.form}</Text>
            </View>
          )}

          {step === 0 && <InfoStep data={info} onChange={setInfo} errors={errors} />}
          {step === 1 && <StoryStep data={story} onChange={setStory} errors={errors} />}
          {step === 2 && <MediaStep data={media} onChange={setMedia} />}
          {step === 3 && (
            <ReviewStep
              info={info}
              story={story}
              media={media}
              consent={consent}
              onConsentChange={setConsent}
              errors={errors}
            />
          )}
        </ScrollView>

        {/* Bottom navigation */}
        <View style={[styles.navBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          {step > 0 ? (
            <TouchableOpacity style={[styles.navBtn, styles.backBtn, { borderColor: colors.border }]} onPress={goBack}>
              <MaterialIcons name="arrow-back" size={18} color={colors.text} />
              <Text style={[styles.navBtnText, { color: colors.text }]}>Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navBtn} />
          )}

          {step < TOTAL_STEPS - 1 ? (
            <TouchableOpacity style={[styles.navBtn, styles.nextBtn, { backgroundColor: colors.earth.gold }]} onPress={goNext}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navBtn, styles.nextBtn, { backgroundColor: colors.earth.gold }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="send" size={18} color="#fff" />
                  <Text style={styles.nextBtnText}>Submit Story</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  errorBanner: {
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    borderRadius: 10, padding: 12, marginBottom: 12,
  },
  errorBannerText: { color: '#dc2626', fontSize: 13, textAlign: 'center' },

  // Bottom nav
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 30,
    borderTopWidth: 1,
    gap: 12,
  },
  navBtn: { flex: 1 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  navBtnText: { fontSize: 15, fontWeight: '600' },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Success
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  successTitle: { fontFamily: fonts.serif, fontSize: 28, fontWeight: '700', marginBottom: 8 },
  successText: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  successBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  successBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerLink: { fontSize: 16, fontWeight: '600' },
});
