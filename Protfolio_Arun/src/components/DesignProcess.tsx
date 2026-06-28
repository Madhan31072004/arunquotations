import React from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import theme from '../theme';
import SectionTitle from './ui/SectionTitle';
import ScrollReveal from './ui/ScrollReveal';

const STEPS = [
  // { num: '01', title: 'Consultation', desc: 'Understanding your vision, lifestyle, and requirements through in-depth discussion.', icon: '💬' },
  { num: '02', title: 'Concept Design', desc: 'Creating mood boards, style direction, and initial design concepts for approval.', icon: '🎨' },
  { num: '03', title: '3D Visualization', desc: 'Photorealistic 3D renders bringing the concept to life before execution.', icon: '🖥️' },
  { num: '04', title: 'Material Selection', desc: 'Curating the finest materials, fabrics, and finishes for your space.', icon: '🪵' },
  { num: '05', title: 'Site Execution', desc: 'Meticulous project management ensuring flawless on-site implementation.', icon: '🏗️' },
  { num: '06', title: 'Final Styling', desc: 'Art curation, accessory placement, and the finishing touches that make it home.', icon: '✨' },
];

export default function DesignProcess() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <View style={styles.container} nativeID="process">
      <View style={styles.inner}>
        <SectionTitle
          label="OUR PROCESS"
          title="From Vision to Reality"
          subtitle="A refined six-step journey ensuring every detail is thoughtfully crafted."
        />

        <View style={[styles.timeline, isDesktop && styles.timelineDesktop]}>
          {/* Connecting line */}
          {isDesktop && (
            <View style={[styles.connectLine, Platform.OS === 'web' ? {
              background: `linear-gradient(to bottom, transparent, ${theme.colors.primary}, transparent)`,
            } as any : { backgroundColor: theme.colors.border }]} />
          )}

          {STEPS.map((step, i) => {
            const isEven = i % 2 === 0;
            return (
              <ScrollReveal
                key={step.num}
                delay={i * 0.12}
                animation={isDesktop ? (isEven ? 'slideInLeft' : 'slideInRight') : 'fadeUp'}
                style={[
                  styles.stepRow,
                  isDesktop && styles.stepRowDesktop,
                  isDesktop && (isEven ? styles.stepLeft : styles.stepRight),
                ]}
              >
                {/* Step card */}
                <View style={[
                  styles.stepCard,
                  Platform.OS === 'web' ? {
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    transition: 'all 0.4s ease',
                  } as any : {},
                ]}>
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepIcon}>{step.icon}</Text>
                    <Text style={styles.stepNum}>{step.num}</Text>
                  </View>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>

                {/* Timeline node */}
                {isDesktop && (
                  <View style={[styles.node, Platform.OS === 'web' ? {
                    boxShadow: `0 0 20px ${theme.colors.goldGlow}`,
                    animation: `pulse 3s ease ${i * 0.5}s infinite`,
                  } as any : {}]} />
                )}
              </ScrollReveal>
            );
          })}
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
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  timeline: {
    position: 'relative',
    gap: 24,
  },
  timelineDesktop: {
    gap: 0,
  },
  connectLine: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 1,
    marginLeft: -0.5,
  },
  stepRow: {
    marginBottom: 24,
  },
  stepRowDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    paddingVertical: 24,
    width: '50%',
  },
  stepLeft: {
    alignSelf: 'flex-start',
    paddingRight: 40,
    alignItems: 'flex-end',
  },
  stepRight: {
    alignSelf: 'flex-end',
    paddingLeft: 40,
    alignItems: 'flex-start',
  },
  stepCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: theme.borderRadius.lg,
    padding: 28,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    maxWidth: 400,
    width: '100%',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stepIcon: {
    fontSize: 28,
  },
  stepNum: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.primary,
    fontWeight: '600',
    letterSpacing: 2,
  },
  stepTitle: {
    fontSize: 20,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepDesc: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    fontWeight: '300',
  },
  node: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    right: -7,
  },
});
