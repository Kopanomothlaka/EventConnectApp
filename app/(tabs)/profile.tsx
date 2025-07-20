import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Share, TextInput, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User as UserIcon, Settings, Calendar, Users, Award, Bell, Share2, CreditCard as Edit3, Building, Mail, Linkedin, MessageCircle, Twitter, Instagram, Globe, Plus, X, Save, Check } from 'lucide-react-native';
import { mockUser, mockEvents } from '@/data/mockData';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import LogoutButton from '@/components/LogoutButton';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseService } from '../../services/database';
import { router } from 'expo-router';
import type { Event, User, Contact } from '@/types';
import { useFocusEffect } from 'expo-router';
import ContactCard from '@/components/ContactCard';

interface SocialMediaAccount {
  id: string;
  platform: string;
  username: string;
  url: string;
  icon: any;
}

export default function ProfileScreen() {
  const { user, session } = useAuth();
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: 'attendee' as 'attendee' | 'organizer',
    company: '',
    position: '',
    bio: '',
    linkedin: '',
    whatsapp: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showAddSocial, setShowAddSocial] = useState(false);
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUsername, setNewSocialUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialAccounts, setSocialAccounts] = useState<SocialMediaAccount[]>([]);
  const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [attendees, setAttendees] = useState<User[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [selectedEventTitle, setSelectedEventTitle] = useState('');
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [mutualConnections, setMutualConnections] = useState<{ [contactId: string]: boolean }>({});
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Redirect to login if logged out
  useEffect(() => {
    console.log('Session changed:', session);
    if (!session) {
      try {
        router.replace('/auth/login');
        router.push('/auth/login');
      } catch (e) {
        console.error('Navigation error after logout:', e);
      }
    }
  }, [session]);

  // Load user profile data
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadSocialAccounts();
      loadContacts();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      const userProfile = await DatabaseService.getUser(user.id);
      if (userProfile) {
        setProfileData({
          name: userProfile.name || user.user_metadata?.name || '',
          email: userProfile.email || user.email || '',
          role: userProfile.role || user.user_metadata?.role || 'attendee',
          company: userProfile.company || '',
          position: userProfile.position || '',
          bio: userProfile.bio || '',
          linkedin: userProfile.linkedin || '',
          whatsapp: userProfile.whatsapp || '',
        });

        // Load social accounts
        // const socialAccountsData = await DatabaseService.getUserSocialAccounts(user.id);
        // setSocialAccounts(socialAccountsData.map(account => ({
        //   id: account.id,
        //   platform: account.platform,
        //   username: account.username,
        //   url: account.url,
        //   icon: getSocialIcon(account.platform),
        // })));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadOrganizerEvents = async () => {
    if (!user?.id) return;
    try {
      const eventsRaw = await DatabaseService.getOrganizerEvents(user.id);
      // Map raw events to Event type expected by UI
      const events: Event[] = eventsRaw.map(e => ({
        ...e,
        organizer: {
          id: user.id,
          name: profileData.name,
          email: profileData.email,
          role: profileData.role,
          company: profileData.company,
          position: profileData.position,
          bio: profileData.bio,
          linkedIn: profileData.linkedin,
          whatsApp: profileData.whatsapp,
        },
        speakers: [],
        agenda: [],
        attendees: [],
        maxAttendees: e.max_attendees,
        isRegistered: false,
        category: e.category as 'conference' | 'workshop' | 'networking' | 'seminar',
        status: e.status as 'upcoming' | 'ongoing' | 'completed',
      }));
      setOrganizedEvents(events);
    } catch (error) {
      setOrganizedEvents([]);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (user && profileData.role === 'organizer') {
        loadOrganizerEvents();
      }
      if (user && profileData.role === 'attendee') {
        // Refetch registered events for attendee
        const fetchRegisteredEvents = async () => {
          const eventsRaw = await DatabaseService.getUserEvents(user.id);
          const events = eventsRaw.map(e => ({
            ...e,
            organizer: {
              id: e.organizer_id,
              name: '',
              email: '',
              role: 'organizer' as 'organizer',
            },
            speakers: [],
            agenda: [],
            attendees: [],
            maxAttendees: e.max_attendees,
            isRegistered: true,
            category: e.category as 'conference' | 'workshop' | 'networking' | 'seminar',
            status: (e.status as 'upcoming' | 'ongoing' | 'completed'),
          }));
          setRegisteredEvents(events);
        };
        fetchRegisteredEvents();
      }
    }, [user, profileData.role])
  );

  const loadSocialAccounts = async () => {
    if (!user?.id) return;
    try {
      const socialAccountsData = await DatabaseService.getUserSocialAccounts(user.id);
      setSocialAccounts(socialAccountsData.map(account => ({
        id: account.id,
        platform: account.platform,
        username: account.username,
        url: account.url,
        icon: getSocialIcon(account.platform),
      })));
    } catch (error) {
      setSocialAccounts([]);
    }
  };

  const loadContacts = async () => {
    if (!user?.id) return;
    try {
      const users = await DatabaseService.getContacts(user.id);
      const contactsList = users.map(u => ({
        ...u,
        metAt: 'EventConnect',
        dateAdded: u.created_at ? u.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
      }));
      setContacts(contactsList);
      // Check mutual connections
      const mutuals: { [contactId: string]: boolean } = {};
      await Promise.all(
        contactsList.map(async (c) => {
          mutuals[c.id] = await DatabaseService.isMutualConnection(user.id, c.id);
        })
      );
      setMutualConnections(mutuals);
    } catch (error) {
      setContacts([]);
      setMutualConnections({});
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return Linkedin;
      case 'whatsapp': return MessageCircle;
      case 'twitter': return Twitter;
      case 'instagram': return Instagram;
      case 'website': return Globe;
      default: return Globe;
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const success = await DatabaseService.updateUser(user.id, {
        name: profileData.name,
        company: profileData.company,
        position: profileData.position,
        bio: profileData.bio,
        linkedin: profileData.linkedin,
        whatsapp: profileData.whatsapp,
      });

      if (success) {
        Alert.alert('Success', 'Profile updated successfully!');
        setIsEditing(false);
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reload original data
    loadUserProfile();
  };

  const handleSettings = () => {
    Alert.alert(
      'Settings',
      'This would open the settings screen with options for:\n\n• Account settings\n• Privacy settings\n• Notification preferences\n• App preferences',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => console.log('Navigate to settings') }
      ]
    );
  };

  const handleNotifications = () => {
    Alert.alert(
      'Notifications',
      'This would open notification preferences with options for:\n\n• Event reminders\n• New event notifications\n• Networking suggestions\n• Email notifications',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Configure', onPress: () => console.log('Navigate to notifications') }
      ]
    );
  };

  const handleShareProfile = async () => {
    try {
      const profileUrl = `https://eventconnect.app/profile/${user?.id}`;
      await Share.share({
        message: `Check out ${profileData.name}'s profile on EventConnect: ${profileUrl}`,
        url: profileUrl,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share profile');
    }
  };

  // Handler for opening contact modal
  const handleContactCardPress = useCallback((contact: Contact) => {
    router.push(`/user/${contact.id}`); // Expo Router will resolve this to /(tabs)/user/[id]
  }, []);

  // Handler for email/linkedin/whatsapp actions
  const handleContactPress = async (type: 'email' | 'linkedin' | 'whatsapp') => {
    try {
      switch (type) {
        case 'email':
          await Linking.openURL(`mailto:${profileData.email}`);
          break;
        case 'linkedin':
          if (profileData.linkedin) {
            await Linking.openURL(profileData.linkedin);
          } else {
            Alert.alert('LinkedIn', 'LinkedIn profile not available');
          }
          break;
        case 'whatsapp':
          if (profileData.whatsapp) {
            await Linking.openURL(`whatsapp://send?phone=${profileData.whatsapp.replace('+', '')}`);
          } else {
            Alert.alert('WhatsApp', 'WhatsApp number not available');
          }
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open application');
    }
  };

  const handleSocialPress = async (account: SocialMediaAccount) => {
    try {
      if (account.url) {
        await Linking.openURL(account.url);
      } else {
        Alert.alert('Error', 'Invalid URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open application');
    }
  };

  const addSocialAccount = async () => {
    if (!newSocialPlatform || !newSocialUsername || !user?.id) {
      Alert.alert('Error', 'Please fill in both platform and username');
      return;
    }

    try {
      const url = `https://${newSocialPlatform.toLowerCase()}.com/${newSocialUsername}`;
      const accountId = await DatabaseService.addSocialAccount({
        user_id: user.id,
        platform: newSocialPlatform,
        username: newSocialUsername,
        url,
      });
      if (accountId) {
        await loadSocialAccounts();
        setNewSocialPlatform('');
        setNewSocialUsername('');
        setShowAddSocial(false);
        Alert.alert('Success', 'Social media account added successfully!');
      }
    } catch (error) {
      console.error('Error adding social account:', error);
      Alert.alert('Error', 'Failed to add social media account');
    }
  };

  const removeSocialAccount = async (id: string) => {
    try {
      const success = await DatabaseService.removeSocialAccount(id);
      if (success) {
        await loadSocialAccounts();
        Alert.alert('Success', 'Social media account removed successfully!');
      }
    } catch (error) {
      console.error('Error removing social account:', error);
      Alert.alert('Error', 'Failed to remove social media account');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'organizer':
        return Colors.primary;
      case 'speaker':
        return Colors.secondary;
      case 'attendee':
        return Colors.accent;
      default:
        return Colors.primary;
    }
  };

  const availablePlatforms = [
    { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { name: 'Instagram', icon: Instagram, color: '#E4405F' },
    { name: 'LinkedIn', icon: Linkedin, color: '#0077B5' },
    { name: 'WhatsApp', icon: MessageCircle, color: '#25D366' },
    { name: 'Website', icon: Globe, color: '#2563EB' },
  ];

  const userEvents = mockEvents.filter(event => 
    event.organizer.id === user?.id || event.attendees.some(attendee => attendee.id === user?.id)
  );

  const handleDeleteEvent = async (eventId: string) => {
    Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const success = await DatabaseService.deleteEvent(eventId);
        if (success) {
          setOrganizedEvents(prev => prev.filter(e => e.id !== eventId));
          Alert.alert('Success', 'Event deleted successfully');
        } else {
          Alert.alert('Error', 'Failed to delete event');
        }
      }}
    ]);
  };

  const handleViewAttendees = async (eventId: string, eventTitle: string) => {
    setAttendeesLoading(true);
    setShowAttendeesModal(true);
    setSelectedEventTitle(eventTitle);
    try {
      const data = await DatabaseService.getEventAttendees(eventId);
      setAttendees(data);
    } catch (e) {
      setAttendees([]);
    } finally {
      setAttendeesLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
          <Settings size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{getInitials(profileData.name)}</Text>
            </View>
            {isEditing ? (
              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={[styles.editButton, styles.saveButton]} 
                  onPress={handleSaveProfile}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Text style={styles.saveButtonText}>Saving...</Text>
                  ) : (
                    <Check size={16} color={Colors.white} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.editButton, styles.cancelEditButton]} 
                  onPress={handleCancelEdit}
                >
                  <X size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Edit3 size={16} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.profileInfo}>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={profileData.name}
                onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                placeholder="Full Name"
                placeholderTextColor={Colors.textLight}
              />
            ) : (
              <Text style={styles.userName}>{profileData.name}</Text>
            )}
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(profileData.role) }]}>
              <Text style={styles.roleText}>{profileData.role}</Text>
            </View>
          </View>

          {isEditing ? (
            <TextInput
              style={[styles.editInput, styles.bioInput]}
              value={profileData.bio}
              onChangeText={(text) => setProfileData(prev => ({ ...prev, bio: text }))}
              placeholder="Add a bio..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
            />
          ) : (
            profileData.bio && (
              <Text style={styles.userBio}>{profileData.bio}</Text>
            )
          )}

          <View style={styles.userDetails}>
            <View style={styles.detailRow}>
              <Mail size={16} color={Colors.textSecondary} />
              <TouchableOpacity onPress={() => handleContactPress('email')}>
                <Text style={styles.detailText}>{profileData.email}</Text>
              </TouchableOpacity>
            </View>
            
            {isEditing ? (
              <>
                <View style={styles.detailRow}>
                  <Building size={16} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.editDetailInput}
                    value={profileData.company}
                    onChangeText={(text) => setProfileData(prev => ({ ...prev, company: text }))}
                    placeholder="Company"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
                <View style={styles.detailRow}>
                  <UserIcon size={16} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.editDetailInput}
                    value={profileData.position}
                    onChangeText={(text) => setProfileData(prev => ({ ...prev, position: text }))}
                    placeholder="Position"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </>
            ) : (
              profileData.company && (
                <View style={styles.detailRow}>
                  <Building size={16} color={Colors.textSecondary} />
                  <Text style={styles.detailText}>
                    {profileData.position ? `${profileData.position} at ` : ''}
                    {profileData.company}
                  </Text>
                </View>
              )
            )}
          </View>

          {/* Social Media Section */}
          <View style={styles.socialSection}>
            <View style={styles.socialHeader}>
              <Text style={styles.socialTitle}>Social Media</Text>
              <TouchableOpacity 
                style={styles.addSocialButton}
                onPress={() => setShowAddSocial(true)}
              >
                <Plus size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.socialAccounts}>
              {socialAccounts.map((account: SocialMediaAccount) => (
                <View key={account.id} style={styles.socialAccount}>
                  <TouchableOpacity 
                    style={styles.socialButton} 
                    onPress={() => handleSocialPress(account)}
                  >
                    <account.icon size={20} color={Colors.primary} />
                    <Text style={styles.socialUsername}>{account.username}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.removeSocialButton}
                    onPress={() => removeSocialAccount(account.id)}
                  >
                    <X size={16} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
          {/* Contacts Section */}
          <View style={styles.contactsSection}>
            <Text style={styles.sectionTitle}>Contacts ({contacts.length})</Text>
            {contacts.length === 0 ? (
              <Text style={styles.emptyStateText}>No contacts yet. Start networking by scanning QR codes!</Text>
            ) : (
              contacts.map(contact => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onPress={() => handleContactCardPress(contact)}
                  isMutual={!!mutualConnections[contact.id]}
                />
              ))
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {profileData.role === 'attendee' && (
            <View style={styles.statCard}>
              <Award size={24} color={Colors.accent} />
              <Text style={styles.statNumber}>{registeredEvents.length}</Text>
              <Text style={styles.statLabel}>Events Registered</Text>
            </View>
          )}
          {profileData.role === 'organizer' && (
            <>
              <View style={styles.statCard}>
                <Calendar size={24} color={Colors.primary} />
                <Text style={styles.statNumber}>{userEvents.length}</Text>
                <Text style={styles.statLabel}>Total Events</Text>
              </View>
              <View style={styles.statCard}>
                <UserIcon size={24} color={Colors.secondary} />
                <Text style={styles.statNumber}>{organizedEvents.length}</Text>
                <Text style={styles.statLabel}>Organized</Text>
              </View>
            </>
          )}
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={handleNotifications}>
            <View style={styles.menuItemLeft}>
              <Bell size={20} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleShareProfile}>
            <View style={styles.menuItemLeft}>
              <Share2 size={20} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Share Profile</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
            <View style={styles.menuItemLeft}>
              <Settings size={20} color={Colors.textSecondary} />
              <Text style={styles.menuItemText}>Settings</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <LogoutButton 
                size={20} 
                color={Colors.error} 
                showText={true}
                
                textStyle={{ color: Colors.error }}
              />
            </View>
          </View>
        </View>

        {profileData.role === 'organizer' && (
          <View style={styles.organizedEventsSection}>
            <Text style={styles.sectionTitle}>Organized Events ({organizedEvents.length})</Text>
            <TouchableOpacity
              style={[styles.addButton, { marginBottom: 16 }]}
              onPress={() => router.push('/organizer/create-event')}
            >
              <Text style={styles.addButtonText}>+ Create Event</Text>
            </TouchableOpacity>
            {organizedEvents.length === 0 ? (
              <Text style={styles.emptyStateText}>No events organized yet.</Text>
            ) : (
              organizedEvents.map(event => (
                <View key={event.id} style={styles.organizedEventCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDate}>{event.date} at {event.time}</Text>
                    <Text style={styles.eventVenue}>{event.venue}</Text>
                  </View>
                  <TouchableOpacity style={styles.editButton} onPress={() => router.push(`/organizer/edit-event?id=${encodeURIComponent(event.id)}` as any)}>
                    <Edit3 size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={async () => {
                    await handleDeleteEvent(event.id);
                    loadOrganizerEvents();
                  }}>
                    <X size={18} color={Colors.error} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.attendeesButton} onPress={() => handleViewAttendees(event.id, event.title)}>
                    <UserIcon size={18} color={Colors.secondary} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Social Media Modal */}
      <Modal
        visible={showAddSocial}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddSocial(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Social Media</Text>
              <TouchableOpacity onPress={() => setShowAddSocial(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Platform</Text>
                <View style={styles.platformContainer}>
                  {availablePlatforms.map(platform => (
                    <TouchableOpacity
                      key={platform.name}
                      style={[
                        styles.platformChip,
                        newSocialPlatform === platform.name && styles.platformChipActive
                      ]}
                      onPress={() => setNewSocialPlatform(platform.name)}
                    >
                      <platform.icon size={16} color={newSocialPlatform === platform.name ? Colors.white : platform.color} />
                      <Text style={[
                        styles.platformText,
                        newSocialPlatform === platform.name && styles.platformTextActive
                      ]}>
                        {platform.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter username"
                  value={newSocialUsername}
                  onChangeText={setNewSocialUsername}
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddSocial(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={addSocialAccount}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Attendees Modal */}
      <Modal
        visible={showAttendeesModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttendeesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registered Attendees for {selectedEventTitle}</Text>
              <TouchableOpacity onPress={() => setShowAttendeesModal(false)}>
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              {attendeesLoading ? (
                <ActivityIndicator size="large" color={Colors.primary} />
              ) : attendees.length === 0 ? (
                <Text style={styles.emptyStateText}>No attendees registered yet.</Text>
              ) : (
                <ScrollView style={{ maxHeight: 300 }}>
                  {attendees.map((a) => (
                    <View key={a.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight }}>
                      <Text style={{ fontWeight: '600', color: Colors.text }}>{a.name}</Text>
                      <Text style={{ color: Colors.textSecondary }}>{a.email}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  settingsButton: {
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
  contentContainer: {
    paddingBottom: Spacing.xl,
  },
  profileCard: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.h2,
    color: Colors.white,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelEditButton: {
    backgroundColor: Colors.error,
  },
  saveButtonText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  profileInfo: {
    marginBottom: Spacing.md,
  },
  userName: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  editInput: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  bioInput: {
    ...Typography.body,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  roleText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  userBio: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  userDetails: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
  },
  editDetailInput: {
    ...Typography.body,
    color: Colors.text,
    flex: 1,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  socialSection: {
    marginTop: Spacing.md,
  },
  socialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  socialTitle: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: '600',
  },
  addSocialButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialAccounts: {
    gap: Spacing.sm,
  },
  socialAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  socialUsername: {
    ...Typography.bodySmall,
    color: Colors.text,
  },
  removeSocialButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    ...Typography.h2,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  statLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  menuSection: {
    backgroundColor: Colors.white,
    margin: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuItemText: {
    ...Typography.body,
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: '600',
  },
  modalBody: {
    padding: Spacing.lg,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  platformContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  platformChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  platformText: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '500',
  },
  platformTextActive: {
    color: Colors.white,
  },
  textInput: {
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  addButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  addButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  organizedEventsSection: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  organizedEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  eventTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  eventDate: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  eventVenue: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
  },
  attendeesButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  contactsSection: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
});