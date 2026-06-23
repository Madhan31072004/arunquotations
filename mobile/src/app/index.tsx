import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/features/auth/authStore';

export default function Index() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Redirect href="/(main)/(tabs)/dashboard" />;
  }

  return <Redirect href="/(auth)/login" />;
}
