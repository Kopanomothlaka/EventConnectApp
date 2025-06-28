# Supabase Setup Guide for EventConnect

This guide will help you set up Supabase for your EventConnect app.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Expo CLI installed

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `eventconnect-app`
   - Database Password: Choose a strong password
   - Region: Select the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## Step 3: Update Your App Configuration

1. Open `lib/supabase.ts` in your project
2. Replace the placeholder values with your actual Supabase credentials:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Project URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your Anon public key
```

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy the contents of `supabase/schema.sql`
3. Paste it into the SQL Editor and click "Run"
4. This will create all the necessary tables and security policies

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure the following settings:

### Site URL
- Add your app's URL (for development: `exp://localhost:8081`)

### Redirect URLs
- Add: `exp://localhost:8081/*`
- Add: `exp://192.168.1.100:8081/*` (replace with your local IP)
- Add: `exp://localhost:19000/*` (for Expo Go)

### Email Templates (Optional)
- Customize the email templates for better user experience

## Step 6: Test the Setup

1. Start your Expo development server:
```bash
npx expo start
```

2. Test the authentication flow:
   - Try registering a new user
   - Try logging in with the registered user
   - Check that the user appears in the Supabase dashboard under Authentication > Users

## Step 7: Environment Variables (Recommended)

For better security, use environment variables:

1. Create a `.env` file in your project root:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Update `lib/supabase.ts`:
```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
```

3. Add `.env` to your `.gitignore` file

## Database Tables Created

The schema creates the following tables:

- **users**: User profiles with role-based access
- **events**: Event information and details
- **event_attendees**: Junction table for event registrations
- **speakers**: Event speakers and their information
- **agenda_items**: Event agenda and schedule
- **social_accounts**: User social media accounts

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Organizers can only manage their own events
- Public read access for events and attendees

## Real-time Features

The app includes real-time subscriptions for:
- Event updates
- Attendee registrations
- Live notifications

## Troubleshooting

### Common Issues

1. **Authentication errors**: Check your Supabase URL and anon key
2. **Database errors**: Ensure the schema was applied correctly
3. **Network errors**: Check your internet connection and Supabase project status

### Getting Help

- Check the [Supabase documentation](https://supabase.com/docs)
- Visit the [Supabase community](https://github.com/supabase/supabase/discussions)
- Review the [Expo documentation](https://docs.expo.dev)

## Next Steps

After setup, you can:

1. Add more features like push notifications
2. Implement file uploads for event images
3. Add analytics and monitoring
4. Set up automated backups
5. Configure custom domains

## Production Deployment

When ready for production:

1. Update redirect URLs to your production domain
2. Set up custom email templates
3. Configure proper CORS settings
4. Set up monitoring and alerts
5. Consider using Supabase Edge Functions for serverless logic 