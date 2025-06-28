import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/Colors';
import { useAuth } from '../contexts/AuthContext';

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
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>EventConnect</Text>
          <Text style={styles.subtitle}>
            Connect, Network, and Grow at Amazing Events
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>🎯 Discover Events</Text>
            <Text style={styles.featureText}>
              Find and join events that match your interests and career goals
            </Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>🤝 Network</Text>
            <Text style={styles.featureText}>
              Connect with professionals and expand your network
            </Text>
          </View>
          
          <View style={styles.feature}>
            <Text style={styles.featureTitle}>📈 Grow</Text>
            <Text style={styles.featureText}>
              Learn from industry experts and advance your career
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleGetStarted}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleSignIn}>
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.xl * 2,
  },
  title: {
    ...Typography.h1,
    color: Colors.primary,
    marginBottom: Spacing.md,
    fontWeight: 'bold',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    gap: Spacing.lg,
  },
  feature: {
    alignItems: 'center',
  },
  featureTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  featureText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    gap: Spacing.md,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
  },
}); 