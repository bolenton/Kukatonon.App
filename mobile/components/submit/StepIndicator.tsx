import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../constants/ThemeContext';

const STEPS = ['Info', 'Story', 'Media', 'Review'];

interface StepIndicatorProps {
  currentStep: number;
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {STEPS.map((label, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const isUpcoming = i > currentStep;

        return (
          <View key={label} style={styles.stepItem}>
            {/* Connector line (before) */}
            {i > 0 && (
              <View
                style={[
                  styles.connector,
                  { backgroundColor: isCompleted || isCurrent ? colors.earth.gold : colors.border },
                ]}
              />
            )}

            {/* Dot / Check */}
            <View
              style={[
                styles.dot,
                isCompleted && { backgroundColor: colors.earth.gold },
                isCurrent && { backgroundColor: colors.earth.gold, transform: [{ scale: 1.2 }] },
                isUpcoming && { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.border },
              ]}
            >
              {isCompleted ? (
                <MaterialIcons name="check" size={10} color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.dotNumber,
                    isCurrent && { color: '#fff' },
                    isUpcoming && { color: colors.textMuted },
                  ]}
                >
                  {i + 1}
                </Text>
              )}
            </View>

            {/* Label */}
            <Text
              style={[
                styles.label,
                { color: isCurrent ? colors.earth.gold : isCompleted ? colors.text : colors.textMuted },
                isCurrent && { fontWeight: '700' },
              ]}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    top: 10,
    right: '50%',
    left: '-50%',
    height: 2,
    zIndex: -1,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dotNumber: {
    fontSize: 10,
    fontWeight: '700',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});
