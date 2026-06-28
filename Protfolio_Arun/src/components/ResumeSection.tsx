import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, useWindowDimensions, Linking, Image } from 'react-native';
import { Asset } from 'expo-asset';
import { useLightbox } from './ui/LightboxContext';
import theme from '../theme';
import SectionTitle from './ui/SectionTitle';
import ScrollReveal from './ui/ScrollReveal';
import GlassCard from './ui/GlassCard';

// ─── Resume Data ───
const PROFILE = {
  name: 'Arun Kumar Gopaldas',
  title: 'Interior Designer',
  phone: '+91 84989 97856',
  email: 'arunkumargopaldas@gmail.com',
  location: 'Hyderabad, Telangana',
  linkedin: 'https://www.linkedin.com/in/arun-kumar-gopaldas-482a0022b',
  instagram: 'https://www.instagram.com/3d_design_diariies',
  summary: 'Passionate and detail-oriented Interior Designer with 3+ years of professional experience transforming residential and commercial spaces into stunning, functional environments. Graduated from JD Institute of Fashion and Technology with a strong foundation in design principles, spatial planning, and material selection. Successfully delivered 100+ projects across Hyderabad.',
};

const EXPERIENCE = [
  {
    period: '2022 – Present',
    role: 'Freelance Interior Designer',
    desc: 'Leading end-to-end interior design projects for residential clients across Hyderabad. Specializing in luxury bedrooms, modern kitchens, living spaces, pooja rooms, TV units, and building elevations.',
    highlights: ['100+ Projects Delivered', 'Residential & Commercial', 'Client Satisfaction: 98%'],
  },
];

const EDUCATION = [
  {
    period: '2019 – 2022',
    institution: 'JD Institute of Fashion & Technology',
    degree: 'Interior Design',
    desc: 'Comprehensive training in interior design principles, spatial planning, color theory, material science, and design software.',
  },
];

const SOFTWARE_SKILLS = [
  { name: 'AutoCAD', level: 95, icon: '📐' },
  { name: 'V-Ray', level: 88, icon: '💡' },
  { name: 'SketchUp', level: 92, icon: '✏️' },
  { name: 'Enscape', level: 96, icon: '🏗️' },
  { name: 'D5 Renders', level: 85, icon: '🖌️' },
  { name: 'Canva AI', level: 80, icon: ' 🎨' },
  { name: 'Coohom', level: 80, icon: '🏠  ' },
];

const DESIGN_SKILLS = [
  'Space Planning', 'Color Theory', 'Material Selection', 'Furniture Design',
  'Lighting Design', '3D Visualization', 'Project Management', 'Client Relations',
  'Budget Planning', 'Site Supervision',
];

const ROOM_EXPERTISE = [
  { name: 'Bedrooms', icon: '🛏️', count: '30+' },
  { name: 'Living Areas', icon: '🛋️', count: '25+' },
  { name: 'Kitchens', icon: '🍳', count: '20+' },
  { name: 'Pooja Rooms', icon: '🪔', count: '10+' },
  { name: 'TV Units', icon: '📺', count: '15+' },
  { name: 'Elevations', icon: '🏛️', count: '10+' },
];

const STATS = [
  { number: '3+', label: 'Years Experience' },
  { number: '100+', label: 'Projects Completed' },
  { number: '98%', label: 'Client Satisfaction' },
  { number: '7+', label: 'Software Mastered' },
];

// ─── Animated Skill Bar ───
function SkillBar({ name, level, icon, delay, isMobile }: { name: string; level: number; icon: string; delay: number; isMobile: boolean }) {
  return (
    <ScrollReveal delay={delay} style={s.skillBarWrap}>
      <View style={s.skillBarHeader}>
        <Text style={s.skillBarIcon}>{icon}</Text>
        <Text style={[s.skillBarName, isMobile && { fontSize: 12 }]}>{name}</Text>
        <Text style={s.skillBarPct}>{level}%</Text>
      </View>
      <View style={s.skillBarTrack}>
        <View style={[
          s.skillBarFill,
          { width: `${level}%` as any },
          Platform.OS === 'web' ? {
            animation: `skillGrow 1.2s cubic-bezier(0.4,0,0.2,1) ${delay + 0.3}s forwards`,
            width: 0,
          } as any : {},
        ]} />
      </View>
    </ScrollReveal>
  );
}

// ─── Beautiful PDF Resume (web) ───
function handleDownloadPDF() {
  if (Platform.OS !== 'web') return;

  const profileImageSrc = Asset.fromModule(require('../../assets/Arun_Profile.jpeg')).uri || '';
  const profileImageAbsolute = profileImageSrc.startsWith('http')
    ? profileImageSrc
    : new URL(profileImageSrc, window.location.href).href;

  const skillBarsHTML = SOFTWARE_SKILLS.map(sk => `
    <div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
        <span style="font-size:11px;color:#333;font-weight:500;">${sk.name}</span>
        <span style="font-size:10px;color:#b08d57;font-weight:600;">${sk.level}%</span>
      </div>
      <div style="height:5px;background:#eee;border-radius:3px;overflow:hidden;">
        <div style="height:100%;width:${sk.level}%;background:linear-gradient(90deg,#c9a96e,#b08d57);border-radius:3px;"></div>
      </div>
    </div>
  `).join('');

  const designSkillsHTML = DESIGN_SKILLS.map(sk =>
    `<span style="display:inline-block;padding:4px 12px;margin:3px;border:1px solid #ddd;border-radius:20px;font-size:10px;color:#555;background:#fafaf8;">${sk}</span>`
  ).join('');

  const roomHTML = ROOM_EXPERTISE.map(r =>
    `<div style="text-align:center;padding:8px 6px;min-width:70px;">
      <div style="font-size:18px;">${r.icon}</div>
      <div style="font-size:14px;font-weight:700;color:#c9a96e;margin:2px 0;">${r.count}</div>
      <div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:1px;">${r.name}</div>
    </div>`
  ).join('');

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<title>Arun Kumar Gopaldas - Resume</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #fff; color: #333; width: 210mm; min-height: 297mm; margin: 0 auto; }
  .page { display: flex; min-height: 297mm; }
  .sidebar { width: 72mm; background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%); color: #f5f0e8; padding: 32px 20px; display: flex; flex-direction: column; gap: 22px; }
  .main { flex: 1; padding: 32px 28px; display: flex; flex-direction: column; gap: 22px; }

  /* Sidebar styles */
  .avatar { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #c9a96e; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; background: rgba(201,169,110,0.1); }
  .avatar-text { font-family: 'Playfair Display', serif; font-size: 28px; color: #c9a96e; font-weight: 700; }
  .sidebar-name { font-family: 'Playfair Display', serif; font-size: 18px; text-align: center; color: #f5f0e8; font-weight: 600; line-height: 1.3; }
  .sidebar-title { font-size: 10px; text-align: center; color: #c9a96e; letter-spacing: 3px; text-transform: uppercase; font-weight: 500; }
  .sidebar-divider { height: 1px; background: linear-gradient(90deg, transparent, #c9a96e, transparent); margin: 4px 0; }
  .sidebar-section { font-size: 10px; color: #c9a96e; letter-spacing: 2px; text-transform: uppercase; font-weight: 600; margin-bottom: 8px; }
  .contact-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
  .contact-icon { font-size: 12px; margin-top: 1px; }
  .contact-text { font-size: 10px; color: #ccc; line-height: 1.4; word-break: break-all; }
  .contact-label { font-size: 8px; color: #888; text-transform: uppercase; letter-spacing: 1px; }

  /* Main content styles */
  .section-title { font-family: 'Playfair Display', serif; font-size: 16px; color: #1a1a1a; font-weight: 600; padding-bottom: 6px; border-bottom: 2px solid #c9a96e; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .summary { font-size: 11px; color: #555; line-height: 1.7; font-weight: 300; }
  .exp-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
  .exp-role { font-family: 'Playfair Display', serif; font-size: 14px; color: #1a1a1a; font-weight: 600; }
  .exp-period { font-size: 10px; color: #c9a96e; font-weight: 600; letter-spacing: 1px; }
  .exp-desc { font-size: 10.5px; color: #666; line-height: 1.6; margin: 4px 0 8px; }
  .highlights { display: flex; gap: 6px; flex-wrap: wrap; }
  .highlight { padding: 3px 10px; border: 1px solid #c9a96e; border-radius: 12px; font-size: 9px; color: #b08d57; font-weight: 600; background: rgba(201,169,110,0.06); }
  .edu-inst { font-family: 'Playfair Display', serif; font-size: 13px; color: #1a1a1a; font-weight: 600; }
  .edu-degree { font-size: 11px; color: #c9a96e; font-style: italic; }
  .edu-desc { font-size: 10px; color: #777; line-height: 1.5; margin-top: 4px; }
  .room-grid { display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; }

  .stats-bar { display: flex; justify-content: space-around; background: linear-gradient(90deg, rgba(201,169,110,0.08), rgba(201,169,110,0.04)); border: 1px solid rgba(201,169,110,0.15); border-radius: 8px; padding: 12px 8px; }
  .stat-item { text-align: center; }
  .stat-num { font-family: 'Playfair Display', serif; font-size: 18px; color: #c9a96e; font-weight: 700; }
  .stat-lbl { font-size: 8px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }

  @media print {
    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .page { page-break-inside: avoid; }
  }
</style>
</head><body>
<div class="page">
  <!-- SIDEBAR -->
  <div class="sidebar">
    <div>
      <div class="avatar"><img src="${profileImageAbsolute}" alt="Arun Kumar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" /></div>
      <div class="sidebar-name">Arun Kumar<br/>Gopaldas</div>
      <div class="sidebar-title">Interior Designer</div>
    </div>
    <div class="sidebar-divider"></div>

    <div>
      <div class="sidebar-section">Contact</div>
      <div class="contact-item"><span class="contact-icon">📞</span><div><div class="contact-label">Phone</div><div class="contact-text">+91 84989 97856</div></div></div>
      <div class="contact-item"><span class="contact-icon">✉️</span><div><div class="contact-label">Email</div><div class="contact-text">arunkumargopaldas@gmail.com</div></div></div>
      <div class="contact-item"><span class="contact-icon">📍</span><div><div class="contact-label">Location</div><div class="contact-text">Hyderabad, Telangana</div></div></div>
      <div class="contact-item"><span class="contact-icon">💼</span><div><div class="contact-label">LinkedIn</div><div class="contact-text">linkedin.com/in/arun-kumar-gopaldas</div></div></div>
      <div class="contact-item"><span class="contact-icon">📸</span><div><div class="contact-label">Instagram</div><div class="contact-text">@3d_design_diariies</div></div></div>
    </div>
    <div class="sidebar-divider"></div>

    <div>
      <div class="sidebar-section">Software Skills</div>
      ${skillBarsHTML}
    </div>
    <div class="sidebar-divider"></div>

    <div>
      <div class="sidebar-section">Design Skills</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">
        ${DESIGN_SKILLS.map(sk => `<span style="display:inline-block;padding:3px 8px;border:1px solid rgba(201,169,110,0.3);border-radius:10px;font-size:9px;color:#ccc;margin-bottom:2px;">${sk}</span>`).join('')}
      </div>
    </div>
  </div>

  <!-- MAIN CONTENT -->
  <div class="main">
    <div class="stats-bar">
      ${STATS.map(st => `<div class="stat-item"><div class="stat-num">${st.number}</div><div class="stat-lbl">${st.label}</div></div>`).join('')}
    </div>

    <div>
      <div class="section-title">Professional Summary</div>
      <p class="summary">${PROFILE.summary}</p>
    </div>

    <div>
      <div class="section-title">Experience</div>
      ${EXPERIENCE.map(exp => `
        <div class="exp-header">
          <span class="exp-role">${exp.role}</span>
          <span class="exp-period">${exp.period}</span>
        </div>
        <p class="exp-desc">${exp.desc}</p>
        <div class="highlights">${exp.highlights.map(h => `<span class="highlight">${h}</span>`).join('')}</div>
      `).join('')}
    </div>

    <div>
      <div class="section-title">Education</div>
      ${EDUCATION.map(edu => `
        <div class="exp-header">
          <span class="edu-inst">${edu.institution}</span>
          <span class="exp-period">${edu.period}</span>
        </div>
        <div class="edu-degree">${edu.degree}</div>
        <p class="edu-desc">${edu.desc}</p>
      `).join('')}
    </div>

    <div>
      <div class="section-title">Room Expertise</div>
      <div class="room-grid">${roomHTML}</div>
    </div>
  </div>
</div>
</body></html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    // Auto-trigger print dialog after fonts load
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 500);
    };
  }
}

export default function ResumeSection() {
  const { width } = useWindowDimensions();
  const { openLightbox } = useLightbox();
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 1024;
  const isDesktop = width >= 1024;

  return (
    <View style={[s.container, isMobile && s.containerMobile]} nativeID="resume">
      <View style={s.inner}>
        <SectionTitle
          label="RESUME"
          title={isMobile ? "My Resume" : "Professional Resume"}
          subtitle={isMobile
            ? "3+ years of design excellence."
            : "A comprehensive overview of my professional journey, skills, and expertise."}
        />

        {/* ─── Stats Row ─── */}
        <ScrollReveal style={[s.statsRow, isMobile && s.statsRowMobile]}>
          {STATS.map((stat, i) => (
            <View key={i} style={[
              s.statCard,
              isMobile && s.statCardMobile,
              Platform.OS === 'web' ? {
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                transition: 'all 0.3s ease',
              } as any : {},
            ]}>
              <Text style={[s.statNumber, isMobile && { fontSize: 24 }]}>{stat.number}</Text>
              <Text style={[s.statLabel, isMobile && { fontSize: 9 }]}>{stat.label}</Text>
            </View>
          ))}
        </ScrollReveal>

        {/* ─── Main Grid ─── */}
        <View style={[s.mainGrid, isDesktop && s.mainGridDesktop]}>

          {/* LEFT COLUMN */}
          <View style={[s.leftCol, isDesktop && { flex: 0.55 }]}>

            {/* Profile Summary */}
            <ScrollReveal animation="slideInLeft">
              <GlassCard intensity="strong" glow style={[s.card, isMobile && s.cardMobile]}>
                <View style={s.profileHeader}>
                  <Pressable onPress={() => openLightbox([{ id: 'profile', src: require('../../assets/Arun_Profile.jpeg'), title: PROFILE.name, subtitle: 'Interior Designer' }])}
                    style={Platform.OS === 'web' ? { cursor: 'pointer', transition: 'transform 0.3s ease' } as any : {}}
                    onHoverIn={(e: any) => e.target.style.transform = 'scale(1.05)'}
                    onHoverOut={(e: any) => e.target.style.transform = 'scale(1)'}
                  >
                    <Image source={require('../../assets/Arun_Profile.jpeg')} style={s.profileAvatarImage} />
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.profileName, isMobile && { fontSize: 20 }]}>{PROFILE.name}</Text>
                    <Text style={s.profileTitle}>{PROFILE.title}</Text>
                  </View>
                </View>
                <Text style={[s.profileSummary, isMobile && { fontSize: 13, lineHeight: 21 }]}>
                  {PROFILE.summary}
                </Text>
                <View style={[s.contactRow, isMobile && { gap: 8 }]}>
                  {[
                    { icon: '📞', text: PROFILE.phone },
                    { icon: '✉️', text: PROFILE.email },
                    { icon: '📍', text: PROFILE.location },
                  ].map((c, i) => (
                    <View key={i} style={s.contactItem}>
                      <Text style={s.contactIcon}>{c.icon}</Text>
                      <Text style={[s.contactText, isMobile && { fontSize: 11 }]}>{c.text}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            </ScrollReveal>

            {/* Experience Timeline */}
            <ScrollReveal delay={0.2} animation="slideInLeft">
              <GlassCard style={[s.card, isMobile && s.cardMobile]}>
                <Text style={s.sectionHeader}>💼  Experience</Text>
                {EXPERIENCE.map((exp, i) => (
                  <View key={i} style={s.timelineItem}>
                    <View style={s.timelineDot} />
                    <View style={s.timelineLine} />
                    <View style={s.timelineContent}>
                      <Text style={s.timelinePeriod}>{exp.period}</Text>
                      <Text style={[s.timelineRole, isMobile && { fontSize: 16 }]}>{exp.role}</Text>
                      <Text style={[s.timelineDesc, isMobile && { fontSize: 12 }]}>{exp.desc}</Text>
                      <View style={[s.highlightRow, isMobile && { gap: 6 }]}>
                        {exp.highlights.map((h, j) => (
                          <View key={j} style={[s.highlightPill, isMobile && s.highlightPillMobile]}>
                            <Text style={[s.highlightText, isMobile && { fontSize: 9 }]}>{h}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </GlassCard>
            </ScrollReveal>

            {/* Education Timeline */}
            <ScrollReveal delay={0.3} animation="slideInLeft">
              <GlassCard style={[s.card, isMobile && s.cardMobile]}>
                <Text style={s.sectionHeader}>🎓  Education</Text>
                {EDUCATION.map((edu, i) => (
                  <View key={i} style={s.timelineItem}>
                    <View style={[s.timelineDot, { backgroundColor: theme.colors.secondary }]} />
                    <View style={[s.timelineLine, { backgroundColor: 'rgba(212,184,150,0.3)' }]} />
                    <View style={s.timelineContent}>
                      <Text style={s.timelinePeriod}>{edu.period}</Text>
                      <Text style={[s.timelineRole, isMobile && { fontSize: 16 }]}>{edu.institution}</Text>
                      <Text style={s.timelineDegree}>{edu.degree}</Text>
                      <Text style={[s.timelineDesc, isMobile && { fontSize: 12 }]}>{edu.desc}</Text>
                    </View>
                  </View>
                ))}
              </GlassCard>
            </ScrollReveal>
          </View>

          {/* RIGHT COLUMN */}
          <View style={[s.rightCol, isDesktop && { flex: 0.45 }]}>

            {/* Software Skills */}
            <ScrollReveal delay={0.15} animation="slideInRight">
              <GlassCard style={[s.card, isMobile && s.cardMobile]}>
                <Text style={s.sectionHeader}>🖥️  Software Proficiency</Text>
                {SOFTWARE_SKILLS.map((skill, i) => (
                  <SkillBar key={skill.name} {...skill} delay={i * 0.1} isMobile={isMobile} />
                ))}
              </GlassCard>
            </ScrollReveal>

            {/* Design Skills */}
            <ScrollReveal delay={0.25} animation="slideInRight">
              <GlassCard style={[s.card, isMobile && s.cardMobile]}>
                <Text style={s.sectionHeader}>✨  Design Skills</Text>
                <View style={s.skillTagsGrid}>
                  {DESIGN_SKILLS.map((skill, i) => (
                    <ScrollReveal key={skill} delay={i * 0.05} animation="scaleIn">
                      <View style={[
                        s.skillTag,
                        isMobile && s.skillTagMobile,
                        Platform.OS === 'web' ? { transition: 'all 0.3s ease', cursor: 'default' } as any : {},
                      ]}>
                        <Text style={[s.skillTagText, isMobile && { fontSize: 11 }]}>{skill}</Text>
                      </View>
                    </ScrollReveal>
                  ))}
                </View>
              </GlassCard>
            </ScrollReveal>

            {/* Room Expertise */}
            <ScrollReveal delay={0.35} animation="slideInRight">
              <GlassCard style={[s.card, isMobile && s.cardMobile]}>
                <Text style={s.sectionHeader}>🏠  Room Expertise</Text>
                <View style={[s.roomGrid, isMobile && { gap: 8 }]}>
                  {ROOM_EXPERTISE.map((room, i) => (
                    <ScrollReveal key={room.name} delay={i * 0.08} animation="scaleIn"
                      style={[s.roomCard, isMobile && s.roomCardMobile]}>
                      <Text style={[s.roomIcon, isMobile && { fontSize: 22 }]}>{room.icon}</Text>
                      <Text style={[s.roomCount, isMobile && { fontSize: 16 }]}>{room.count}</Text>
                      <Text style={[s.roomName, isMobile && { fontSize: 10 }]}>{room.name}</Text>
                    </ScrollReveal>
                  ))}
                </View>
              </GlassCard>
            </ScrollReveal>

            {/* Social Links */}
            <ScrollReveal delay={0.4} animation="slideInRight">
              <GlassCard style={[s.card, isMobile && s.cardMobile]}>
                <Text style={s.sectionHeader}>🔗  Connect</Text>
                <View style={s.socialLinks}>
                  {[
                    { icon: '💼', label: 'LinkedIn', url: PROFILE.linkedin },
                    { icon: '📸', label: 'Instagram', url: PROFILE.instagram },
                    { icon: '💬', label: 'WhatsApp', url: 'https://wa.me/918498997856' },
                  ].map((link) => (
                    <Pressable key={link.label}
                      onPress={() => Linking.openURL(link.url)}
                      style={({ hovered }: any) => [
                        s.socialLink,
                        isMobile && s.socialLinkMobile,
                        Platform.OS === 'web' ? { transition: 'all 0.3s ease', cursor: 'pointer' } as any : {},
                        hovered && s.socialLinkHover,
                      ]}>
                      <Text style={s.socialLinkIcon}>{link.icon}</Text>
                      <Text style={[s.socialLinkText, isMobile && { fontSize: 12 }]}>{link.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </GlassCard>
            </ScrollReveal>
          </View>
        </View>

        {/* ─── Download Button ─── */}
        <ScrollReveal delay={0.5}>
          <View style={s.downloadRow}>
            <Pressable
              onPress={handleDownloadPDF}
              style={({ hovered }: any) => [
                s.downloadBtn,
                isMobile && s.downloadBtnMobile,
                Platform.OS === 'web' ? { transition: 'all 0.3s ease', cursor: 'pointer' } as any : {},
                hovered && s.downloadBtnHover,
              ]}>
              <Text style={s.downloadIcon}>📄</Text>
              <Text style={[s.downloadText, isMobile && { fontSize: 13 }]}>Download Resume</Text>
            </Pressable>
          </View>
        </ScrollReveal>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.section,
    paddingHorizontal: 24,
  },
  containerMobile: { paddingVertical: 60, paddingHorizontal: 12 },
  inner: { maxWidth: 1300, width: '100%', alignSelf: 'center' },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginBottom: 48, flexWrap: 'wrap' },
  statsRowMobile: { gap: 10, marginBottom: 32 },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: theme.colors.glassBorder,
    borderRadius: theme.borderRadius.lg, paddingHorizontal: 28, paddingVertical: 20,
    alignItems: 'center', minWidth: 150,
  },
  statCardMobile: { paddingHorizontal: 16, paddingVertical: 14, minWidth: 0, flex: 1 },
  statNumber: { fontSize: 32, fontFamily: theme.fonts.heading, color: theme.colors.primary, fontWeight: '700' },
  statLabel: { fontSize: 11, fontFamily: theme.fonts.body, color: theme.colors.textSecondary, letterSpacing: 1, marginTop: 4, textAlign: 'center' },

  // Grid
  mainGrid: { gap: 24 },
  mainGridDesktop: { flexDirection: 'row' },
  leftCol: { gap: 24 },
  rightCol: { gap: 24 },

  // Cards
  card: { padding: 28, gap: 20 },
  cardMobile: { padding: 18, gap: 16 },
  sectionHeader: {
    fontSize: 18, fontFamily: theme.fonts.heading, color: theme.colors.text,
    fontWeight: '600', letterSpacing: 0.5,
  },

  // Profile
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  profileAvatarImage: {
    width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: theme.colors.primary,
  },
  profileName: { fontSize: 22, fontFamily: theme.fonts.heading, color: theme.colors.text, fontWeight: '700' },
  profileTitle: {
    fontSize: 13, fontFamily: theme.fonts.body, color: theme.colors.primary,
    fontWeight: '500', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2,
  },
  profileSummary: {
    fontSize: 14, fontFamily: theme.fonts.body, color: theme.colors.textSecondary,
    lineHeight: 24, fontWeight: '300',
  },
  contactRow: { gap: 12 },
  contactItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactIcon: { fontSize: 16 },
  contactText: { fontSize: 13, fontFamily: theme.fonts.body, color: theme.colors.text, fontWeight: '400' },

  // Timeline
  timelineItem: { paddingLeft: 24, position: 'relative' },
  timelineDot: {
    position: 'absolute', left: 0, top: 6, width: 12, height: 12, borderRadius: 6,
    backgroundColor: theme.colors.primary, borderWidth: 2, borderColor: theme.colors.surface,
  },
  timelineLine: {
    position: 'absolute', left: 5, top: 20, bottom: 0, width: 2,
    backgroundColor: 'rgba(201,169,110,0.2)',
  },
  timelineContent: { gap: 6 },
  timelinePeriod: {
    fontSize: 11, fontFamily: theme.fonts.body, color: theme.colors.primary,
    fontWeight: '600', letterSpacing: 2,
  },
  timelineRole: { fontSize: 18, fontFamily: theme.fonts.heading, color: theme.colors.text, fontWeight: '600' },
  timelineDegree: {
    fontSize: 13, fontFamily: theme.fonts.body, color: theme.colors.secondary,
    fontStyle: 'italic', fontWeight: '400',
  },
  timelineDesc: {
    fontSize: 13, fontFamily: theme.fonts.body, color: theme.colors.textSecondary,
    lineHeight: 22, fontWeight: '300',
  },
  highlightRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  highlightPill: {
    backgroundColor: 'rgba(201,169,110,0.12)', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: theme.borderRadius.full, borderWidth: 1, borderColor: 'rgba(201,169,110,0.2)',
  },
  highlightPillMobile: { paddingHorizontal: 10, paddingVertical: 4 },
  highlightText: { fontSize: 11, fontFamily: theme.fonts.body, color: theme.colors.primary, fontWeight: '600' },

  // Skill Bars
  skillBarWrap: { gap: 6 },
  skillBarHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  skillBarIcon: { fontSize: 16 },
  skillBarName: { fontSize: 13, fontFamily: theme.fonts.body, color: theme.colors.text, fontWeight: '500', flex: 1 },
  skillBarPct: { fontSize: 12, fontFamily: theme.fonts.body, color: theme.colors.primary, fontWeight: '600' },
  skillBarTrack: {
    height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden',
  },
  skillBarFill: {
    height: '100%', borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },

  // Skill Tags
  skillTagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  skillTag: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.borderRadius.full,
    borderWidth: 1, borderColor: theme.colors.glassBorder, backgroundColor: 'rgba(255,255,255,0.03)',
  },
  skillTagMobile: { paddingHorizontal: 12, paddingVertical: 6 },
  skillTagText: { fontSize: 12, fontFamily: theme.fonts.body, color: theme.colors.text, fontWeight: '400' },

  // Room Grid
  roomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  roomCard: {
    alignItems: 'center', gap: 4, paddingVertical: 16, paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md, backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: theme.colors.glassBorder, minWidth: 90,
  },
  roomCardMobile: { minWidth: 75, paddingVertical: 12, paddingHorizontal: 8 },
  roomIcon: { fontSize: 28 },
  roomCount: { fontSize: 20, fontFamily: theme.fonts.heading, color: theme.colors.primary, fontWeight: '700' },
  roomName: { fontSize: 11, fontFamily: theme.fonts.body, color: theme.colors.textSecondary, fontWeight: '400' },

  // Social
  socialLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  socialLink: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: theme.borderRadius.full,
    borderWidth: 1, borderColor: theme.colors.glassBorder, backgroundColor: 'rgba(255,255,255,0.03)',
  },
  socialLinkMobile: { paddingHorizontal: 14, paddingVertical: 8 },
  socialLinkHover: { borderColor: theme.colors.primary, backgroundColor: 'rgba(201,169,110,0.1)' },
  socialLinkIcon: { fontSize: 16 },
  socialLinkText: { fontSize: 13, fontFamily: theme.fonts.body, color: theme.colors.text, fontWeight: '500' },

  // Download
  downloadRow: { alignItems: 'center', marginTop: 48 },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 36, paddingVertical: 16, borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
  },
  downloadBtnMobile: { paddingHorizontal: 28, paddingVertical: 14 },
  downloadBtnHover: { backgroundColor: '#d4b478', transform: [{ scale: 1.03 }] },
  downloadIcon: { fontSize: 18 },
  downloadText: { fontSize: 15, fontFamily: theme.fonts.body, color: theme.colors.background, fontWeight: '600', letterSpacing: 1 },
});
