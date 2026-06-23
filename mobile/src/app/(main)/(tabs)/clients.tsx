import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/lib/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/layout/Header';
import { useResponsive } from '@/hooks/useResponsive';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/features/data/apiHooks';

export default function ClientsScreen() {
  const router = useRouter();
  const { isMobile, isDesktop, contentPadding } = useResponsive();
  const [editingClient, setEditingClient] = useState<any>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [project, setProject] = useState('');

  const { data: clients, isLoading } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const handleSaveClient = async () => {
    if (!name || !project) return;
    try {
      if (editingClient) {
        await updateClient.mutateAsync({
          id: editingClient._id,
          data: { name, phone, email, projectName: project }
        });
      } else {
        await createClient.mutateAsync({ name, phone, email, projectName: project });
      }
      setShowModal(false);
      setName(''); setPhone(''); setEmail(''); setProject('');
      setEditingClient(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartEdit = (client: any) => {
    setEditingClient(client);
    setName(client.name);
    setPhone(client.phone || '');
    setEmail(client.email || '');
    setProject(client.projectName || '');
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const performDelete = async () => {
      try {
        await deleteClient.mutateAsync(id);
      } catch (e) {
        console.error(e);
        alert('Failed to delete client');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this client?')) {
        await performDelete();
      }
    } else {
      Alert.alert(
        'Delete Client',
        'Are you sure you want to delete this client?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  };

  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const clientList = clients || [];
  const filtered = clientList.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.projectName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {isMobile && (
        <Header 
          title="Clients" 
          rightAction={
            <Button
              title=""
              onPress={() => { setEditingClient(null); setName(''); setPhone(''); setEmail(''); setProject(''); setShowModal(true); }}
              variant="primary"
              size="sm"
              icon={<Ionicons name="add" size={20} color={Colors.textInverse} />}
              style={{ width: 40, height: 40, borderRadius: 20, paddingHorizontal: 0 }}
            />
          }
        />
      )}
      <ScrollView contentContainerStyle={[styles.scroll, { padding: contentPadding }]} showsVerticalScrollIndicator={false}>
        {isDesktop && (
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>Clients</Text>
              <Text style={styles.pageSub}>{clientList.length} clients</Text>
            </View>
            <Button title="Add Client" onPress={() => { setEditingClient(null); setName(''); setPhone(''); setEmail(''); setProject(''); setShowModal(true); }} icon={<Ionicons name="person-add" size={18} color={Colors.textInverse} />} />
          </View>
        )}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textTertiary} />
          <TextInput style={styles.searchInput} placeholder="Search clients..." placeholderTextColor={Colors.textTertiary} value={search} onChangeText={setSearch} selectionColor={Colors.primary} />
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
        ) : (
          filtered.map((c: any) => (
            <View key={c._id}>
              <Card variant="default" padding="md" style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{c.name.split(' ').map((n: string) => n[0]).join('').substring(0,2)}</Text></View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{c.name}</Text>
                    <Text style={styles.project}>{c.projectName}</Text>
                    <Text style={styles.phone}>{c.phone || 'No phone number'}</Text>
                  </View>
                  <View style={styles.right}>
                    <Text style={styles.qCount}>{c.quotationsCount || 0}</Text>
                    <Text style={styles.qLabel}>quotes</Text>
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: Spacing.sm }}>
                      <TouchableOpacity onPress={() => handleStartEdit(c)} activeOpacity={0.7}>
                        <Ionicons name="pencil-outline" size={18} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(c._id)} activeOpacity={0.7}>
                        <Ionicons name="trash-outline" size={18} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Card>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingClient ? "Edit Client" : "Add New Client"}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); setEditingClient(null); }}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <View style={{ gap: Spacing.md, padding: Spacing.lg }}>
              <Input label="Client Name" placeholder="e.g. John Doe" value={name} onChangeText={setName} />
              <Input label="Phone Number" placeholder="e.g. +91 9876543210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <Input label="Email Address" placeholder="e.g. john@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
              <Input label="Project Name" placeholder="e.g. 3BHK Apartment Interiors" value={project} onChangeText={setProject} />
              <Button title={createClient.isPending || updateClient.isPending ? "Saving..." : (editingClient ? "Update Client" : "Save Client")} onPress={handleSaveClient} disabled={createClient.isPending || updateClient.isPending} style={{ marginTop: Spacing.sm }} />
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
  card: { marginBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.borderGold },
  avatarText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primary },
  info: { flex: 1, marginLeft: Spacing.md },
  name: { fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary },
  project: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  phone: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  right: { alignItems: 'center' },
  qCount: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  qLabel: { fontSize: FontSize.xs, color: Colors.textTertiary },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, width: '90%', maxWidth: 450, borderWidth: 1, borderColor: Colors.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
});
