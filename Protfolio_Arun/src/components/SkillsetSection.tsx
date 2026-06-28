import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import theme from '../theme';
import SectionTitle from './ui/SectionTitle';
import ScrollReveal from './ui/ScrollReveal';

const SKILLS = [
  {
    name: 'SketchUp',
    category: '3D Modeling',
    level: 95,
    desc: 'Advanced 3D modeling for architectural & interior visualization',
    icon: '🏗️',
  },
  {
    name: 'Enscape',
    category: 'Real-time Rendering',
    level: 90,
    desc: 'Real-time rendering & virtual walkthroughs with photorealism',
    icon: '🎬',
  },
  {
    name: 'AutoCAD',
    category: '2D Drafting',
    level: 92,
    desc: 'Precision 2D drafting, floor plans & construction drawings',
    icon: '📐',
  },
  {
    name: 'V-Ray',
    category: 'Photorealistic Rendering',
    level: 88,
    desc: 'High-quality photorealistic renders with advanced lighting',
    icon: '✨',
  },
  {
    name: 'D5 Render',
    category: 'Real-time Rendering',
    level: 85,
    desc: 'Real-time rendering with cinematic quality & GPU acceleration',
    icon: '🎥',
  },
  {
    name: 'Canva with AI',
    category: 'Design & Presentation',
    level: 90,
    desc: 'AI-powered mood boards, presentations & social media content',
    icon: '🎨',
  },
  {
    name: 'Coohom',
    category: '3D Design & Planning',
    level: 87,
    desc: 'Cloud-based 3D interior design, rendering & space planning',
    icon: '🏠',
  },
];

export default function SkillsetSection() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <View style={styles.container} nativeID="skillset">
      <View style={styles.inner}>
        <SectionTitle
          label="SKILLSET"
          title="Tools & Expertise"
          subtitle="Mastering industry-leading software to bring your design vision to life with precision and creativity."
        />

        {/* Skills Grid */}
        <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
          {SKILLS.map((skill, i) => (
            <ScrollReveal key={skill.name} delay={i * 0.1} animation="fadeUp">
              <Pressable
                onHoverIn={() => setHoveredIdx(i)}
                onHoverOut={() => setHoveredIdx(null)}
                style={[
                  styles.card,
                  Platform.OS === 'web' ? {
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    ...(hoveredIdx === i ? {
                      transform: 'translateY(-6px)',
                      boxShadow: `0 16px 48px rgba(201,169,110,0.12)`,
                      borderColor: 'rgba(201,169,110,0.3)',
                    } : {}),
                  } as any : {},
                ]}
              >
                {/* Icon & Category */}
                <View style={styles.cardHeader}>
                  <Text style={styles.icon}>{skill.icon}</Text>
                  <Text style={styles.category}>{skill.category}</Text>
                </View>

                {/* Name */}
                <Text style={styles.skillName}>{skill.name}</Text>

                {/* Description */}
                <Text style={styles.desc}>{skill.desc}</Text>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>Proficiency</Text>
                    <Text style={styles.progressValue}>{skill.level}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[
                      styles.progressBar,
                      {
                        width: hoveredIdx === i || !Platform.OS ? `${skill.level}%` as any : `${skill.level}%`,
                      },
                      Platform.OS === 'web' ? {
                        transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                        boxShadow: hoveredIdx === i
                          ? `0 0 12px ${theme.colors.goldGlow}`
                          : 'none',
                      } as any : { backgroundColor: theme.colors.primary },
                    ]} />
                  </View>
                </View>
              </Pressable>
            </ScrollReveal>
          ))}
        </View>

        {/* Additional tools row */}
        <ScrollReveal delay={0.5} style={styles.extraTools}>
          <Text style={styles.extraLabel}>Also proficient in</Text>
          <View style={styles.extraRow}>
            {['Photoshop', 'Lumion', 'Blender', 'Revit', 'Pinterest'].map((tool) => (
              <View key={tool} style={[styles.extraPill, Platform.OS === 'web' ? {
                transition: 'all 0.3s ease',
              } as any : {}]}>
                <Text style={styles.extraPillText}>{tool}</Text>
              </View>
            ))}
          </View>
        </ScrollReveal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.section,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  inner: {
    maxWidth: 1300,
    width: '100%',
    alignSelf: 'center',
  },
  grid: {
    gap: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  gridDesktop: {
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: theme.borderRadius.xl,
    padding: 28,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    width: 280,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    fontSize: 32,
  },
  category: {
    fontSize: 10,
    fontFamily: theme.fonts.body,
    color: theme.colors.primary,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    backgroundColor: 'rgba(201,169,110,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  skillName: {
    fontSize: 22,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    fontWeight: '300',
  },
  progressContainer: {
    marginTop: 4,
    gap: 6,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
    fontWeight: '400',
  },
  progressValue: {
    fontSize: 13,
    fontFamily: theme.fonts.heading,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  extraTools: {
    alignItems: 'center',
    marginTop: 56,
    gap: 16,
  },
  extraLabel: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '400',
  },
  extraRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  extraPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  extraPillText: {
    fontSize: 13,
    fontFamily: theme.fonts.body,
    color: 'rgba(245,240,232,0.6)',
    fontWeight: '400',
  },
});
