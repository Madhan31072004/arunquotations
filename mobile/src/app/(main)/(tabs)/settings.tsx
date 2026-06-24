import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Platform, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/lib/theme';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Header } from '@/components/layout/Header';
import { useResponsive } from '@/hooks/useResponsive';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/features/auth/authStore';
import { useCompanyProfile, useUpdateCompanyProfile, useUpdateUser, useExportData } from '@/features/data/apiHooks';
import { APP_NAME, APP_VERSION } from '@/lib/constants';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const settingsSections = [
  {
    title: 'Company Profile',
    items: [
      { icon: 'business-outline' as const, label: 'Company Details', sub: 'Name, address, GST number' },
      { icon: 'image-outline' as const, label: 'Logo & Branding', sub: 'Upload logo, set brand colors' },
      { icon: 'document-attach-outline' as const, label: 'Terms & Conditions', sub: 'Default T&C for quotations' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'calculator-outline' as const, label: 'Tax Settings', sub: 'GST rates and defaults' },
      { icon: 'text-outline' as const, label: 'Quotation Format', sub: 'Number prefix, templates' },
      { icon: 'color-palette-outline' as const, label: 'PDF Theme', sub: 'Colors, fonts, layout' },
    ],
  },
  {
    title: 'Account',
    items: [
      { icon: 'person-outline' as const, label: 'Profile', sub: 'Name, email, phone' },
      { icon: 'shield-outline' as const, label: 'Security', sub: 'Change password' },
      { icon: 'cloud-upload-outline' as const, label: 'Backup & Export', sub: 'Export data, backup' },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { isMobile, isDesktop, contentPadding } = useResponsive();
  const { logout, user } = useAuthStore();
  const { data: company, isLoading } = useCompanyProfile();
  const updateCompany = useUpdateCompanyProfile();
  const updateUser = useUpdateUser();
  const exportData = useExportData();

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [showTcModal, setShowTcModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const [cName, setCName] = useState('');
  const [cAddress, setCAddress] = useState('');
  const [cGst, setCGst] = useState('');
  const [cPhone, setCPhone] = useState('');
  const [cEmail, setCEmail] = useState('');
  const [cWebsite, setCWebsite] = useState('');

  const [cLogo, setCLogo] = useState('');
  const [cColor, setCColor] = useState('');
  const [cTerms, setCTerms] = useState('');
  
  const [cTax, setCTax] = useState('');
  const [cPrefix, setCPrefix] = useState('');
  const [cTheme, setCTheme] = useState('');

  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uPassword, setUPassword] = useState('');

  useEffect(() => {
    if (user) {
      setUName(user.name || '');
      setUEmail(user.email || '');
      setUPhone(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (company) {
      setCName(company.companyName || '');
      setCAddress(company.address || '');
      setCGst(company.gstNumber || '');
      setCPhone(company.phone || '');
      setCEmail(company.email || '');
      setCWebsite(company.website || '');
      setCLogo(company.logo || '');
      setCColor(company.primaryColor || '#C9A351');
      setCTerms((company.termsAndConditions || []).join('\n'));
      setCTax(company.taxPercentage ? String(company.taxPercentage) : '18');
      setCPrefix(company.quotationPrefix || 'AQ');
      setCTheme(company.pdfTheme || 'default');
    }
  }, [company]);

  const handleSaveCompany = async () => {
    try {
      await updateCompany.mutateAsync({
        companyName: cName, address: cAddress, gstNumber: cGst,
        phone: cPhone, email: cEmail, website: cWebsite,
        logo: cLogo, primaryColor: cColor,
        termsAndConditions: cTerms.split('\n').filter((t: string) => t.trim() !== ''),
        taxPercentage: Number(cTax) || 0,
        quotationPrefix: cPrefix,
        pdfTheme: cTheme
      });
      setShowCompanyModal(false);
      setShowBrandingModal(false);
      setShowTcModal(false);
      setShowTaxModal(false);
      setShowFormatModal(false);
      setShowThemeModal(false);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update company details');
    }
  };

  const handleSaveUser = async () => {
    try {
      await updateUser.mutateAsync({
        name: uName, email: uEmail, phone: uPhone,
        ...(uPassword ? { password: uPassword } : {})
      });
      setShowProfileModal(false);
      setShowSecurityModal(false);
      setUPassword('');
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update user profile');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login' as any);
  };

  const handleExport = async () => {
    try {
      const data = await exportData.mutateAsync();
      const jsonString = JSON.stringify(data, null, 2);
      const fileName = `ArunQuotations_Backup_${new Date().toISOString().split('T')[0]}.json`;

      if (Platform.OS === 'web') {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // @ts-ignore
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, jsonString, { encoding: FileSystem.EncodingType.UTF8 });
        await Sharing.shareAsync(fileUri, { mimeType: 'application/json', dialogTitle: 'Export Backup' });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleSettingPress = (item: any) => {
    if (item.label === 'Company Details') return setShowCompanyModal(true);
    if (item.label === 'Logo & Branding') return setShowBrandingModal(true);
    if (item.label === 'Terms & Conditions') return setShowTcModal(true);
    if (item.label === 'Tax Settings') return setShowTaxModal(true);
    if (item.label === 'Quotation Format') return setShowFormatModal(true);
    if (item.label === 'PDF Theme') return setShowThemeModal(true);
    if (item.label === 'Profile') return setShowProfileModal(true);
    if (item.label === 'Security') return setShowSecurityModal(true);
    if (item.label === 'Backup & Export') return handleExport();
    
    if (Platform.OS === 'web') {
      window.alert(`${item.label} feature is coming soon.`);
    } else {
      Alert.alert('Coming Soon', `${item.label} feature is coming soon.`);
    }
  };

  return (
    <View style={styles.container}>
      {isMobile && <Header title="Settings" />}
      <ScrollView contentContainerStyle={[styles.scroll, { padding: contentPadding }]} showsVerticalScrollIndicator={false}>
        {isDesktop && (
          <View style={styles.pageHeaderRow}>
            <Text style={styles.pageTitle}>Settings</Text>
          </View>
        )}

        {settingsSections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card variant="default" padding="none">
              {section.items.map((item, ii) => (
                <TouchableOpacity key={ii} style={[styles.settingRow, ii < section.items.length - 1 && styles.settingRowBorder]} activeOpacity={0.6} onPress={() => handleSettingPress(item)}>
                  <View style={styles.settingIcon}>
                    <Ionicons name={item.icon} size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    <Text style={styles.settingSub}>{item.sub}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        <Button title="Sign Out" onPress={handleLogout} variant="danger" fullWidth size="lg" style={{ marginTop: Spacing.xxl }} icon={<Ionicons name="log-out-outline" size={20} color="#FFF" />} />

        <Text style={styles.version}>{APP_NAME} v{APP_VERSION}</Text>
      </ScrollView>

      {/* Company Details Modal */}
      <Modal visible={showCompanyModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Company Details</Text>
              <TouchableOpacity onPress={() => setShowCompanyModal(false)}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView style={{ padding: Spacing.lg, maxHeight: 500 }} showsVerticalScrollIndicator={false}>
              <Input label="Company Name" placeholder="e.g. Arun Interiors" value={cName} onChangeText={setCName} />
              <Input label="Address" placeholder="Full address" value={cAddress} onChangeText={setCAddress} />
              
              <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                <View style={{ flex: 1 }}><Input label="GST Number" placeholder="e.g. 29ABCDE1234F1Z5" value={cGst} onChangeText={setCGst} /></View>
                <View style={{ flex: 1 }}><Input label="Phone" placeholder="Contact number" value={cPhone} onChangeText={setCPhone} keyboardType="phone-pad" /></View>
              </View>

              <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                <View style={{ flex: 1 }}><Input label="Email" placeholder="support@company.com" value={cEmail} onChangeText={setCEmail} keyboardType="email-address" /></View>
                <View style={{ flex: 1 }}><Input label="Website" placeholder="www.company.com" value={cWebsite} onChangeText={setCWebsite} /></View>
              </View>
              
              <Button title={updateCompany.isPending ? "Saving..." : "Save Details"} onPress={handleSaveCompany} disabled={updateCompany.isPending} style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Logo & Branding Modal */}
      <Modal visible={showBrandingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Logo & Branding</Text>
              <TouchableOpacity onPress={() => setShowBrandingModal(false)}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <View style={{ padding: Spacing.lg }}>
              <Input label="Logo URL" placeholder="https://example.com/logo.png" value={cLogo} onChangeText={setCLogo} />
              <Input label="Primary Brand Color (Hex)" placeholder="#C9A351" value={cColor} onChangeText={setCColor} />
              <Button title={updateCompany.isPending ? "Saving..." : "Save Branding"} onPress={handleSaveCompany} disabled={updateCompany.isPending} style={{ marginTop: Spacing.lg }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal visible={showTcModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms & Conditions</Text>
              <TouchableOpacity onPress={() => setShowTcModal(false)}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <View style={{ padding: Spacing.lg }}>
              <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm }}>Enter terms separated by new lines.</Text>
              <Input label="Terms" placeholder="e.g. 50% advance payment required" value={cTerms} onChangeText={setCTerms} multiline />
              <Button title={updateCompany.isPending ? "Saving..." : "Save Terms"} onPress={handleSaveCompany} disabled={updateCompany.isPending} style={{ marginTop: Spacing.lg }} />
            </View>
          </View>
        </View>
      </Modal>
      {/* Tax Settings Modal */}
      <Modal visible={showTaxModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tax Settings</Text>
              <TouchableOpacity onPress={() => setShowTaxModal(false)}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <View style={{ padding: Spacing.lg }}>
              <Input label="Default GST Percentage (%)" placeholder="18" value={cTax} onChangeText={setCTax} keyboardType="numeric" />
              <Button title={updateCompany.isPending ? "Saving..." : "Save Settings"} onPress={handleSaveCompany} disabled={updateCompany.isPending} style={{ marginTop: Spacing.lg }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Quotation Format Modal */}
      <Modal visible={showFormatModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Quotation Format</Text>
              <TouchableOpacity onPress={() => setShowFormatModal(false)}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <View style={{ padding: Spacing.lg }}>
              <Input label="Quotation Number Prefix" placeholder="AQ" value={cPrefix} onChangeText={setCPrefix} />
              <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.md }}>Generated format: {cPrefix}-2026-1234</Text>
              <Button title={updateCompany.isPending ? "Saving..." : "Save Format"} onPress={handleSaveCompany} disabled={updateCompany.isPending} style={{ marginTop: Spacing.md }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* PDF Theme Modal */}
      <Modal visible={showThemeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>PDF Theme</Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <View style={{ padding: Spacing.lg }}>
              <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm }}>Select default theme for generated PDFs.</Text>
              <Input label="Theme Name" placeholder="default" value={cTheme} onChangeText={setCTheme} />
              <Button title={updateCompany.isPending ? "Saving..." : "Save Theme"} onPress={handleSaveCompany} disabled={updateCompany.isPending} style={{ marginTop: Spacing.lg }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Profile Modal */}
      <Modal visible={showProfileModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Account Profile</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <View style={{ padding: Spacing.lg }}>
              <Input label="Full Name" placeholder="John Doe" value={uName} onChangeText={setUName} />
              <Input label="Email Address" placeholder="john@example.com" value={uEmail} onChangeText={setUEmail} keyboardType="email-address" />
              <Input label="Phone Number" placeholder="Contact number" value={uPhone} onChangeText={setUPhone} keyboardType="phone-pad" />
              <Button title={updateUser.isPending ? "Saving..." : "Save Profile"} onPress={handleSaveUser} disabled={updateUser.isPending} style={{ marginTop: Spacing.lg }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Security Modal */}
      <Modal visible={showSecurityModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Security</Text>
              <TouchableOpacity onPress={() => setShowSecurityModal(false)}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <View style={{ padding: Spacing.lg }}>
              <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: Spacing.sm }}>Enter a new password to change your login credentials.</Text>
              <Input label="New Password" placeholder="••••••••" value={uPassword} onChangeText={setUPassword} secureTextEntry />
              <Button title={updateUser.isPending ? "Updating..." : "Update Password"} onPress={handleSaveUser} disabled={updateUser.isPending} style={{ marginTop: Spacing.lg }} />
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
  pageHeaderRow: { paddingTop: Spacing.xl, marginBottom: Spacing.xxl },
  pageTitle: { fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  section: { marginBottom: Spacing.xxl },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semiBold, color: Colors.textTertiary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.sm, marginLeft: Spacing.xs },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg },
  settingRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingIcon: { width: 40, height: 40, borderRadius: BorderRadius.md, backgroundColor: Colors.primaryGlow, alignItems: 'center', justifyContent: 'center' },
  settingInfo: { flex: 1, marginLeft: Spacing.md },
  settingLabel: { fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  settingSub: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: 2 },
  version: { textAlign: 'center', fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: Spacing.xxl },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, width: '90%', maxWidth: 500, borderWidth: 1, borderColor: Colors.border },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
});
