import { View, Text, ScrollView, StyleSheet, Linking, Pressable } from 'react-native';
import { colors, fonts } from '../../constants/theme';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>ABOUT THE PROJECT</Text>
        <Text style={styles.heroTitle}>Kukatonon</Text>
        <Text style={styles.heroSubtitle}>
          A National Act of Memory, Healing, and Collective Responsibility
        </Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.paragraph}>
          The Liberian Civil War (1989-2003) claimed the lives of an estimated
          250,000 people and displaced over a million more. Entire communities were
          torn apart, families separated, and countless lives cut short.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>Kukatonon</Text> is a memorial platform
          dedicated to preserving the memories of those we lost. Through stories
          shared by survivors, family members, and community members, we seek to
          ensure that no life is forgotten.
        </Text>

        <View style={styles.quote}>
          <Text style={styles.quoteText}>
            "Until the story of the hunt is told by the lion, the tale of the
            hunt will always glorify the hunter."
          </Text>
        </View>

        <Text style={styles.heading}>Our Mission</Text>
        <Text style={styles.paragraph}>
          We believe that remembering is the first step toward healing. Kukatonon
          provides a dignified space where victims are honored, communities can
          collectively grieve, and future generations can learn about the true cost
          of conflict.
        </Text>

        <Text style={styles.heading}>The Walk to Remember</Text>
        <Text style={styles.paragraph}>
          On <Text style={styles.bold}>April 4, 2026</Text>, we are holding the
          Inaugural Kukatonon Walk to Remember — a memorial walk from the Du Port
          Road Massacre Memorial to the Paynesville City Hall Grounds.
        </Text>
        <Text style={styles.paragraph}>
          Walk: 7:00 AM - 9:00 AM{'\n'}
          Remembrance Ceremony: 10:00 AM
        </Text>

        <Text style={styles.heading}>Presented By</Text>
        <Text style={styles.paragraph}>
          Kukatonon is presented by the <Text style={styles.bold}>Kuwoo Movement</Text>,
          dedicated to national healing, truth-telling, and collective responsibility.
        </Text>

        <Pressable
          style={styles.contactButton}
          onPress={() => Linking.openURL('tel:+231880710399')}
        >
          <Text style={styles.contactText}>Call: +231 880 710 399</Text>
        </Pressable>

        <Pressable
          style={styles.websiteButton}
          onPress={() => Linking.openURL('https://kukatonon.app')}
        >
          <Text style={styles.websiteText}>Visit kukatonon.app</Text>
        </Pressable>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.earth.light,
  },
  content: {},
  hero: {
    backgroundColor: colors.earth.darkest,
    padding: 28,
    alignItems: 'center',
  },
  heroLabel: {
    color: colors.earth.gold,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: fonts.serif,
    fontSize: 36,
    fontWeight: '700',
    color: colors.earth.cream,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.earth.cream,
    opacity: 0.8,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: fonts.serif,
  },
  body: {
    padding: 20,
  },
  paragraph: {
    fontSize: 15,
    color: colors.earth.dark,
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
    color: colors.earth.dark,
    marginTop: 12,
    marginBottom: 12,
  },
  quote: {
    borderLeftWidth: 4,
    borderLeftColor: colors.earth.gold,
    paddingLeft: 16,
    marginVertical: 20,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: colors.earth.warm,
    lineHeight: 24,
    fontFamily: fonts.serif,
  },
  contactButton: {
    backgroundColor: colors.earth.gold,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  contactText: {
    color: colors.earth.darkest,
    fontWeight: '700',
    fontSize: 15,
  },
  websiteButton: {
    borderWidth: 2,
    borderColor: colors.earth.gold,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  websiteText: {
    color: colors.earth.gold,
    fontWeight: '700',
    fontSize: 15,
  },
});
