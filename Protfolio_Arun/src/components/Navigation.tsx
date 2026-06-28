import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useScrollPosition } from '../hooks/useScrollPosition';
import theme from '../theme';

const NAV_LINKS = [
  { label: 'About', id: 'about' },
  { label: 'Projects', id: 'projects' },
  { label: 'Process', id: 'process' },
  { label: 'Skillset', id: 'skillset' },
  { label: 'Resume', id: 'resume' },
  { label: 'Contact', id: 'contact' },
];

export default function Navigation() {
  const { scrollY } = useScrollPosition();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = scrollY > 80;
  const isDesktop = width >= 900;

  const scrollTo = (id: string) => {
    if (Platform.OS !== 'web') return;
    setMenuOpen(false);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const navBg = scrolled
    ? 'rgba(10,10,10,0.85)'
    : 'rgba(10,10,10,0.2)';

  const webStyle = Platform.OS === 'web' ? {
    backdropFilter: scrolled ? 'blur(20px)' : 'blur(5px)',
    WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'blur(5px)',
    transition: 'all 0.4s ease',
    position: 'fixed' as const,
    top: 0, left: 0, right: 0,
    zIndex: 1000,
  } : {};

  return (
    <>
      <View style={[styles.nav, { backgroundColor: navBg }, webStyle, scrolled && styles.navScrolled]}>
        <View style={styles.inner}>
          <Pressable onPress={() => scrollTo('hero')}>
            <Text style={styles.logo}>ARUN</Text>
            <Text style={styles.logoSub}>INTERIORS</Text>
          </Pressable>

          {/* Desktop Nav — only render on desktop */}
          {isDesktop && (
            <View style={styles.links}>
              {NAV_LINKS.map((link) => (
                <Pressable
                  key={link.id}
                  onPress={() => scrollTo(link.id)}
                  style={({ hovered }: any) => [styles.linkWrap, hovered && styles.linkHover]}
                >
                  <Text style={styles.linkText}>{link.label}</Text>
                </Pressable>
              ))}
              {/* <Pressable
                onPress={() => scrollTo('contact')}
                style={({ hovered }: any) => [styles.cta, hovered && styles.ctaHover]}
              >
                <Text style={styles.ctaText}>Book Consultation</Text>
              </Pressable> */}
            </View>
          )}

          {/* Mobile hamburger — only render on mobile */}
          {!isDesktop && (
            <Pressable style={styles.hamburger} onPress={() => setMenuOpen(!menuOpen)}>
              <View style={[styles.hamLine, menuOpen && styles.hamLine1Open]} />
              <View style={[styles.hamLine, menuOpen && styles.hamLine2Open]} />
              <View style={[styles.hamLine, menuOpen && styles.hamLine3Open]} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Mobile Menu Overlay */}
      {menuOpen && !isDesktop && (
        <View style={[styles.mobileMenu, Platform.OS === 'web' ? {
          position: 'fixed' as any,
          zIndex: 999,
        } : {}]}>
          {NAV_LINKS.map((link, i) => (
            <Pressable key={link.id} onPress={() => scrollTo(link.id)}>
              <Text style={[styles.mobileLink, Platform.OS === 'web' ? {
                animation: `fadeUp 0.5s ease ${i * 0.1}s forwards`,
                opacity: 0,
              } as any : {}]}>
                {link.label}
              </Text>
            </Pressable>
          ))}
          {/* <Pressable
            onPress={() => scrollTo('contact')}
            style={styles.mobileCta}
          >
            <Text style={styles.mobileCtaText}>Book Consultation</Text>
          </Pressable> */}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  nav: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  navScrolled: {
    borderBottomColor: theme.colors.glassBorder,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
  },
  logo: {
    fontSize: 22,
    fontFamily: theme.fonts.heading,
    color: theme.colors.primary,
    fontWeight: '700',
    letterSpacing: 4,
  },
  logoSub: {
    fontSize: 9,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    letterSpacing: 6,
    fontWeight: '400',
    marginTop: -2,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  linkWrap: { paddingVertical: 4 },
  linkHover: { borderBottomWidth: 1, borderBottomColor: theme.colors.primary },
  linkText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    fontWeight: '400',
    letterSpacing: 1,
  },
  cta: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  ctaHover: { backgroundColor: theme.colors.primary },
  ctaText: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.primary,
    fontWeight: '500',
    letterSpacing: 1,
  },
  hamburger: {
    width: 28,
    height: 20,
    justifyContent: 'space-between',
  },
  hamLine: {
    width: 28,
    height: 2,
    backgroundColor: theme.colors.text,
    borderRadius: 1,
  },
  hamLine1Open: { transform: [{ rotate: '45deg' }, { translateY: 9 }] },
  hamLine2Open: { opacity: 0 },
  hamLine3Open: { transform: [{ rotate: '-45deg' }, { translateY: -9 }] },
  mobileMenu: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10,10,10,0.97)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  mobileLink: {
    fontSize: 28,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text,
    fontWeight: '500',
    letterSpacing: 2,
    textAlign: 'center',
  },
  mobileCta: {
    marginTop: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  mobileCtaText: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.primary,
    fontWeight: '500',
    letterSpacing: 1,
  },
});
