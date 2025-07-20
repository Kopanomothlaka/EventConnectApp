import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Building, MapPin, MessageCircle, Linkedin, Star, CheckCircle } from 'lucide-react-native';
import { Contact } from '@/types';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

interface ContactCardProps {
  contact: Contact;
  onPress: () => void;
  isMutual?: boolean;
}

export default function ContactCard({ contact, onPress, isMutual }: ContactCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TouchableOpacity style={[styles.card, Shadows.medium]} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.header}>
        <LinearGradient
          colors={[Colors.primaryLight, Colors.primary]}
          style={styles.avatarContainer}
        >
          <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
        </LinearGradient>
        <View style={styles.headerContent}>
          <Text style={styles.name} numberOfLines={1}>
            {contact.name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {contact.email}
          </Text>
          {isMutual && (
            <View style={[styles.connectedBadge, Shadows.small]}>
              <CheckCircle size={12} color={Colors.white} />
              <Text style={styles.connectedBadgeText}>
                Connected
              </Text>
            </View>
          )}
        </View>
        <View style={styles.socialIcons}>
          {contact.linkedIn && (
            <TouchableOpacity style={styles.socialButton}>
              <Linkedin size={16} color={Colors.info} />
            </TouchableOpacity>
          )}
          {contact.whatsApp && (
            <TouchableOpacity style={styles.socialButton}>
              <MessageCircle size={16} color={Colors.success} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {contact.company && (
        <View style={styles.detailRow}>
          <Building size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {contact.position ? `${contact.position} at ` : ''}
            {contact.company}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.metAtContainer}>
          <View style={styles.metAtIcon}>
            <Star size={10} color={Colors.warning} fill={Colors.warning} />
          </View>
          <Text style={styles.metAtText}>
            Met at {contact.metAt}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(contact.dateAdded)}</Text>
      </View>

      {contact.notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesText} numberOfLines={2}>
            {contact.notes}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    ...Typography.bodyMedium,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  name: {
    ...Typography.bodyMedium,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  email: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  socialIcons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  socialButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  detailText: {
    ...Typography.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  metAtContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metAtIcon: {
    width: 16,
    height: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metAtText: {
    ...Typography.captionMedium,
    color: Colors.textLight,
  },
  dateText: {
    ...Typography.captionMedium,
    color: Colors.textLight,
  },
  notesContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  notesText: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  connectedBadge: {
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connectedBadgeText: {
    ...Typography.captionMedium,
    color: Colors.white,
    fontWeight: '600',
  },
});