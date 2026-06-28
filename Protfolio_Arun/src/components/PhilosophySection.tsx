import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import theme from '../theme';

export default function PhilosophySection() {
  const { width } = useWindowDimensions();
  const sectionRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !sectionRef.current) return;
    const el = sectionRef.current as unknown as HTMLElement;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.querySelectorAll('[data-anim]').forEach((child, i) => {
          (child as HTMLElement).style.animation =
            `fadeUp 1.2s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.2}s forwards`;
        });
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <View ref={sectionRef} style={styles.container}>
      {/* Background image with overlay */}
      <View style={[styles.bg, Platform.OS === 'web' ? {
        backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=60)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: width >= 900 ? 'fixed' : 'scroll',
      } as any : {}]} />
      <View style={styles.overlay} />

      {/* Grain texture */}
      <View style={[styles.grain, Platform.OS === 'web' ? {
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.04,
      } as any : {}]} />

      {/* Content */}
      <View style={styles.content}>
        <View nativeID="anim" style={Platform.OS === 'web' ? { opacity: 0 } as any : {}}>
          <Text style={styles.label} {...{ dataSet: { anim: true } } as any}>DESIGN PHILOSOPHY</Text>
        </View>

        <View nativeID="anim2" style={Platform.OS === 'web' ? { opacity: 0 } as any : {}}>
          <Text style={[styles.quote, { maxWidth: width >= 900 ? 900 : '100%' }]} {...{ dataSet: { anim: true } } as any}>
            "A beautifully designed space should not only look luxurious but also feel emotionally
            connected to the people living within it."
          </Text>
        </View>

        <View nativeID="anim3" style={Platform.OS === 'web' ? { opacity: 0 } as any : {}}>
          <View style={styles.authorRow} {...{ dataSet: { anim: true } } as any}>
            <View style={styles.authorLine} />
            <View>
              <Text style={styles.authorName}>Arun Kumar</Text>
              <Text style={styles.authorTitle}>Founder & Lead Designer</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingVertical: 120,
    paddingHorizontal: 24,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bg: {
    position: 'absolute',
    top: -50, left: 0, right: 0, bottom: -50,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(10,10,10,0.8)',
  },
  grain: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
  },
  content: {
    maxWidth: 1000,
    alignItems: 'center',
    zIndex: 10,
    gap: 32,
  },
  label: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: theme.colors.primary,
    letterSpacing: 4,
    fontWeight: '500',
    textAlign: 'center',
  },
  quote: {
    fontSize: 32,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text,
    fontStyle: 'italic',
    lineHeight: 48,
    textAlign: 'center',
    fontWeight: '400',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  authorLine: {
    width: 40,
    height: 1,
    backgroundColor: theme.colors.primary,
  },
  authorName: {
    fontSize: 16,
    fontFamily: theme.fonts.heading,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  authorTitle: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
