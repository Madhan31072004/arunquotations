import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Slot } from 'expo-router';
import { Colors } from '@/lib/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuthStore } from '@/features/auth/authStore';
import { useRouter } from 'expo-router';

export default function MainLayout() {
  const { isDesktop } = useResponsive();
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  // Route protection: If logged out, redirect to login page instantly
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login' as any);
    }
  }, [isAuthenticated, isLoading, router]);

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
