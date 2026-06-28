import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../theme';
import ScrollReveal from './ScrollReveal';

interface SectionTitleProps {
  label?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  align?: 'left' | 'center';
}

export default function SectionTitle({ label, title, subtitle, light, align = 'center' }: SectionTitleProps) {
  return (
    <ScrollReveal style={[styles.container, align === 'center' && styles.centered]}>
      {label && (
        <Text style={[styles.label, light && styles.labelLight]}>{label}</Text>
      )}
      <Text style={[styles.title, light && styles.titleLight, align === 'center' && { textAlign: 'center' }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, align === 'center' && { textAlign: 'center' }]}>
          {subtitle}
        </Text>
      )}
      <View style={[styles.line, align === 'center' && styles.lineCentered]} />
    </ScrollReveal>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: theme.spacing.xxl },
  centered: { alignItems: 'center' },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontFamily: theme.fonts.body,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
    fontWeight: '500',
  },
  labelLight: { color: theme.colors.secondary },
  title: {
    fontSize: theme.fontSize.xxxl,
    color: theme.colors.text,
    fontFamily: theme.fonts.heading,
    fontWeight: '600',
    marginBottom: theme.spacing.md,
    lineHeight: 50,
  },
  titleLight: { color: theme.colors.text },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    maxWidth: 600,
    lineHeight: 28,
    fontWeight: '300',
  },
  line: {
    width: 60,
    height: 2,
    backgroundColor: theme.colors.primary,
    marginTop: theme.spacing.lg,
    borderRadius: 1,
  },
  lineCentered: { alignSelf: 'center' },
});
