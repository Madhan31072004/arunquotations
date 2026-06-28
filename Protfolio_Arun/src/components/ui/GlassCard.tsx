import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import theme from '../../theme';

interface GlassCardProps {
  children?: React.ReactNode;
  style?: any;
  intensity?: 'light' | 'medium' | 'strong';
  glow?: boolean;
}

export default function GlassCard({ children, style, intensity = 'medium', glow = false }: GlassCardProps) {
  const bg = intensity === 'light' ? 'rgba(255,255,255,0.03)'
    : intensity === 'strong' ? 'rgba(255,255,255,0.1)'
    : 'rgba(255,255,255,0.06)';

  const blur = intensity === 'light' ? 12 : intensity === 'strong' ? 30 : 20;

  const webStyle = Platform.OS === 'web' ? {
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    ...(glow ? { boxShadow: `0 0 30px ${theme.colors.goldGlow}` } : {}),
  } : {};

  return (
    <View style={[styles.card, { backgroundColor: bg }, webStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    padding: theme.spacing.lg,
    overflow: 'hidden',
  },
});
