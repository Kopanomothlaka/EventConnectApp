# EventConnectApp

A React Native app for event management and networking, built with Expo Router and Supabase.

## Features

### Authentication & User Management
- **User Registration & Login**: Secure authentication with Supabase
- **Role-based Access**: Support for both attendees and organizers
- **Logout Functionality**: Complete logout system with confirmation dialogs

#### Logout Implementation

The app includes a comprehensive logout system that allows users to sign out from any screen:

**Components:**
- `LogoutButton` - Reusable component with customizable styling
- `AuthContext` - Manages authentication state and logout logic

**Features:**
- ✅ Confirmation dialog before logout
- ✅ Automatic navigation to welcome screen
- ✅ Error handling for failed logout attempts
- ✅ Consistent styling across all screens
- ✅ Available on all main screens:
  - Home screen
  - Agenda screen  
  - Network screen
  - Profile screen
  - Event details screen
  - Organizer create event screen

**Usage:**
```tsx
import LogoutButton from '@/components/LogoutButton';

// Basic usage
<LogoutButton />

// Customized styling
<LogoutButton 
  size={20} 
  color={Colors.textSecondary}
  showText={true}
  style={customStyle}
/>
```

**Authentication Flow:**
1. User clicks logout button
2. Confirmation dialog appears
3. If confirmed, `signOut()` is called from AuthContext
4. Supabase auth state is cleared
5. User is automatically redirected to welcome screen
6. All protected routes become inaccessible

## Getting Started

[Add your setup instructions here]

## Tech Stack

- React Native with Expo
- Expo Router for navigation
- Supabase for backend and authentication
- TypeScript for type safety
