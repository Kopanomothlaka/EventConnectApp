import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import AgendaItem from '@/components/AgendaItem';
import LogoutButton from '@/components/LogoutButton';
import { mockEvents } from '@/data/mockData';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { Event, AgendaItem as AgendaItemType } from '@/types';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseService } from '../../services/database';
import { useEffect } from 'react';
import { useFocusEffect } from 'expo-router';

export default function AgendaScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEventsAndAgendas = async () => {
    if (!user) return;
    setLoading(true);
    const userEventsRaw = await DatabaseService.getUserEvents(user.id);
    // Map to full Event type
    const eventsWithAgendas = await Promise.all(
      userEventsRaw.map(async (event) => {
        // Organizer
        let organizer = {
          id: event.organizer_id,
          name: 'Unknown Organizer',
          email: '',
          role: 'organizer' as 'organizer',
        };
        // Attendees
        const attendees = await DatabaseService.getEventAttendees(event.id);
        // Speakers
        const speakersRaw = await DatabaseService.getEventSpeakers(event.id);
        const speakers = speakersRaw.map(s => ({
          ...s,
          bio: s.bio || '',
          company: s.company || '',
          position: s.position || '',
          sessions: [], // Provide empty array for sessions
        }));
        // Agenda
        const agendaRaw = await DatabaseService.getEventAgenda(event.id);
        // Map agenda items to AgendaItem type
        const agenda = agendaRaw.map(a => ({
          id: a.id,
          title: a.title,
          description: a.description || '',
          startTime: a.start_time,
          endTime: a.end_time,
          speaker: speakers.find(s => s.id === a.speaker_id),
          location: a.location,
          type: a.type || 'session',
        }));
        return {
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          venue: event.venue,
          organizer,
          speakers,
          agenda,
          attendees,
          maxAttendees: event.max_attendees,
          isRegistered: true,
          category: event.category as 'conference' | 'workshop' | 'networking' | 'seminar',
          status: event.status as 'upcoming' | 'ongoing' | 'completed',
        };
      })
    );
    setEvents(eventsWithAgendas);
    setSelectedEvent(eventsWithAgendas[0] || null);
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchEventsAndAgendas();
    }, [user])
  );

  const handleAgendaItemPress = (item: AgendaItemType) => {
    console.log('Navigate to agenda item details:', item.id);
  };

  const formatEventDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getEventDuration = () => {
    if (!selectedEvent || !selectedEvent.agenda || selectedEvent.agenda.length === 0) return '';
    const firstItem = selectedEvent.agenda[0];
    const lastItem = selectedEvent.agenda[selectedEvent.agenda.length - 1];
    if (!firstItem || !lastItem) return '';
    return `${firstItem.startTime} - ${lastItem.endTime}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Agenda</Text>
          <LogoutButton 
            size={20} 
            color={Colors.textSecondary}
            style={styles.logoutButton}
          />
        </View>
      </View>

      <ScrollView 
        style={styles.agendaContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.agendaContent}
      >
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 32 }}>Loading agendas...</Text>
        ) : events.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={48} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>No agenda available</Text>
            <Text style={styles.emptyStateSubtext}>
              Register for events to see their agenda
            </Text>
          </View>
        ) : (
          events.map(event => (
            <View key={event.id} style={{ marginBottom: 32 }}>
              <View style={styles.eventInfo}>
                <View style={styles.eventInfoHeader}>
                  <Calendar size={16} color={Colors.primary} />
                  <Text style={styles.eventDate}>
                    {formatEventDate(event.date)}
                  </Text>
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventInfoRow}>
                  <Clock size={14} color={Colors.textSecondary} />
                  <Text style={styles.eventTime}>{event.time}</Text>
                </View>
                <View style={styles.eventInfoRow}>
                  <MapPin size={14} color={Colors.textSecondary} />
                  <Text style={styles.eventVenue} numberOfLines={1}>
                    {event.venue}
                  </Text>
                </View>
              </View>
              {event.agenda && event.agenda.length > 0 ? (
                event.agenda.map(item => (
                  <AgendaItem
                    key={item.id}
                    item={item}
                    onPress={() => handleAgendaItemPress(item)}
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No agenda for this event</Text>
                </View>
              )}
            </View>
          ))
        )}
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
    backgroundColor: Colors.white,
    paddingBottom: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  logoutButton: {
    padding: Spacing.sm,
  },
  eventSelector: {
    marginBottom: Spacing.md,
  },
  eventSelectorContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  eventChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 200,
  },
  eventChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  eventChipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  eventChipTextActive: {
    color: Colors.white,
  },
  eventInfo: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surfaceVariant,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  eventInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  eventDate: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  eventTime: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  eventVenue: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  eventTitle: {
    ...Typography.h2,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  agendaContainer: {
    flex: 1,
  },
  agendaContent: {
    paddingVertical: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  emptyStateText: {
    ...Typography.h3,
    color: Colors.textSecondary,
  },
  emptyStateSubtext: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});