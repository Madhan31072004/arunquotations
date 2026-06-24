import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/lib/theme';
import { Header } from '@/components/layout/Header';
import { useResponsive } from '@/hooks/useResponsive';
import { Card } from '@/components/ui/Card';

import { ActivityIndicator } from 'react-native';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/features/data/apiHooks';

export default function NotificationsScreen() {
  const router = useRouter();
  const { isMobile, contentPadding, isDesktop } = useResponsive();

  const { data: notificationsData, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  const notifications = notificationsData || [];

  const handleMarkAsRead = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate(id);
    }
  };

  const handleMarkAllAsRead = () => {
    const hasUnread = notifications.some((n: any) => !n.isRead);
    if (hasUnread) {
      markAllAsRead.mutate();
    }
  };

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
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <Text style={styles.markAllRead}>Mark all as read</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.list}>
              {notifications.map((notif: any) => (
                <TouchableOpacity 
                  key={notif._id} 
                  activeOpacity={0.7} 
                  onPress={() => handleMarkAsRead(notif._id, notif.isRead)}
                >
                  <Card variant="default" padding="md" style={[styles.card, !notif.isRead && styles.unreadCard] as any}>
                    <View style={styles.row}>
                      <View style={[styles.iconBox, { backgroundColor: `${notif.color}15` }]}>
                        <Ionicons name={notif.icon as any} size={22} color={notif.color} />
                      </View>
                      <View style={styles.content}>
                        <View style={styles.headerRow}>
                          <Text style={[styles.title, !notif.isRead && styles.unreadText]}>{notif.title}</Text>
                          <Text style={styles.time}>{new Date(notif.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <Text style={styles.message}>{notif.message}</Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>

        {notifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyMessage}>You're all caught up!</Text>
          </View>
        )}
          </>
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
