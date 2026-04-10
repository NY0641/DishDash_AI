import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { User } from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>
      <View style={styles.placeholder}>
        <View style={styles.iconWrap}>
          <User color={colors.neutral[500]} size={36} strokeWidth={1.5} />
        </View>
        <Text style={styles.comingSoonTitle}>Coming Soon</Text>
        <Text style={styles.comingSoonDesc}>
          Set your dietary preferences, allergies, and cooking skill level to personalize your experience.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 24,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  comingSoonTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  comingSoonDesc: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
