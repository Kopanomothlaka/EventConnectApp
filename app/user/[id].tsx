import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { DatabaseService } from '../../services/database';
import { User, Contact } from '@/types';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import ContactCard from '@/components/ContactCard';
import { ArrowLeft, Linkedin, MessageCircle, Twitter, Instagram, Globe } from 'lucide-react-native';
import * as Linking from 'expo-linking';

interface SocialMediaAccount {
  id: string;
  platform: string;
  username: string;
  url: string;
  icon: any;
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [socialAccounts, setSocialAccounts] = useState<SocialMediaAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchUserProfile(id as string);
      fetchSocialAccounts(id as string);
    }
  }, [id]);

  const fetchUserProfile = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await DatabaseService.getUser(userId);
      if (!userData) {
        setError('User not found');
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(userData);
    } catch (e) {
      setError('Failed to load user profile');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchSocialAccounts = async (userId: string) => {
    try {
      const socialAccountsData = await DatabaseService.getUserSocialAccounts(userId);
      setSocialAccounts(socialAccountsData.map(account => ({
        id: account.id,
        platform: account.platform,
        username: account.username,
        url: account.url,
        icon: getSocialIcon(account.platform),
      })));
    } catch (error) {
      setSocialAccounts([]);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return Linkedin;
      case 'whatsapp': return MessageCircle;
      case 'twitter': return Twitter;
      case 'instagram': return Instagram;
      case 'website': return Globe;
      default: return Globe;
    }
  };

  const handleSocialPress = async (account: SocialMediaAccount) => {
    try {
      if (account.url) {
        await Linking.openURL(account.url);
      } else {
        Alert.alert('Error', 'Invalid URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open application');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16 }}>Loading user profile...</Text>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'User not found'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonIcon}>
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>User Profile</Text>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.profileCard}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <Text style={styles.userRole}>{user.role}</Text>
          {user.company && (
            <Text style={styles.userCompany}>{user.position ? `${user.position} at ` : ''}{user.company}</Text>
          )}
        </View>
        {/* Social Media Section */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Social Media</Text>
          <View style={styles.socialAccounts}>
            {socialAccounts.length === 0 ? (
              <Text style={styles.emptyStateText}>No social media accounts.</Text>
            ) : (
              socialAccounts.map((account: SocialMediaAccount) => (
                <View key={account.id} style={styles.socialAccount}>
                  <TouchableOpacity 
                    style={styles.socialButton} 
                    onPress={() => handleSocialPress(account)}
                  >
                    <account.icon size={20} color={Colors.primary} />
                    <Text style={styles.socialUsername}>{account.username}</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButtonIcon: {
    marginRight: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  profileCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userName: {
    ...Typography.h2,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  userEmail: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  userRole: {
    ...Typography.bodySmall,
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textTransform: 'capitalize',
  },
  userCompany: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  socialSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  socialTitle: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  socialAccounts: {
    gap: Spacing.sm,
  },
  socialAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  socialUsername: {
    ...Typography.bodySmall,
    color: Colors.text,
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    ...Typography.h3,
    color: Colors.error,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
}); 