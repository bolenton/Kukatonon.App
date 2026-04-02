import { View, Text, ScrollView, StyleSheet, Linking, Pressable } from 'react-native';
import { useTheme } from '../../constants/ThemeContext';
import { fonts } from '../../constants/theme';

export default function AboutScreen() {
  const { mode, colors, toggle } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: mode === 'earth' ? colors.earth.darkest : colors.bg }]}>
        <Text style={[styles.heroLabel, { color: colors.earth.gold }]}>ABOUT THE PROJECT</Text>
        <Text style={[styles.heroTitle, { color: mode === 'earth' ? colors.earth.cream : colors.text }]}>
          Kukatonon
        </Text>
        <Text style={[styles.heroSubtitle, { color: mode === 'earth' ? colors.earth.cream : colors.textSecondary, opacity: 0.8 }]}>
          A National Act of Memory, Healing, and Collective Responsibility
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          The Liberian Civil War (1989-2003) claimed the lives of an estimated
          250,000 people and displaced over a million more. Entire communities were
          torn apart, families separated, and countless lives cut short.
        </Text>

        <Text style={[styles.paragraph, { color: colors.text }]}>
          <Text style={styles.bold}>Kukatonon</Text> is a memorial platform
          dedicated to preserving the memories of those we lost. Through stories
          shared by survivors, family members, and community members, we seek to
          ensure that no life is forgotten.
        </Text>

        <View style={[styles.quote, { borderLeftColor: colors.earth.gold }]}>
          <Text style={[styles.quoteText, { color: colors.textSecondary }]}>
            "Until the story of the hunt is told by the lion, the tale of the
            hunt will always glorify the hunter."
          </Text>
        </View>

        <Text style={[styles.heading, { color: colors.text }]}>Our Mission</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We believe that remembering is the first step toward healing. Kukatonon
          provides a dignified space where victims are honored, communities can
          collectively grieve, and future generations can learn about the true cost
          of conflict.
        </Text>

        <Text style={[styles.heading, { color: colors.text }]}>The Walk to Remember</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          On <Text style={styles.bold}>April 4, 2026</Text>, we are holding the
          Inaugural Kukatonon Walk to Remember — a memorial walk from the Du Port
          Road Massacre Memorial to the Paynesville City Hall Grounds.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Walk: 7:00 AM - 9:00 AM{'\n'}
          Remembrance Ceremony: 10:00 AM
        </Text>

        <Text style={[styles.heading, { color: colors.text }]}>Presented By</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Kukatonon is presented by the <Text style={styles.bold}>Kuwoo Movement</Text>,
          dedicated to national healing, truth-telling, and collective responsibility.
        </Text>

        <Pressable
          style={[styles.contactButton, { backgroundColor: colors.earth.gold }]}
          onPress={() => Linking.openURL('tel:+231880710399')}
        >
          <Text style={[styles.contactText, { color: colors.earth.darkest }]}>Call: +231 880 710 399</Text>
        </Pressable>

        <Pressable
          style={[styles.websiteButton, { borderColor: colors.earth.gold }]}
          onPress={() => Linking.openURL('https://kukatonon.app')}
        >
          <Text style={[styles.websiteText, { color: colors.earth.gold }]}>Visit kukatonon.app</Text>
        </Pressable>

        {/* Theme Toggle */}
        <View style={[styles.themeSection, { borderTopColor: colors.border }]}>
          <View style={styles.themeInfo}>
            <Text style={[styles.themeLabel, { color: colors.textSecondary }]}>Appearance</Text>
            <Text style={[styles.themeName, { color: colors.textMuted }]}>
              {mode === 'earth' ? 'Earth (Dark)' : 'Light (Editorial)'}
            </Text>
          </View>
          <Pressable
            onPress={toggle}
            style={[
              styles.toggleTrack,
              { backgroundColor: mode === 'light' ? colors.earth.gold : colors.earth.brown },
            ]}
          >
            <View
              style={[
                styles.toggleThumb,
                { transform: [{ translateX: mode === 'light' ? 20 : 2 }] },
              ]}
            />
          </Pressable>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {},
  hero: {
    padding: 28,
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: fonts.serif,
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: fonts.serif,
  },
  body: {
    padding: 20,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  bold: {
    fontWeight: '700',
  },
  heading: {
    fontFamily: fonts.serif,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 12,
  },
  quote: {
    borderLeftWidth: 4,
    paddingLeft: 16,
    marginVertical: 20,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 24,
    fontFamily: fonts.serif,
  },
  contactButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  contactText: {
    fontWeight: '700',
    fontSize: 15,
  },
  websiteButton: {
    borderWidth: 2,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  websiteText: {
    fontWeight: '700',
    fontSize: 15,
  },
  themeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  themeInfo: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  themeName: {
    fontSize: 13,
    marginTop: 2,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
