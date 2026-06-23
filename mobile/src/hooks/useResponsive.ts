import { useWindowDimensions } from 'react-native';
import { Layout } from '@/lib/theme';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isMobile = width < Layout.breakpoint.tablet;
  const isTablet = width >= Layout.breakpoint.tablet && width < Layout.breakpoint.desktop;
  const isDesktop = width >= Layout.breakpoint.desktop;
  const isWide = width >= Layout.breakpoint.wide;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    // Layout helpers
    contentPadding: isMobile ? 16 : isTablet ? 24 : 32,
    columns: isMobile ? 1 : isTablet ? 2 : 3,
    sidebarVisible: isDesktop,
  };
}
