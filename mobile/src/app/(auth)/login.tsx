import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/lib/theme';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/features/auth/authStore';
import { useResponsive } from '@/hooks/useResponsive';
import api from '@/lib/api';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsive();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      setAuth(res.data.user, res.data.token);
      router.replace('/(main)/(tabs)/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <View style={[styles.formContainer, isDesktop && styles.formContainerDesktop]}>
      {/* Logo */}
      <View style={styles.logoSection}>
        <View style={styles.logoCircle}>
          <Ionicons name="diamond" size={36} color={Colors.primary} />
        </View>
        <Text style={styles.appName}>{APP_NAME}</Text>
        <Text style={styles.tagline}>{APP_TAGLINE}</Text>
      </View>

      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome back</Text>
        <Text style={styles.welcomeSubtitle}>Sign in to manage your quotations</Text>
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Form */}
      <Input
        label="Email Address"
        placeholder="designer@example.com"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        required
      />

      <Input
        label="Password"
        placeholder="Enter your password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        required
      />

      <TouchableOpacity style={styles.forgotButton}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <Button
        title="Sign In"
        onPress={handleLogin}
        loading={loading}
        fullWidth
        size="lg"
        style={{ marginTop: Spacing.lg }}
      />

      {/* Register link */}
      <View style={styles.registerSection}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.registerLink}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        {/* Left: Decorative panel */}
        <View style={styles.heroPanel}>
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <Ionicons name="diamond" size={64} color={Colors.primary} />
              <Text style={styles.heroTitle}>Design. Quote.{'\n'}Deliver.</Text>
              <Text style={styles.heroSubtitle}>
                Create professional interior design quotations{'\n'}in minutes, not hours.
              </Text>
              <View style={styles.heroFeatures}>
                {['Area-wise pricing', 'Live PDF preview', 'Branded documents'].map(
                  (f, i) => (
                    <View key={i} style={styles.heroFeatureRow}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                      <Text style={styles.heroFeatureText}>{f}</Text>
                    </View>
                  )
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Right: Form */}
        <ScrollView
          contentContainerStyle={styles.desktopFormScroll}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.mobileContainer}
    >
      <ScrollView
        contentContainerStyle={[
          styles.mobileScroll,
          { paddingTop: insets.top + Spacing.xxl, paddingBottom: insets.bottom + Spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {content}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Mobile
  mobileContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mobileScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },

  // Desktop
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.background,
  },
  heroPanel: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.huge,
  },
  heroContent: {
    maxWidth: 440,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: FontWeight.extraBold,
    color: Colors.textPrimary,
    marginTop: Spacing.xxl,
    lineHeight: 52,
  },
  heroSubtitle: {
    fontSize: FontSize.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    lineHeight: 26,
  },
  heroFeatures: {
    marginTop: Spacing.xxxl,
    gap: Spacing.lg,
  },
  heroFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  heroFeatureText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },

  desktopFormScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.huge,
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
  },

  formContainer: {
    width: '100%',
  },
  formContainerDesktop: {
    maxWidth: 400,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.gold,
  },
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Welcome
  welcomeSection: {
    marginBottom: Spacing.xxl,
  },
  welcomeTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  welcomeSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    flex: 1,
  },

  // Forgot
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
  },
  forgotText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
  },

  // Register
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xxl,
  },
  registerText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  registerLink: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: FontWeight.semiBold,
  },
});
