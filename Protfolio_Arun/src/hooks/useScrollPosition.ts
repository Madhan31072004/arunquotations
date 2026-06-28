import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

export function useScrollPosition() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    let lastScroll = 0;
    const handleScroll = () => {
      const current = window.scrollY;
      setScrollDirection(current > lastScroll ? 'down' : 'up');
      setScrollY(current);
      lastScroll = current;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { scrollY, scrollDirection };
}
