import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius, shadow } from '@/constants/theme';

const CATEGORIES = [
  {
    id: '1',
    name: 'Breakfast',
    image: 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400',
    count: '240+ recipes',
  },
  {
    id: '2',
    name: 'Lunch',
    image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400',
    count: '310+ recipes',
  },
  {
    id: '3',
    name: 'Dinner',
    image: 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=400',
    count: '420+ recipes',
  },
  {
    id: '4',
    name: 'Snacks',
    image: 'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=400',
    count: '180+ recipes',
  },
];

export function CategoryCards() {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Explore by Meal</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.id} style={[styles.card, shadow.sm]} activeOpacity={0.85}>
            <Image source={{ uri: cat.image }} style={styles.image} />
            <View style={styles.cardOverlay} />
            <View style={styles.cardContent}>
              <Text style={styles.cardName}>{cat.name}</Text>
              <Text style={styles.cardCount}>{cat.count}</Text>
            </View>
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
