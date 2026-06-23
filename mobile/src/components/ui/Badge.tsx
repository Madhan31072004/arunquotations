import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/lib/theme';

interface BadgeProps {
  text: string;
  color?: string;
  variant?: 'solid' | 'soft' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  text,
  color = Colors.primary,
  variant = 'soft',
  size = 'sm',
}: BadgeProps) {
  const backgroundColor =
    variant === 'solid'
      ? color
      : variant === 'soft'
      ? `${color}20`
      : 'transparent';

  const textColor = variant === 'solid' ? '#FFFFFF' : color;
  const borderColor = variant === 'outline' ? color : 'transparent';

  return (
    <View
      style={[
        styles.base,
        styles[`size_${size}`],
        { backgroundColor, borderColor, borderWidth: variant === 'outline' ? 1 : 0 },
      ]}
    >
      <Text style={[styles.text, styles[`text_${size}`], { color: textColor }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.round,
  },
  size_sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  size_md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  text: {
    fontWeight: FontWeight.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  text_sm: {
    fontSize: FontSize.xs,
  },
  text_md: {
    fontSize: FontSize.sm,
  },
});
