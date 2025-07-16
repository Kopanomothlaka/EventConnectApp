import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Calendar, Clock, MapPin, Users, DollarSign, FileText, User, Plus, X } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import LogoutButton from '@/components/LogoutButton';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateEventScreen() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    maxAttendees: '',
    category: '',
    price: '',
  });
  const [speakers, setSpeakers] = useState<Array<{name: string, company: string, position: string}>>([]);
  const [agenda, setAgenda] = useState<Array<{title: string, startTime: string, endTime: string, description: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSpeaker = () => {
    setSpeakers(prev => [...prev, { name: '', company: '', position: '' }]);
  };

  const updateSpeaker = (index: number, field: string, value: string) => {
    setSpeakers(prev => prev.map((speaker, i) => 
      i === index ? { ...speaker, [field]: value } : speaker
    ));
  };

  const removeSpeaker = (index: number) => {
    setSpeakers(prev => prev.filter((_, i) => i !== index));
  };

  const addAgendaItem = () => {
    setAgenda(prev => [...prev, { title: '', startTime: '', endTime: '', description: '' }]);
  };

  const updateAgendaItem = (index: number, field: string, value: string) => {
    setAgenda(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const removeAgendaItem = (index: number) => {
    setAgenda(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateEvent = async () => {
    if (!formData.title || !formData.description || !formData.date || !formData.time || !formData.venue) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'You must be logged in as an organizer to create an event.');
      return;
    }
    setIsLoading(true);
    try {
      // Insert event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            date: formData.date,
            time: formData.time,
            venue: formData.venue,
            max_attendees: formData.maxAttendees ? Number(formData.maxAttendees) : null,
            category: formData.category,
            price: formData.price ? Number(formData.price) : null,
            organizer_id: user.id,
            status: 'upcoming',
          },
        ])
        .select()
        .single();
      if (eventError || !event) {
        setIsLoading(false);
        Alert.alert('Error', eventError?.message || 'Failed to create event');
        return;
      }
      // Insert speakers
      for (const speaker of speakers) {
        if (speaker.name) {
          await supabase.from('speakers').insert([
            {
              event_id: event.id,
              name: speaker.name,
              company: speaker.company,
              position: speaker.position,
            },
          ]);
        }
      }
      // Insert agenda items
      for (const item of agenda) {
        if (item.title && item.startTime && item.endTime) {
          await supabase.from('agenda_items').insert([
            {
              event_id: event.id,
              title: item.title,
              description: item.description,
              start_time: item.startTime,
              end_time: item.endTime,
              type: 'session',
            },
          ]);
        }
      }
      setIsLoading(false);
      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      setIsLoading(false);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const categories = [
    'conference', 'workshop', 'networking', 'seminar', 'meetup', 'hackathon'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Event</Text>
          <LogoutButton 
            size={20} 
            color={Colors.textSecondary}
            style={styles.headerLogoutButton}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Event title"
                value={formData.title}
                onChangeText={(value) => updateFormData('title', value)}
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Event description"
                value={formData.description}
                onChangeText={(value) => updateFormData('description', value)}
                multiline
                numberOfLines={4}
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <View style={styles.inputWithIcon}>
                  <Calendar size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Date (YYYY-MM-DD)"
                    value={formData.date}
                    onChangeText={(value) => updateFormData('date', value)}
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>
              
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <View style={styles.inputWithIcon}>
                  <Clock size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Time (HH:MM)"
                    value={formData.time}
                    onChangeText={(value) => updateFormData('time', value)}
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Venue"
                  value={formData.venue}
                  onChangeText={(value) => updateFormData('venue', value)}
                  placeholderTextColor={Colors.textLight}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <View style={styles.inputWithIcon}>
                  <Users size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Max attendees"
                    value={formData.maxAttendees}
                    onChangeText={(value) => updateFormData('maxAttendees', value)}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>
              
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <View style={styles.inputWithIcon}>
                  <DollarSign size={20} color={Colors.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Price ($)"
                    value={formData.price}
                    onChangeText={(value) => updateFormData('price', value)}
                    keyboardType="numeric"
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryChip,
                      formData.category === category && styles.categoryChipActive
                    ]}
                    onPress={() => updateFormData('category', category)}
                  >
                    <Text style={[
                      styles.categoryText,
                      formData.category === category && styles.categoryTextActive
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Speakers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Speakers</Text>
              <TouchableOpacity style={styles.addButton} onPress={addSpeaker}>
                <Plus size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {speakers.map((speaker, index) => (
              <View key={index} style={styles.speakerCard}>
                <View style={styles.speakerHeader}>
                  <Text style={styles.speakerTitle}>Speaker {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeSpeaker(index)}>
                    <X size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                  <View style={styles.inputWithIcon}>
                    <User size={20} color={Colors.textSecondary} />
                    <TextInput
                      style={styles.input}
                      placeholder="Speaker name"
                      value={speaker.name}
                      onChangeText={(value) => updateSpeaker(index, 'name', value)}
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Company"
                      value={speaker.company}
                      onChangeText={(value) => updateSpeaker(index, 'company', value)}
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>
                  
                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <TextInput
                      style={styles.input}
                      placeholder="Position"
                      value={speaker.position}
                      onChangeText={(value) => updateSpeaker(index, 'position', value)}
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Agenda */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Agenda</Text>
              <TouchableOpacity style={styles.addButton} onPress={addAgendaItem}>
                <Plus size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {agenda.map((item, index) => (
              <View key={index} style={styles.agendaCard}>
                <View style={styles.agendaHeader}>
                  <Text style={styles.agendaTitle}>Session {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeAgendaItem(index)}>
                    <X size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Session title"
                    value={item.title}
                    onChangeText={(value) => updateAgendaItem(index, 'title', value)}
                    placeholderTextColor={Colors.textLight}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <View style={styles.inputWithIcon}>
                      <Clock size={20} color={Colors.textSecondary} />
                      <TextInput
                        style={styles.input}
                        placeholder="Start time"
                        value={item.startTime}
                        onChangeText={(value) => updateAgendaItem(index, 'startTime', value)}
                        placeholderTextColor={Colors.textLight}
                      />
                    </View>
                  </View>
                  
                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <View style={styles.inputWithIcon}>
                      <Clock size={20} color={Colors.textSecondary} />
                      <TextInput
                        style={styles.input}
                        placeholder="End time"
                        value={item.endTime}
                        onChangeText={(value) => updateAgendaItem(index, 'endTime', value)}
                        placeholderTextColor={Colors.textLight}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Session description"
                    value={item.description}
                    onChangeText={(value) => updateAgendaItem(index, 'description', value)}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={Colors.textLight}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            onPress={handleCreateEvent}
            disabled={isLoading}
          >
            <Text style={styles.createButtonText}>
              {isLoading ? 'Creating Event...' : 'Create Event'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  keyboardView: {
    flex: 1,
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
  section: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: '600',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  input: {
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  categoryTextActive: {
    color: Colors.white,
  },
  speakerCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  speakerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  speakerTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  agendaCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  agendaTitle: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  createButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
}); 