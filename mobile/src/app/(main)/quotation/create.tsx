import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/lib/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useResponsive } from '@/hooks/useResponsive';
import { CURRENCY, AREA_TEMPLATES, UNIT_TYPES, TAX_TYPES } from '@/lib/constants';
import { generateQuotationHTML, printHtmlToPdfWeb } from '@/lib/pdfTemplate';
import { useCreateQuotation, useClients, useCompanyProfile, useCreateClient, useQuotation, useUpdateQuotation, useMaterials } from '@/features/data/apiHooks';
import * as FileSystem from 'expo-file-system';

interface LineItem {
  id: string; description: string; unit: string;
  finish: string;
  height: string; width: string;
  quantity: string; unitPrice: string; costPrice: number; amount: number; remarks: string;
}
interface Area {
  id: string; areaName: string; items: LineItem[]; subtotal: number; collapsed: boolean;
}

const emptyItem = (): LineItem => ({
  id: Date.now().toString() + Math.random(), description: '', unit: 'sq.ft',
  finish: '',
  height: '', width: '',
  quantity: '1', unitPrice: '', costPrice: 0, amount: 0, remarks: '',
});

export default function CreateQuotationScreen() {
  const router = useRouter();
  const { isMobile, isDesktop, contentPadding } = useResponsive();

  const { id } = useLocalSearchParams();
  const { data: existingQuotation, isLoading: isQuoteLoading } = useQuotation(id as string);
  const updateQuotation = useUpdateQuotation();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [areas, setAreas] = useState<Area[]>([
    { id: '1', areaName: 'Master Bedroom', items: [emptyItem()], subtotal: 0, collapsed: false },
  ]);
  const [discountPct, setDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(18);
  const [showAreaPicker, setShowAreaPicker] = useState(false);
  const [quotationNumber, setQuotationNumber] = useState('');
  const [galleryImages, setGalleryImages] = useState('');
  const [validDays, setValidDays] = useState('30');

  const { data: clients } = useClients();
  const createClient = useCreateClient();
  const { data: company } = useCompanyProfile();
  const createQuotation = useCreateQuotation();
  const { data: materials } = useMaterials();

  useEffect(() => {
    if (existingQuotation) {
      setTitle(existingQuotation.title || '');
      setClientName(existingQuotation.clientId?.name || '');
      setDiscountPct(existingQuotation.discountValue || 0);
      setTaxPct(existingQuotation.taxPercentage || 18);
      setQuotationNumber(existingQuotation.quotationNumber || '');

      if (existingQuotation.areas && existingQuotation.areas.length > 0) {
        setAreas(existingQuotation.areas.map((a: any) => ({
          id: a._id || Date.now().toString() + Math.random(),
          areaName: a.areaName,
          items: a.items.map((i: any) => ({
            id: i._id || Date.now().toString() + Math.random(),
            description: i.description,
            unit: i.unit || 'sq.ft',
            finish: i.finish || '',
            height: i.height !== undefined && i.height !== null ? String(i.height) : '',
            width: i.width !== undefined && i.width !== null ? String(i.width) : '',
            quantity: i.quantity !== undefined && i.quantity !== null ? String(i.quantity) : '1',
            unitPrice: i.unitPrice !== undefined && i.unitPrice !== null ? String(i.unitPrice) : '',
            amount: i.amount || 0,
            remarks: i.remarks || '',
          })),
          subtotal: a.subtotal || 0,
          collapsed: false
        })));
      }
      if (existingQuotation.galleryImages) {
        setGalleryImages(existingQuotation.galleryImages.join(', '));
      }
      if (existingQuotation.validUntil) {
        const diff = Math.ceil((new Date(existingQuotation.validUntil).getTime() - new Date(existingQuotation.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        setValidDays(diff > 0 ? String(diff) : '30');
      }
    }
  }, [existingQuotation]);

  useEffect(() => {
    if (id) return;
    if (company) {
      if (company.taxPercentage !== undefined) {
        setTaxPct(company.taxPercentage);
      }
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      const prefix = company.quotationPrefix || 'AQ';
      setQuotationNumber(`${prefix}-${year}-${rand}`);
    } else {
      const year = new Date().getFullYear();
      const rand = Math.floor(1000 + Math.random() * 9000);
      setQuotationNumber(`AQ-${year}-${rand}`);
    }
  }, [company, id]);

  const handleSave = async () => {
    if (!title) {
      alert('Please enter a quotation title');
      return;
    }
    if (!clientName) {
      alert('Please enter a client name');
      return;
    }

    try {
      let activeClientId = '';
      if (clientName) {
        const trimmedName = clientName.trim();
        const existing = (clients || []).find((c: any) => c.name.toLowerCase() === trimmedName.toLowerCase());
        if (existing) {
          activeClientId = existing._id;
        } else {
          // Dynamic client creation
          const newClient = await createClient.mutateAsync({
            name: trimmedName,
            projectName: title || 'Interior Project',
            phone: '',
            email: '',
          });
          activeClientId = newClient._id;
        }
      }

      const cleanedAreas = areas.map(a => ({
        areaName: a.areaName,
        items: a.items
          .filter(i => i.description.trim().length > 0)
          .map(i => ({
            description: i.description.trim(),
            finish: i.finish ? i.finish.trim() : '',
            unit: 'sq.ft',
            height: parseFloat(String(i.height)) || 0,
            width: parseFloat(String(i.width)) || 0,
            quantity: parseFloat(String(i.quantity)) || 0,
            unitPrice: parseFloat(String(i.unitPrice)) || 0,
            costPrice: i.costPrice || 0
          }))
      })).filter(a => a.items.length > 0);

      if (cleanedAreas.length === 0) {
        alert('Please add at least one line item with a description before saving!');
        return;
      }

      const payload = {
        title,
        clientId: activeClientId || undefined,
        quotationNumber,
        status: 'draft',
        discountType: 'percentage',
        discountValue: discountPct,
        taxPercentage: taxPct,
        validUntil: new Date(Date.now() + Number(validDays) * 24 * 60 * 60 * 1000),
        areas: cleanedAreas,
        galleryImages: galleryImages ? galleryImages.split(',').map(u => u.trim()).filter(Boolean) : []
      };

      if (id) {
        await updateQuotation.mutateAsync({
          id: id as string,
          data: payload
        });
        router.replace(`/(main)/quotation/${id}` as any);
      } else {
        const newQuote = await createQuotation.mutateAsync(payload);
        router.replace(`/(main)/quotation/${newQuote._id}` as any);
      }
    } catch (e) {
      console.error('Save error:', e);
      alert('Failed to save quotation');
    }
  };

  const updateItem = (areaIdx: number, itemIdx: number, field: string, value: any) => {
    setAreas(prev => {
      const next = [...prev];
      const area = { ...next[areaIdx] };
      const items = [...area.items];
      const item = { ...items[itemIdx], [field]: value };
      
      // Auto-fill prices if description matches a material
      if (field === 'description' && materials) {
        const match = materials.find((m: any) => m.name.toLowerCase() === value.trim().toLowerCase());
        if (match) {
          if (!item.unitPrice) item.unitPrice = String(match.unitPrice);
          item.costPrice = match.costPrice || 0;
        }
      }

      if (field === 'quantity' || field === 'unitPrice' || field === 'height' || field === 'width' || field === 'description') {
        const h = parseFloat(String(item.height)) || 0;
        const w = parseFloat(String(item.width)) || 0;
        const qty = parseFloat(String(item.quantity)) || 0;
        const rate = parseFloat(String(item.unitPrice)) || 0;
        const dimensionArea = (h > 0 && w > 0) ? (h * w) : 1;
        item.amount = dimensionArea * qty * rate;
      }
      items[itemIdx] = item;
      area.items = items;
      area.subtotal = items.reduce((s, i) => s + (i.amount || 0), 0);
      next[areaIdx] = area;
      return next;
    });
  };

  const addItem = (areaIdx: number) => {
    setAreas(prev => {
      const next = [...prev];
      next[areaIdx] = { ...next[areaIdx], items: [...next[areaIdx].items, emptyItem()] };
      return next;
    });
  };

  const removeItem = (areaIdx: number, itemIdx: number) => {
    setAreas(prev => {
      const next = [...prev];
      const area = { ...next[areaIdx] };
      area.items = area.items.filter((_, i) => i !== itemIdx);
      area.subtotal = area.items.reduce((s, i) => s + (i.amount || 0), 0);
      next[areaIdx] = area;
      return next;
    });
  };

  const addArea = (name: string) => {
    setAreas(prev => [...prev, {
      id: Date.now().toString(), areaName: name, items: [emptyItem()], subtotal: 0, collapsed: false,
    }]);
    setShowAreaPicker(false);
  };

  const removeArea = (idx: number) => {
    setAreas(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleCollapse = (idx: number) => {
    setAreas(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], collapsed: !next[idx].collapsed };
      return next;
    });
  };

  const updateAreaName = (areaIdx: number, newName: string) => {
    setAreas(prev => {
      const next = [...prev];
      next[areaIdx] = { ...next[areaIdx], areaName: newName };
      return next;
    });
  };

  const moveArea = (index: number, direction: 'up' | 'down') => {
    setAreas(prev => {
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < next.length) {
        const temp = next[index];
        next[index] = next[targetIndex];
        next[targetIndex] = temp;
      }
      return next;
    });
  };

  const subtotal = areas.reduce((s, a) => s + a.subtotal, 0);
  const discountAmt = (subtotal * discountPct) / 100;
  const afterDiscount = subtotal - discountAmt;
  const taxAmt = (afterDiscount * taxPct) / 100;
  const grandTotal = afterDiscount + taxAmt;

  const fmt = (n: number) => `${CURRENCY.symbol}${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const generatePDF = async () => {
    try {
      const html = generateQuotationHTML({
        title, clientName: clientName || 'Unknown Client', areas, subtotal, discountPct, discountAmt, taxPct, taxAmt, grandTotal, quotationNumber,
        galleryImages: galleryImages ? galleryImages.split(',').map(u => u.trim()).filter(Boolean) : []
      }, company);

      if (Platform.OS === 'web') {
        // Use our robust custom iframe printer to ensure ONLY the PDF prints, not the Chrome page wrapper
        printHtmlToPdfWeb(html);
      } else {
        // On mobile, generate an actual file, rename it for sharing
        const { uri } = await Print.printToFileAsync({ html });
        const cleanName = `Quotation_${quotationNumber || 'Document'}.pdf`;
        // @ts-ignore
        const newUri = `${FileSystem.documentDirectory}${cleanName}`;
        await FileSystem.copyAsync({ from: uri, to: newUri });
        await Sharing.shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  const renderSummary = () => (
    <Card variant="gold" padding="md" style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Pricing Summary</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>{fmt(subtotal)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryInputRow}>
          <Text style={styles.summaryLabel}>Discount</Text>
          <TextInput style={styles.pctInput} value={String(discountPct)} onChangeText={v => setDiscountPct(Number(v) || 0)} keyboardType="numeric" selectionColor={Colors.primary} />
          <Text style={styles.pctSign}>%</Text>
        </View>
        <Text style={[styles.summaryValue, { color: Colors.error }]}>-{fmt(discountAmt)}</Text>
      </View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryInputRow}>
          <Text style={styles.summaryLabel}>GST</Text>
          <TextInput style={styles.pctInput} value={String(taxPct)} onChangeText={v => setTaxPct(Number(v) || 0)} keyboardType="numeric" selectionColor={Colors.primary} />
          <Text style={styles.pctSign}>%</Text>
        </View>
        <Text style={styles.summaryValue}>+{fmt(taxAmt)}</Text>
      </View>
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Grand Total</Text>
        <Text style={styles.totalValue}>{fmt(grandTotal)}</Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={[styles.topBar, Platform.OS === 'web' && { paddingTop: Spacing.lg }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{id ? 'Edit Quotation' : 'New Quotation'}</Text>
        <Button title={createQuotation.isPending || updateQuotation.isPending ? "Saving..." : "Save"} onPress={handleSave} disabled={createQuotation.isPending || updateQuotation.isPending} size="sm" />
      </View>

      <View style={[styles.body, isDesktop && styles.bodyDesktop]}>
        {/* Editor */}
        <ScrollView style={[styles.editor, isDesktop && styles.editorDesktop]} contentContainerStyle={{ padding: contentPadding, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <Input label="Quotation Title" placeholder="e.g. 3BHK Modern Interior" value={title} onChangeText={setTitle} icon="document-text-outline" />

          <Input
            label="Client Name"
            placeholder="e.g. Priya Sharma"
            value={clientName}
            onChangeText={setClientName}
            icon="person-outline"
          />

          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Valid For (Days)"
                placeholder="30"
                value={validDays}
                onChangeText={setValidDays}
                keyboardType="numeric"
                icon="timer-outline"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 6, fontWeight: FontWeight.medium }}>Expires On</Text>
              <View style={{ height: 48, backgroundColor: Colors.surfaceHover, borderRadius: BorderRadius.md, justifyContent: 'center', paddingHorizontal: Spacing.md, borderWidth: 1, borderColor: Colors.border }}>
                <Text style={{ color: Colors.textPrimary, fontSize: FontSize.md }}>
                  {new Date(Date.now() + Number(validDays || 0) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {clientName.trim().length > 0 && !clients?.some((c: any) => c.name.toLowerCase() === clientName.trim().toLowerCase()) && (
            <View style={{ marginTop: -Spacing.sm, marginBottom: Spacing.md, gap: 1, backgroundColor: Colors.border, borderRadius: BorderRadius.md, overflow: 'hidden' }}>
              {clients?.filter((c: any) => c.name.toLowerCase().includes(clientName.toLowerCase())).map((c: any) => (
                <TouchableOpacity
                  key={c._id}
                  style={{ padding: Spacing.md, backgroundColor: Colors.surfaceElevated }}
                  onPress={() => setClientName(c.name)}
                >
                  <Text style={{ color: Colors.textPrimary, fontSize: FontSize.sm, fontWeight: FontWeight.medium }}>{c.name} <Text style={{ color: Colors.textTertiary, fontWeight: FontWeight.regular }}>({c.projectName || 'Active Client'})</Text></Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Areas */}
          {areas.map((area, ai) => {
            const isGeneral = area.areaName === "General Items";
            return (
              <View key={area.id} style={styles.areaBlock}>
                <View style={[styles.areaHeader, isGeneral && { backgroundColor: Colors.surfaceHover }]}>
                  <View style={styles.areaHeaderLeft}>
                    {isGeneral ? (
                      <>
                        <Ionicons name="list" size={18} color={Colors.primary} style={{ marginLeft: 6 }} />
                        <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textSecondary, marginLeft: 8 }}>Standalone Items</Text>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity onPress={() => toggleCollapse(ai)} style={{ padding: 6 }}>
                          <Ionicons name={area.collapsed ? 'chevron-forward' : 'chevron-down'} size={18} color={Colors.primary} />
                        </TouchableOpacity>
                        <Ionicons name="layers" size={18} color={Colors.primary} style={{ marginLeft: 2 }} />
                        <TextInput
                          style={{ flex: 1, color: Colors.textPrimary, fontSize: FontSize.md, fontWeight: FontWeight.bold, marginLeft: 8, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4, backgroundColor: Colors.surfaceHover }}
                          value={area.areaName}
                          onChangeText={v => updateAreaName(ai, v)}
                          placeholder="Room Name..."
                          placeholderTextColor={Colors.textTertiary}
                          selectionColor={Colors.primary}
                        />
                      </>
                    )}
                  </View>
                  <View style={styles.areaHeaderRight}>
                    <Text style={styles.areaSubtotal}>{fmt(area.subtotal)}</Text>

                    {!isGeneral && (
                      /* Up/Down Arrow buttons for reordering rooms */
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, gap: 6 }}>
                        <TouchableOpacity
                          onPress={() => moveArea(ai, 'up')}
                          disabled={ai === 0}
                          style={{ padding: 4, opacity: ai === 0 ? 0.3 : 1 }}
                        >
                          <Ionicons name="arrow-up" size={18} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => moveArea(ai, 'down')}
                          disabled={ai === areas.length - 1}
                          style={{ padding: 4, opacity: ai === areas.length - 1 ? 0.3 : 1 }}
                        >
                          <Ionicons name="arrow-down" size={18} color={Colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    )}

                    {areas.length > 1 && (
                      <TouchableOpacity onPress={() => removeArea(ai)} style={styles.removeAreaBtn}>
                        <Ionicons name="trash-outline" size={16} color={Colors.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {!area.collapsed && (
                  <View style={styles.areaContent}>
                    {isMobile ? (
                      area.items.map((item, ii) => (
                        <View key={item.id} style={styles.mobileItemCard}>
                          <TextInput style={styles.mobileDescInput} placeholder="Item description..." placeholderTextColor={Colors.textTertiary} value={item.description} onChangeText={v => updateItem(ai, ii, 'description', v)} selectionColor={Colors.primary} />
                          <TextInput style={[styles.mobileDescInput, { marginTop: Spacing.xs, fontStyle: 'italic', fontSize: FontSize.sm }]} placeholder="Finish / Materials used..." placeholderTextColor={Colors.textTertiary} value={item.finish} onChangeText={v => updateItem(ai, ii, 'finish', v)} selectionColor={Colors.primary} />

                          {/* Row for Dimensions */}
                          <View style={[styles.mobileItemRow, { marginTop: Spacing.xs, marginBottom: Spacing.sm }]}>
                            <View style={styles.mobileField}>
                              <Text style={styles.mobileFieldLabel}>Height (ft)</Text>
                              <TextInput style={styles.mobileFieldInput} placeholder="0" value={item.height} onChangeText={v => updateItem(ai, ii, 'height', v)} keyboardType="numeric" selectionColor={Colors.primary} />
                            </View>
                            <Text style={styles.mobileX}>×</Text>
                            <View style={styles.mobileField}>
                              <Text style={styles.mobileFieldLabel}>Width (ft)</Text>
                              <TextInput style={styles.mobileFieldInput} placeholder="0" value={item.width} onChangeText={v => updateItem(ai, ii, 'width', v)} keyboardType="numeric" selectionColor={Colors.primary} />
                            </View>
                            <Text style={styles.mobileEquals}>=</Text>
                            <View style={styles.mobileField}>
                              <Text style={styles.mobileFieldLabel}>Sq.Ft</Text>
                              <Text style={[styles.mobileFieldInput, { fontWeight: FontWeight.bold, backgroundColor: Colors.surfaceHover, textAlign: 'center' }]}>
                                {item.height && item.width ? (parseFloat(item.height) * parseFloat(item.width)).toFixed(2) : '0.00'}
                              </Text>
                            </View>
                          </View>

                          {/* Row for Qty, Rate, Amount */}
                          <View style={styles.mobileItemRow}>
                            <View style={styles.mobileField}>
                              <Text style={styles.mobileFieldLabel}>Qty</Text>
                              <TextInput style={styles.mobileFieldInput} value={item.quantity} onChangeText={v => updateItem(ai, ii, 'quantity', v)} keyboardType="numeric" selectionColor={Colors.primary} />
                            </View>
                            <Text style={styles.mobileX}>×</Text>
                            <View style={styles.mobileField}>
                              <Text style={styles.mobileFieldLabel}>Rate</Text>
                              <TextInput style={styles.mobileFieldInput} value={item.unitPrice} onChangeText={v => updateItem(ai, ii, 'unitPrice', v)} keyboardType="numeric" selectionColor={Colors.primary} />
                            </View>
                            <Text style={styles.mobileEquals}>=</Text>
                            <Text style={styles.mobileAmount}>{fmt(item.amount)}</Text>
                            <TouchableOpacity onPress={() => removeItem(ai, ii)} style={styles.deleteItemBtn}>
                              <Ionicons name="close-circle" size={20} color={Colors.error} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    ) : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={{ minWidth: 900, flexDirection: 'column' }}>
                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                          <Text style={[styles.th, { flex: 0.5 }]}>#</Text>
                          <Text style={[styles.th, { flex: 1.8 }]}>Description</Text>
                          <Text style={[styles.th, { flex: 1.2 }]}>Finish</Text>
                          <Text style={[styles.th, { flex: 0.7, textAlign: 'center' }]}>Height</Text>
                          <Text style={[styles.th, { flex: 0.7, textAlign: 'center' }]}>Width</Text>
                          <Text style={[styles.th, { flex: 0.9, textAlign: 'center' }]}>Sq.Ft</Text>
                          <Text style={[styles.th, { flex: 0.7, textAlign: 'center' }]}>Qty</Text>
                          <Text style={[styles.th, { flex: 1.1, textAlign: 'center' }]}>Rate</Text>
                          <Text style={[styles.th, { flex: 1.1, textAlign: 'right' }]}>Amount</Text>
                          <Text style={[styles.th, { flex: 0.4 }]}></Text>
                        </View>

                        {area.items.map((item, ii) => (
                          <View key={item.id} style={styles.tableRow}>
                            <Text style={[styles.td, { flex: 0.5 }]}>{ii + 1}</Text>
                            <TextInput style={[styles.tdInput, { flex: 1.8 }]} value={item.description} onChangeText={v => updateItem(ai, ii, 'description', v)} placeholder="Description..." placeholderTextColor={Colors.textTertiary} selectionColor={Colors.primary} />
                            <TextInput style={[styles.tdInput, { flex: 1.2 }]} value={item.finish} onChangeText={v => updateItem(ai, ii, 'finish', v)} placeholder="e.g. Laminate / PU" placeholderTextColor={Colors.textTertiary} selectionColor={Colors.primary} />
                            <TextInput style={[styles.tdInput, { flex: 0.7, textAlign: 'center' }]} value={item.height} onChangeText={v => updateItem(ai, ii, 'height', v)} keyboardType="numeric" placeholder="H" placeholderTextColor={Colors.textTertiary} selectionColor={Colors.primary} />
                            <TextInput style={[styles.tdInput, { flex: 0.7, textAlign: 'center' }]} value={item.width} onChangeText={v => updateItem(ai, ii, 'width', v)} keyboardType="numeric" placeholder="W" placeholderTextColor={Colors.textTertiary} selectionColor={Colors.primary} />
                            <View style={[styles.tdInput, { flex: 0.9, backgroundColor: Colors.surfaceElevated, justifyContent: 'center', alignItems: 'center', height: 32 }]}>
                              <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium }}>
                                {item.height && item.width ? (parseFloat(item.height) * parseFloat(item.width)).toFixed(2) : '—'}
                              </Text>
                            </View>
                            <TextInput style={[styles.tdInput, { flex: 0.7, textAlign: 'center' }]} value={item.quantity} onChangeText={v => updateItem(ai, ii, 'quantity', v)} keyboardType="numeric" selectionColor={Colors.primary} />
                            <TextInput style={[styles.tdInput, { flex: 1.1, textAlign: 'center' }]} value={item.unitPrice} onChangeText={v => updateItem(ai, ii, 'unitPrice', v)} keyboardType="numeric" selectionColor={Colors.primary} />
                            <Text style={[styles.td, styles.amountCell, { flex: 1.1 }]}>{fmt(item.amount)}</Text>
                            <TouchableOpacity style={{ flex: 0.4, alignItems: 'center' }} onPress={() => removeItem(ai, ii)}>
                              <Ionicons name="trash-outline" size={16} color={Colors.error} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    )}

                    <TouchableOpacity style={styles.addItemBtn} onPress={() => addItem(ai)}>
                      <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
                      <Text style={styles.addItemText}>Add Item</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          {/* Add Area */}
          {showAreaPicker ? (
            <Card variant="outlined" padding="sm" style={styles.areaPicker}>
              <Text style={styles.areaPickerTitle}>Select Area / Room</Text>
              <View style={styles.areaChips}>
                {AREA_TEMPLATES.map(t => (
                  <TouchableOpacity key={t} style={styles.areaChip} onPress={() => addArea(t)}>
                    <Text style={styles.areaChipText}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          ) : (
            <View style={{ flexDirection: 'row', gap: Spacing.md, width: '100%', marginBottom: Spacing.md }}>
              <TouchableOpacity style={[styles.addAreaBtn, { flex: 1 }]} onPress={() => setShowAreaPicker(true)}>
                <Ionicons name="add" size={20} color={Colors.primary} />
                <Text style={styles.addAreaText}>Add Area / Room</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addAreaBtn, { flex: 1, backgroundColor: Colors.surfaceElevated, borderColor: Colors.border }]} onPress={() => addArea("General Items")}>
                <Ionicons name="list" size={20} color={Colors.primary} />
                <Text style={styles.addAreaText}>Add Items Without Room</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Reference Images Appendix */}
          <Card variant="elevated" padding="md" style={{ marginBottom: Spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
              <Ionicons name="images-outline" size={20} color={Colors.primary} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textPrimary }}>Appendix: Reference Images</Text>
            </View>
            <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md }}>
              Paste image URLs (comma separated) to include them at the end of the generated PDF.
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.sm, padding: Spacing.md, fontSize: FontSize.sm, backgroundColor: Colors.surfaceHover, color: Colors.textPrimary, minHeight: 80 }}
              placeholder="https://example.com/image1.jpg, https://example.com/image2.png"
              placeholderTextColor={Colors.textTertiary}
              value={galleryImages}
              onChangeText={setGalleryImages}
              multiline
            />
          </Card>

          {/* Summary (mobile only) */}
          {isMobile && renderSummary()}
        </ScrollView>

        {/* Right Panel — Desktop Summary + PDF Preview */}
        {isDesktop && (
          <View style={styles.rightPanel}>
            <ScrollView contentContainerStyle={{ padding: Spacing.xl, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
              {renderSummary()}

              <View style={styles.previewHeaderRow}>
                <Text style={styles.previewSectionTitle}>Live Preview</Text>
                <Button title="Download PDF" onPress={generatePDF} size="sm" variant="outline" icon={<Ionicons name="download-outline" size={16} color={Colors.primary} />} />
              </View>

              <Card variant="default" padding="none" style={styles.previewCard}>
                {Platform.OS === 'web' ? (
                  <iframe
                    srcDoc={generateQuotationHTML({
                      title, clientName: clientName || 'Unknown Client', areas, subtotal, discountPct, discountAmt, taxPct, taxAmt, grandTotal, quotationNumber,
                      galleryImages: galleryImages ? galleryImages.split(',').map(u => u.trim()).filter(Boolean) : []
                    }, company)}
                    style={{ width: '100%', height: 600, border: 'none', backgroundColor: '#fff' }}
                  />
                ) : (
                  <View style={styles.previewPlaceholder}>
                    <Ionicons name="document-text-outline" size={48} color={Colors.textTertiary} />
                    <Text style={styles.previewText}>PDF Ready to Download</Text>
                    <Button title="Preview & Download" onPress={generatePDF} size="md" style={{ marginTop: Spacing.md }} />
                  </View>
                )}
              </Card>
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  topTitle: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  body: { flex: 1 },
  bodyDesktop: { flexDirection: 'row' },
  editor: { flex: 1 },
  editorDesktop: { flex: 3 },
  rightPanel: { flex: 2, borderLeftWidth: 1, borderLeftColor: Colors.border, backgroundColor: Colors.surface, maxWidth: 420 },

  // Area block
  areaBlock: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg, overflow: 'hidden' },
  areaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.lg, backgroundColor: Colors.surfaceElevated },
  areaHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
  areaName: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary, marginLeft: Spacing.sm },
  areaHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  areaSubtotal: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  removeAreaBtn: { padding: 4 },
  areaContent: { padding: Spacing.md },

  // Table header (desktop)
  tableHeader: { flexDirection: 'row', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: Spacing.xs },
  th: { fontSize: FontSize.xs, fontWeight: FontWeight.semiBold, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border },
  td: { fontSize: FontSize.sm, color: Colors.textSecondary },
  tdInput: { fontSize: FontSize.sm, color: Colors.textPrimary, paddingVertical: 4, paddingHorizontal: 6, backgroundColor: Colors.surfaceHover, borderRadius: 4, marginHorizontal: 2 },
  amountCell: { fontWeight: FontWeight.semiBold, color: Colors.textPrimary, textAlign: 'right' },

  // Mobile item card
  mobileItemCard: { backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  mobileDescInput: { fontSize: FontSize.md, color: Colors.textPrimary, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: Spacing.sm, marginBottom: Spacing.sm },
  mobileItemRow: { flexDirection: 'row', alignItems: 'center' },
  mobileField: { flex: 1 },
  mobileFieldLabel: { fontSize: FontSize.xs, color: Colors.textTertiary, marginBottom: 2 },
  mobileFieldInput: { fontSize: FontSize.md, color: Colors.textPrimary, backgroundColor: Colors.surfaceHover, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
  mobileX: { fontSize: FontSize.md, color: Colors.textTertiary, marginHorizontal: 6 },
  mobileEquals: { fontSize: FontSize.md, color: Colors.textTertiary, marginHorizontal: 6 },
  mobileAmount: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary, minWidth: 70, textAlign: 'right' },
  deleteItemBtn: { marginLeft: 8 },

  addItemBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md, gap: Spacing.xs },
  addItemText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  addAreaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.borderGold, borderStyle: 'dashed', marginBottom: Spacing.xl, gap: Spacing.sm },
  addAreaText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semiBold },

  // Area picker
  areaPicker: { marginBottom: Spacing.xl },
  areaPickerTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.textSecondary, marginBottom: Spacing.md },
  areaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  areaChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round, backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border },
  areaChipText: { fontSize: FontSize.sm, color: Colors.textSecondary },

  // Summary
  summaryCard: { marginTop: Spacing.lg },
  summaryTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  summaryLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  summaryInputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  pctInput: { width: 44, fontSize: FontSize.sm, color: Colors.textPrimary, backgroundColor: Colors.surfaceHover, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, textAlign: 'center' },
  pctSign: { fontSize: FontSize.sm, color: Colors.textTertiary },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.borderGold, paddingTop: Spacing.md, marginTop: Spacing.sm, marginBottom: 0 },
  totalLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  totalValue: { fontSize: FontSize.xxl, fontWeight: FontWeight.extraBold, color: Colors.primary },

  // Preview placeholder
  previewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.md },
  previewSectionTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  previewCard: { flex: 1, minHeight: 600, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xl },
  previewPlaceholder: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: Spacing.huge },
  previewText: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textSecondary, marginTop: Spacing.md },
});
