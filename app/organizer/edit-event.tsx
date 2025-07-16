import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { DatabaseService } from '../../services/database';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Colors';
import { ArrowLeft, Plus, X, Calendar, Clock, MapPin, Users, DollarSign, FileText, User as UserIcon } from 'lucide-react-native';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams();
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
  const [isLoading, setIsLoading] = useState(true);
  const [speakers, setSpeakers] = useState<Array<any>>([]);
  const [agenda, setAgenda] = useState<Array<any>>([]);
  const [isAgendaLoading, setIsAgendaLoading] = useState(false);
  const [isSpeakersLoading, setIsSpeakersLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchSpeakers();
      fetchAgenda();
    }
  }, [id]);

  const fetchEvent = async () => {
    setIsLoading(true);
    const event = await DatabaseService.getEvent(id as string);
    console.log('Fetched event:', event);
    if (!event) {
      Alert.alert('Error', 'Event not found');
      router.back();
      return;
    }
    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: event.date || '',
      time: event.time || '',
      venue: event.venue || '',
      maxAttendees: event.max_attendees ? String(event.max_attendees) : '',
      category: event.category || '',
      price: event.price ? String(event.price) : '',
    });
    setIsLoading(false);
  };

  const fetchSpeakers = async () => {
    setIsSpeakersLoading(true);
    const data = await DatabaseService.getEventSpeakers(id as string);
    setSpeakers(data || []);
    setIsSpeakersLoading(false);
  };

  const fetchAgenda = async () => {
    setIsAgendaLoading(true);
    const data = await DatabaseService.getEventAgenda(id as string);
    setAgenda(data || []);
    setIsAgendaLoading(false);
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    const success = await DatabaseService.updateEvent(id as string, {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      max_attendees: formData.maxAttendees ? Number(formData.maxAttendees) : undefined,
      category: formData.category,
      price: formData.price ? Number(formData.price) : undefined,
    });
    setIsLoading(false);
    if (success) {
      Alert.alert('Success', 'Event updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Error', 'Failed to update event');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Event</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <Text style={styles.label}>Event Title</Text>
        <View style={styles.inputWithIcon}>
          <FileText size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Event title"
            value={formData.title}
            onChangeText={v => updateFormData('title', v)}
          />
        </View>
        <Text style={styles.label}>Event Description</Text>
        <View style={styles.inputWithIcon}>
          <FileText size={20} color={Colors.textSecondary} />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Event description"
            value={formData.description}
            onChangeText={v => updateFormData('description', v)}
            multiline
          />
        </View>
        <Text style={styles.label}>Date</Text>
        <View style={styles.inputWithIcon}>
          <Calendar size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            value={formData.date}
            onChangeText={v => updateFormData('date', v)}
          />
        </View>
        <Text style={styles.label}>Time</Text>
        <View style={styles.inputWithIcon}>
          <Clock size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Time (HH:MM)"
            value={formData.time}
            onChangeText={v => updateFormData('time', v)}
          />
        </View>
        <Text style={styles.label}>Venue</Text>
        <View style={styles.inputWithIcon}>
          <MapPin size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Venue"
            value={formData.venue}
            onChangeText={v => updateFormData('venue', v)}
          />
        </View>
        <Text style={styles.label}>Max Attendees</Text>
        <View style={styles.inputWithIcon}>
          <Users size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Max attendees"
            value={formData.maxAttendees}
            onChangeText={v => updateFormData('maxAttendees', v)}
            keyboardType="numeric"
          />
        </View>
        <Text style={styles.label}>Category</Text>
        <View style={styles.inputWithIcon}>
          <FileText size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={formData.category}
            onChangeText={v => updateFormData('category', v)}
          />
        </View>
        <Text style={styles.label}>Price</Text>
        <View style={styles.inputWithIcon}>
          <DollarSign size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Price ($)"
            value={formData.price}
            onChangeText={v => updateFormData('price', v)}
            keyboardType="numeric"
          />
        </View>
        {/* Speakers Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Speakers</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setSpeakers([...speakers, { name: '', company: '', position: '' }])}>
            <Plus size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {isSpeakersLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          speakers.map((speaker, idx) => (
            <View key={speaker.id || idx} style={styles.speakerCard}>
              <View style={styles.speakerHeader}>
                <Text style={styles.speakerTitle}>Speaker {idx + 1}</Text>
                <TouchableOpacity onPress={() => setSpeakers(speakers.filter((_, i) => i !== idx))}>
                  <X size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
              <View style={styles.inputWithIcon}>
                <UserIcon size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  value={speaker.name}
                  onChangeText={v => {
                    const updated = [...speakers];
                    updated[idx] = { ...updated[idx], name: v };
                    setSpeakers(updated);
                  }}
                />
              </View>
              <View style={styles.inputWithIcon}>
                <FileText size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Company"
                  value={speaker.company}
                  onChangeText={v => {
                    const updated = [...speakers];
                    updated[idx] = { ...updated[idx], company: v };
                    setSpeakers(updated);
                  }}
                />
              </View>
              <View style={styles.inputWithIcon}>
                <FileText size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.input}
                  placeholder="Position"
                  value={speaker.position}
                  onChangeText={v => {
                    const updated = [...speakers];
                    updated[idx] = { ...updated[idx], position: v };
                    setSpeakers(updated);
                  }}
                />
              </View>
            </View>
          ))
        )}
        {/* Agenda Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Agenda</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setAgenda([...agenda, { title: '', description: '', start_time: '', end_time: '' }])}>
            <Plus size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {isAgendaLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          agenda.map((item, idx) => (
            <View key={item.id || idx} style={styles.agendaCard}>
              <View style={styles.agendaHeader}>
                <Text style={styles.agendaTitle}>Session {idx + 1}</Text>
                <TouchableOpacity onPress={() => setAgenda(agenda.filter((_, i) => i !== idx))}>
                  <X size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={item.title}
                onChangeText={v => {
                  const updated = [...agenda];
                  updated[idx] = { ...updated[idx], title: v };
                  setAgenda(updated);
                }}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={item.description}
                onChangeText={v => {
                  const updated = [...agenda];
                  updated[idx] = { ...updated[idx], description: v };
                  setAgenda(updated);
                }}
              />
              <TextInput
                style={styles.input}
                placeholder="Start Time (HH:MM)"
                value={item.start_time || item.startTime || ''}
                onChangeText={v => {
                  const updated = [...agenda];
                  updated[idx] = { ...updated[idx], start_time: v };
                  setAgenda(updated);
                }}
              />
              <TextInput
                style={styles.input}
                placeholder="End Time (HH:MM)"
                value={item.end_time || item.endTime || ''}
                onChangeText={v => {
                  const updated = [...agenda];
                  updated[idx] = { ...updated[idx], end_time: v };
                  setAgenda(updated);
                }}
              />
            </View>
          ))
        )}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} onPress={handleSave} disabled={isLoading}>
            <Text style={styles.saveButtonText}>{isLoading ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    marginRight: 12,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    flex: 1,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  input: {
    ...Typography.body,
    color: Colors.text,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    ...Typography.body,
    color: Colors.text,
    marginBottom: Spacing.xs,
    fontWeight: '500',
    marginTop: Spacing.sm,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
}); 