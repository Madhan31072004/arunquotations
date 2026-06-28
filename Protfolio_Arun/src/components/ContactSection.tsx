import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform, useWindowDimensions, Linking } from 'react-native';
import theme from '../theme';
import SectionTitle from './ui/SectionTitle';
import ScrollReveal from './ui/ScrollReveal';
import GlassCard from './ui/GlassCard';

const CONTACT_INFO = [
  { icon: '📞', label: 'Phone', value: '+91 84989 97856', url: 'tel:+918498997856' },
  { icon: '✉️', label: 'Email', value: 'arunkumargopaldas@gmail.com', url: 'mailto:arunkumargopaldas@gmail.com' },
  { icon: '📸', label: 'Instagram', value: '@3d_design_diariies', url: 'https://www.instagram.com/3d_design_diariies?igsh=MzRpc3UzejV3b2t1' },
  { icon: '💼', label: 'LinkedIn', value: 'Arun Kumar Gopaldas', url: 'https://www.linkedin.com/in/arun-kumar-gopaldas-482a0022b?utm_source=share_via&utm_content=profile&utm_medium=member_ios' },
  { icon: '💬', label: 'WhatsApp', value: '+91 84989 97856', url: 'https://wa.me/918498997856' },
  { icon: '📍', label: 'Studio', value: 'Hyderabad, Telangana', url: 'https://maps.google.com/?q=Hyderabad,Telangana' },
];

export default function ContactSection() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [focused, setFocused] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePress = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn(`Don't know how to open URI: ${url}`);
      }
    } catch (error) {
      console.error(`An error occurred opening URL ${url}:`, error);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.message.trim()) {
      alert('Please fill in your Name and Message to book a consultation.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        __DEV__
          ? 'http://localhost:5000/api/contact'
          : 'https://arun-portfolio-backend.onrender.com/api/contact',
        {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (response.ok || data.success) {
        setSuccess(true);
      } else {
        alert(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to connect to the server. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container} nativeID="contact">
      {/* Background ambient glow */}
      <View style={[styles.ambientGlow, Platform.OS === 'web' ? {
        background: 'radial-gradient(ellipse at 30% 50%, rgba(201,169,110,0.06) 0%, transparent 70%)',
      } as any : {}]} />

      <View style={styles.inner}>
        <SectionTitle
          label="GET IN TOUCH"
          title="Let's Create Something Beautiful"
          subtitle="Ready to transform your space? Reach out and let's discuss your vision."
        />

        <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
          {/* Contact Form */}
          {/* <ScrollReveal animation="slideInLeft" style={[styles.formCol, isDesktop && { flex: 0.55 }]}>
            <View style={styles.form}>
              {success ? (
                <View style={styles.successContainer}>
                  <Text style={styles.successIcon}>✨</Text>
                  <Text style={styles.successTitle}>Message Sent!</Text>
                  <Text style={styles.successMessage}>Arun will contact you Shortly .. Thank you for choosing Arun Interiors</Text>
                  <Pressable
                    onPress={() => {
                      setSuccess(false);
                      setForm({ name: '', email: '', phone: '', message: '' });
                    }}
                    style={({ hovered }: any) => [
                      styles.resetBtn,
                      Platform.OS === 'web' ? { transition: 'all 0.3s ease' } as any : {},
                      hovered && styles.resetBtnHover,
                    ]}
                  >
                    <Text style={styles.resetText}>Send Another Message</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.formInner}>
                  {['name', 'email', 'phone'].map((field) => (
                    <View key={field} style={styles.inputWrap}>
                      <Text style={styles.inputLabel}>{field.toUpperCase()}</Text>
                      <TextInput
                        style={[
                          styles.input,
                          focused === field && styles.inputFocused,
                          Platform.OS === 'web' ? {
                            outline: 'none',
                            transition: 'all 0.3s ease',
                          } as any : {},
                        ]}
                        placeholder={`Your ${field}`}
                        placeholderTextColor={theme.colors.textSecondary}
                        value={(form as any)[field]}
                        onChangeText={(v) => setForm({ ...form, [field]: v })}
                        onFocus={() => setFocused(field)}
                        onBlur={() => setFocused('')}
                      />
                    </View>
                  ))}

                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>MESSAGE</Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.textarea,
                        focused === 'message' && styles.inputFocused,
                        Platform.OS === 'web' ? {
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          resize: 'none',
                        } as any : {},
                      ]}
                      placeholder="Tell us about your project..."
                      placeholderTextColor={theme.colors.textSecondary}
                      multiline
                      numberOfLines={4}
                      value={form.message}
                      onChangeText={(v) => setForm({ ...form, message: v })}
                      onFocus={() => setFocused('message')}
                      onBlur={() => setFocused('')}
                    />
                  </View>

                  <Pressable
                    onPress={handleSubmit}
                    disabled={loading}
                    style={({ hovered }: any) => [
                      styles.submitBtn,
                      Platform.OS === 'web' ? { transition: 'all 0.3s ease' } as any : {},
                      hovered && styles.submitBtnHover,
                      loading && { opacity: 0.7 }
                    ]}
                  >
                    <Text style={styles.submitText}>
                      {loading ? 'Sending...' : 'Book Consultation ✨'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </ScrollReveal> */}

          {/* Contact Info Card */}
          <ScrollReveal animation="slideInRight" delay={0.2} style={[styles.infoCol, isDesktop && { flex: 0.42 }]}>
            <GlassCard intensity="strong" glow style={styles.infoCard}>
              <Text style={styles.infoTitle}>Contact Information</Text>
              <Text style={styles.infoSubtitle}>Let's start a conversation</Text>

              <View style={styles.infoList}>
                {CONTACT_INFO.map((item, i) => (
                  <Pressable key={i} onPress={() => handlePress(item.url)} style={({ hovered }: any) => [
                    styles.infoItem,
                    Platform.OS === 'web' ? {
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    } as any : {},
                    hovered && { transform: [{ translateX: 6 }] }
                  ]}>
                    <Text style={styles.infoIcon}>{item.icon}</Text>
                    <View>
                      <Text style={styles.infoLabel}>{item.label}</Text>
                      <Text style={styles.infoValue}>{item.value}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>

              {/* Social links */}
              <View style={styles.socialRow}>
                {[
                  { name: 'Instagram', label: 'I', url: 'https://www.instagram.com/3d_design_diariies?igsh=MzRpc3UzejV3b2t1' },
                  { name: 'LinkedIn', label: 'L', url: 'https://www.linkedin.com/in/arun-kumar-gopaldas-482a0022b?utm_source=share_via&utm_content=profile&utm_medium=member_ios' },
                  { name: 'Behance', label: 'B', url: 'https://behance.net' },
                ].map((s) => (
                  <Pressable key={s.name} onPress={() => handlePress(s.url)} style={({ hovered }: any) => [
                    styles.socialBtn,
                    Platform.OS === 'web' ? { transition: 'all 0.3s ease' } as any : {},
                    hovered && styles.socialBtnHover,
                  ]}>
                    <Text style={styles.socialBtnText}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>
            </GlassCard>
          </ScrollReveal>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.section,
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  inner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    zIndex: 10,
  },
  grid: {
    gap: 40,
  },
  gridDesktop: {
    flexDirection: 'row',
  },
  formCol: {},
  form: { gap: 20 },
  inputWrap: { gap: 6 },
  inputLabel: {
    fontSize: 11,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(201,169,110,0.05)',
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  submitBtnHover: {
    backgroundColor: '#d4b478',
    transform: [{ scale: 1.03 }],
  },
  submitText: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.background,
    fontWeight: '600',
    letterSpacing: 1,
  },
  formInner: {
    gap: 20,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 16,
  },
  successIcon: {
    fontSize: 48,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: theme.fonts.heading,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  successMessage: {
    fontSize: 16,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  resetBtn: {
    marginTop: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.full,
  },
  resetBtnHover: {
    backgroundColor: 'rgba(201,169,110,0.1)',
  },
  resetText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.body,
    fontWeight: '600',
    fontSize: 14,
  },
  infoCol: {},
  infoCard: {
    padding: 36,
    gap: 24,
  },
  infoTitle: {
    fontSize: 22,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text,
    fontWeight: '600',
  },
  infoSubtitle: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: -16,
  },
  infoList: { gap: 16 },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
  },
  infoIcon: { fontSize: 22 },
  infoLabel: {
    fontSize: 11,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    fontWeight: '400',
    marginTop: 2,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  socialBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  socialBtnHover: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  socialBtnText: {
    fontSize: 16,
    fontFamily: theme.fonts.heading,
    color: theme.colors.text,
    fontWeight: '600',
  },
});
