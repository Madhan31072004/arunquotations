import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions, Image, ScrollView } from 'react-native';
import { useLightbox } from './ui/LightboxContext';
import theme from '../theme';
import SectionTitle from './ui/SectionTitle';
import ScrollReveal from './ui/ScrollReveal';

// ─── Asset imports ───
const BEDROOM_IMAGES = [
  require('../../assets/BEDROOM.jpeg'),
  require('../../assets/BEDROOM 1.jpeg'),
  require('../../assets/BEDROOM 2.jpeg'),
  require('../../assets/BEDROOM (3).jpeg'),
  require('../../assets/BEDROOM 4.jpeg'),
  require('../../assets/BEDROOM 5.jpeg'),
  require('../../assets/BEDROOM 6.jpeg'),
  require('../../assets/BEDROOM 7.jpeg'),
  require('../../assets/BEDROOM 8.jpeg'),
  require('../../assets/BEDROOM 9.jpeg'),
  require('../../assets/BEDROOM 10.jpeg'),
  require('../../assets/BEDROOM 11.jpeg'),
  require('../../assets/BEDROOM 12.jpeg'),
  require('../../assets/BEDROOM STUDY.jpeg'),
];
const LIVING_IMAGES = [
  require('../../assets/LIVING AREA 1.jpeg'),
  require('../../assets/LIVING AREA 2.jpeg'),
  require('../../assets/LIVING AREA 3.jpeg'),
  require('../../assets/LIVING AREA 4.jpeg'),
  require('../../assets/LIVING AREA 5.jpeg'),
  require('../../assets/LIVING AREA 6.jpeg'),
  require('../../assets/LIVING AREA 7.jpeg'),
  require('../../assets/LIVING AREA 8.jpeg'),
  require('../../assets/LIVING AREA 9.jpeg'),
];
const KITCHEN_IMAGES = [
  require('../../assets/KITCHEN.jpeg'),
  require('../../assets/KITECHEN 1.jpeg'),
  require('../../assets/KITECHEN 2.jpeg'),
  require('../../assets/KITCHEN 3.jpeg'),
  require('../../assets/KITCHEN 4.jpeg'),
  require('../../assets/KITCHEN 5.jpeg'),
  require('../../assets/KITCHEN 6.jpeg'),
  require('../../assets/KITCHEN 7.jpeg'),
  require('../../assets/KITCHEN 8.jpeg'),
  require('../../assets/KITCHEN 9.jpeg'),
  require('../../assets/KITCHEN 10.jpeg'),
  require('../../assets/KITCHEN 11.jpeg'),
];
const DINING_IMAGES = [
  require('../../assets/DINING AREA.jpeg'),
  require('../../assets/DINING AREA 1.jpeg'),
  require('../../assets/DINING.jpeg'),
  require('../../assets/dinning area 1.jpg.jpeg'),
  require('../../assets/dinning area 1.1.jpg.jpeg'),
];
const POOJA_IMAGES = [
  require('../../assets/pojja.jpg.jpeg'),
  require('../../assets/pojja1.jpg.jpeg'),
  require('../../assets/POOJA 3.jpeg'),
];
const TV_IMAGES = [
  require('../../assets/TV 1.jpeg'),
  require('../../assets/TV 2.jpeg'),
  require('../../assets/TV 3.jpeg'),
  require('../../assets/TV 4.jpeg'),
  require('../../assets/TV 5.jpeg'),
  require('../../assets/TV 6.jpeg'),
];
const ELEVATION_IMAGES = [
  require('../../assets/ELEVATION.jpeg'),
  require('../../assets/ELEVATION 1.jpeg'),
  require('../../assets/ELEVATION 2.jpeg'),
  require('../../assets/ELEVATION 3.jpeg'),
];
const BAR_IMAGES = [
  require('../../assets/BAR AND CROCERY.jpeg'),
];

type GalleryItem = { id: number; src: any; cat: string };

function buildItems(sources: any[], cat: string, startId: number): GalleryItem[] {
  return sources.map((src, i) => ({ id: startId + i, src, cat }));
}

const ALL_IMAGES: GalleryItem[] = [
  ...buildItems(BEDROOM_IMAGES, 'Bedroom', 1),
  ...buildItems(LIVING_IMAGES, 'Living Area', 100),
  ...buildItems(KITCHEN_IMAGES, 'Kitchen', 200),
  ...buildItems(DINING_IMAGES, 'Dining', 300),
  ...buildItems(POOJA_IMAGES, 'Pooja Room', 400),
  ...buildItems(TV_IMAGES, 'TV Unit', 500),
  ...buildItems(ELEVATION_IMAGES, 'Elevation', 600),
  ...buildItems(BAR_IMAGES, 'Bar', 700),
];

const CATEGORIES = ['All', 'Bedroom', 'Living Area', 'Kitchen', 'Dining', 'Pooja Room', 'TV Unit', 'Elevation', 'Bar'];
const CAT_ICONS: Record<string, string> = {
  All: '✦', Bedroom: '🛏️', 'Living Area': '🛋️', Kitchen: '🍳',
  Dining: '🍽️', 'Pooja Room': '🪔', 'TV Unit': '📺', Elevation: '🏛️', Bar: '🍸',
};

// Masonry height pattern per column position for visual variety
const MASONRY_H_DESKTOP = [360, 280, 340, 300, 320, 260, 380, 290, 350, 270, 330, 310, 295, 345];
const MASONRY_H_TABLET  = [300, 240, 280, 260, 310, 250, 290, 270];
const MASONRY_H_MOBILE  = [220, 260, 240, 250, 230, 270];

export default function GallerySection() {
  const { width } = useWindowDimensions();
  const [filter, setFilter] = useState('All');
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

  const filtered = filter === 'All' ? ALL_IMAGES : ALL_IMAGES.filter(i => i.cat === filter);
  const INITIAL = isMobile ? 8 : isTablet ? 9 : 12;
  const visible = showAll ? filtered : filtered.slice(0, INITIAL);
  const hasMore = filtered.length > INITIAL && !showAll;

  const catCount = useCallback((cat: string) => {
    return cat === 'All' ? ALL_IMAGES.length : ALL_IMAGES.filter(i => i.cat === cat).length;
  }, []);

  const handleOpenLightbox = (item: GalleryItem) => {
    const lightboxImages = filtered.map(img => ({
      id: img.id,
      src: img.src,
      title: img.cat
    }));
    const index = filtered.findIndex(img => img.id === item.id);
    openLightbox(lightboxImages, index >= 0 ? index : 0);
  };

  // ─── Responsive item width ───
  const itemWidth = `${(100 / cols) - 1.5}%` as any;

  return (
    <View style={[s.container, isMobile && s.containerMobile]} nativeID="gallery">
      <View style={s.inner}>
        <SectionTitle
          label="OUR WORK"
          title={isMobile ? "Gallery" : "Design Gallery"}
          subtitle={isMobile ? "Our finest interior designs." : "Explore our portfolio of stunning interior designs across every room of your dream home."}
        />

        {/* ─── Category filter ─── */}
        <ScrollReveal style={s.tabsWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={[s.tabs, isMobile && s.tabsMobile]}>
            {CATEGORIES.map((c) => (
              <Pressable key={c}
                onPress={() => { setFilter(c); setShowAll(false); }}
                style={[
                  s.tab, isMobile && s.tabMobile,
                  filter === c && s.tabActive,
                  Platform.OS === 'web' ? { transition: 'all 0.3s ease', cursor: 'pointer' } as any : {},
                ]}>
                <Text style={[s.tabIcon, isMobile && { fontSize: 12 }]}>{CAT_ICONS[c]}</Text>
                <Text style={[s.tabText, isMobile && s.tabTextMobile, filter === c && s.tabTextActive]}>
                  {c}
                </Text>
                {!isMobile && (
                  <View style={[s.tabBadge, filter === c && s.tabBadgeActive]}>
                    <Text style={[s.tabBadgeText, filter === c && s.tabBadgeTextActive]}>
                      {catCount(c)}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </ScrollReveal>

        {/* Results count */}
        <ScrollReveal delay={0.1}>
          <Text style={[s.resultCount, isMobile && { fontSize: 11, marginBottom: 20 }]}>
            Showing {visible.length} of {filtered.length} designs
            {filter !== 'All' ? ` in ${filter}` : ''}
          </Text>
        </ScrollReveal>

        {/* ─── Masonry Grid ─── */}
        <View style={[s.grid, { gap }]}>
          {visible.map((img, i) => {
            const h = hArr[i % hArr.length];
            // On mobile: first image is full-width hero
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

                  {/* Always-visible category pill on mobile, hover-only on desktop */}
                  {(isMobile || hovered === img.id) && (
                    <View style={[s.gridLabel, Platform.OS === 'web' && !isMobile ? {
                      animation: 'fadeUp 0.3s ease forwards',
                    } as any : {}]}>
                      <View style={[s.labelPill, isMobile && s.labelPillMobile]}>
                        <Text style={s.labelIcon}>{CAT_ICONS[img.cat]}</Text>
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

        {/* Show More */}
        {hasMore && (
          <ScrollReveal delay={0.2}>
            <Pressable onPress={() => setShowAll(true)}
              style={({ hovered: h }: any) => [s.showMoreBtn, isMobile && s.showMoreBtnMobile, h && s.showMoreBtnHover]}>
              <Text style={[s.showMoreText, isMobile && { fontSize: 13 }]}>
                View All {filtered.length} Designs →
              </Text>
            </Pressable>
          </ScrollReveal>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  // ─── Container ───
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

  // ─── Tabs ───
  tabsWrap: { marginBottom: 20 },
  tabs: {
    flexDirection: 'row', gap: 10, justifyContent: 'center',
    paddingBottom: 8, paddingHorizontal: 4,
  },
  tabsMobile: { justifyContent: 'flex-start', gap: 6, paddingHorizontal: 2 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1, borderColor: theme.colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  tabMobile: { paddingHorizontal: 10, paddingVertical: 7, gap: 4 },
  tabActive: { borderColor: theme.colors.primary, backgroundColor: 'rgba(201,169,110,0.12)' },
  tabIcon: { fontSize: 14 },
  tabText: { fontSize: 13, fontFamily: theme.fonts.body, color: theme.colors.textSecondary, fontWeight: '500' },
  tabTextMobile: { fontSize: 11 },
  tabTextActive: { color: theme.colors.primary },
  tabBadge: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: theme.borderRadius.full, marginLeft: 2,
  },
  tabBadgeActive: { backgroundColor: 'rgba(201,169,110,0.2)' },
  tabBadgeText: { fontSize: 10, fontFamily: theme.fonts.body, color: theme.colors.textSecondary, fontWeight: '600' },
  tabBadgeTextActive: { color: theme.colors.primary },

  // ─── Result count ───
  resultCount: {
    fontSize: 13, fontFamily: theme.fonts.body, color: theme.colors.textSecondary,
    textAlign: 'center', marginBottom: 32, letterSpacing: 0.5,
  },

  // ─── Grid ───
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

  // ─── Show More ───
  showMoreBtn: {
    alignSelf: 'center', marginTop: 48, paddingHorizontal: 36, paddingVertical: 16,
    borderRadius: theme.borderRadius.full, borderWidth: 1,
    borderColor: theme.colors.primary, backgroundColor: 'transparent',
  },
  showMoreBtnMobile: { marginTop: 32, paddingHorizontal: 24, paddingVertical: 12 },
  showMoreBtnHover: { backgroundColor: theme.colors.primary },
  showMoreText: { fontSize: 14, fontFamily: theme.fonts.body, color: theme.colors.primary, fontWeight: '600', letterSpacing: 1 },
});
