import React from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import theme from '../theme';
import SectionTitle from './ui/SectionTitle';
import ScrollReveal from './ui/ScrollReveal';
import AnimatedCounter from './ui/AnimatedCounter';
import GlassCard from './ui/GlassCard';

const SERVICES = [
  { icon: '◈', title: 'Residential Design', desc: 'Luxury homes & apartments' },
  { icon: '◇', title: 'Commercial Spaces', desc: 'Offices, cafés & retail' },
  { icon: '△', title: '3D Visualization', desc: 'Photorealistic renders' },
  { icon: '○', title: 'Space Planning', desc: 'Functional layouts' },
];

export default function AboutSection() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <View style={styles.container} nativeID="about">
      <View style={[styles.inner, isDesktop && styles.innerDesktop]}>
        {/* Left — Image */}
        <ScrollReveal animation="slideInLeft" style={[styles.imageCol, isDesktop && styles.imageColDesktop]}>
          <View style={[styles.imageWrapper, Platform.OS === 'web' ? {
            backgroundImage: 'url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } as any : {}]}>
            {/* Glow effect behind image */}
            <View style={[styles.imageGlow, Platform.OS === 'web' ? {
              boxShadow: '0 0 80px rgba(201,169,110,0.15)',
            } as any : {}]} />
          </View>

          {/* Floating experience card */}
          <GlassCard glow style={[styles.expCard, Platform.OS === 'web' ? {
            animation: 'floatSlow 6s ease-in-out infinite',
            position: 'absolute' as any,
            bottom: -20,
            right: isDesktop ? -30 : 20,
          } as any : {}]}>
            <Text style={styles.expNumber}>10+</Text>
            <Text style={styles.expLabel}>Years of{'\n'}Excellence</Text>
          </GlassCard>
        </ScrollReveal>

        {/* Right — Content */}
        <View style={[styles.textCol, isDesktop && styles.textColDesktop]}>
          <SectionTitle
            label="ABOUT US"
            title="Designing Experiences, Not Just Spaces"
            align="left"
          />

          <ScrollReveal delay={0.2}>
            <Text style={styles.description}>
              Arun Kumar is a passionate interior designer with a modern vision for luxury living.
              With a strong eye for aesthetics, space planning, and contemporary elegance, he creates
              interiors that blend functionality with timeless beauty.
            </Text>
          </ScrollReveal>

          <ScrollReveal delay={0.3}>
            <Text style={styles.philosophy}>
              "Every project is designed to reflect the client's personality while maximizing
              comfort and visual harmony."
            </Text>
          </ScrollReveal>

          {/* Stats Row */}
          <ScrollReveal delay={0.4} style={styles.statsRow}>
            <View style={styles.statItem}>
              <AnimatedCounter target={150} suffix="+" />
              <Text style={styles.statLabel}>Projects</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <AnimatedCounter target={98} suffix="%" />
              <Text style={styles.statLabel}>Satisfaction</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <AnimatedCounter target={50} suffix="+" />
              <Text style={styles.statLabel}>Happy Clients</Text>
            </View>
          </ScrollReveal>

          {/* Services Grid */}
          <ScrollReveal delay={0.5}>
            <View style={styles.servicesGrid}>
              {SERVICES.map((s, i) => (
                <View key={i} style={[styles.serviceItem, Platform.OS === 'web' ? {
                  transition: 'all 0.3s ease',
                } as any : {}]}>
                  <Text style={styles.serviceIcon}>{s.icon}</Text>
                  <View>
                    <Text style={styles.serviceTitle}>{s.title}</Text>
                    <Text style={styles.serviceDesc}>{s.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollReveal>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.section,
    paddingHorizontal: 24,
  },
  inner: {
    maxWidth: 1300,
    width: '100%',
    alignSelf: 'center',
  },
  innerDesktop: {
    flexDirection: 'row',
    gap: 80,
    alignItems: 'center',
  },
  imageCol: {
    position: 'relative',
    marginBottom: 48,
  },
  imageColDesktop: {
    flex: 0.45,
    marginBottom: 0,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  imageGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: theme.borderRadius.xl,
  },
  expCard: {
    position: 'absolute',
    bottom: -20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  expNumber: {
    fontSize: 36,
    fontFamily: theme.fonts.heading,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  expLabel: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  textCol: {
    flex: 1,
  },
  textColDesktop: {
    flex: 0.55,
  },
  description: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: 'rgba(245,240,232,0.75)',
    lineHeight: 28,
    fontWeight: '300',
    marginBottom: 24,
  },
  philosophy: {
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    color: theme.colors.primary,
    fontStyle: 'italic',
    lineHeight: 30,
    marginBottom: 32,
    paddingLeft: 20,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 24,
    flexWrap: 'wrap',
  },
  statItem: { alignItems: 'center' },
  statLabel: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.glassBorder,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    minWidth: 200,
    flex: 1,
  },
  serviceIcon: {
    fontSize: 20,
    color: theme.colors.primary,
  },
  serviceTitle: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  serviceDesc: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
