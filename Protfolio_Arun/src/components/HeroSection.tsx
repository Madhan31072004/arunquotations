import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions, Image } from 'react-native';
import theme from '../theme';

const heroImage = require('../../assets/LIVING AREA 3.jpeg');

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 8,
  duration: 8 + Math.random() * 12,
  size: 2 + Math.random() * 3,
  opacity: 0.1 + Math.random() * 0.3,
}));

const STATS = [
  { number: '150+', label: 'Projects Completed' },
  { number: '10+', label: 'Years Experience' },
  { number: '98%', label: 'Client Satisfaction' },
];

export default function HeroSection() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const heroRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !heroRef.current) return;
    const el = heroRef.current as unknown as HTMLElement;
    el.style.minHeight = '100vh';
  }, []);

  const scrollTo = (id: string) => {
    if (Platform.OS !== 'web') return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <View ref={heroRef} style={styles.container} nativeID="hero">
      {/* Background with Ken Burns effect */}
      <View style={styles.bgContainer}>
        <Image source={heroImage} style={[styles.bgImage, Platform.OS === 'web' ? {
          animation: 'kenBurns 25s ease-in-out infinite alternate',
        } as any : {}]} resizeMode="cover" />
        <View style={styles.overlay} />
        <View style={styles.overlayGradient} />
      </View>

      {/* Floating particles */}
      {Platform.OS === 'web' && PARTICLES.map((p) => (
        <View key={p.id} style={[styles.particle, {
          left: `${p.left}%` as any,
          width: p.size,
          height: p.size,
          opacity: p.opacity,
          animation: `particleFloat ${p.duration}s linear ${p.delay}s infinite`,
        } as any]} />
      ))}

      {/* Content */}
      <View style={[styles.content, isDesktop && styles.contentDesktop]}>
        <View style={[styles.textSection, isDesktop && styles.textDesktop]}>
          {/* Tagline label */}
          <View style={[styles.taglineRow, Platform.OS === 'web' ? {
            animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.3s forwards',
            opacity: 0,
          } as any : {}]}>
            <View style={styles.taglineLine} />
            <Text style={styles.taglineText}>INTERIOR DESIGNER & CREATIVE VISIONARY</Text>
          </View>

          {/* Main heading */}
          <View style={Platform.OS === 'web' ? {
            animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.5s forwards',
            opacity: 0,
          } as any : {}}>
            <Text style={[styles.heading, isDesktop && styles.headingDesktop]}>
              Designing{'\n'}Spaces That{'\n'}Feel{' '}
              <Text style={styles.headingAccent}>Timeless</Text>
            </Text>
          </View>

          {/* Subtitle */}
          <View style={Platform.OS === 'web' ? {
            animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.7s forwards',
            opacity: 0,
          } as any : {}}>
            <Text style={styles.subtitle}>
              Luxury interiors crafted with elegance, precision,{'\n'}and modern aesthetics by Arun Kumar.
            </Text>
          </View>

          {/* CTA Buttons */}
          <View style={[styles.ctaRow, Platform.OS === 'web' ? {
            animation: 'fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.9s forwards',
            opacity: 0,
          } as any : {}]}>
            <Pressable
              onPress={() => scrollTo('projects')}
              style={({ hovered }: any) => [styles.btnPrimary, hovered && styles.btnPrimaryHover]}
            >
              <Text style={styles.btnPrimaryText}>View Projects</Text>
            </Pressable>
            {/* <Pressable
              onPress={() => scrollTo('contact')}
              style={({ hovered }: any) => [styles.btnSecondary, hovered && styles.btnSecondaryHover]}
            >
              <Text style={styles.btnSecondaryText}>Book Consultation</Text>
            </Pressable> */}
          </View>
        </View>

        {/* Stats cards (desktop) */}
        {isDesktop && (
          <View style={[styles.statsColumn, Platform.OS === 'web' ? {
            animation: 'slideInRight 1s cubic-bezier(0.16,1,0.3,1) 1.1s forwards',
            opacity: 0,
          } as any : {}]}>
            {STATS.map((stat, i) => (
              <View key={i} style={[styles.statCard, Platform.OS === 'web' ? {
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                animation: `float 4s ease-in-out ${i * 0.5}s infinite`,
                transition: 'all 0.3s ease',
              } as any : {}]}>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Scroll indicator */}
      <View style={[styles.scrollIndicator, Platform.OS === 'web' ? {
        animation: 'bounce 2s ease infinite',
        position: 'absolute',
        bottom: 40,
        left: '50%',
      } as any : {}]}>
        <View style={styles.scrollLine} />
        <Text style={styles.scrollText}>SCROLL</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.background,
  },
  bgContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  bgImage: {
    position: 'absolute',
    top: -20, left: -20, right: -20, bottom: -20,
    width: '110%',
    height: '110%',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  overlayGradient: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    height: 200,
    backgroundColor: 'transparent',
  },
  particle: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 120,
    paddingTop: 140,
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
    zIndex: 10,
  },
  contentDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 60,
  },
  textSection: {
    flex: 1,
    maxWidth: 700,
  },
  textDesktop: { maxWidth: 650 },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  taglineLine: {
    width: 40,
    height: 1,
    backgroundColor: theme.colors.primary,
  },
  taglineText: {
    fontSize: 11,
    fontFamily: theme.fonts.body,
    color: theme.colors.primary,
    letterSpacing: 4,
    fontWeight: '500',
  },
  heading: {
    fontSize: 48,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text,
    fontWeight: '700',
    lineHeight: 58,
    marginBottom: 24,
  },
  headingDesktop: {
    fontSize: 68,
    lineHeight: 80,
  },
  headingAccent: {
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 17,
    fontFamily: theme.fonts.body,
    color: 'rgba(245,240,232,0.7)',
    lineHeight: 28,
    fontWeight: '300',
    marginBottom: 40,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  btnPrimary: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.full,
  },
  btnPrimaryHover: {
    backgroundColor: '#d4b478',
  },
  btnPrimaryText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.background,
    fontWeight: '600',
    letterSpacing: 1,
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(245,240,232,0.3)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.full,
  },
  btnSecondaryHover: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(201,169,110,0.1)',
  },
  btnSecondaryText: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    fontWeight: '500',
    letterSpacing: 1,
  },
  statsColumn: {
    gap: 20,
    marginLeft: 40,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: 28,
    paddingVertical: 22,
    minWidth: 200,
  },
  statNumber: {
    fontSize: 36,
    fontFamily: theme.fonts.heading,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    fontWeight: '400',
    marginTop: 4,
    letterSpacing: 1,
  },
  scrollIndicator: {
    alignItems: 'center',
    gap: 8,
    alignSelf: 'center',
    zIndex: 10,
  },
  scrollLine: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(245,240,232,0.3)',
  },
  scrollText: {
    fontSize: 10,
    color: 'rgba(245,240,232,0.4)',
    letterSpacing: 3,
    fontFamily: theme.fonts.body,
  },
});
