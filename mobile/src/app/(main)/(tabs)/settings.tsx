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
import { useCompanyProfile, useUpdateCompanyProfile, useUpdateUser, useExportData, useSessions, useRevokeSession, useRevokeAllSessions, useChangePassword, useServerLogout, useForceSignOutAll } from '@/features/data/apiHooks';
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
      { icon: 'key-outline' as const, label: 'Change Password', sub: 'Update your login password' },
      { icon: 'phone-portrait-outline' as const, label: 'Active Devices', sub: 'Manage logged-in sessions' },
      { icon: 'cloud-upload-outline' as const, label: 'Backup & Export', sub: 'Export data, backup' },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { isMobile, isDesktop, contentPadding } = useResponsive();
  const { logout, user, setAuth } = useAuthStore();
  const { data: company, isLoading } = useCompanyProfile();
  const updateCompany = useUpdateCompanyProfile();
  const updateUser = useUpdateUser();
  const exportData = useExportData();
  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } = useSessions();
  const revokeSession = useRevokeSession();
  const revokeAllSessions = useRevokeAllSessions();
  const changePassword = useChangePassword();
  const serverLogout = useServerLogout();
  const forceSignOutAll = useForceSignOutAll();

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [showTcModal, setShowTcModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);

  const [curPassword, setCurPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');

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
      });
      setShowProfileModal(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update user profile');
    }
  };

  const handleChangePassword = async () => {
    setPwError('');
    if (!curPassword || !newPassword) {
      setPwError('Please fill in all fields');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    try {
      const result = await changePassword.mutateAsync({ currentPassword: curPassword, newPassword });
      // Save the new token (old one is now invalid due to tokenVersion bump)
      if (result.token && user) {
        setAuth(user, result.token);
      }
      setCurPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordModal(false);
      Alert.alert('Success', 'Password updated. All other devices have been signed out.');
    } catch (e: any) {
      setPwError(e.response?.data?.message || 'Failed to change password');
    }
  };

  const handleRevokeDevice = async (sessionId: string) => {
    try {
      await revokeSession.mutateAsync(sessionId);
      Alert.alert('Done', 'Device has been signed out.');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to sign out device');
    }
  };

  const handleRevokeAll = async () => {
    try {
      const result = await revokeAllSessions.mutateAsync();
      Alert.alert('Done', result.message);
    } catch (e) {
      Alert.alert('Error', 'Failed to sign out devices');
    }
  };

  const handleForceSignOutAll = async () => {
    try {
      const result = await forceSignOutAll.mutateAsync();
      // Save the new token (old one is now invalid)
      if (result.token && user) {
        setAuth(user, result.token);
      }
      Alert.alert('Done', result.message);
    } catch (e) {
      Alert.alert('Error', 'Failed to sign out all devices');
    }
  };

  const handleLogout = async () => {
    try { await serverLogout.mutateAsync(); } catch {}
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
    if (item.label === 'Change Password') return setShowPasswordModal(true);
    if (item.label === 'Active Devices') { refetchSessions(); return setShowDevicesModal(true); }
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

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => { setShowPasswordModal(false); setPwError(''); setCurPassword(''); setNewPassword(''); setConfirmPassword(''); }}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <View style={{ padding: Spacing.lg }}>
              {pwError ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.errorBg, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' }}>
                  <Ionicons name="alert-circle" size={18} color={Colors.error} />
                  <Text style={{ fontSize: FontSize.sm, color: Colors.error, flex: 1 }}>{pwError}</Text>
                </View>
              ) : null}
              <Input label="Current Password" placeholder="Enter current password" value={curPassword} onChangeText={setCurPassword} secureTextEntry />
              <Input label="New Password" placeholder="Enter new password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
              <Input label="Confirm New Password" placeholder="Re-enter new password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
              <Text style={{ fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: Spacing.xs }}>All other devices will be signed out after password change.</Text>
              <Button title={changePassword.isPending ? "Updating..." : "Update Password"} onPress={handleChangePassword} disabled={changePassword.isPending} style={{ marginTop: Spacing.lg }} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Active Devices Modal */}
      <Modal visible={showDevicesModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Active Devices</Text>
              <TouchableOpacity onPress={() => setShowDevicesModal(false)}><Ionicons name="close" size={24} color={Colors.textSecondary} /></TouchableOpacity>
            </View>
            <ScrollView style={{ padding: Spacing.lg, maxHeight: 450 }} showsVerticalScrollIndicator={false}>
              {sessionsLoading ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: Spacing.xxl }} />
              ) : sessions && sessions.length > 0 ? (
                <>
                  {sessions.map((s: any) => (
                    <View key={s._id} style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: BorderRadius.md, backgroundColor: s.isCurrent ? Colors.primaryGlow : Colors.background, borderWidth: 1, borderColor: s.isCurrent ? Colors.primary : Colors.border, marginBottom: Spacing.md }}>
                      <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: s.isCurrent ? Colors.primary : Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: s.isCurrent ? 0 : 1, borderColor: Colors.border }}>
                        <Ionicons name={s.deviceName?.includes('Phone') || s.deviceName?.includes('iPhone') || s.deviceName?.includes('Android') ? 'phone-portrait' : s.deviceName?.includes('iPad') || s.deviceName?.includes('Tablet') ? 'tablet-portrait' : 'desktop'} size={22} color={s.isCurrent ? '#FFF' : Colors.textSecondary} />
                      </View>
                      <View style={{ flex: 1, marginLeft: Spacing.md }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                          <Text style={{ fontSize: FontSize.md, fontWeight: FontWeight.semiBold, color: Colors.textPrimary }}>{s.deviceName}</Text>
                          {s.isCurrent && <View style={{ backgroundColor: Colors.primary, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}><Text style={{ fontSize: 10, color: '#FFF', fontWeight: FontWeight.bold }}>THIS DEVICE</Text></View>}
                        </View>
                        <Text style={{ fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 }}>{s.browser} • {s.os}</Text>
                        <Text style={{ fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 }}>Last active: {new Date(s.lastActive).toLocaleString()}{s.ipAddress ? ` • IP: ${s.ipAddress}` : ''}</Text>
                      </View>
                      {!s.isCurrent && (
                        <TouchableOpacity onPress={() => handleRevokeDevice(s._id)} style={{ padding: Spacing.sm }}>
                          <Ionicons name="log-out-outline" size={22} color={Colors.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  {sessions.filter((s: any) => !s.isCurrent).length > 0 && (
                    <Button title={revokeAllSessions.isPending ? "Signing out..." : "Sign Out All Other Devices"} onPress={handleRevokeAll} variant="danger" fullWidth style={{ marginTop: Spacing.md, marginBottom: Spacing.md }} />
                  )}
                  <Button title={forceSignOutAll.isPending ? "Forcing Sign Out..." : "Force Sign Out All Devices"} onPress={handleForceSignOutAll} variant="danger" fullWidth style={{ marginTop: Spacing.md, marginBottom: Spacing.md }} />
                </>
              ) : (
                <Text style={{ fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginVertical: Spacing.xxl }}>No active sessions found.</Text>
              )}
            </ScrollView>
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
