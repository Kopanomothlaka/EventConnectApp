import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, MapPin } from 'lucide-react-native';
import AgendaItem from '@/components/AgendaItem';
import { mockEvents } from '@/data/mockData';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { Event, AgendaItem as AgendaItemType } from '@/types';

export default function AgendaScreen() {
  const [selectedEvent, setSelectedEvent] = useState<Event>(mockEvents[0]);

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
    if (selectedEvent.agenda.length === 0) return '';
    
    const firstItem = selectedEvent.agenda[0];
    const lastItem = selectedEvent.agenda[selectedEvent.agenda.length - 1];
    
    return `${firstItem.startTime} - ${lastItem.endTime}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agenda</Text>
        
        {/* Event Selector */}
        <View style={styles.eventSelector}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventSelectorContent}
          >
            {mockEvents
              .filter(event => event.isRegistered && event.agenda.length > 0)
              .map(event => (
                <TouchableOpacity
                  key={event.id}
                  style={[
                    styles.eventChip,
                    selectedEvent.id === event.id && styles.eventChipActive
                  ]}
                  onPress={() => setSelectedEvent(event)}
                >
                  <Text
                    style={[
                      styles.eventChipText,
                      selectedEvent.id === event.id && styles.eventChipTextActive
                    ]}
                    numberOfLines={1}
                  >
                    {event.title}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>

        {/* Event Info */}
        {selectedEvent && (
          <View style={styles.eventInfo}>
            <View style={styles.eventInfoHeader}>
              <Calendar size={16} color={Colors.primary} />
              <Text style={styles.eventDate}>
                {formatEventDate(selectedEvent.date)}
              </Text>
            </View>
            <View style={styles.eventInfoRow}>
              <Clock size={14} color={Colors.textSecondary} />
              <Text style={styles.eventTime}>{getEventDuration()}</Text>
            </View>
            <View style={styles.eventInfoRow}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.eventVenue} numberOfLines={1}>
                {selectedEvent.venue}
              </Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.agendaContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.agendaContent}
      >
        {selectedEvent && selectedEvent.agenda.length > 0 ? (
          selectedEvent.agenda.map(item => (
            <AgendaItem
              key={item.id}
              item={item}
              onPress={() => handleAgendaItemPress(item)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={48} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>No agenda available</Text>
            <Text style={styles.emptyStateSubtext}>
              {mockEvents.filter(e => e.isRegistered).length === 0
                ? 'Register for events to see their agenda'
                : 'Check back later for event details'
              }
            </Text>
          </View>
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
  title: {
    ...Typography.h1,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
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