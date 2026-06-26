import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow, Layout } from '@/lib/theme';
import { APP_NAME } from '@/lib/constants';
import { useCompanyProfile } from '@/features/data/apiHooks';

interface NavItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'grid-outline', iconActive: 'grid', route: '/(main)/(tabs)/dashboard' },
  { label: 'Quotations', icon: 'document-text-outline', iconActive: 'document-text', route: '/(main)/(tabs)/quotations' },
  { label: 'Clients', icon: 'people-outline', iconActive: 'people', route: '/(main)/(tabs)/clients' },
  { label: 'Materials', icon: 'cube-outline', iconActive: 'cube', route: '/(main)/(tabs)/materials' },
  { label: 'Settings', icon: 'settings-outline', iconActive: 'settings', route: '/(main)/(tabs)/settings' },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: company } = useCompanyProfile();

  return (
    <View style={styles.container}>
      {/* Logo / Brand */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          {company?.logo ? (
            <Image source={{ uri: company.logo }} style={{ width: 44, height: 44, borderRadius: BorderRadius.md }} />
          ) : (
            <Ionicons name="diamond" size={28} color={Colors.primary} />
          )}
        </View>
        <Text style={styles.brandName}>{company?.companyName || APP_NAME}</Text>
        <Text style={styles.brandTagline}>{company?.tagline || 'Interior Design Studio'}</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Navigation */}
      <ScrollView style={styles.navSection} showsVerticalScrollIndicator={false}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.includes(item.route.split('/').pop() || '');
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.navIconWrapper, isActive && styles.navIconWrapperActive]}>
                <Ionicons
                  name={isActive ? item.iconActive : item.icon}
                  size={20}
                  color={isActive ? Colors.primary : Colors.textTertiary}
                />
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom section */}
      <View style={styles.bottomSection}>
        <View style={styles.divider} />
        <TouchableOpacity 
          style={styles.navItem} 
          activeOpacity={0.7}
          onPress={() => {
            if (Platform.OS === 'web') {
              window.alert('Please contact the administrator for support at support@arunquotations.com');
            } else {
              import('react-native').then(({ Alert }) => {
                Alert.alert('Help & Support', 'Please contact the administrator for support at support@arunquotations.com');
              });
            }
          }}
        >
          <View style={styles.navIconWrapper}>
            <Ionicons name="help-circle-outline" size={20} color={Colors.textTertiary} />
          </View>
          <Text style={styles.navLabel}>Help & Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Layout.sidebarWidth,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingTop: Platform.OS === 'web' ? Spacing.xxl : Spacing.huge,
    height: '100%',
  },
  brandSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1,
    borderColor: Colors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  brandName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  brandTagline: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  navSection: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: 2,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: Colors.primaryGlow,
  },
  navIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapperActive: {
    backgroundColor: Colors.primaryGlow,
  },
  navLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginLeft: Spacing.md,
  },
  navLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.semiBold,
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: '25%',
    bottom: '25%',
    width: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  bottomSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
});
