import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type User = Database['public']['Tables']['users']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type EventAttendee = Database['public']['Tables']['event_attendees']['Row'];
type Speaker = Database['public']['Tables']['speakers']['Row'];
type AgendaItem = Database['public']['Tables']['agenda_items']['Row'];
type SocialAccount = Database['public']['Tables']['social_accounts']['Row'];

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
        users!events_organizer_id_fkey(name, company)
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
        users!events_organizer_id_fkey(name, company)
      `)
      .eq('id', eventId)
      .single();

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

    return data?.map(item => item.users) || [];
  }

  static async getUserEvents(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('event_attendees')
      .select(`
        events!event_attendees_event_id_fkey(
          *,
          users!events_organizer_id_fkey(name, company)
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user events:', error);
      return [];
    }

    return data?.map(item => item.events) || [];
  }

  // Speaker operations
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

  static async addSpeaker(speakerData: Omit<Speaker, 'id' | 'created_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('speakers')
      .insert([speakerData])
      .select('id')
      .single();

    if (error) {
      console.error('Error adding speaker:', error);
      return null;
    }

    return data.id;
  }

  // Agenda operations
  static async getEventAgenda(eventId: string): Promise<AgendaItem[]> {
    const { data, error } = await supabase
      .from('agenda_items')
      .select(`
        *,
        speakers(name)
      `)
      .eq('event_id', eventId)
      .order('start_time');

    if (error) {
      console.error('Error fetching agenda:', error);
      return [];
    }

    return data || [];
  }

  static async addAgendaItem(agendaData: Omit<AgendaItem, 'id' | 'created_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('agenda_items')
      .insert([agendaData])
      .select('id')
      .single();

    if (error) {
      console.error('Error adding agenda item:', error);
      return null;
    }

    return data.id;
  }

  // Social accounts operations
  static async getUserSocialAccounts(userId: string): Promise<SocialAccount[]> {
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', userId)
      .order('platform');

    if (error) {
      console.error('Error fetching social accounts:', error);
      return [];
    }

    return data || [];
  }

  static async addSocialAccount(socialData: Omit<SocialAccount, 'id' | 'created_at'>): Promise<string | null> {
    const { data, error } = await supabase
      .from('social_accounts')
      .insert([socialData])
      .select('id')
      .single();

    if (error) {
      console.error('Error adding social account:', error);
      return null;
    }

    return data.id;
  }

  static async removeSocialAccount(accountId: string): Promise<boolean> {
    const { error } = await supabase
      .from('social_accounts')
      .delete()
      .eq('id', accountId);

    if (error) {
      console.error('Error removing social account:', error);
      return false;
    }

    return true;
  }

  // Real-time subscriptions
  static subscribeToEvents(callback: (payload: any) => void) {
    return supabase
      .channel('events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, callback)
      .subscribe();
  }

  static subscribeToEventAttendees(eventId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`event_attendees_${eventId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'event_attendees', filter: `event_id=eq.${eventId}` }, 
        callback
      )
      .subscribe();
  }
} 