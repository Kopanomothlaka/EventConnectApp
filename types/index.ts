export interface User {
  id: string;
  name: string;
  email: string;
  role: 'organizer' | 'attendee' | 'speaker';
  profileImage?: string;
  bio?: string;
  linkedIn?: string;
  whatsApp?: string;
  company?: string;
  position?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  organizer: User;
  speakers: Speaker[];
  agenda: AgendaItem[];
  attendees: User[];
  maxAttendees?: number;
  isRegistered?: boolean;
  category: 'conference' | 'workshop' | 'networking' | 'seminar';
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface Speaker {
  id: string;
  name: string;
  bio: string;
  profileImage?: string;
  company: string;
  position: string;
  linkedIn?: string;
  twitter?: string;
  sessions: string[];
}

export interface AgendaItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  speaker?: Speaker;
  location?: string;
  type: 'session' | 'break' | 'networking';
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  linkedIn?: string;
  whatsApp?: string;
  metAt: string; // Event name
  dateAdded: string;
  notes?: string;
}

export interface EventAnalytics {
  eventId: string;
  totalAttendees: number;
  actualAttendees: number;
  attendanceRate: number;
  feedback: Feedback[];
  checkIns: CheckIn[];
}

export interface Feedback {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  eventId: string;
  createdAt: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  eventId: string;
  timestamp: string;
}