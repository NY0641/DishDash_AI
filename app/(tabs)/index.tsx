import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Bell } from 'lucide-react-native';
import { colors, spacing, shadow, radius } from '@/constants/theme';
import { HeroSection } from '@/components/home/HeroSection';
import { AiInputBar } from '@/components/home/AiInputBar';
import { QuickPrompts } from '@/components/home/QuickPrompts';
import { CategoryCards } from '@/components/home/CategoryCards';
import { HowItWorks } from '@/components/home/HowItWorks';

export default function HomeScreen() {
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  const handlePrompt = (text: string) => {
    setLastPrompt(text);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.name}>Chef Explorer</Text>
          </View>
          <TouchableOpacity style={[styles.notifBtn, shadow.sm]} activeOpacity={0.8}>
            <Bell color={colors.text.primary} size={18} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <HeroSection />

        <AiInputBar onSubmit={handlePrompt} />

        {lastPrompt && (
          <View style={styles.promptFeedback}>
            <Text style={styles.promptFeedbackLabel}>Last search:</Text>
            <Text style={styles.promptFeedbackText} numberOfLines={1}>
              {lastPrompt}
            </Text>
          </View>
        )}

        <QuickPrompts onSelect={handlePrompt} />
        <CategoryCards onSelect={handlePrompt} />
        <HowItWorks />

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  greeting: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: colors.text.secondary,
  },
  name: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 22,
    color: colors.text.primary,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: 6,
  },
  promptFeedbackLabel: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: colors.text.muted,
  },
  promptFeedbackText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: colors.green.dark,
    flex: 1,
  },
  bottomPad: {
    height: spacing.xl,
  },
});
