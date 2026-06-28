import React from 'react';
import { ScrollView, View, StyleSheet, Platform } from 'react-native';

import Navigation from '../components/Navigation';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import FeaturedProjects from '../components/FeaturedProjects';
import GallerySection from '../components/GallerySection';
import DesignProcess from '../components/DesignProcess';
import PhilosophySection from '../components/PhilosophySection';
import SkillsetSection from '../components/SkillsetSection';
import ResumeSection from '../components/ResumeSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';
import FloatingSocials from '../components/ui/FloatingSocials';

export default function PortfolioHome() {
  return (
    <View style={styles.container}>
      <Navigation />

      {/* Floating Social Icons (desktop only) */}
      {Platform.OS === 'web' && <FloatingSocials />}

      {/* Main Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Cinematic Hero */}
        <HeroSection />

        {/* 2. About Studio */}
        <AboutSection />

        {/* 3. Featured Projects */}
        <FeaturedProjects />

        {/* 4. Visual Gallery */}
        <GallerySection />

        {/* 5. Design Philosophy */}
        <PhilosophySection />

        {/* 6. Design Process */}
        <DesignProcess />

        {/* 7. Skillset */}
        <SkillsetSection />

        {/* 8. Resume */}
        <ResumeSection />

        {/* 9. Contact */}
        <ContactSection />

        {/* Footer */}
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
