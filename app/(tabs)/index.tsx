import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Bell, ChefHat } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors, spacing, shadow, radius } from '@/constants/theme';
import { HeroSection } from '@/components/home/HeroSection';
import { AiInputBar } from '@/components/home/AiInputBar';
import { QuickPrompts } from '@/components/home/QuickPrompts';
import { CategoryCards } from '@/components/home/CategoryCards';
import { HowItWorks } from '@/components/home/HowItWorks';
import { RecipeResultCard, type AiRecipe } from '@/components/home/RecipeResultCard';
import { useAuth } from '@/context/AuthContext';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export default function HomeScreen() {
  const { user } = useAuth();
  const [aiRecipe, setAiRecipe] = useState<AiRecipe | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handlePrompt = async (query: string) => {
    setAiError(null);
    setAiRecipe(null);
    setAiLoading(true);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-recipe-suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Apikey: SUPABASE_ANON_KEY ?? '',
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (data.error) {
        setAiError(data.error);
      } else if (data.recipe) {
        setAiRecipe(data.recipe);
      } else {
        setAiError('Could not generate a recipe. Please try again.');
      }
    } catch {
      setAiError('Network error. Please check your connection.');
    } finally {
      setAiLoading(false);
    }
  };

  const displayName = user?.user_metadata?.display_name ?? (user ? 'Chef' : 'Chef Explorer');
  const greeting = new Date().getHours() < 12
    ? 'Good morning'
    : new Date().getHours() < 17
    ? 'Good afternoon'
    : 'Good evening';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.name}>{displayName}</Text>
          </View>
          <View style={styles.headerRight}>
            {!user && (
              <TouchableOpacity
                style={[styles.signInBtn, shadow.sm]}
                onPress={() => router.push('/(auth)/login')}
                activeOpacity={0.8}
              >
                <ChefHat color={colors.green.main} size={14} strokeWidth={2} />
                <Text style={styles.signInText}>Sign In</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.notifBtn, shadow.sm]} activeOpacity={0.8}>
              <Bell color={colors.text.primary} size={18} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <HeroSection />

        <AiInputBar onSubmit={handlePrompt} sessionId={user?.id ?? 'anon'} />

        {aiLoading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.green.main} />
            <Text style={styles.loadingText}>Crafting your recipe...</Text>
          </View>
        )}

        {aiError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{aiError}</Text>
            <TouchableOpacity onPress={() => setAiError(null)}>
              <Text style={styles.errorDismiss}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {aiRecipe && !aiLoading && (
          <RecipeResultCard recipe={aiRecipe} onDismiss={() => setAiRecipe(null)} />
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
  scroll: { flex: 1 },
  scrollContent: { paddingTop: spacing.md },
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.green.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.green.mid,
  },
  signInText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: colors.green.dark,
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
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.green.light,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  loadingText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: colors.green.dark,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: '#FEE2E2',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: '#DC2626',
    flex: 1,
  },
  errorDismiss: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: '#DC2626',
  },
  bottomPad: { height: spacing.xl },
});
