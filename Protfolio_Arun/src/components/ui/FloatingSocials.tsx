import React from 'react';
import { View, Pressable, Text, StyleSheet, Platform, Linking } from 'react-native';
import theme from '../../theme';

const SOCIALS = [
  { icon: '📸', label: 'Instagram', url: 'https://www.instagram.com/3d_design_diariies?igsh=MzRpc3UzejV3b2t1' },
  { icon: '💼', label: 'LinkedIn', url: 'https://www.linkedin.com/in/arun-kumar-gopaldas-482a0022b?utm_source=share_via&utm_content=profile&utm_medium=member_ios' },
  { icon: '✉️', label: 'Email', url: 'mailto:arunkumargopaldas@gmail.com' },
  { icon: '💬', label: 'WhatsApp', url: 'https://wa.me/918498997856' },
];

export default function FloatingSocials() {
  const handlePress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn(`Don't know how to open URI: ${url}`);
      }
    } catch (error) {
      console.error(`An error occurred opening URL ${url}:`, error);
    }
  };

  return (
    <View style={[styles.container, Platform.OS === 'web' ? {
      position: 'fixed' as any,
      right: 20,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 100,
    } as any : {}]}>
      {SOCIALS.map((s, i) => (
        <Pressable
          key={s.label}
          onPress={() => handlePress(s.url)}
          style={({ hovered }: any) => [
            styles.btn,
            Platform.OS === 'web' ? {
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              transition: 'all 0.3s ease',
              animation: `floatSlow 5s ease-in-out ${i * 0.3}s infinite`,
            } as any : {},
            hovered && styles.btnHover,
          ]}
        >
          <Text style={styles.icon}>{s.icon}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    alignItems: 'center',
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnHover: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    transform: [{ scale: 1.15 }],
  },
  icon: { fontSize: 18 },
});
