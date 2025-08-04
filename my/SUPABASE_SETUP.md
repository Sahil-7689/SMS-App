# Supabase Environment Setup

## Environment Variables

To use Supabase with environment variables, create a `.env` file in the `my/` directory with the following variables:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://kvthiphblhmsadoofvvq.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-publishable-key-here
```

## Getting Your Supabase Keys

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the **Project URL** for `EXPO_PUBLIC_SUPABASE_URL`
4. Copy the **anon public** key for `EXPO_PUBLIC_SUPABASE_KEY`

## Important Notes

- Use the **publishable key** (anon public key) for mobile and desktop apps
- The `EXPO_PUBLIC_` prefix is required for Expo to expose these variables to your app
- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`

## Current Configuration

The app is currently configured with fallback values:
- URL: `https://kvthiphblhmsadoofvvq.supabase.co`
- Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dGhpcGhibGhtc2Fkb29mdnZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMTgyNDksImV4cCI6MjA2OTc5NDI0OX0.phhsUcoRBskEw48tknSlM9rnoG8DPp0wUlhI3Fk1gqw`

## Storage Bucket Setup

Make sure you have a `syllabi` bucket created in your Supabase storage with the following settings:
- Public bucket (for file downloads)
- Row Level Security (RLS) policies configured appropriately 