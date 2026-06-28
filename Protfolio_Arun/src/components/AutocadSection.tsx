import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions, Image } from 'react-native';
import { useLightbox } from './ui/LightboxContext';
import theme from '../theme';
import SectionTitle from './ui/SectionTitle';
import ScrollReveal from './ui/ScrollReveal';

const AUTOCAD_IMAGES = [
  require('../../assets/AUTOCAD_1.jpg'),
  require('../../assets/AUTOCAD_2.jpg'),
  require('../../assets/AUTOCAD_3.jpg'),
  require('../../assets/AUTOCAD_4.jpg'),
  require('../../assets/AUTOCAD_5.jpg'),
  require('../../assets/AUTOCAD_6.jpg'),
];

type GalleryItem = { id: number; src: any; cat: string };

function buildItems(sources: any[], cat: string, startId: number): GalleryItem[] {
  return sources.map((src, i) => ({ id: startId + i, src, cat }));
}

const ALL_IMAGES: GalleryItem[] = buildItems(AUTOCAD_IMAGES, 'Autocad', 1000);

// Masonry height pattern per column position for visual variety
const MASONRY_H_DESKTOP = [360, 280, 340, 300, 320, 260, 380, 290, 350, 270, 330, 310, 295, 345];
const MASONRY_H_TABLET  = [300, 240, 280, 260, 310, 250, 290, 270];
const MASONRY_H_MOBILE  = [220, 260, 240, 250, 230, 270];

export default function AutocadSection() {
  const { width } = useWindowDimensions();
  const [hovered, setHovered] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  const { openLightbox } = useLightbox();

  // ─── Responsive breakpoints ───
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isDesktop = width >= 1024;
  const cols = isDesktop ? 4 : isTablet ? 3 : 2;
  const gap = isMobile ? 10 : isTablet ? 14 : 16;
  const hArr = isDesktop ? MASONRY_H_DESKTOP : isTablet ? MASONRY_H_TABLET : MASONRY_H_MOBILE;

  const INITIAL = isMobile ? 4 : isTablet ? 6 : 8;
  const visible = showAll ? ALL_IMAGES : ALL_IMAGES.slice(0, INITIAL);
  const hasMore = ALL_IMAGES.length > INITIAL && !showAll;

  const handleOpenLightbox = (item: GalleryItem) => {
    const lightboxImages = ALL_IMAGES.map(img => ({
      id: img.id,
      src: img.src,
      title: img.cat
    }));
    const index = ALL_IMAGES.findIndex(img => img.id === item.id);
    openLightbox(lightboxImages, index >= 0 ? index : 0);
  };

  // ─── Responsive item width ───
  const itemWidth = `${(100 / cols) - 1.5}%` as any;

  return (
    <View style={[s.container, isMobile && s.containerMobile]} nativeID="autocad">
      <View style={s.inner}>
        <SectionTitle
          label="TECHNICAL DRAWINGS"
          title={isMobile ? "Autocad" : "Autocad Designs"}
          subtitle={isMobile ? "Our detailed technical plans." : "Precision engineering and detailed technical layouts."}
        />

        {/* Results count */}
        <ScrollReveal delay={0.1}>
          <Text style={[s.resultCount, isMobile && { fontSize: 11, marginBottom: 20 }]}>
            Showing {visible.length} of {ALL_IMAGES.length} designs
          </Text>
        </ScrollReveal>

        {/* ─── Masonry Grid ─── */}
        <View style={[s.grid, { gap }]}>
          {visible.map((img, i) => {
            const h = hArr[i % hArr.length];
            const isHero = isMobile && i === 0;
            const w = isHero ? '100%' as any : itemWidth;
            const heroH = isHero ? 280 : h;

            return (
              <ScrollReveal key={img.id} delay={Math.min(i * 0.04, 0.5)} animation="scaleIn"
                style={{ width: w }}>
                <Pressable
                  onPress={() => handleOpenLightbox(img)}
                  onHoverIn={() => setHovered(img.id)}
                  onHoverOut={() => setHovered(null)}
                  style={[s.gridItem, { height: heroH },
                    isHero && { borderRadius: 16 },
                    Platform.OS === 'web' ? {
                      transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                      cursor: 'pointer',
                      ...(hovered === img.id ? {
                         transform: isDesktop ? 'scale(1.03)' : 'scale(1.02)',
                         boxShadow: '0 12px 40px rgba(201,169,110,0.25)',
                      } : {}),
                    } as any : {},
                  ]}>
                  <Image source={img.src} style={s.gridImage} resizeMode="cover" />
                  <View style={[s.gridOverlay,
                    Platform.OS === 'web' ? { transition: 'opacity 0.3s ease' } as any : {},
                    { opacity: hovered === img.id ? 0.5 : 0 },
                  ]} />

                  {(isMobile || hovered === img.id) && (
                    <View style={[s.gridLabel, Platform.OS === 'web' && !isMobile ? {
                      animation: 'fadeUp 0.3s ease forwards',
                    } as any : {}]}>
                      <View style={[s.labelPill, isMobile && s.labelPillMobile]}>
                        <Text style={s.labelIcon}>📐</Text>
                        <Text style={[s.gridCat, isMobile && { fontSize: 10 }]}>{img.cat}</Text>
                      </View>
                      {!isMobile && <Text style={s.viewText}>Tap to view ↗</Text>}
                    </View>
                  )}

                  <View style={[s.cornerAccent, isMobile && { width: 22, height: 22 }]} />
                </Pressable>
              </ScrollReveal>
            );
          })}
        </View>

        {hasMore && (
          <ScrollReveal delay={0.2}>
            <Pressable onPress={() => setShowAll(true)}
              style={({ hovered: h }: any) => [s.showMoreBtn, isMobile && s.showMoreBtnMobile, h && s.showMoreBtnHover]}>
              <Text style={[s.showMoreText, isMobile && { fontSize: 13 }]}>
                View All {ALL_IMAGES.length} Designs →
              </Text>
            </Pressable>
          </ScrollReveal>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.section,
    paddingHorizontal: 24,
  },
  containerMobile: {
    paddingVertical: 60,
    paddingHorizontal: 12,
  },
  inner: { maxWidth: 1400, width: '100%', alignSelf: 'center' },
  resultCount: {
    fontSize: 13, fontFamily: theme.fonts.body, color: theme.colors.textSecondary,
    textAlign: 'center', marginBottom: 32, letterSpacing: 0.5,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  gridItem: {
    borderRadius: theme.borderRadius.md, overflow: 'hidden',
    position: 'relative', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  gridImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },
  gridOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0a0a0a' },
  gridLabel: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  labelPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: theme.borderRadius.full, alignSelf: 'flex-start', marginBottom: 4,
  },
  labelPillMobile: { paddingHorizontal: 8, paddingVertical: 4, gap: 4 },
  labelIcon: { fontSize: 12 },
  gridCat: { fontSize: 12, fontFamily: theme.fonts.body, color: theme.colors.white, fontWeight: '600', letterSpacing: 0.5 },
  viewText: { fontSize: 11, fontFamily: theme.fonts.body, color: 'rgba(255,255,255,0.6)', marginLeft: 4 },
  cornerAccent: {
    position: 'absolute', top: 0, right: 0, width: 28, height: 28,
    borderTopRightRadius: theme.borderRadius.md, borderBottomLeftRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(201,169,110,0.15)',
  },
  showMoreBtn: {
    alignSelf: 'center', marginTop: 48, paddingHorizontal: 36, paddingVertical: 16,
    borderRadius: theme.borderRadius.full, borderWidth: 1,
    borderColor: theme.colors.primary, backgroundColor: 'transparent',
  },
  showMoreBtnMobile: { marginTop: 32, paddingHorizontal: 24, paddingVertical: 12 },
  showMoreBtnHover: { backgroundColor: theme.colors.primary },
  showMoreText: { fontSize: 14, fontFamily: theme.fonts.body, color: theme.colors.primary, fontWeight: '600', letterSpacing: 1 },
});
