import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ToastAndroid, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Clock, Users, Calendar, User, Mail, Linkedin, Edit3, X, Check as Checkmark, Circle } from 'lucide-react-native';
import LogoutButton from '@/components/LogoutButton';
import { DatabaseService } from '../../services/database';
import { Event, User as UserType, Speaker, AgendaItem } from '@/types';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<UserType[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEventDetails(id as string);
    }
  }, [id]);

  const fetchEventDetails = async (eventId: string) => {
    setLoading(true);
    const dbEvent = await DatabaseService.getEvent(eventId);
    console.log('Fetched event:', dbEvent);
    if (!dbEvent) {
      setEvent(null);
      setLoading(false);
      return;
    }
    let organizer = (dbEvent as any)['users']
      ? { ...(dbEvent as any)['users'], id: dbEvent.organizer_id }
      : null;
    if (!organizer && dbEvent.organizer_id) {
      const organizerUser = await DatabaseService.getUser(dbEvent.organizer_id);
      organizer = organizerUser
        ? { ...organizerUser, id: dbEvent.organizer_id }
        : { id: dbEvent.organizer_id, name: 'Unknown Organizer', email: '' };
    }
    const eventAttendees = await DatabaseService.getEventAttendees(eventId);
    const eventSpeakersRaw = await DatabaseService.getEventSpeakers(eventId);
    const eventSpeakers: Speaker[] = eventSpeakersRaw.map((s: any) => ({
      ...s,
      sessions: [], // or fetch if needed
    }));
    const eventAgendaRaw = await DatabaseService.getEventAgenda(eventId);
    const eventAgenda: AgendaItem[] = eventAgendaRaw.map((a: any) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      startTime: a.start_time,
      endTime: a.end_time,
      speaker: eventSpeakers.find(s => s.id === a.speaker_id),
      location: a.location,
      type: a.type || 'session',
    }));
    setEvent({
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description,
      date: dbEvent.date,
      time: dbEvent.time,
      venue: dbEvent.venue,
      organizer,
      speakers: eventSpeakers,
      agenda: eventAgenda,
      attendees: eventAttendees as UserType[],
      maxAttendees: dbEvent.max_attendees,
      isRegistered: false, // You can check registration status if needed
      category: (dbEvent.category as 'conference' | 'workshop' | 'networking' | 'seminar'),
      status: (dbEvent.status as 'upcoming' | 'ongoing' | 'completed'),
    });
    setAttendees(eventAttendees as UserType[]);
    setSpeakers(eventSpeakers);
    setAgenda(eventAgenda);
    // Check if user is registered
    if (user) {
      setIsRegistered((eventAttendees as UserType[]).some(a => a.id === user.id));
    } else {
      setIsRegistered(false);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 32 }}>Loading event details...</Text>
      </SafeAreaView>
    );
  }

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

  const isOwnEvent = user && event && event.organizer && user.id === event.organizer.id;

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  const handleRegister = async () => {
    if (!user || !event) return;
    if (user.id === event.organizer.id) {
      Alert.alert('You cannot register for your own event.');
      return;
    }
    if (event.maxAttendees && attendees.length >= event.maxAttendees) {
      Alert.alert('Event Full', 'This event has reached its maximum capacity.');
      return;
    }
    if (isRegistered) {
      showToast('You are already registered for this event.');
      return;
    }
    Alert.alert(
      'Register for Event',
      'Are you sure you want to register for this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: async () => {
            setIsRegistering(true);
            try {
              const success = await DatabaseService.registerForEvent(event.id, user.id);
              if (success) {
                setIsRegistered(true);
                showToast('You have successfully registered for this event!');
                await fetchEventDetails(event.id); // Refresh event details
                router.replace('/'); // Go back to Home and trigger refresh
              } else {
                Alert.alert('Error', 'Failed to register for event. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to register for event. Please try again.');
            } finally {
              setIsRegistering(false);
            }
          },
        },
      ]
    );
  };

  const handleUnregister = async () => {
    if (!user || !event) return;
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
              const success = await DatabaseService.unregisterFromEvent(event.id, user.id);
              if (success) {
                setIsRegistered(false);
                showToast('You have been unregistered from this event.');
                await fetchEventDetails(event.id); // Refresh event details
                router.replace('/'); // Go back to Home and trigger refresh
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to unregister from event. Please try again.');
            } finally {
              setIsRegistering(false);
            }
          },
        },
      ]
    );
  };

  // Add edit/delete handlers
  const handleEdit = () => {
    router.push(`/organizer/edit-event?id=${encodeURIComponent(event.id)}`);
  };
  const handleDelete = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            await DatabaseService.deleteEvent(event.id);
            showToast('Event deleted');
            router.back();
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isOwnEvent && (
            <>
              <TouchableOpacity style={styles.iconButton} onPress={handleEdit}>
                <Edit3 size={22} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
                <X size={22} color={Colors.error} />
              </TouchableOpacity>
            </>
          )}
          <LogoutButton 
            size={20} 
            color={Colors.textSecondary}
            style={styles.headerLogoutButton}
          />
        </View>
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
          {/* Registration status icon for attendees */}
          {!isOwnEvent && (
            <View style={styles.registrationStatusRow}>
              {isRegistered ? (
                <View style={styles.registeredIconBadge}>
                  <Checkmark size={18} color={Colors.white} />
                  <Text style={styles.registrationStatusText}>Registered</Text>
                </View>
              ) : (
                <View style={styles.unregisteredIconBadge}>
                  <Circle size={18} color={Colors.textLight} />
                  <Text style={styles.registrationStatusText}>Not Registered</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Organizer info always visible */}
        <View style={styles.organizerSection}>
          <Text style={styles.sectionTitle}>Organizer</Text>
          <View style={styles.organizerCard}>
            <User size={24} color={Colors.primary} />
            <View style={styles.organizerInfo}>
              <Text style={styles.organizerName}>{event.organizer.name || 'Unknown Organizer'}</Text>
              <Text style={styles.organizerEmail}>{event.organizer.email || 'No email'}</Text>
            </View>
          </View>
        </View>

        {event.speakers && event.speakers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Speakers</Text>
            {event.speakers.map((speaker: any) => (
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
            {event.agenda.map((item: any) => (
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

        {user && event.organizer && user.id === event.organizer.id && attendees.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Registered Attendees</Text>
            {attendees.map((att: any) => (
              <View key={att.id} style={{ marginBottom: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>{att.name}</Text>
                <Text style={{ color: Colors.textSecondary }}>{att.email}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!isOwnEvent && (
          isRegistered ? (
            <View style={styles.registeredStatus}>
              <Text style={styles.registeredText}>You are registered <Text style={{ color: Colors.success }}>✔</Text></Text>
              <TouchableOpacity 
                style={styles.unregisterButton}
                onPress={handleUnregister}
                disabled={isRegistering}
              >
                <Text style={styles.unregisterButtonText}>
                  {isRegistering ? 'Unregistering...' : 'Unregister'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={
                isRegistering ||
                !!(event && event.maxAttendees && attendees.length >= event.maxAttendees)
              }
            >
              <Text style={styles.registerButtonText}>
                {isRegistering ? 'Registering...' : (event && event.maxAttendees && attendees.length >= event.maxAttendees) ? 'Full' : 'Register'}
              </Text>
            </TouchableOpacity>
          )
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
  headerLogoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
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
  registeredStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  registeredText: {
    ...Typography.body,
    color: Colors.success,
    fontWeight: '600',
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
  registrationStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  registeredIconBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 6,
  },
  unregisteredIconBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: Colors.textLight,
    gap: 6,
  },
  registrationStatusText: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '500',
    marginLeft: 4,
  },
}); 