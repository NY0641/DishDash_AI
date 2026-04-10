import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Mail, Lock, User, ChefHat, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { colors, spacing, radius, shadow } from '@/constants/theme';

export default function RegisterScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: displayName.trim() } },
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <ChefHat color={colors.text.inverse} size={32} strokeWidth={2} />
            </View>
            <Text style={styles.appName}>CookAI</Text>
            <Text style={styles.tagline}>Create your free account</Text>
          </View>

          <View style={[styles.card, shadow.md]}>
            <Text style={styles.cardTitle}>Get started</Text>
            <Text style={styles.cardSubtitle}>Join thousands of home chefs</Text>

            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Display Name</Text>
              <View style={styles.inputRow}>
                <User color={colors.text.muted} size={16} strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="Chef John"
                  placeholderTextColor={colors.text.muted}
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputRow}>
                <Mail color={colors.text.muted} size={16} strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.text.muted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <Lock color={colors.text.muted} size={16} strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.text.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  {showPassword
                    ? <EyeOff color={colors.text.muted} size={16} strokeWidth={2} />
                    : <Eye color={colors.text.muted} size={16} strokeWidth={2} />
                  }
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={colors.text.inverse} />
                : <Text style={styles.btnText}>Create Account</Text>
              }
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Already have an account?</Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.switchLink}>Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.skipBtn}>
            <Text style={styles.skipText}>Continue without signing in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxl,
  },
  logoWrap: { alignItems: 'center', marginBottom: spacing.xl },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.green.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  appName: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 28,
    color: colors.text.primary,
  },
  tagline: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 22,
    color: colors.text.primary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: '#DC2626',
  },
  fieldWrap: { marginBottom: spacing.md },
  label: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: colors.text.primary,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  btn: {
    backgroundColor: colors.green.main,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: colors.text.inverse,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 6,
  },
  switchLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 13,
    color: colors.text.secondary,
  },
  switchLink: {
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    color: colors.green.dark,
  },
  skipBtn: { alignItems: 'center', marginTop: spacing.lg },
  skipText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: colors.text.muted,
  },
});
