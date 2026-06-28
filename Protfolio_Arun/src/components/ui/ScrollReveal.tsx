import React, { useEffect, useRef } from 'react';
import { View, Platform } from 'react-native';
import { useInView } from '../../hooks/useInView';

interface ScrollRevealProps {
  children?: React.ReactNode;
  animation?: 'fadeUp' | 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'scaleIn';
  delay?: number;
  duration?: number;
  style?: any;
}

export default function ScrollReveal({
  children, animation = 'fadeUp', delay = 0, duration = 0.8, style
}: ScrollRevealProps) {
  const [ref, inView] = useInView(0.1);
  const elRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !inView) return;
    const el = (ref as any).current as HTMLElement;
    if (!el) return;
    el.style.animation = `${animation} ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards`;
  }, [inView, animation, delay, duration]);

  const initialStyle = Platform.OS === 'web' ? { opacity: 0 } : {};

  return (
    <View ref={ref} style={[initialStyle, style]}>
      {children}
    </View>
  );
}
