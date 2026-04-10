import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { BookMarked, Clock, Trash2, ChefHat } from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import { colors, spacing, radius, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type SavedItem = {
  id: string;
  title: string;
  description: string;
  cook_time_minutes: number;
  difficulty: string;
  tags: string[];
  created_at: string;
};

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  easy: { bg: '#D1FAE5', text: '#065F46' },
  medium: { bg: '#FEF3C7', text: '#92400E' },
  hard: { bg: '#FEE2E2', text: '#991B1B' },
};

export default function SavedScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchSaved = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('saved_recipes')
      .select('id, title, description, cook_time_minutes, difficulty, tags, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchSaved();
    }, [fetchSaved])
  );

  const handleRemove = async (id: string) => {
    setRemoving(id);
    await supabase.from('saved_recipes').delete().eq('id', id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    setRemoving(null);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Saved Recipes</Text>
          <Text style={styles.subtitle}>Your personal cookbook</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <BookMarked color={colors.orange.main} size={36} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>Sign in to save recipes</Text>
          <Text style={styles.emptyDesc}>
            Create an account to bookmark your favorite AI-generated recipes and build your personal cookbook.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, shadow.sm]}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.85}
          >
            <ChefHat color={colors.text.inverse} size={16} strokeWidth={2} />
            <Text style={styles.primaryBtnText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Saved Recipes</Text>
          <Text style={styles.subtitle}>{items.length} recipe{items.length !== 1 ? 's' : ''} saved</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.green.main} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <BookMarked color={colors.orange.mid} size={36} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>No saved recipes yet</Text>
          <Text style={styles.emptyDesc}>
            Ask the AI for a recipe on the Home tab and tap "Save" to add it here.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, shadow.sm]}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.85}
          >
            <ChefHat color={colors.text.inverse} size={16} strokeWidth={2} />
            <Text style={styles.primaryBtnText}>Get a Recipe</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {items.map((item) => {
            const diff = DIFFICULTY_COLORS[item.difficulty] ?? DIFFICULTY_COLORS.easy;
            return (
              <View key={item.id} style={[styles.card, shadow.sm]}>
                <View style={styles.cardTop}>
                  <View style={styles.cardMain}>
                    <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemove(item.id)}
                    disabled={removing === item.id}
                    hitSlop={8}
                  >
                    {removing === item.id
                      ? <ActivityIndicator size="small" color={colors.text.muted} />
                      : <Trash2 color={colors.text.muted} size={16} strokeWidth={2} />
                    }
                  </TouchableOpacity>
                </View>
                <View style={styles.cardMeta}>
                  <View style={styles.metaItem}>
                    <Clock color={colors.text.muted} size={12} strokeWidth={2} />
                    <Text style={styles.metaText}>{item.cook_time_minutes} min</Text>
                  </View>
                  <View style={[styles.diffBadge, { backgroundColor: diff.bg }]}>
                    <Text style={[styles.diffText, { color: diff.text }]}>
                      {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
                    </Text>
                  </View>
                  {item.tags.slice(0, 2).map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
          <View style={styles.bottomPad} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.orange.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.green.main,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    width: '100%',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  primaryBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: colors.text.inverse,
  },
  secondaryBtn: { paddingVertical: spacing.sm },
  secondaryBtnText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: colors.green.dark,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardMain: { flex: 1 },
  cardTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 4,
    lineHeight: 21,
  },
  cardDesc: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  removeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 11,
    color: colors.text.muted,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  diffText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 10,
  },
  tag: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 10,
    color: colors.text.secondary,
  },
  bottomPad: { height: spacing.lg },
});
