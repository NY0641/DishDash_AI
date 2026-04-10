import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, spacing, radius } from '@/constants/theme';

const PROMPTS = [
  { label: 'Quick & Easy', emoji: '⚡' },
  { label: 'Vegetarian', emoji: '🥦' },
  { label: 'High Protein', emoji: '💪' },
  { label: 'Under 30 min', emoji: '⏱️' },
  { label: 'Budget-friendly', emoji: '💰' },
  { label: 'Desserts', emoji: '🍰' },
];

interface QuickPromptsProps {
  onSelect: (label: string) => void;
}

export function QuickPrompts({ onSelect }: QuickPromptsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Inspiration</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {PROMPTS.map((p) => (
          <TouchableOpacity
            key={p.label}
            style={styles.chip}
            onPress={() => onSelect(p.label)}
            activeOpacity={0.7}
          >
            <Text style={styles.chipEmoji}>{p.emoji}</Text>
            <Text style={styles.chipLabel}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: colors.text.primary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: colors.text.primary,
  },
});
