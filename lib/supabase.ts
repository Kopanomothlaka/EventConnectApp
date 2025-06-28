import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = 'https://ripkrvajsddrbixvhzwf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpcGtydmFqc2RkcmJpeHZoendmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNzE2MDQsImV4cCI6MjA2NjY0NzYwNH0.Iq2_Gs4D8k7uoqXWAHfED6UAbyzCF8FGZjTNYkSi0rE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'attendee' | 'organizer';
          company?: string;
          position?: string;
          bio?: string;
          linkedin?: string;
          whatsapp?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role: 'attendee' | 'organizer';
          company?: string;
          position?: string;
          bio?: string;
          linkedin?: string;
          whatsapp?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'attendee' | 'organizer';
          company?: string;
          position?: string;
          bio?: string;
          linkedin?: string;
          whatsapp?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          date: string;
          time: string;
          venue: string;
          organizer_id: string;
          max_attendees?: number;
          category: string;
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
          price?: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          date: string;
          time: string;
          venue: string;
          organizer_id: string;
          max_attendees?: number;
          category: string;
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
          price?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          date?: string;
          time?: string;
          venue?: string;
          organizer_id?: string;
          max_attendees?: number;
          category?: string;
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
          price?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_attendees: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      speakers: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          bio?: string;
          company?: string;
          position?: string;
          linkedin?: string;
          twitter?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          name: string;
          bio?: string;
          company?: string;
          position?: string;
          linkedin?: string;
          twitter?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          name?: string;
          bio?: string;
          company?: string;
          position?: string;
          linkedin?: string;
          twitter?: string;
          created_at?: string;
        };
      };
      agenda_items: {
        Row: {
          id: string;
          event_id: string;
          title: string;
          description?: string;
          start_time: string;
          end_time: string;
          speaker_id?: string;
          location?: string;
          type: 'session' | 'break' | 'networking';
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          title: string;
          description?: string;
          start_time: string;
          end_time: string;
          speaker_id?: string;
          location?: string;
          type?: 'session' | 'break' | 'networking';
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          title?: string;
          description?: string;
          start_time?: string;
          end_time?: string;
          speaker_id?: string;
          location?: string;
          type?: 'session' | 'break' | 'networking';
          created_at?: string;
        };
      };
      social_accounts: {
        Row: {
          id: string;
          user_id: string;
          platform: string;
          username: string;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          username: string;
          url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          platform?: string;
          username?: string;
          url?: string;
          created_at?: string;
        };
      };
    };
  };
} 