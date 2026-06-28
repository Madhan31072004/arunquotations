import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LightboxProvider } from '../components/ui/LightboxContext';
import '../global.css';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Set page metadata
    document.title = 'Arun Kumar | Luxury Interior Design Portfolio';
    const meta = document.createElement('meta');
    meta.name = 'description';
    meta.content = 'Premium interior design portfolio by Arun Kumar. Luxury residential and commercial interior design in India.';
    document.head.appendChild(meta);

    // Theme color
    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    themeColor.content = '#0a0a0a';
    document.head.appendChild(themeColor);

    // Viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0');
    }

    // Inject responsive nav styles
    const style = document.createElement('style');
    style.textContent = `
      @media (min-width: 769px) {
        #nav-links { display: flex !important; }
        #hamburger { display: none !important; }
      }
      @media (max-width: 768px) {
        #nav-links { display: none !important; }
        #hamburger { display: flex !important; }
      }

      /* Smooth selection color */
      ::selection {
        background: rgba(201,169,110,0.3);
        color: #f5f0e8;
      }

      /* Smooth scrollbar for horizontal galleries */
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <LightboxProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>

      {/* Grain overlay */}
      {Platform.OS === 'web' && (
        <View style={{
          position: 'fixed' as any,
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        } as any} />
      )}
    </LightboxProvider>
  );
}
