import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ImageBackground, Modal, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Filter, RefreshCw, Sparkles, TrendingUp, Calendar as CalendarIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import EventCard from '@/components/EventCard';
import LogoutButton from '@/components/LogoutButton';
import { mockEvents, mockUser } from '@/data/mockData';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '@/constants/Colors';
import { Event, User } from '@/types';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseService } from '../../services/database';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [events, setEvents] = useState(mockEvents);
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showMyEvents, setShowMyEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);

  // Use authenticated user data if available, otherwise fall back to mock data
  const currentUser = user ? {
    name: user.user_metadata?.name || 'User',
    role: user.user_metadata?.role || 'attendee',
    email: user.email || ''
  } : mockUser;

  const categories = [
    { id: 'all', label: 'All Events' },
    { id: 'conference', label: 'Conferences', icon: '🎯' },
    { id: 'workshop', label: 'Workshops', icon: '🛠️' },
    { id: 'networking', label: 'Networking', icon: '🤝' },
    { id: 'seminar', label: 'Seminars', icon: '📚' },
    { id: 'meetup', label: 'Meetups', icon: '☕' },
    { id: 'hackathon', label: 'Hackathons', icon: '💻' },
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
    let matchesUpcoming = true;
    if (showUpcomingOnly && event.date) {
      const today = new Date();
      const eventDate = new Date(event.date);
      matchesUpcoming = eventDate >= today;
    }
    return matchesSearch && matchesCategory && matchesUpcoming;
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
      <ImageBackground
        source={{ uri: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200' }}
        style={styles.headerBackground}
        imageStyle={styles.headerBackgroundImage}
      >
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.8)', 'rgba(139, 92, 246, 0.9)']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerContent}>
                <View style={styles.greetingContainer}>
                  <Sparkles size={20} color={Colors.white} />
                  <Text style={styles.greeting}>Welcome, {currentUser.name}!</Text>
                </View>
                <Text style={styles.subtitle}>Discover amazing events around you</Text>
                {session && (
                  <View style={styles.userInfoContainer}>
                    <View style={styles.userInfoBadge}>
                      <Text style={styles.userInfo}>
                        {currentUser.email} • {currentUser.role}
                      </Text>
                    </View>
                  </View>
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
                  color={Colors.white}
                  style={styles.logoutButton}
                />
              </View>
            </View>
            
            {isAttendee && (
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, !showMyEvents && styles.tabButtonActive]}
                  onPress={() => setShowMyEvents(false)}
                >
                  <TrendingUp size={16} color={!showMyEvents ? Colors.primary : Colors.white} />
                  <Text style={[styles.tabButtonText, !showMyEvents && styles.tabButtonTextActive]}>
                    All Events
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabButton, showMyEvents && styles.tabButtonActive]}
                  onPress={() => setShowMyEvents(true)}
                >
                  <CalendarIcon size={16} color={showMyEvents ? Colors.primary : Colors.white} />
                  <Text style={[styles.tabButtonText, showMyEvents && styles.tabButtonTextActive]}>
                    My Events
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.searchSection}>
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
          <TouchableOpacity style={[styles.filterButton, Shadows.small]} onPress={() => setFilterModalVisible(true)}>
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
              {category.icon && (
                <Text style={styles.categoryIcon}>{category.icon}</Text>
              )}
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

      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 24, minWidth: 280 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Filter Events</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ flex: 1, fontSize: 16 }}>Show only upcoming events</Text>
              <Switch
                value={showUpcomingOnly}
                onValueChange={setShowUpcomingOnly}
                trackColor={{ false: '#ccc', true: Colors.primaryLight }}
                thumbColor={showUpcomingOnly ? Colors.primary : '#f4f3f4'}
              />
            </View>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={{ marginTop: 8, alignSelf: 'flex-end' }}>
              <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  headerBackground: {
    height: 250,
  },
  headerBackgroundImage: {
    resizeMode: 'cover',
  },
  headerGradient: {
    flex: 1,
    paddingTop: Spacing.md,
  },
  header: {
    flex: 1,
    justifyContent: 'space-between',
  },
  searchSection: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    ...Shadows.small,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flex: 1,
    maxWidth: '80%',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  greeting: {
    ...Typography.h3,
    color: Colors.white,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.sm,
  },
  userInfoContainer: {
    marginTop: Spacing.xs,
  },
  userInfoBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  userInfo: {
    ...Typography.captionMedium,
    color: Colors.white,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BorderRadius.full,
    padding: 4,
    gap: 4,
  },
  createButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginLeft: Spacing.md,
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
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
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
  categoryIcon: {
    fontSize: 16,
  },
  categoryChip: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    ...Shadows.small,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    ...Typography.captionMedium,
    color: Colors.textSecondary,
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
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  tabButtonActive: {
    backgroundColor: Colors.white,
  },
  tabButtonText: {
    ...Typography.captionMedium,
    color: Colors.white,
  },
  tabButtonTextActive: {
    color: Colors.primary,
  },
});