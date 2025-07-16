import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Building, MapPin, MessageCircle, Linkedin } from 'lucide-react-native';
import { Contact } from '@/types';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';

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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(contact.name)}</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.name} numberOfLines={1}>
            {contact.name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {contact.email}
          </Text>
          {isMutual && (
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedBadgeText}>Connected</Text>
            </View>
          )}
        </View>
        <View style={styles.socialIcons}>
          {contact.linkedIn && (
            <TouchableOpacity style={styles.socialButton}>
              <Linkedin size={16} color={Colors.primary} />
            </TouchableOpacity>
          )}
          {contact.whatsApp && (
            <TouchableOpacity style={styles.socialButton}>
              <MessageCircle size={16} color={Colors.accent} />
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
          <MapPin size={12} color={Colors.textLight} />
          <Text style={styles.metAtText}>Met at {contact.metAt}</Text>
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
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  name: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  detailText: {
    ...Typography.bodySmall,
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
  metAtText: {
    ...Typography.caption,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textLight,
  },
  notesContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  notesText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  connectedBadge: {
    backgroundColor: '#22c55e', // green
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 2,
  },
  connectedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});