import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/lib/theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useResponsive } from '@/hooks/useResponsive';
import { CURRENCY } from '@/lib/constants';
import { generateQuotationHTML, printHtmlToPdfWeb } from '@/lib/pdfTemplate';
import { useQuotation, useCompanyProfile, useUpdateQuotation, useSendQuotationEmail } from '@/features/data/apiHooks';
import { ActivityIndicator, Alert, Modal, Pressable, Linking, TextInput } from 'react-native';
import * as FileSystem from 'expo-file-system';

const statusColors: Record<string, string> = {
  draft: Colors.statusDraft, sent: Colors.statusSent, pending: '#f59e0b',
  approved: Colors.statusApproved, rejected: Colors.statusRejected, revised: Colors.statusRevised,
};

export default function QuotationDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isMobile, isDesktop, contentPadding } = useResponsive();
  
  const { data: q, isLoading } = useQuotation(id as string);
  const { data: company } = useCompanyProfile();
  const updateQuotation = useUpdateQuotation();
  const sendEmail = useSendQuotationEmail();
  
  const [showStatusModal, setShowStatusModal] = React.useState(false);
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [emailInput, setEmailInput] = React.useState('');
  
  const fmt = (n: number) => `${CURRENCY.symbol}${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const generatePDF = async () => {
    try {
      const html = generateQuotationHTML(q, company);
      if (Platform.OS === 'web') {
        printHtmlToPdfWeb(html);
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        const cleanName = `Quotation_${q.quotationNumber || 'Document'}.pdf`;
        // @ts-ignore
        const newUri = `${FileSystem.documentDirectory}${cleanName}`;
        await FileSystem.copyAsync({ from: uri, to: newUri });
        await Sharing.shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateQuotation.mutateAsync({ id: q._id, data: { status: newStatus } });
      setShowStatusModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleWhatsApp = async () => {
    setShowShareMenu(false);
    const phone = q.clientId?.phone || '';
    const text = `Hello ${q.clientId?.name || ''},\n\nHere is your quotation for: *${q.title}*\nTotal Amount: ${fmt(q.grandTotal)}\n\nPlease review it and let us know if you have any questions.\n\nBest Regards,\n${company?.companyName || 'Arun Interiors'}`;
    const url = `https://wa.me/${phone.replace(/\D/g,'')}?text=${encodeURIComponent(text)}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open WhatsApp'));
    
    // Auto update status to pending
    try {
      await updateQuotation.mutateAsync({ id: q._id, data: { status: 'pending' } });
    } catch (e) {
      console.error('Failed to update status to pending');
    }
  };

  const executeSendEmail = async (email: string) => {
    if (!email) {
      Alert.alert('Error', 'Please provide an email address.');
      return;
    }
    try {
      const html = generateQuotationHTML(q, company);
      await sendEmail.mutateAsync({ id: q._id, data: { html, toEmail: email } });
      Alert.alert('Success', 'Quotation sent via email successfully!');
      setShowShareMenu(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to send email. Check your business email credentials.');
    }
  };

  if (isLoading || !q) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{q.quotationNumber}</Text>
        <View style={styles.topActions}>
          <Button title="Edit" onPress={() => router.push({ pathname: '/(main)/quotation/create', params: { id } })} variant="outline" size="sm" icon={<Ionicons name="create-outline" size={16} color={Colors.primary} />} />
          <Button title="PDF" onPress={generatePDF} size="sm" icon={<Ionicons name="download-outline" size={16} color={Colors.textInverse} />} style={{ marginLeft: 8 }} />
          <Button title="Share" onPress={() => setShowShareMenu(true)} size="sm" variant="outline" icon={<Ionicons name="share-social-outline" size={16} color={Colors.primary} />} style={{ marginLeft: 8 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { padding: contentPadding }]} showsVerticalScrollIndicator={false}>
        {/* Header Info */}
        <Card variant="gold" padding="md" style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.qTitle}>{q.title}</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }} activeOpacity={0.7}>
                <Badge text={q.status} color={statusColors[q.status?.toLowerCase()] || Colors.primary} variant="soft" size="md" />
                <Ionicons name="chevron-down-circle" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.grandTotalBig}>{fmt(q.grandTotal)}</Text>
          </View>
          <View style={styles.metaGrid}>
            <View style={styles.metaItem}><Ionicons name="person-outline" size={14} color={Colors.textTertiary} /><Text style={styles.metaText}>{q.clientId?.name}</Text></View>
            <View style={styles.metaItem}><Ionicons name="calendar-outline" size={14} color={Colors.textTertiary} /><Text style={styles.metaText}>{new Date(q.createdAt).toLocaleDateString()}</Text></View>
            <View style={styles.metaItem}><Ionicons name="layers-outline" size={14} color={Colors.textTertiary} /><Text style={styles.metaText}>{q.areas?.length || 0} areas</Text></View>
          </View>
        </Card>

        {/* Area Breakdown */}
        {q.areas?.map((area: any, ai: number) => (
          <Card key={ai} variant="default" padding="none" style={styles.areaCard}>
            <View style={styles.areaHeader}>
              <View style={styles.areaLeft}>
                <Ionicons name={area.areaName === "General Items" ? "list" : "layers"} size={18} color={Colors.primary} />
                <Text style={styles.areaName}>{area.areaName === "General Items" ? "Standalone Items" : area.areaName}</Text>
              </View>
              <Text style={styles.areaSub}>{fmt(area.subtotal)}</Text>
            </View>
            {area.items?.map((item: any, ii: number) => (
              <View key={ii} style={[styles.itemRow, ii === area.items.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemDesc}>
                    {item.description}
                    {item.finish ? <Text style={{ fontStyle: 'italic', fontWeight: 'normal', color: Colors.textSecondary }}> ({item.finish})</Text> : null}
                  </Text>
                  {item.height && item.width ? (
                    <Text style={styles.itemMeta}>
                      {item.height} ft × {item.width} ft = {(item.height * item.width).toFixed(2)} sq.ft {item.quantity > 1 ? `(Qty: ${item.quantity}) ` : ''}× {fmt(item.unitPrice)} / sq.ft
                    </Text>
                  ) : (
                    <Text style={styles.itemMeta}>
                      {item.quantity || 1} sq.ft × {fmt(item.unitPrice)} / sq.ft
                    </Text>
                  )}
                </View>
                <Text style={styles.itemAmt}>{fmt(item.amount)}</Text>
              </View>
            ))}
          </Card>
        ))}

        {/* Summary */}
        <Card variant="elevated" padding="md" style={{ marginTop: Spacing.sm }}>
          <View style={styles.sumRow}><Text style={styles.sumLabel}>Subtotal</Text><Text style={styles.sumVal}>{fmt(q.subtotal)}</Text></View>
          {q.discountAmount > 0 && <View style={styles.sumRow}><Text style={styles.sumLabel}>Discount ({q.discountValue}{q.discountType === 'percentage' ? '%' : ''})</Text><Text style={[styles.sumVal, { color: Colors.error }]}>-{fmt(q.discountAmount)}</Text></View>}
          <View style={styles.sumRow}><Text style={styles.sumLabel}>GST ({q.taxPercentage}%)</Text><Text style={styles.sumVal}>+{fmt(q.taxAmount)}</Text></View>
          <View style={[styles.sumRow, styles.totalRow]}><Text style={styles.totalLabel}>Grand Total</Text><Text style={styles.totalVal}>{fmt(q.grandTotal)}</Text></View>
        </Card>
      </ScrollView>

      <Modal visible={showStatusModal} transparent animationType="fade" onRequestClose={() => setShowStatusModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowStatusModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Change Status</Text>
            {Object.keys(statusColors).map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.statusOption, q.status?.toLowerCase() === status && styles.statusOptionActive]}
                onPress={() => handleStatusChange(status)}
              >
                <Badge text={status} color={statusColors[status]} variant={q.status?.toLowerCase() === status ? "solid" : "soft"} size="md" />
                {q.status?.toLowerCase() === status && <Ionicons name="checkmark" size={20} color={statusColors[status]} />}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Share Web Menu */}
      <Modal visible={showShareMenu} transparent animationType="fade" onRequestClose={() => setShowShareMenu(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowShareMenu(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Share Quotation</Text>
            
            <View style={{ marginBottom: Spacing.lg }}>
              <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm }}>
                Send via Email (PDF Attached)
              </Text>
              {q.clientId?.email ? (
                <TouchableOpacity style={[styles.statusOption, { paddingVertical: Spacing.sm }]} onPress={() => executeSendEmail(q.clientId.email)} disabled={sendEmail.isPending}>
                  <Ionicons name="mail" size={20} color={Colors.primary} />
                  <Text style={{ flex: 1, marginLeft: 12, fontSize: FontSize.md, color: Colors.textPrimary }}>
                    {sendEmail.isPending ? 'Sending...' : `Send to ${q.clientId.email}`}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                  <TextInput
                    style={{ flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, fontSize: FontSize.md, backgroundColor: Colors.surfaceHover, color: Colors.textPrimary }}
                    placeholder="Client Email"
                    placeholderTextColor={Colors.textTertiary}
                    value={emailInput}
                    onChangeText={setEmailInput}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <Button title={sendEmail.isPending ? "..." : "Send"} size="sm" onPress={() => executeSendEmail(emailInput)} disabled={sendEmail.isPending} />
                </View>
              )}
            </View>

            <View>
              <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm }}>
                Send via WhatsApp
              </Text>
              <TouchableOpacity style={[styles.statusOption, { paddingVertical: Spacing.sm }]} onPress={handleWhatsApp}>
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                <Text style={{ flex: 1, marginLeft: 12, fontSize: FontSize.md, color: Colors.textPrimary }}>Send to {q.clientId?.phone || 'Client'}</Text>
              </TouchableOpacity>
            </View>

          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  topTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  topActions: { flexDirection: 'row' },
  scroll: { paddingBottom: 100 },
  headerCard: { marginBottom: Spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  qTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  grandTotalBig: { fontSize: FontSize.xxl, fontWeight: FontWeight.extraBold, color: Colors.primary },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  areaCard: { marginBottom: Spacing.md },
  areaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, backgroundColor: Colors.surfaceElevated },
  areaLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  areaName: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
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
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 300, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md, color: Colors.textPrimary },
  statusOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  statusOptionActive: { borderRadius: BorderRadius.sm, backgroundColor: Colors.surfaceElevated },
});
