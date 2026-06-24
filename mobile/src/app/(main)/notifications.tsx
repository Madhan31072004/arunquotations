import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/lib/theme';
import { Header } from '@/components/layout/Header';
import { useResponsive } from '@/hooks/useResponsive';
import { Card } from '@/components/ui/Card';

export default function NotificationsScreen() {
  const router = useRouter();
  const { isMobile, contentPadding, isDesktop } = useResponsive();

  // Mock notifications
  const notifications = [
    {
      id: '1',
      title: 'Welcome to Arun Quotations',
      message: 'Get started by adding your first client and creating a quotation.',
      time: 'Just now',
      icon: 'sparkles',
      color: Colors.primary,
      read: false,
    },
    {
      id: '2',
      title: 'New Feature Available',
      message: 'You can now customize your PDF templates from the settings page.',
      time: '2 hours ago',
      icon: 'color-wand',
      color: Colors.info,
      read: true,
    },
    {
      id: '3',
      title: 'System Update',
      message: 'The application was updated to version 1.0.0 successfully.',
      time: '1 day ago',
      icon: 'build',
      color: Colors.success,
      read: true,
    }
  ];

  return (
    <View style={styles.container}>
      {isMobile ? (
        <Header title="Notifications" showBack onBack={() => router.back()} />
      ) : (
        <View style={styles.desktopHeaderRow}>
           <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
             <Text style={styles.backText}>Back</Text>
           </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { padding: contentPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {isDesktop && (
          <View style={styles.pageHeader}>
            <Text style={styles.pageTitle}>Notifications</Text>
            <TouchableOpacity>
              <Text style={styles.markAllRead}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.list}>
          {notifications.map((notif) => (
            <Card key={notif.id} variant="default" padding="md" style={[styles.card, !notif.read && styles.unreadCard] as any}>
              <View style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: `${notif.color}15` }]}>
                  <Ionicons name={notif.icon as any} size={22} color={notif.color} />
                </View>
                <View style={styles.content}>
                  <View style={styles.headerRow}>
                    <Text style={[styles.title, !notif.read && styles.unreadText]}>{notif.title}</Text>
                    <Text style={styles.time}>{notif.time}</Text>
                  </View>
                  <Text style={styles.message}>{notif.message}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyMessage}>You're all caught up!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.huge,
  },
  desktopHeaderRow: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginLeft: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  pageTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  markAllRead: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  list: {
    gap: Spacing.md,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  unreadCard: {
    borderLeftColor: Colors.primary,
    backgroundColor: Colors.surfaceElevated,
  },
  row: {
    flexDirection: 'row',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  unreadText: {
    color: Colors.textPrimary,
    fontWeight: FontWeight.semiBold,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
  message: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.huge * 2,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptyMessage: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
