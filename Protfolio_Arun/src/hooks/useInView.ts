import { useState, useEffect, useRef, RefObject } from 'react';
import { Platform, View } from 'react-native';

export function useInView(threshold = 0.15): [RefObject<View | null>, boolean] {
  const ref = useRef<View>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || !ref.current) return;
    const el = ref.current as unknown as HTMLElement;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}
