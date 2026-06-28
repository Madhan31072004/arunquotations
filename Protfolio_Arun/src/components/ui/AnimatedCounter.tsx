import React, { useEffect, useState } from 'react';
import { Text, View, Platform } from 'react-native';
import { useInView } from '../../hooks/useInView';
import theme from '../../theme';

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  style?: any;
}

export default function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2000, style }: AnimatedCounterProps) {
  const [ref, inView] = useInView(0.3);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return (
    <View ref={ref as any}>
      <Text style={[{
        fontSize: theme.fontSize.xxxl,
        color: theme.colors.primary,
        fontFamily: theme.fonts.heading,
        fontWeight: '700',
      }, style]}>
        {prefix}{count}{suffix}
      </Text>
    </View>
  );
}
