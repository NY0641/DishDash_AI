import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Clock,
  ChefHat,
  BookMarked,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  CircleCheck,
} from 'lucide-react-native';
import { colors, spacing, radius, shadow } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

export type AiRecipe = {
  title: string;
  description: string;
  cook_time_minutes: number;
  difficulty: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  tip?: string;
};

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string }> = {
  easy: { bg: '#D1FAE5', text: '#065F46' },
  medium: { bg: '#FEF3C7', text: '#92400E' },
  hard: { bg: '#FEE2E2', text: '#991B1B' },
};

interface RecipeResultCardProps {
  recipe: AiRecipe;
  onDismiss: () => void;
}

export function RecipeResultCard({ recipe, onDismiss }: RecipeResultCardProps) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const diffStyle = DIFFICULTY_COLORS[recipe.difficulty] ?? DIFFICULTY_COLORS.easy;

  const handleSave = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    setSaving(true);
    const { data: existing } = await supabase
      .from('recipes')
      .select('id')
      .eq('title', recipe.title)
      .eq('is_ai_generated', true)
      .maybeSingle();

    let recipeId = existing?.id;

    if (!recipeId) {
      const { data: inserted } = await supabase
        .from('recipes')
        .insert({
          title: recipe.title,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          cook_time_minutes: recipe.cook_time_minutes,
          difficulty: recipe.difficulty,
          tags: recipe.tags,
          is_ai_generated: true,
        })
        .select('id')
        .single();
      recipeId = inserted?.id;
    }

    if (recipeId) {
      await supabase.from('saved_recipes').insert({
        recipe_id: recipeId,
        user_id: user.id,
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cook_time_minutes: recipe.cook_time_minutes,
        difficulty: recipe.difficulty,
        tags: recipe.tags,
        tip: recipe.tip ?? '',
      });
      setSaved(true);
    }
    setSaving(false);
  };

  return (
    <View style={[styles.card, shadow.lg]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiBadge}>
            <ChefHat color={colors.green.main} size={12} strokeWidth={2.5} />
            <Text style={styles.aiBadgeText}>AI Recipe</Text>
          </View>
          <Text style={styles.title} numberOfLines={2}>{recipe.title}</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn} hitSlop={8}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>{recipe.description}</Text>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Clock color={colors.text.secondary} size={14} strokeWidth={2} />
          <Text style={styles.metaText}>{recipe.cook_time_minutes} min</Text>
        </View>
        <View style={[styles.diffBadge, { backgroundColor: diffStyle.bg }]}>
          <Text style={[styles.diffText, { color: diffStyle.text }]}>
            {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
          </Text>
        </View>
        {recipe.tags.slice(0, 2).map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        {recipe.ingredients.slice(0, expanded ? undefined : 4).map((ing, i) => (
          <View key={i} style={styles.ingredientRow}>
            <View style={styles.bullet} />
            <Text style={styles.ingredientText}>{ing}</Text>
          </View>
        ))}
        {!expanded && recipe.ingredients.length > 4 && (
          <Text style={styles.moreText}>+{recipe.ingredients.length - 4} more</Text>
        )}
      </View>

      {expanded && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.instructions.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
          {recipe.tip && (
            <View style={styles.tipBox}>
              <Lightbulb color={colors.orange.main} size={14} strokeWidth={2} />
              <Text style={styles.tipText}>{recipe.tip}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.expandBtn}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          {expanded
            ? <ChevronUp color={colors.text.secondary} size={16} strokeWidth={2} />
            : <ChevronDown color={colors.text.secondary} size={16} strokeWidth={2} />
          }
          <Text style={styles.expandText}>{expanded ? 'Show less' : 'Full recipe'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnDone]}
          onPress={handleSave}
          disabled={saving || saved}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={colors.text.inverse} size="small" />
          ) : saved ? (
            <>
              <CircleCheck color={colors.text.inverse} size={14} strokeWidth={2.5} />
              <Text style={styles.saveBtnText}>Saved</Text>
            </>
          ) : (
            <>
              <BookMarked color={colors.text.inverse} size={14} strokeWidth={2.5} />
              <Text style={styles.saveBtnText}>Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: { flex: 1, marginRight: spacing.sm },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.green.light,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  aiBadgeText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 10,
    color: colors.green.dark,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 18,
    color: colors.text.primary,
    lineHeight: 24,
  },
  dismissBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  description: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 19,
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: colors.text.secondary,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  diffText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 11,
  },
  tag: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 11,
    color: colors.text.secondary,
  },
  section: { marginBottom: spacing.md },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 6,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.green.main,
  },
  ingredientText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: colors.text.primary,
    flex: 1,
  },
  moreText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 4,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.green.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  stepNumText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 11,
    color: colors.green.dark,
  },
  stepText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 20,
    flex: 1,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.orange.light,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  tipText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: colors.orange.dark,
    flex: 1,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: colors.text.secondary,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.green.main,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  saveBtnDone: {
    backgroundColor: colors.green.dark,
  },
  saveBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    color: colors.text.inverse,
  },
});
