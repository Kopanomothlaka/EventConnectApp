import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MapPin, Clock, Users, Calendar, Edit3, X, Check as Checkmark, Circle } from 'lucide-react-native';
import { Event } from '@/types';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';

interface EventCardProps {
  event: Event;
  onPress: () => void;
  onRegister?: (eventId: string) => void;
  onUnregister?: (eventId: string) => void;
  isRegistered?: boolean;
  currentUserId?: string;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
}

export default function EventCard({ event, onPress, onRegister, onUnregister, isRegistered: isRegisteredProp, currentUserId, onEdit, onDelete }: EventCardProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(isRegisteredProp ?? event.isRegistered);
  const isOwnEvent = currentUserId && event.organizer && currentUserId === event.organizer.id;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'conference':
        return Colors.primary;
      case 'workshop':
        return Colors.secondary;
      case 'networking':
        return Colors.accent;
      case 'seminar':
        return Colors.warning;
      default:
        return Colors.primary;
    }
  };

  const handleRegister = async () => {
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      Alert.alert('Event Full', 'This event has reached its maximum capacity.');
      return;
    }

    setIsRegistering(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsRegistered(true);
      onRegister?.(event.id);
      Alert.alert('Success', 'You have successfully registered for this event!');
    } catch (error) {
      Alert.alert('Error', 'Failed to register for event. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async () => {
    Alert.alert(
      'Unregister',
      'Are you sure you want to unregister from this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unregister',
          style: 'destructive',
          onPress: async () => {
            setIsRegistering(true);
            
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              setIsRegistered(false);
              onUnregister?.(event.id);
              Alert.alert('Success', 'You have been unregistered from this event.');
            } catch (error) {
              Alert.alert('Error', 'Failed to unregister from event. Please try again.');
            } finally {
              setIsRegistering(false);
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Calendar size={16} color={Colors.primary} />
          <Text style={styles.dateText}>{formatDate(event.date)}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {event.title}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {event.description}
      </Text>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Clock size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{formatTime(event.time)}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText} numberOfLines={1}>
            {event.venue}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Users size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            {event.attendees.length}
            {event.maxAttendees ? `/${event.maxAttendees}` : ''} attending
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.organizerText}>by {event.organizer.name}</Text>
        {isOwnEvent && (
          <View style={styles.attendeeCountBadge}>
            <Users size={14} color={Colors.secondary} />
            <Text style={styles.attendeeCountText}>{event.attendees.length} attendee{event.attendees.length === 1 ? '' : 's'}</Text>
          </View>
        )}
      </View>
      {/* Registered icon for attendees at bottom right */}
      {isRegistered && !isOwnEvent && (
        <View style={styles.registeredIconContainer}>
          <View style={styles.registeredIconBadge}>
            <Checkmark size={18} color={Colors.white} />
          </View>
        </View>
      )}
      {/* Unregistered icon for attendees at bottom right */}
      {!isRegistered && !isOwnEvent && (
        <View style={styles.registeredIconContainer}>
          <View style={styles.unregisteredIconBadge}>
            <Circle size={18} color={Colors.textLight} />
          </View>
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
  cardRegistered: {
    backgroundColor: Colors.textLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dateText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  details: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
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
  },
  organizerText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  registerButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  registerButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  registerButtonText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '500',
  },
  unregisterButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  unregisterButtonText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '500',
  },
  registeredBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.xs,
  },
  registeredBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '500',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  attendeeCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  attendeeCountText: {
    ...Typography.bodySmall,
    color: Colors.secondary,
    fontWeight: '500',
    marginLeft: 4,
  },
  registeredIconContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    zIndex: 10,
  },
  registeredIconBadge: {
    backgroundColor: Colors.success,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  unregisteredIconBadge: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.textLight,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
});