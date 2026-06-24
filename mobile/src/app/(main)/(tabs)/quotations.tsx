import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/lib/theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Header } from '@/components/layout/Header';
import { useResponsive } from '@/hooks/useResponsive';
import { CURRENCY, QUOTATION_STATUSES } from '@/lib/constants';
import { useQuotations } from '@/features/data/apiHooks';
import { ActivityIndicator } from 'react-native';

const statusColors: Record<string, string> = {
  draft: Colors.statusDraft,
  sent: Colors.statusSent,
  approved: Colors.statusApproved,
  rejected: Colors.statusRejected,
  revised: Colors.statusRevised,
};

export default function QuotationsScreen() {
  const router = useRouter();
  const { isMobile, isDesktop, contentPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const { data: quotations, isLoading } = useQuotations();

  const filters = ['all', 'draft', 'sent', 'approved', 'rejected', 'revised'];

  const quotationList = quotations || [];
  const filtered = quotationList.filter((q: any) => {
    const matchSearch =
      (q.clientId?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      q.quotationNumber.toLowerCase().includes(search.toLowerCase()) ||
      q.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'all' || q.status === activeFilter;
    return matchSearch && matchFilter;
  });

  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return `${CURRENCY.symbol}${(amount / 100000).toFixed(1)}L`;
    }
    return `${CURRENCY.symbol}${amount.toLocaleString('en-IN')}`;
  };

  return (
    <View style={styles.container}>
      {isMobile && (
        <Header
          title="Quotations"
          rightAction={
            <Button
              title=""
              onPress={() => router.push('/(main)/quotation/create' as any)}
              variant="primary"
              size="sm"
              icon={<Ionicons name="add" size={20} color={Colors.textInverse} />}
              style={{ width: 40, height: 40, borderRadius: 20, paddingHorizontal: 0 }}
            />
          }
        />
      )}

  const handleFilterChange = (f: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveFilter(f);
  };

  const handleSearchChange = (t: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearch(t);
  };

  const handleClearSearch = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSearch('');
  };

  const renderHeader = () => (
    <View style={{ paddingBottom: Spacing.md }}>
      {/* Desktop header */}
      {isDesktop && (
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Quotations</Text>
            <Text style={styles.pageSubtitle}>{quotationList.length} total quotations</Text>
          </View>
          <Button
            title="Create Quotation"
            onPress={() => router.push('/(main)/quotation/create' as any)}
            icon={<Ionicons name="add" size={20} color={Colors.textInverse} />}
          />
        </View>
      )}

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search quotations..."
          placeholderTextColor={Colors.textTertiary}
          value={search}
          onChangeText={handleSearchChange}
          selectionColor={Colors.primary}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => handleFilterChange(f)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === f && styles.filterTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderItem = ({ item: q }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/(main)/quotation/${q._id}` as any)}
    >
      <Card variant="default" padding="md" style={styles.quotationCard}>
        <View style={styles.cardTop}>
          <View style={styles.cardTopLeft}>
            <Text style={styles.quotationNumber}>{q.quotationNumber}</Text>
            <Badge text={q.status} color={statusColors[q.status]} variant="soft" />
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
        </View>

        <Text style={styles.clientName}>{q.clientId?.name || 'Unknown Client'}</Text>
        <Text style={styles.projectName}>{q.title}</Text>

        <View style={styles.cardBottom}>
          <View style={styles.cardMeta}>
            <Ionicons name="layers-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{q.areas?.length || 0} areas</Text>
          </View>
          <View style={styles.cardMeta}>
            <Ionicons name="calendar-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.metaText}>{new Date(q.createdAt).toLocaleDateString()}</Text>
          </View>
          <Text style={styles.amount}>{formatAmount(q.grandTotal)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color={Colors.textTertiary} />
      <Text style={styles.emptyTitle}>No quotations found</Text>
      <Text style={styles.emptySubtitle}>
        {search ? 'Try a different search term' : 'Create your first quotation'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {isMobile && (
        <Header
          title="Quotations"
          rightAction={
            <Button
              title=""
              onPress={() => router.push('/(main)/quotation/create' as any)}
              variant="primary"
              size="sm"
              icon={<Ionicons name="add" size={20} color={Colors.textInverse} />}
              style={{ width: 40, height: 40, borderRadius: 20, paddingHorizontal: 0 }}
            />
          }
        />
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[styles.scrollContent, { padding: contentPadding }]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: Spacing.huge },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.xxl,
    paddingTop: Spacing.xl,
  },
  pageTitle: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  pageSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },

  filterScroll: { marginBottom: Spacing.lg },
  filterContent: { gap: Spacing.sm },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryGlow,
    borderColor: Colors.primary,
  },
  filterText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  filterTextActive: { color: Colors.primary, fontWeight: FontWeight.semiBold },

  quotationCard: { marginBottom: Spacing.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  quotationNumber: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.primary },
  clientName: { fontSize: FontSize.lg, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  projectName: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: Spacing.lg },
  metaText: { fontSize: FontSize.xs, color: Colors.textTertiary },
  amount: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginLeft: 'auto' },

  emptyState: { alignItems: 'center', paddingTop: Spacing.huge },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.semiBold, color: Colors.textSecondary, marginTop: Spacing.lg },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.textTertiary, marginTop: Spacing.xs },
});
