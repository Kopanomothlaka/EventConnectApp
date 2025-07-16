import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Filter, RefreshCw } from 'lucide-react-native';
import { router } from 'expo-router';
import EventCard from '@/components/EventCard';
import LogoutButton from '@/components/LogoutButton';
import { mockEvents, mockUser } from '@/data/mockData';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { Event, User } from '@/types';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseService } from '../../services/database';
import { useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [events, setEvents] = useState(mockEvents);
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showMyEvents, setShowMyEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use authenticated user data if available, otherwise fall back to mock data
  const currentUser = user ? {
    name: user.user_metadata?.name || 'User',
    role: user.user_metadata?.role || 'attendee',
    email: user.email || ''
  } : mockUser;

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'conference', label: 'Conferences' },
    { id: 'workshop', label: 'Workshops' },
    { id: 'networking', label: 'Networking' },
    { id: 'seminar', label: 'Seminars' },
  ];

  useEffect(() => {
    fetchAllEvents();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchAllEvents();
    }, [user, session])
  );

  const fetchAllEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const dbEvents = await DatabaseService.getEvents();
      console.log('dbEvents:', dbEvents);
      if (!Array.isArray(dbEvents)) throw new Error('No events array returned');
      // Filter out null or invalid events
      const validEvents = dbEvents.filter((event: any) => event && event.id);
      console.log('validEvents:', validEvents);
      // Defensive mapping
      const eventsWithAttendees = await Promise.all(
        validEvents.map(async (event: any, idx: number) => {
          if (!event || !event.id) {
            console.error('Skipping null/invalid event at index', idx, event);
            return null;
          }
          const attendeesRaw = await DatabaseService.getEventAttendees(event.id);
          const attendees = Array.isArray(attendeesRaw) ? attendeesRaw.filter(Boolean) : [];
          let isRegistered = false;
          if (user) {
            isRegistered = attendees.some((a: User) => a && a.id === user.id);
          }
          return {
            id: event.id,
            title: event.title,
            description: event.description,
            date: event.date,
            time: event.time,
            venue: event.venue,
            organizer: event.users
              ? { ...event.users, id: event.organizer_id }
              : {
                  id: event.organizer_id,
                  name: 'Unknown Organizer',
                  email: '',
                  role: 'organizer',
                  profileImage: '',
                  bio: '',
                  linkedIn: '',
                  whatsApp: '',
                  company: '',
                  position: '',
                },
            speakers: [], // You can fetch speakers if needed
            agenda: [], // You can fetch agenda if needed
            attendees,
            maxAttendees: event.max_attendees,
            isRegistered,
            category: event.category,
            status: event.status,
          } as Event;
        })
      );
      // Final filter to remove any nulls
      setEvents(eventsWithAttendees.filter(Boolean) as Event[]);
    } catch (err: any) {
      setError('Failed to load events. Please try again.');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEventPress = (event: Event) => {
    // Navigate to event details
    router.push(`/event/${event.id}` as any);
  };

  const handleCreateEvent = () => {
    // Navigate to organizer dashboard
    router.push('/organizer/create-event' as any);
  };

  const handleRegisterEvent = async (eventId: string) => {
    if (!user) return;
    const success = await DatabaseService.registerForEvent(eventId, user.id);
    if (success) {
      fetchAllEvents();
    }
  };

  const handleUnregisterEvent = async (eventId: string) => {
    if (!user) return;
    const success = await DatabaseService.unregisterFromEvent(eventId, user.id);
    if (success) {
      fetchAllEvents();
    }
  };

  const isOrganizer = currentUser.role === 'organizer';
  const isAttendee = currentUser.role === 'attendee';

  const myEvents = events.filter(event => event.isRegistered);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome, {currentUser.name}!</Text>
            <Text style={styles.subtitle}>Discover amazing events</Text>
            {session && (
              <Text style={styles.userInfo}>
                Logged in as: {currentUser.email} ({currentUser.role})
              </Text>
            )}
          </View>
          <View style={styles.headerActions}>
            {isOrganizer && (
              <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
                <Plus size={20} color={Colors.white} />
              </TouchableOpacity>
            )}
            <LogoutButton 
              size={20} 
              color={Colors.textSecondary}
              style={styles.logoutButton}
            />
          </View>
        </View>
        {isAttendee && (
          <View style={{ flexDirection: 'row', marginTop: 8, marginLeft: 8 }}>
            <TouchableOpacity
              style={[styles.tabButton, !showMyEvents && styles.tabButtonActive]}
              onPress={() => setShowMyEvents(false)}
            >
              <Text style={[styles.tabButtonText, !showMyEvents && styles.tabButtonTextActive]}>All Events</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, showMyEvents && styles.tabButtonActive]}
              onPress={() => setShowMyEvents(true)}
            >
              <Text style={[styles.tabButtonText, showMyEvents && styles.tabButtonTextActive]}>My Events</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textLight}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.categoryTextActive
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.eventsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsContent}
      >
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 32 }}>Loading events...</Text>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{error}</Text>
            <TouchableOpacity onPress={fetchAllEvents} style={{ marginTop: 16, alignSelf: 'center', backgroundColor: Colors.primary, padding: 12, borderRadius: 8 }}>
              <Text style={{ color: Colors.white }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (showMyEvents && isAttendee ? myEvents : filteredEvents).length > 0 ? (
          (showMyEvents && isAttendee ? myEvents : filteredEvents).map(event => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => handleEventPress(event)}
              onRegister={handleRegisterEvent}
              onUnregister={handleUnregisterEvent}
              isRegistered={event.isRegistered}
              currentUserId={user?.id}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No events found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  greeting: {
    ...Typography.h2,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  createButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },
  filterButton: {
    backgroundColor: Colors.surface,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoriesContainer: {
    maxHeight: 44,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  categoryChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: Colors.white,
  },
  eventsContainer: {
    flex: 1,
  },
  eventsContent: {
    paddingVertical: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  emptyStateText: {
    ...Typography.h3,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    ...Typography.bodySmall,
    color: Colors.textLight,
    textAlign: 'center',
  },
  userInfo: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoutButton: {
    backgroundColor: Colors.surface,
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButton: {
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
  },
  tabButtonActive: {
    borderColor: Colors.primary,
  },
  tabButtonText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: Colors.primary,
  },
});