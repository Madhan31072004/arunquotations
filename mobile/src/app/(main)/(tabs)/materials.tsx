import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/lib/theme';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/layout/Header';
import { useResponsive } from '@/hooks/useResponsive';
import { CURRENCY, MATERIAL_CATEGORIES } from '@/lib/constants';
import { useMaterials, useCreateMaterial, useDeleteMaterial } from '@/features/data/apiHooks';
import { Alert } from 'react-native';

export default function MaterialsScreen() {
  const { isMobile, isDesktop, contentPadding } = useResponsive();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(MATERIAL_CATEGORIES[0] || 'Plywood');
  const [unitPrice, setUnitPrice] = useState('');
  const [unit, setUnit] = useState('sq.ft');
  const [brand, setBrand] = useState('');

  const { data: materials, isLoading } = useMaterials();
  const createMaterial = useCreateMaterial();
  const deleteMaterial = useDeleteMaterial();

  const handleAddMaterial = async () => {
    if (!name || !unitPrice) return;
    try {
      await createMaterial.mutateAsync({ name, category, unitPrice: Number(unitPrice), unit, brand });
      setShowModal(false);
      setName(''); setUnitPrice(''); setBrand('');
    } catch (e) {
      console.error(e);
    }
  };

  const categories = ['All', ...MATERIAL_CATEGORIES.slice(0, 10)];

  const materialList = materials || [];
  const filtered = materialList.filter((m: any) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || (m.brand || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'All' || m.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const handleDeleteMaterial = (id: string, name: string) => {
    Alert.alert(
      "Delete Material",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteMaterial.mutate(id)
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {isMobile && (
        <Header 
          title="Materials" 
          rightAction={
            <TouchableOpacity onPress={() => setShowModal(true)} style={{ marginRight: Spacing.sm }}>
              <Ionicons name="add-circle" size={28} color={Colors.primary} />
            </TouchableOpacity>
          }
        />
      )}
      <ScrollView contentContainerStyle={[styles.scroll, { padding: contentPadding }]} showsVerticalScrollIndicator={false}>
        {isDesktop && (
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>Material Library</Text>
              <Text style={styles.pageSub}>{materialList.length} materials</Text>
            </View>
            <Button title="Add Material" onPress={() => setShowModal(true)} icon={<Ionicons name="add" size={18} color={Colors.textInverse} />} />
          </View>
        )}

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textTertiary} />
          <TextInput style={styles.searchInput} placeholder="Search materials..." placeholderTextColor={Colors.textTertiary} value={search} onChangeText={setSearch} selectionColor={Colors.primary} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {categories.map((c) => (
            <TouchableOpacity key={c} style={[styles.chip, activeCategory === c && styles.chipActive]} onPress={() => setActiveCategory(c)} activeOpacity={0.7}>
              <Text style={[styles.chipText, activeCategory === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          filtered.map((m: any) => (
            <TouchableOpacity key={m._id} activeOpacity={0.7}>
              <Card variant="default" padding="md" style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.iconBox}>
                    <Ionicons name="cube" size={22} color={Colors.primary} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{m.name}</Text>
                    <View style={styles.metaRow}>
                      <Badge text={m.category} color={Colors.info} variant="soft" size="sm" />
                      <Text style={styles.brand}>{m.brand}</Text>
                    </View>
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={styles.price}>{CURRENCY.symbol}{m.unitPrice}</Text>
                    <Text style={styles.unit}>/{m.unit}</Text>
                    
                    <TouchableOpacity 
                      style={{ marginTop: Spacing.sm }}
                      onPress={() => handleDeleteMaterial(m._id, m.name)}
                    >
                      <Ionicons name="trash-outline" size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Material</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <View style={{ gap: Spacing.md, padding: Spacing.lg }}>
              <Input label="Material Name" placeholder="e.g. BWP Plywood 18mm" value={name} onChangeText={setName} />
              
              <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Input label="Category" placeholder="e.g. Plywood" value={category} onChangeText={setCategory} />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Brand" placeholder="e.g. Century" value={brand} onChangeText={setBrand} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Input label="Rate (₹)" placeholder="e.g. 125" value={unitPrice} onChangeText={setUnitPrice} keyboardType="numeric" />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Unit" placeholder="e.g. sq.ft" value={unit} onChangeText={setUnit} />
                </View>
              </View>
              
              <Button title={createMaterial.isPending ? "Saving..." : "Save Material"} onPress={handleAddMaterial} disabled={createMaterial.isPending} style={{ marginTop: Spacing.sm }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.huge },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: Spacing.xxl, paddingTop: Spacing.xl },
  pageTitle: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  pageSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceElevated, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: Colors.border, height: 48 },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: FontSize.md, color: Colors.textPrimary },
  filterScroll: { marginBottom: Spacing.lg },
  filterContent: { gap: Spacing.sm },
  chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.round, backgroundColor: Colors.surfaceElevated, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.primaryGlow, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  chipTextActive: { color: Colors.primary, fontWeight: FontWeight.semiBold },
  card: { marginBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: Spacing.md },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  brand: { fontSize: FontSize.xs, color: Colors.textTertiary },
  priceBox: { alignItems: 'flex-end' },
  price: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  unit: { fontSize: FontSize.xs, color: Colors.textTertiary },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, width: '90%', maxWidth: 450, borderWidth: 1, borderColor: Colors.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
});
