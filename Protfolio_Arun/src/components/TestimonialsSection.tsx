import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import theme from '../theme';
import SectionTitle from './ui/SectionTitle';
import ScrollReveal from './ui/ScrollReveal';

const TESTIMONIALS = [
  {
    id: 1, name: 'Priya Sharma', role: 'Homeowner, Mumbai',
    text: 'Arun transformed our apartment into a warm and luxurious space beyond our expectations. Every detail was thoughtfully curated.',
    rating: 5,
  },
  {
    id: 2, name: 'Rajesh Patel', role: 'CEO, TechCorp',
    text: 'The office redesign boosted our team productivity and morale. The balance between aesthetics and functionality is remarkable.',
    rating: 5,
  },
  {
    id: 3, name: 'Ananya Reddy', role: 'Villa Owner, Bangalore',
    text: 'Working with Arun was an absolute pleasure. His attention to detail and creative vision brought our dream home to life.',
    rating: 5,
  },
  {
    id: 4, name: 'Vikram Singh', role: 'Restaurant Owner',
    text: 'The restaurant interior became the talk of the town. Our guests constantly compliment the ambiance and design.',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [active, setActive] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <View style={styles.container} nativeID="testimonials">
      <View style={styles.inner}>
        <SectionTitle
          label="TESTIMONIALS"
          title="What Our Clients Say"
          subtitle="Real stories from homeowners and businesses we've had the privilege to design for."
        />

        {/* Cards carousel */}
        <ScrollReveal style={[styles.carousel, isDesktop && styles.carouselDesktop]}>
          {TESTIMONIALS.map((t, i) => {
            const isActive = i === active;
            return (
              <View key={t.id} style={[
                styles.card,
                isDesktop && styles.cardDesktop,
                Platform.OS === 'web' ? {
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isActive ? 'scale(1.04)' : 'scale(0.96)',
                  opacity: isActive ? 1 : 0.5,
                } as any : {},
                isActive && styles.cardActive,
              ]}>
                {/* Quotation mark */}
                <Text style={styles.quoteIcon}>"</Text>

                {/* Stars */}
                <View style={styles.stars}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Text key={j} style={styles.star}>★</Text>
                  ))}
                </View>

                <Text style={styles.reviewText}>{t.text}</Text>

                <View style={styles.authorRow}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{t.name[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.authorName}>{t.name}</Text>
                    <Text style={styles.authorRole}>{t.role}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollReveal>

        {/* Dots */}
        <View style={styles.dots}>
          {TESTIMONIALS.map((_, i) => (
            <View key={i} style={[
              styles.dot,
              i === active && styles.dotActive,
              Platform.OS === 'web' ? { transition: 'all 0.3s ease' } as any : {},
            ]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.section,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  inner: {
    maxWidth: 1400,
    width: '100%',
    alignSelf: 'center',
  },
  carousel: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  carouselDesktop: {
    flexWrap: 'nowrap',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: theme.borderRadius.xl,
    padding: 32,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    flex: 1,
    minWidth: 280,
    maxWidth: 340,
  },
  cardDesktop: { minWidth: 300 },
  cardActive: {
    borderColor: theme.colors.border,
  },
  quoteIcon: {
    fontSize: 60,
    fontFamily: theme.fonts.heading,
    color: theme.colors.primary,
    opacity: 0.3,
    lineHeight: 50,
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 16,
  },
  star: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  reviewText: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: 'rgba(245,240,232,0.8)',
    lineHeight: 26,
    fontWeight: '300',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: theme.fonts.heading,
    color: theme.colors.background,
    fontWeight: '700',
  },
  authorName: {
    fontSize: 15,
    fontFamily: theme.fonts.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  authorRole: {
    fontSize: 12,
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors.primary,
  },
});
