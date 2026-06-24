import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/lib/theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { useResponsive } from '@/hooks/useResponsive';
import { CURRENCY } from '@/lib/constants';
import { useDashboardStats, useClients, useUpdateClient } from '@/features/data/apiHooks';
import { ActivityIndicator, Modal, TextInput, Pressable, Alert } from 'react-native';
export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isMobile, isDesktop, contentPadding } = useResponsive();
  const { data: dashboard, isLoading } = useDashboardStats();
  const { data: clients } = useClients();
  const updateClient = useUpdateClient();

  const [showRevenueModal, setShowRevenueModal] = React.useState(false);
  const [selectedClientId, setSelectedClientId] = React.useState('');
  const [revenueInput, setRevenueInput] = React.useState('');

  const handleLogRevenue = async () => {
    if (!selectedClientId) return Alert.alert('Error', 'Please select a client');
    try {
      await updateClient.mutateAsync({
        id: selectedClientId,
        data: { revenue: Number(revenueInput) || 0 }
      });
      setShowRevenueModal(false);
      setRevenueInput('');
      setSelectedClientId('');
      Alert.alert('Success', 'Revenue logged successfully');
    } catch (e) {
      Alert.alert('Error', 'Failed to log revenue');
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return `${CURRENCY.symbol}${(amount / 100000).toFixed(1)}L`;
    }
    return `${CURRENCY.symbol}${amount.toLocaleString('en-IN')}`;
  };

  const stats = [
    {
      label: 'Total Quotations',
      value: dashboard?.totalQuotes?.toString() || '0',
      change: 'Lifetime',
      icon: 'document-text' as const,
      color: Colors.primary,
    },
    {
      label: 'Active Clients',
      value: dashboard?.activeClients?.toString() || '0',
      change: 'All time',
      icon: 'people' as const,
      color: Colors.success,
    },
    {
      label: 'Pending Approval',
      value: dashboard?.pendingQuotes?.toString() || '0',
      change: 'Needs follow-up',
      icon: 'time' as const,
      color: Colors.warning,
    },
    {
      label: 'Revenue',
      value: formatAmount(dashboard?.totalRevenue || 0),
      change: 'Approved quotes',
      icon: 'trending-up' as const,
      color: Colors.info,
    },
  ];

  const recentQuotations = dashboard?.recentQuotations || [];

  return (
    <View style={styles.container}>
      {isMobile && <Header title="Dashboard" />}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { padding: contentPadding },
          !isMobile && { paddingTop: Spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Desktop title */}
        {isDesktop && (
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.greeting}>
                {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'} 👋
              </Text>
              <Text style={styles.pageTitle}>Dashboard Overview</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              <Button
                title="Log Revenue"
                variant="outline"
                onPress={() => setShowRevenueModal(true)}
                icon={<Ionicons name="cash" size={20} color={Colors.primary} />}
              />
              <Button
                title="New Quotation"
                onPress={() => router.push('/(main)/quotation/create' as any)}
                icon={<Ionicons name="add" size={20} color={Colors.textInverse} />}
              />
            </View>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40, marginBottom: 40 }} />
        ) : (
          <View style={[styles.statsGrid, isDesktop && styles.statsGridDesktop]}>
            {stats.map((stat, index) => (
              <Card
                key={index}
                variant="elevated"
                padding="md"
                style={[styles.statCard, isDesktop ? styles.statCardDesktop : null] as any}
              >
                <View style={styles.statHeader}>
                  <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                    <Ionicons name={stat.icon} size={22} color={stat.color} />
                  </View>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statChange}>{stat.change}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Quick Actions (Mobile) */}
        {isMobile && (
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/(main)/quotation/create' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.primaryGlow }]}>
                <Ionicons name="add-circle" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.quickActionText}>New Quote</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction} 
              activeOpacity={0.7}
              onPress={() => router.push('/(main)/(tabs)/clients' as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.infoBg }]}>
                <Ionicons name="person-add" size={24} color={Colors.info} />
              </View>
              <Text style={styles.quickActionText}>Add Client</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction} 
              activeOpacity={0.7}
              onPress={() => router.push('/(main)/(tabs)/materials' as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.successBg }]}>
                <Ionicons name="cube" size={24} color={Colors.success} />
              </View>
              <Text style={styles.quickActionText}>Materials</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.quickAction} 
              activeOpacity={0.7}
              onPress={() => setShowRevenueModal(true)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: Colors.warningBg }]}>
                <Ionicons name="cash" size={24} color={Colors.warning} />
              </View>
              <Text style={styles.quickActionText}>Log Revenue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Quotations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Quotations</Text>
          <TouchableOpacity
            onPress={() => router.push('/(main)/(tabs)/quotations' as any)}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentQuotations.map((q: any) => (
          <TouchableOpacity key={q._id} activeOpacity={0.7} onPress={() => router.push(`/(main)/quotation/${q._id}` as any)}>
            <Card variant="default" padding="md" style={styles.quotationCard}>
              <View style={styles.quotationRow}>
                <View style={styles.quotationInfo}>
                  <View style={styles.quotationHeader}>
                    <Text style={styles.quotationNumber}>{q.quotationNumber}</Text>
                    <Badge
                      text={q.status}
                      color={
                        q.status === 'approved' ? Colors.success :
                        q.status === 'draft' ? Colors.textTertiary :
                        q.status === 'revised' ? Colors.warning :
                        Colors.primary
                      }
                      variant="soft"
                    />
                  </View>
                  <Text style={styles.quotationClient}>{q.clientId?.name || 'Unknown Client'}</Text>
                  <Text style={styles.quotationProject}>{q.title}</Text>
                </View>
                <View style={styles.quotationRight}>
                  <Text style={styles.quotationAmount}>{formatAmount(q.grandTotal)}</Text>
                  <Text style={styles.quotationDate}>{new Date(q.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Log Revenue Modal */}
      <Modal visible={showRevenueModal} transparent animationType="fade" onRequestClose={() => setShowRevenueModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowRevenueModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Client Revenue</Text>
              <TouchableOpacity onPress={() => setShowRevenueModal(false)}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            
            <View style={{ padding: Spacing.lg }}>
              <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs }}>Select Client</Text>
              <ScrollView style={{ maxHeight: 150, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.sm, marginBottom: Spacing.md }}>
                {clients?.map((c: any) => (
                  <TouchableOpacity
                    key={c._id}
                    style={{ padding: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: selectedClientId === c._id ? Colors.primaryGlow : 'transparent' }}
                    onPress={() => setSelectedClientId(c._id)}
                  >
                    <Text style={{ color: selectedClientId === c._id ? Colors.primary : Colors.textPrimary }}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.xs }}>Revenue Amount (₹)</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.sm, padding: Spacing.sm, fontSize: FontSize.md, backgroundColor: Colors.surfaceHover, marginBottom: Spacing.lg, color: Colors.textPrimary }}
                placeholder="e.g. 50000"
                placeholderTextColor={Colors.textTertiary}
                value={revenueInput}
                onChangeText={setRevenueInput}
                keyboardType="numeric"
              />

              <Button title={updateClient.isPending ? "Saving..." : "Save Revenue"} onPress={handleLogRevenue} disabled={updateClient.isPending} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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

  // Page header (desktop)
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.xxl,
  },
  greeting: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  pageTitle: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statsGridDesktop: {
    gap: Spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  statCardDesktop: {
    minWidth: 200,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statChange: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  quickActionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semiBold,
  },

  // Quotation cards
  quotationCard: {
    marginBottom: Spacing.md,
  },
  quotationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quotationInfo: {
    flex: 1,
  },
  quotationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  quotationNumber: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary,
  },
  quotationClient: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    color: Colors.textPrimary,
  },
  quotationProject: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quotationRight: {
    alignItems: 'flex-end',
  },
  quotationAmount: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  quotationDate: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, width: '90%', maxWidth: 400, borderWidth: 1, borderColor: Colors.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
});
