import { View, Text, StyleSheet } from 'react-native';
import { MessageSquare, ChefHat, Star } from 'lucide-react-native';
import { colors, spacing, radius, shadow } from '@/constants/theme';

const STEPS = [
  {
    icon: MessageSquare,
    color: colors.green.main,
    bg: colors.green.light,
    title: 'Tell us your idea',
    desc: 'Share what ingredients you have or what you are craving.',
  },
  {
    icon: ChefHat,
    color: colors.orange.main,
    bg: colors.orange.light,
    title: 'AI crafts recipes',
    desc: 'Our assistant generates personalized, step-by-step recipes.',
  },
  {
    icon: Star,
    color: '#F59E0B',
    bg: '#FEF3C7',
    title: 'Cook & enjoy',
    desc: 'Follow along, save favorites, and build your cookbook.',
  },
];

export function HowItWorks() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>How it works</Text>
      <View style={styles.cards}>
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <View key={i} style={[styles.card, shadow.sm]}>
              <View style={[styles.iconWrap, { backgroundColor: step.bg }]}>
                <Icon color={step.color} size={20} strokeWidth={2} />
              </View>
              <Text style={styles.stepNum}>Step {i + 1}</Text>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  cards: {
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  stepNum: {
    fontFamily: 'Nunito-Bold',
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  stepTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 4,
  },
  stepDesc: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
  },
});
