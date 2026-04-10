import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, radius, shadow } from '@/constants/theme';
import { supabase, type Category } from '@/lib/supabase';

const FALLBACK_CATEGORIES: Category[] = [
  { id: '1', name: 'Breakfast', image_url: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400', recipe_count: 240, display_order: 1 },
  { id: '2', name: 'Lunch', image_url: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400', recipe_count: 310, display_order: 2 },
  { id: '3', name: 'Dinner', image_url: 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=400', recipe_count: 420, display_order: 3 },
  { id: '4', name: 'Snacks', image_url: 'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=400', recipe_count: 180, display_order: 4 },
];

interface CategoryCardsProps {
  onSelect?: (name: string) => void;
}

export function CategoryCards({ onSelect }: CategoryCardsProps) {
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        setCategories(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Explore by Meal</Text>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.green.main} />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.card, shadow.sm]}
              activeOpacity={0.85}
              onPress={() => onSelect?.(cat.name)}
            >
              <Image
                source={{ uri: cat.image_url }}
                style={styles.image}
                pointerEvents="none"
              />
              <View style={styles.cardOverlay} pointerEvents="none" />
              <View style={styles.cardContent} pointerEvents="none">
                <Text style={styles.cardName}>{cat.name}</Text>
                <Text style={styles.cardCount}>{cat.recipe_count}+ recipes</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
  loadingWrap: {
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  card: {
    width: 130,
    height: 160,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.neutral[200],
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
  },
  cardName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  cardCount: {
    fontFamily: 'Nunito-Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 2,
  },
});
