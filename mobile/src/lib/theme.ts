// Arun Quotations — Design System
// Premium dark theme with golden accents for interior design

export const Colors = {
  // Primary palette - Deep navy with golden luxury
  primary: '#C9A351',        // Warm gold
  primaryLight: '#E4CB82',   // Light gold
  primaryDark: '#A17D2F',    // Deep gold
  primaryGlow: 'rgba(201, 163, 81, 0.15)',

  // Background layers
  background: '#0A0E1A',     // Deepest navy
  surface: '#111827',        // Dark card surface
  surfaceElevated: '#1A2236', // Elevated card
  surfaceHover: '#1F2A42',   // Hover state
  surfaceActive: '#243050',  // Active state

  // Text hierarchy
  textPrimary: '#F1F5F9',    // Bright white text
  textSecondary: '#94A3B8',  // Muted text
  textTertiary: '#64748B',   // Very muted
  textInverse: '#0F172A',    // Dark text on light bg
  textGold: '#C9A351',       // Gold accent text

  // Status colors
  success: '#10B981',        // Emerald green
  successBg: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',        // Amber
  warningBg: 'rgba(245, 158, 11, 0.12)',
  error: '#EF4444',          // Red
  errorBg: 'rgba(239, 68, 68, 0.12)',
  info: '#3B82F6',           // Blue
  infoBg: 'rgba(59, 130, 246, 0.12)',

  // Borders & dividers
  border: '#1E293B',
  borderLight: '#334155',
  borderGold: 'rgba(201, 163, 81, 0.3)',

  // Special
  glass: 'rgba(17, 24, 39, 0.8)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.4)',

  // Gradient stops
  gradientStart: '#C9A351',
  gradientEnd: '#8B6914',
  gradientBgStart: '#0A0E1A',
  gradientBgMid: '#111827',
  gradientBgEnd: '#0F172A',

  // Status badge colors
  statusDraft: '#64748B',
  statusSent: '#3B82F6',
  statusApproved: '#10B981',
  statusRejected: '#EF4444',
  statusRevised: '#F59E0B',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  round: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 36,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  gold: {
    shadowColor: '#C9A351',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const Layout = {
  sidebarWidth: 260,
  headerHeight: 64,
  bottomTabHeight: 72,
  maxContentWidth: 1200,
  breakpoint: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  },
};
