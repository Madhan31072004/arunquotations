import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/lib/theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePublicQuotation, useAcceptPublicQuotation } from '@/features/data/apiHooks';
import { Ionicons } from '@expo/vector-icons';
import { CURRENCY } from '@/lib/constants';

const statusColors: Record<string, string> = {
  draft: Colors.statusDraft, sent: Colors.statusSent, pending: '#f59e0b',
  approved: Colors.statusApproved, rejected: Colors.statusRejected, revised: Colors.statusRevised,
};

export default function PublicQuotationScreen() {
  const { id } = useLocalSearchParams();
  const { data, isLoading, isError } = usePublicQuotation(id as string);
  const acceptQuotation = useAcceptPublicQuotation();

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isError || !data || !data.quotation) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={{ marginTop: Spacing.md, fontSize: FontSize.lg, color: Colors.textSecondary }}>Quotation not found or link expired.</Text>
      </View>
    );
  }

  const q = data.quotation;
  const company = data.company;
  const fmt = (n: number) => `${CURRENCY.symbol}${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const handleAccept = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to approve this quotation? This will notify the designer.");
      if (confirmed) {
        try {
          await acceptQuotation.mutateAsync(q._id);
          window.alert('Quotation approved successfully!');
        } catch (e) {
          window.alert('Failed to approve quotation. Please try again.');
        }
      }
    } else {
      Alert.alert(
        "Accept Quotation",
        "Are you sure you want to approve this quotation? This will notify the designer.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Accept", 
            onPress: async () => {
              try {
                await acceptQuotation.mutateAsync(q._id);
                Alert.alert('Success', 'Quotation approved successfully!');
              } catch (e) {
                Alert.alert('Error', 'Failed to approve quotation. Please try again.');
              }
            }
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Company Header */}
        <View style={styles.headerBox}>
          <Text style={styles.companyName}>{company?.companyName || 'Arun Interiors'}</Text>
          <Text style={styles.companyMeta}>{company?.email} | {company?.phone}</Text>
        </View>

        {/* Client & Quotation Info */}
        <Card variant="gold" padding="lg" style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.qTitle}>{q.title}</Text>
              <Badge text={q.status} color={statusColors[q.status?.toLowerCase()] || Colors.primary} variant="solid" size="md" />
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.grandTotalBig}>{fmt(q.grandTotal)}</Text>
              <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 }}>Total Amount</Text>
            </View>
          </View>
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}><Ionicons name="person-outline" size={14} color={Colors.textSecondary} /><Text style={styles.metaText}>{q.clientId?.name}</Text></View>
            <View style={styles.metaItem}><Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} /><Text style={styles.metaText}>{new Date(q.createdAt).toLocaleDateString()}</Text></View>
            <View style={styles.metaItem}><Ionicons name="document-text-outline" size={14} color={Colors.textSecondary} /><Text style={styles.metaText}>{q.quotationNumber}</Text></View>
          </View>
        </Card>

        {/* Area Breakdown */}
        {q.areas?.map((area: any, ai: number) => (
          <Card key={ai} variant="default" padding="none" style={styles.areaCard}>
            <View style={styles.areaHeader}>
              <Text style={styles.areaName}>{area.areaName}</Text>
              <Text style={styles.areaSub}>{fmt(area.subtotal)}</Text>
            </View>
            {area.items?.map((item: any, ii: number) => (
              <View key={ii} style={[styles.itemRow, ii === area.items.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemDesc}>{item.description} {item.finish ? <Text style={{ fontStyle: 'italic', fontWeight: 'normal', color: Colors.textSecondary }}>({item.finish})</Text> : ''}</Text>
                  {item.height && item.width ? (
                    <Text style={styles.itemMeta}>{item.height} ft × {item.width} ft = {(item.height * item.width).toFixed(2)} sq.ft × {fmt(item.unitPrice)} / sq.ft</Text>
                  ) : (
                    <Text style={styles.itemMeta}>{item.quantity || 1} sq.ft × {fmt(item.unitPrice)} / sq.ft</Text>
                  )}
                </View>
                <Text style={styles.itemAmt}>{fmt(item.amount)}</Text>
              </View>
            ))}
          </Card>
        ))}

        {/* Summary */}
        <Card variant="elevated" padding="md" style={{ marginTop: Spacing.md }}>
          <View style={styles.sumRow}><Text style={styles.sumLabel}>Subtotal</Text><Text style={styles.sumVal}>{fmt(q.subtotal)}</Text></View>
          {q.discountAmount > 0 && <View style={styles.sumRow}><Text style={styles.sumLabel}>Discount ({q.discountValue}%)</Text><Text style={[styles.sumVal, { color: Colors.error }]}>-{fmt(q.discountAmount)}</Text></View>}
          <View style={styles.sumRow}><Text style={styles.sumLabel}>GST ({q.taxPercentage}%)</Text><Text style={styles.sumVal}>+{fmt(q.taxAmount)}</Text></View>
          <View style={[styles.sumRow, styles.totalRow]}><Text style={styles.totalLabel}>Grand Total</Text><Text style={styles.totalVal}>{fmt(q.grandTotal)}</Text></View>
        </Card>

      </ScrollView>

      {/* Action Footer or Success Message */}
      {q.status === 'approved' ? (
        <View style={[styles.footer, { backgroundColor: Colors.successBg, alignItems: 'center', paddingVertical: Spacing.xl }]}>
          <Ionicons name="checkmark-circle" size={48} color={Colors.success} style={{ marginBottom: Spacing.sm }} />
          <Text style={{ fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.success }}>Quotation Approved!</Text>
          <Text style={{ textAlign: 'center', fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.sm, maxWidth: 400 }}>
            Thanks for choosing {company?.companyName || 'Arun Interior Studio'}. We will start the next steps shortly!
          </Text>
        </View>
      ) : q.status !== 'rejected' ? (
        <View style={styles.footer}>
          <Button 
            title={acceptQuotation.isPending ? "Approving..." : "Accept Quotation"} 
            onPress={handleAccept} 
            disabled={acceptQuotation.isPending}
            size="lg" 
            icon={<Ionicons name="checkmark-circle" size={24} color={Colors.textInverse} />}
          />
          <Text style={{ textAlign: 'center', fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: Spacing.sm }}>
            By accepting, you agree to the terms and conditions.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: 150, maxWidth: 800, alignSelf: 'center', width: '100%' },
  headerBox: { alignItems: 'center', marginBottom: Spacing.xl, marginTop: Spacing.lg },
  companyName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.primary },
  companyMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  
  headerCard: { marginBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  qTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  grandTotalBig: { fontSize: FontSize.xxl, fontWeight: FontWeight.extraBold, color: Colors.primary },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: Spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  
  areaCard: { marginBottom: Spacing.md },
  areaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, backgroundColor: Colors.surfaceElevated },
  areaName: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  areaSub: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemDesc: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  itemMeta: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  itemAmt: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.textPrimary, marginLeft: Spacing.md },
  
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  sumLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  sumVal: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.borderGold, paddingTop: Spacing.md, marginTop: Spacing.sm, marginBottom: 0 },
  totalLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  totalVal: { fontSize: FontSize.xxl, fontWeight: FontWeight.extraBold, color: Colors.primary },

  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: Colors.surface, padding: Spacing.lg, 
    borderTopWidth: 1, borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg 
  }
});
