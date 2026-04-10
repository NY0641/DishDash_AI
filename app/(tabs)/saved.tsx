import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { BookMarked } from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/theme';

export default function SavedScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Recipes</Text>
        <Text style={styles.subtitle}>Your personal recipe collection</Text>
      </View>
      <View style={styles.placeholder}>
        <View style={styles.iconWrap}>
          <BookMarked color={colors.orange.main} size={36} strokeWidth={1.5} />
        </View>
        <Text style={styles.comingSoonTitle}>Coming Soon</Text>
        <Text style={styles.comingSoonDesc}>
          Save your favorite AI-generated recipes and organize them into collections.
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
    backgroundColor: colors.orange.light,
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
