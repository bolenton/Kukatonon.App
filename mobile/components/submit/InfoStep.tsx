import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from '../../constants/ThemeContext';
import { fonts } from '../../constants/theme';

export interface InfoData {
  honoreeName: string;
  title: string;
  summary: string;
  submitterName: string;
  phone: string;
  whatsapp: string;
  email: string;
}

interface InfoStepProps {
  data: InfoData;
  onChange: (data: InfoData) => void;
  errors: Record<string, string>;
}

export default function InfoStep({ data, onChange, errors }: InfoStepProps) {
  const { colors } = useTheme();

  const update = (field: keyof InfoData, value: string) =>
    onChange({ ...data, [field]: value });

  const inputStyle = [styles.input, { backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }];

  return (
    <View>
      {/* Honoree section */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardLabel, { color: colors.earth.gold }]}>STEP 1 OF 4</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Who Are You Honoring?</Text>
          <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
            Tell us about the person whose memory you want to preserve.
          </Text>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Their Name *</Text>
        <TextInput
          style={inputStyle}
          value={data.honoreeName}
          onChangeText={(v) => update('honoreeName', v)}
          placeholder="Full name of the person being honored"
          placeholderTextColor={colors.textMuted}
        />
        {errors.honoree_name && <Text style={styles.errorText}>{errors.honoree_name}</Text>}

        <Text style={[styles.label, { color: colors.textSecondary }]}>Story Title *</Text>
        <TextInput
          style={inputStyle}
          value={data.title}
          onChangeText={(v) => update('title', v)}
          placeholder="A title for this memorial"
          placeholderTextColor={colors.textMuted}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

        <Text style={[styles.label, { color: colors.textSecondary }]}>Brief Summary</Text>
        <TextInput
          style={[...inputStyle, styles.multiline]}
          value={data.summary}
          onChangeText={(v) => update('summary', v)}
          placeholder="A short summary (optional)"
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Submitter section */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardSubtitle, { color: colors.text }]}>Your Information</Text>
        <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
          Private — only visible to our team, never shown publicly.
        </Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>Your Name *</Text>
        <TextInput
          style={inputStyle}
          value={data.submitterName}
          onChangeText={(v) => update('submitterName', v)}
          placeholder="Your full name"
          placeholderTextColor={colors.textMuted}
        />
        {errors.submitted_by_name && <Text style={styles.errorText}>{errors.submitted_by_name}</Text>}

        <Text style={[styles.hint, { color: colors.textMuted }]}>At least one contact method required.</Text>
        {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}

        <Text style={[styles.label, { color: colors.textSecondary }]}>Phone</Text>
        <TextInput
          style={inputStyle}
          value={data.phone}
          onChangeText={(v) => update('phone', v)}
          placeholder="+231..."
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>WhatsApp</Text>
        <TextInput
          style={inputStyle}
          value={data.whatsapp}
          onChangeText={(v) => update('whatsapp', v)}
          placeholder="+231..."
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
        <TextInput
          style={inputStyle}
          value={data.email}
          onChangeText={(v) => update('email', v)}
          placeholder="your@email.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.submitted_by_email && <Text style={styles.errorText}>{errors.submitted_by_email}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 14 },
  cardHeader: { marginBottom: 8 },
  cardLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  cardTitle: { fontFamily: fonts.serif, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  cardSubtitle: { fontFamily: fonts.serif, fontSize: 18, fontWeight: '700', marginBottom: 2 },
  cardDesc: { fontSize: 13, lineHeight: 19 },
  label: { fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  hint: { fontSize: 12, marginTop: 10 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  multiline: { minHeight: 60, textAlignVertical: 'top' },
  errorText: { color: '#dc2626', fontSize: 12, marginTop: 2 },
});
