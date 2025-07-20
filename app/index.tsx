import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Users, TrendingUp, Calendar } from 'lucide-react-native';

export default function WelcomeScreen() {
  const { session, loading } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to main app
    if (!loading && session) {
      router.replace('/(tabs)');
    }
  }, [session, loading]);

  const handleGetStarted = () => {
    router.push('/auth/register');
  };

  const handleSignIn = () => {
    router.push('/auth/login');
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If user is authenticated, don't show welcome screen
  if (session) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200' }}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.9)', 'rgba(139, 92, 246, 0.8)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Sparkles size={32} color={Colors.white} />
                <Text style={styles.title}>EventConnect</Text>
              </View>
              <Text style={styles.subtitle}>
                Connect, Network, and Grow at Amazing Events
              </Text>
            </View>

            <View style={styles.features}>
              <View style={[styles.feature, Shadows.medium]}>
                <View style={styles.featureIcon}>
                  <Calendar size={24} color={Colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Discover Events</Text>
                <Text style={styles.featureText}>
                  Find and join events that match your interests and career goals
                </Text>
              </View>
              
              <View style={[styles.feature, Shadows.medium]}>
                <View style={styles.featureIcon}>
                  <Users size={24} color={Colors.secondary} />
                </View>
                <Text style={styles.featureTitle}>Network</Text>
                <Text style={styles.featureText}>
                  Connect with professionals and expand your network
                </Text>
              </View>
              
              <View style={[styles.feature, Shadows.medium]}>
                <View style={styles.featureIcon}>
                  <TrendingUp size={24} color={Colors.accent} />
                </View>
                <Text style={styles.featureTitle}>Grow</Text>
                <Text style={styles.featureText}>
                  Learn from industry experts and advance your career
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.primaryButton, Shadows.medium]} onPress={handleGetStarted}>
                <LinearGradient
                  colors={[Colors.white, 'rgba(255, 255, 255, 0.9)']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.secondaryButton} onPress={handleSignIn}>
                <Text style={styles.secondaryButtonText}>I already have an account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    marginTop: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.white,
    fontWeight: '800',
    fontSize: 36,
  },
  subtitle: {
    ...Typography.h4,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },
  features: {
    gap: Spacing.xl,
    marginVertical: Spacing.xl,
  },
  feature: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  featureTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
    fontWeight: '700',
  },
  featureText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: Spacing.lg,
  },
  primaryButton: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 18,
  },
  secondaryButton: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  secondaryButtonText: {
    ...Typography.bodyMedium,
    color: Colors.white,
    fontWeight: '600',
  },
}); 