import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Linking } from 'react-native';
import theme from '../theme';

const SOCIAL_LINKS = [
  { label: 'Ig', name: 'Instagram', url: 'https://www.instagram.com/3d_design_diariies?igsh=MzRpc3UzejV3b2t1' },
  { label: 'Li', name: 'LinkedIn', url: 'https://www.linkedin.com/in/arun-kumar-gopaldas-482a0022b?utm_source=share_via&utm_content=profile&utm_medium=member_ios' },
  { label: 'Be', name: 'Behance', url: 'https://behance.net' },
  { label: 'Wa', name: 'WhatsApp', url: 'https://wa.me/918498997856' },
];

const FOOTER_LINKS = [
  { label: 'About', id: 'about' },
  { label: 'Projects', id: 'projects' },
  { label: 'Process', id: 'process' },
  { label: 'Resume', id: 'resume' },
  { label: 'Contact', id: 'contact' },
];

export default function Footer() {
  const scrollTo = (id: string) => {
    if (Platform.OS !== 'web') return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn(`Don't know how to open URI: ${url}`);
      }
    } catch (error) {
      console.error(`An error occurred opening URL ${url}:`, error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated line separator */}
      <View style={[styles.separator, Platform.OS === 'web' ? {
        background: `linear-gradient(to right, transparent, ${theme.colors.primary}, transparent)`,
      } as any : { backgroundColor: theme.colors.border }]} />

      <View style={styles.inner}>
        {/* Top row */}
        <View style={styles.topRow}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <Text style={styles.logo}>ARUN</Text>
            <Text style={styles.logoSub}>INTERIORS</Text>
            <Text style={styles.tagline}>Crafting Elegant Living Spaces</Text>
          </View>

          {/* Quick links */}
          <View style={styles.linksSection}>
            <Text style={styles.linksTitle}>Quick Links</Text>
            {FOOTER_LINKS.map((link) => (
              <Pressable key={link.id} onPress={() => scrollTo(link.id)}>
                <Text style={styles.footerLink}>{link.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Social */}
          <View style={styles.socialSection}>
            <Text style={styles.linksTitle}>Follow Us</Text>
            <View style={styles.socialGrid}>
              {SOCIAL_LINKS.map((s) => (
                <Pressable key={s.name} onPress={() => handlePress(s.url)} style={({ hovered }: any) => [
                  styles.socialBtn,
                  Platform.OS === 'web' ? { transition: 'all 0.3s ease' } as any : {},
                  hovered && styles.socialBtnHover,
                ]}>
                  <Text style={styles.socialLabel}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom bar */}
        <View style={styles.bottom}>
          <Text style={styles.copyright}>
            © 2024 Arun Kumar Interiors. All rights reserved.
          </Text>
          <Text style={styles.craftedBy}>
            Crafted with passion by Arun Kumar ✦
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingTop: 0,
  },
  separator: {
    height: 1,
    width: '100%',
  },
  inner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  topRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 40,
    marginBottom: 48,
  },
  logoSection: { minWidth: 200 },
  logo: {
    fontSize: 28,
    fontFamily: theme.fonts.heading,
    color: theme.colors.primary,
    fontWeight: '700',
    letterSpacing: 6,
  },
  logoSub: {
    fontSize: 10,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    letterSpacing: 8,
    marginTop: -2,
  },
  tagline: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
    fontWeight: '300',
  },
  linksSection: { gap: 12 },
  linksTitle: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.primary,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  footerLink: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontWeight: '300',
  },
  socialSection: { gap: 12 },
  socialGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  socialBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  socialBtnHover: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  socialLabel: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  bottom: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.glassBorder,
    paddingTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  copyright: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontWeight: '300',
  },
  craftedBy: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.primary,
    fontWeight: '400',
    fontStyle: 'italic',
  },
});
