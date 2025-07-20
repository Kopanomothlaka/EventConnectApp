import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import { MapPin, Clock, Users, Calendar, Check as Checkmark, Circle, Star, Bookmark } from 'lucide-react-native';
import { Event } from '@/types';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

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

const getCategoryImage = (category: string) => {
  const images = {
    conference: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
    workshop: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    networking: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
    seminar: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800',
    meetup: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
    hackathon: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
  };
  return images[category as keyof typeof images] || images.conference;
};

export default function EventCard({ event, onPress, onRegister, onUnregister, isRegistered: isRegisteredProp, currentUserId, onEdit, onDelete }: EventCardProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(isRegisteredProp ?? event.isRegistered);
  const [isBookmarked, setIsBookmarked] = useState(false);
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
    const colors = {
      conference: Colors.conference,
      workshop: Colors.workshop,
      networking: Colors.networking,
      seminar: Colors.seminar,
      meetup: Colors.meetup,
      hackathon: Colors.hackathon,
    };
    return colors[category as keyof typeof colors] || Colors.primary;
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const attendancePercentage = event.maxAttendees 
    ? (event.attendees.length / event.maxAttendees) * 100 
    : 0;

  const getAttendanceStatus = () => {
    if (attendancePercentage >= 90) return { color: Colors.error, text: 'Almost Full' };
    if (attendancePercentage >= 70) return { color: Colors.warning, text: 'Filling Up' };
    return { color: Colors.success, text: 'Available' };
  };

  const attendanceStatus = getAttendanceStatus();

  return (
    <TouchableOpacity
      style={[styles.card, Shadows.medium]}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <ImageBackground
        source={{ uri: getCategoryImage(event.category) }}
        style={styles.imageBackground}
        imageStyle={styles.backgroundImage}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.dateContainer}>
              <Calendar size={14} color={Colors.white} />
              <Text style={styles.dateText}>{formatDate(event.date)}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={[styles.iconButton, { backgroundColor: isBookmarked ? Colors.warning : 'rgba(255,255,255,0.2)' }]}
                onPress={handleBookmark}
              >
                <Bookmark size={16} color={Colors.white} fill={isBookmarked ? Colors.white : 'transparent'} />
              </TouchableOpacity>
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
                <Text style={styles.categoryText}>{event.category}</Text>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {event.title}
            </Text>
            
            {event.maxAttendees && (
              <View style={styles.attendanceContainer}>
                <View style={[styles.attendanceBadge, { backgroundColor: attendanceStatus.color }]}>
                  <Text style={styles.attendanceText}>{attendanceStatus.text}</Text>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.cardContent}>
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Clock size={16} color={Colors.primary} />
            <Text style={styles.detailText}>{formatTime(event.time)}</Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={16} color={Colors.primary} />
            <Text style={styles.detailText} numberOfLines={1}>
              {event.venue}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Users size={16} color={Colors.primary} />
            <Text style={styles.detailText}>
              {event.attendees.length}
              {event.maxAttendees ? `/${event.maxAttendees}` : ''} attending
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.organizerContainer}>
            <View style={styles.organizerAvatar}>
              <Text style={styles.organizerInitial}>
                {event.organizer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.organizerText}>by {event.organizer.name}</Text>
          </View>
          
          {isOwnEvent && (
            <View style={styles.attendeeCountBadge}>
              <Star size={14} color={Colors.warning} fill={Colors.warning} />
              <Text style={styles.attendeeCountText}>Your Event</Text>
            </View>
          )}
        </View>

        {/* Registration status indicator */}
        {!isOwnEvent && (
          <View style={styles.registrationIndicator}>
            {isRegistered ? (
              <View style={styles.registeredBadge}>
                <Checkmark size={16} color={Colors.white} />
                <Text style={styles.registeredText}>Registered</Text>
              </View>
            ) : (
              <View style={styles.unregisteredBadge}>
                <Circle size={16} color={Colors.textLight} />
                <Text style={styles.unregisteredText}>Not Registered</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    overflow: 'hidden',
  },
  imageBackground: {
    height: 160,
    width: '100%',
  },
  backgroundImage: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  gradient: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  dateText: {
    ...Typography.captionMedium,
    color: Colors.white,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    ...Typography.captionMedium,
    color: Colors.white,
    textTransform: 'capitalize',
  },
  content: {
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h4,
    color: Colors.white,
    fontWeight: '700',
  },
  attendanceContainer: {
    alignSelf: 'flex-start',
  },
  attendanceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  attendanceText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  cardContent: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  details: {
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    ...Typography.bodySmall,
    color: Colors.text,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  organizerAvatar: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  organizerInitial: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
  organizerText: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    fontStyle: 'italic',
    flex: 1,
  },
  attendeeCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warningLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    gap: 4,
  },
  attendeeCountText: {
    ...Typography.captionMedium,
    color: Colors.warning,
  },
  registrationIndicator: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.xs,
  },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 4,
  },
  registeredText: {
    ...Typography.captionMedium,
    color: Colors.white,
  },
  unregisteredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  unregisteredText: {
    ...Typography.captionMedium,
    color: Colors.textLight,
  },
});