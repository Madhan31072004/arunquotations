import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { Colors } from '@/lib/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { Sidebar } from '@/components/layout/Sidebar';

export default function MainLayout() {
  const { isDesktop } = useResponsive();

  if (isDesktop) {
    return (
      <View style={styles.desktopContainer}>
        <Sidebar />
        <View style={styles.desktopContent}>
          <Slot />
        </View>
      </View>
    );
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.background,
  },
  desktopContent: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
