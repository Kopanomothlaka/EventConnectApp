import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Clock, Users, Calendar, User, Mail, Linkedin } from 'lucide-react-native';
import { mockEvents, mockUser } from '@/data/mockData';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const event = mockEvents.find(e => e.id === id);

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Event not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Event Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>
        </View>

        <View style={styles.eventInfo}>
          <View style={styles.infoRow}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{formatDate(event.date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{formatTime(event.time)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.infoText}>{event.venue}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Users size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              {event.attendees.length}
              {event.maxAttendees ? `/${event.maxAttendees}` : ''} attending
            </Text>
          </View>
        </View>

        {event.speakers && event.speakers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Speakers</Text>
            {event.speakers.map(speaker => (
              <View key={speaker.id} style={styles.speakerCard}>
                <View style={styles.speakerInfo}>
                  <Text style={styles.speakerName}>{speaker.name}</Text>
                  <Text style={styles.speakerPosition}>
                    {speaker.position} at {speaker.company}
                  </Text>
                  <Text style={styles.speakerBio}>{speaker.bio}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {event.agenda && event.agenda.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Agenda</Text>
            {event.agenda.map(item => (
              <View key={item.id} style={styles.agendaItem}>
                <View style={styles.agendaTime}>
                  <Text style={styles.agendaTimeText}>
                    {item.startTime} - {item.endTime}
                  </Text>
                </View>
                <View style={styles.agendaContent}>
                  <Text style={styles.agendaTitle}>{item.title}</Text>
                  <Text style={styles.agendaDescription}>{item.description}</Text>
                  {item.speaker && (
                    <Text style={styles.agendaSpeaker}>by {item.speaker.name}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.organizerSection}>
          <Text style={styles.sectionTitle}>Organizer</Text>
          <View style={styles.organizerCard}>
            <User size={24} color={Colors.primary} />
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerName}>{event.organizer.name}</Text>
              <Text style={styles.organizerEmail}>{event.organizer.email}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isRegistered ? (
          <TouchableOpacity 
            style={styles.unregisterButton}
            onPress={handleUnregister}
            disabled={isRegistering}
          >
            <Text style={styles.unregisterButtonText}>
              {isRegistering ? 'Unregistering...' : 'Unregister from Event'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[
              styles.registerButton,
              (event.maxAttendees && event.attendees.length >= event.maxAttendees) ? styles.registerButtonDisabled : null
            ]}
            onPress={handleRegister}
            disabled={isRegistering || Boolean(event.maxAttendees && event.attendees.length >= event.maxAttendees)}
          >
            <Text style={styles.registerButtonText}>
              {isRegistering ? 'Registering...' : 
               (event.maxAttendees && event.attendees.length >= event.maxAttendees) ? 'Event Full' : 'Register for Event'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  eventHeader: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
  },
  eventTitle: {
    ...Typography.h1,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  eventDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  eventInfo: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    marginTop: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  section: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  speakerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  speakerInfo: {
    gap: Spacing.xs,
  },
  speakerName: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: '600',
  },
  speakerPosition: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '500',
  },
  speakerBio: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  agendaItem: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  agendaTime: {
    minWidth: 80,
  },
  agendaTimeText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '500',
  },
  agendaContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  agendaTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  agendaDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  agendaSpeaker: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontStyle: 'italic',
  },
  organizerSection: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    marginTop: Spacing.md,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  organizerInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  organizerName: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  organizerEmail: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  registerButtonDisabled: {
    backgroundColor: Colors.textLight,
  },
  registerButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  unregisterButton: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  unregisterButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    ...Typography.h2,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  backButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
  },
}); 