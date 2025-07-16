import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type User = Database['public']['Tables']['users']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type EventAttendee = Database['public']['Tables']['event_attendees']['Row'];
type Speaker = Database['public']['Tables']['speakers']['Row'];
type AgendaItem = Database['public']['Tables']['agenda_items']['Row'];
type SocialAccount = Database['public']['Tables']['social_accounts']['Row'];

// Utility to recursively flatten arrays
function flattenArray(arr: any[]): any[] {
  return arr.reduce((flat, toFlatten) =>
    flat.concat(Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten), []);
}

export class DatabaseService {
  // User operations
  static async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user:', error);
      return false;
    }

    return true;
  }

  // Event operations
  static async getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        users!events_organizer_id_fkey(*)
      `)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }

    return data || [];
  }

  static async getEvent(eventId: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        users!events_organizer_id_fkey(*)
      `)
      .eq('id', eventId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }

    return data;
  }

  static async createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('events')
      .insert([eventData])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return null;
    }

    return data.id;
  }

  static async updateEvent(eventId: string, updates: Partial<Event>): Promise<boolean> {
    const { error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId);

    if (error) {
      console.error('Error updating event:', error);
      return false;
    }

    return true;
  }

  static async deleteEvent(eventId: string): Promise<boolean> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }

    return true;
  }

  static async getOrganizerEvents(organizerId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching organizer events:', error);
      return [];
    }

    return data || [];
  }

  // Event attendance operations
  static async registerForEvent(eventId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('event_attendees')
      .insert([{ event_id: eventId, user_id: userId }]);

    if (error) {
      console.error('Error registering for event:', error);
      return false;
    }

    return true;
  }

  static async unregisterFromEvent(eventId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('event_attendees')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error unregistering from event:', error);
      return false;
    }

    return true;
  }

  static async isRegisteredForEvent(eventId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('event_attendees')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return false;
    }

    return !!data;
  }

  static async getEventAttendees(eventId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('event_attendees')
      .select(`
        users!event_attendees_user_id_fkey(*)
      `)
      .eq('event_id', eventId);

    if (error) {
      console.error('Error fetching event attendees:', error);
      return [];
    }

    const flatData = Array.isArray(data) ? flattenArray(data) : [];
    return flatData
      .filter(item => item && typeof item === 'object' && !Array.isArray(item) && item.users && typeof item.users === 'object')
      .map(item => item.users)
      .filter(u => u && u.id && u.email && u.name && u.role);
  }

  static async getUserEvents(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('event_attendees')
      .select(`
        events!event_attendees_event_id_fkey(*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user events:', error);
      return [];
    }

    const flatData = Array.isArray(data) ? flattenArray(data) : [];
    return flatData
      .filter(item => item && typeof item === 'object' && !Array.isArray(item) && item.events && typeof item.events === 'object')
      .map(item => item.events)
      .filter(e => e && e.id && e.title && e.date && e.time && e.venue && e.organizer_id && e.category && e.status && e.created_at && e.updated_at);
  }

  static async getEventSpeakers(eventId: string): Promise<Speaker[]> {
    const { data, error } = await supabase
      .from('speakers')
      .select('*')
      .eq('event_id', eventId)
      .order('name');

    if (error) {
      console.error('Error fetching speakers:', error);
      return [];
    }

    return data || [];
  }

  static async getEventAgenda(eventId: string): Promise<AgendaItem[]> {
    const { data, error } = await supabase
      .from('agenda_items')
      .select('*')
      .eq('event_id', eventId)
      .order('start_time');

    if (error) {
      console.error('Error fetching agenda:', error);
      return [];
    }

    return data || [];
  }

  // Contact operations
  static async addContactConnection(userId: string, contactId: string): Promise<boolean> {
    const { error } = await supabase
      .from('contacts')
      .insert([{ user_id: userId, contact_id: contactId }]);
    if (error && error.code !== '23505') { // 23505 = unique violation
      console.error('Error adding contact connection:', error);
      return false;
    }
    return true;
  }

  static async getContacts(userId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('contact_id, users:contact_id(*)')
      .eq('user_id', userId);
    if (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
    return (data || []).map((row: any) => row.users);
  }
}