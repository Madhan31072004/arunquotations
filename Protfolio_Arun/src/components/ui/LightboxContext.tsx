import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions, Image, ImageSourcePropType } from 'react-native';
import theme from '../../theme';

export interface LightboxImage {
  id: string | number;
  src: ImageSourcePropType;
  title?: string;
  subtitle?: string;
}

interface LightboxContextType {
  openLightbox: (images: LightboxImage[], initialIndex?: number) => void;
  closeLightbox: () => void;
}

const LightboxContext = createContext<LightboxContextType | undefined>(undefined);

export function useLightbox() {
  const context = useContext(LightboxContext);
  if (!context) {
    throw new Error('useLightbox must be used within a LightboxProvider');
  }
  return context;
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (newImages: LightboxImage[], initialIndex = 0) => {
    setImages(newImages);
    setCurrentIndex(initialIndex);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
  };

  const navigate = (direction: number) => {
    setCurrentIndex((prev) => {
      let next = prev + direction;
      if (next < 0) next = images.length - 1;
      if (next >= images.length) next = 0;
      return next;
    });
  };

  const currentImage = images[currentIndex];

  return (
    <LightboxContext.Provider value={{ openLightbox, closeLightbox }}>
      {children}
      
      {isOpen && currentImage && Platform.OS === 'web' && (
        <Pressable style={s.lbBackdrop} onPress={closeLightbox}>
          <Pressable style={[s.lbClose, isMobile && { top: 12, right: 12, width: 36, height: 36 }]} onPress={closeLightbox}>
            <Text style={s.lbCloseText}>✕</Text>
          </Pressable>

          {!isMobile && images.length > 1 && (
            <Pressable style={[s.lbNav, { left: isMobile ? 8 : 24 }]} onPress={(e) => { e.stopPropagation(); navigate(-1); }}>
              <Text style={s.lbNavText}>‹</Text>
            </Pressable>
          )}

          <Pressable style={[s.lbContent, isMobile && s.lbContentMobile]} onPress={(e) => e.stopPropagation()}>
            <Image 
              source={currentImage.src}
              style={[s.lbImage, isMobile ? { width: width - 32, height: (width - 32) * 0.65 } : {}]}
              resizeMode="contain" 
            />
            {(currentImage.title || currentImage.subtitle || images.length > 1) && (
              <View style={[s.lbInfo, isMobile && { paddingHorizontal: 0 }]}>
                <Text style={[s.lbTitle, isMobile && { fontSize: 13 }]}>
                  {currentImage.title || ''} {currentImage.subtitle ? `• ${currentImage.subtitle}` : ''}
                </Text>
                {images.length > 1 && (
                  <Text style={s.lbCounter}>{currentIndex + 1} / {images.length}</Text>
                )}
              </View>
            )}
          </Pressable>

          {!isMobile && images.length > 1 && (
            <Pressable style={[s.lbNav, { right: isMobile ? 8 : 24 }]} onPress={(e) => { e.stopPropagation(); navigate(1); }}>
              <Text style={s.lbNavText}>›</Text>
            </Pressable>
          )}

          {isMobile && images.length > 1 && (
            <View style={s.lbMobileNav}>
              <Pressable style={s.lbMobileBtn} onPress={(e) => { e.stopPropagation(); navigate(-1); }}>
                <Text style={s.lbNavText}>‹ Prev</Text>
              </Pressable>
              <Pressable style={s.lbMobileBtn} onPress={(e) => { e.stopPropagation(); navigate(1); }}>
                <Text style={s.lbNavText}>Next ›</Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      )}
    </LightboxContext.Provider>
  );
}

const s = StyleSheet.create({
  lbBackdrop: {
    position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.94)', zIndex: 99999,
    justifyContent: 'center', alignItems: 'center',
  },
  lbClose: {
    position: 'absolute', top: 24, right: 32, zIndex: 10,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center',
  },
  lbCloseText: { fontSize: 20, color: theme.colors.white, fontWeight: '300' },
  lbContent: { maxWidth: '80%' as any, maxHeight: '85%' as any, alignItems: 'center' },
  lbContentMobile: { maxWidth: '95%' as any, maxHeight: '70%' as any },
  lbImage: { width: 900, height: 600, maxWidth: '100%' as any, borderRadius: theme.borderRadius.lg },
  lbInfo: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', marginTop: 16, paddingHorizontal: 8,
  },
  lbTitle: { fontSize: 15, fontFamily: theme.fonts.body, color: theme.colors.primary, fontWeight: '600', letterSpacing: 1 },
  lbCounter: { fontSize: 13, fontFamily: theme.fonts.body, color: theme.colors.textSecondary },
  lbNav: {
    position: 'absolute', width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center',
    alignItems: 'center', zIndex: 10,
  },
  lbNavText: { fontSize: 22, color: theme.colors.white, fontWeight: '300' },
  lbMobileNav: {
    position: 'absolute', bottom: 40, flexDirection: 'row', gap: 24,
    alignSelf: 'center',
  },
  lbMobileBtn: {
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
});
