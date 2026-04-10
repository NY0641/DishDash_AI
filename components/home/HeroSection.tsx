import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, spacing, radius } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

export function HeroSection() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.green.main, '#2E7D52']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' }}
          style={styles.heroImage}
          pointerEvents="none"
        />
        <View style={styles.overlay} pointerEvents="none" />
        <View style={styles.content}>
          <Text style={styles.badge}>AI POWERED</Text>
          <Text style={styles.title}>Your personal{'\n'}cooking companion</Text>
          <Text style={styles.subtitle}>
            Describe ingredients, dietary needs, or a craving — and get inspired instantly.
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    minHeight: 200,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.25,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46,125,82,0.55)',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    zIndex: 1,
  },
  badge: {
    fontFamily: 'Nunito-Bold',
    fontSize: 10,
    color: colors.green.light,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 26,
    color: colors.text.inverse,
    lineHeight: 34,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 20,
    maxWidth: '85%',
  },
});
