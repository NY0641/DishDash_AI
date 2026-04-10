import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { User, Mail, LogOut, ChefHat, Settings, BookMarked, Search } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors, spacing, radius, shadow } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Halal', 'Kosher'];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stats, setStats] = useState({ searches: 0, saved: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, dietary_prefs')
        .eq('id', user.id)
        .maybeSingle();
      if (data) {
        setDisplayName(data.display_name ?? '');
        setSelectedPrefs(data.dietary_prefs ?? []);
      } else {
        setDisplayName(user.user_metadata?.display_name ?? '');
      }
      const { count: searchCount } = await supabase
        .from('user_searches')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', user.id);
      const { count: savedCount } = await supabase
        .from('saved_recipes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setStats({ searches: searchCount ?? 0, saved: savedCount ?? 0 });
    };
    load();
  }, [user]);

  const togglePref = (pref: string) => {
    setSelectedPrefs((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSaveSuccess(false);
    await supabase.from('profiles').upsert({
      id: user.id,
      display_name: displayName,
      dietary_prefs: selectedPrefs,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(tabs)');
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>Manage your account</Text>
        </View>
        <View style={styles.guestContainer}>
          <View style={styles.guestIconWrap}>
            <User color={colors.neutral[400]} size={40} strokeWidth={1.5} />
          </View>
          <Text style={styles.guestTitle}>You're not signed in</Text>
          <Text style={styles.guestDesc}>
            Create an account to save recipes, set dietary preferences, and personalize your experience.
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
            <Text style={styles.secondaryBtnText}>Sign in to existing account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn} activeOpacity={0.8}>
            <LogOut color={colors.text.secondary} size={16} strokeWidth={2} />
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.avatarCard, shadow.sm]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {(displayName || user.email || 'C').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.avatarName}>{displayName || 'Chef'}</Text>
            <View style={styles.emailRow}>
              <Mail color={colors.text.muted} size={12} strokeWidth={2} />
              <Text style={styles.emailText} numberOfLines={1}>{user.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, shadow.sm]}>
            <Search color={colors.green.main} size={18} strokeWidth={2} />
            <Text style={styles.statNum}>{stats.searches}</Text>
            <Text style={styles.statLabel}>Searches</Text>
          </View>
          <View style={[styles.statCard, shadow.sm]}>
            <BookMarked color={colors.orange.main} size={18} strokeWidth={2} />
            <Text style={styles.statNum}>{stats.saved}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={[styles.statCard, shadow.sm]}>
            <ChefHat color={colors.neutral[400]} size={18} strokeWidth={2} />
            <Text style={styles.statNum}>{selectedPrefs.length}</Text>
            <Text style={styles.statLabel}>Prefs</Text>
          </View>
        </View>

        <View style={[styles.section, shadow.sm]}>
          <View style={styles.sectionHeader}>
            <Settings color={colors.text.secondary} size={16} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Display Name</Text>
          </View>
          <TextInput
            style={styles.nameInput}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your chef name"
            placeholderTextColor={colors.text.muted}
          />
        </View>

        <View style={[styles.section, shadow.sm]}>
          <View style={styles.sectionHeader}>
            <ChefHat color={colors.text.secondary} size={16} strokeWidth={2} />
            <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          </View>
          <Text style={styles.sectionHint}>Select all that apply — recipes will be tailored for you.</Text>
          <View style={styles.prefsGrid}>
            {DIETARY_OPTIONS.map((pref) => {
              const active = selectedPrefs.includes(pref);
              return (
                <TouchableOpacity
                  key={pref}
                  style={[styles.prefChip, active && styles.prefChipActive]}
                  onPress={() => togglePref(pref)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.prefText, active && styles.prefTextActive]}>{pref}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, (saving || saveSuccess) && styles.saveBtnMuted]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color={colors.text.inverse} />
          ) : (
            <Text style={styles.saveBtnText}>{saveSuccess ? 'Saved!' : 'Save Changes'}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xl },
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
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signOutText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: colors.text.secondary,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  guestIconWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.xl,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  guestTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  guestDesc: {
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
  secondaryBtn: {
    paddingVertical: spacing.sm,
  },
  secondaryBtnText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: colors.green.dark,
  },
  avatarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.green.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 24,
    color: colors.text.inverse,
  },
  avatarInfo: { flex: 1 },
  avatarName: {
    fontFamily: 'Nunito-Bold',
    fontSize: 17,
    color: colors.text.primary,
    marginBottom: 4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emailText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: colors.text.muted,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  statNum: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 20,
    color: colors.text.primary,
  },
  statLabel: {
    fontFamily: 'Nunito-Regular',
    fontSize: 11,
    color: colors.text.muted,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: colors.text.primary,
  },
  sectionHint: {
    fontFamily: 'Nunito-Regular',
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  nameInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prefsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  prefChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  prefChipActive: {
    backgroundColor: colors.green.light,
    borderColor: colors.green.mid,
  },
  prefText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: colors.text.secondary,
  },
  prefTextActive: {
    color: colors.green.dark,
  },
  saveBtn: {
    backgroundColor: colors.green.main,
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  saveBtnMuted: { backgroundColor: colors.green.mid },
  saveBtnText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: colors.text.inverse,
  },
  bottomPad: { height: spacing.lg },
});
