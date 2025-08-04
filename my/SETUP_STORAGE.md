# Storage Setup Guide - Firebase + Supabase

## Overview
This app now supports using both Firebase and Supabase storage together:
- **Firebase**: Authentication, Firestore database, and other services
- **Supabase**: File storage (free tier)

## Setup Instructions

### 1. Firebase Setup (Already Done)
✅ Firebase is already configured for:
- Authentication
- Firestore database
- Other services

### 2. Supabase Setup (For File Storage)

#### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

#### Step 2: Get Supabase Credentials
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy your:
   - **Project URL**
   - **Anon Public Key**

#### Step 3: Update Configuration
Edit `my/config/supabase-storage.ts`:
```typescript
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

#### Step 4: Create Storage Bucket
1. Go to **Storage** in your Supabase dashboard
2. Click **Create a new bucket**
3. Name it: `syllabi`
4. Set it as **Public** (for easy access)
5. Click **Create bucket**

### 3. Install Supabase Dependencies
```bash
cd my
npm install @supabase/supabase-js
```

## Usage

### Default Behavior
- Files are uploaded to **Supabase** (free storage)
- Database data is stored in **Firebase Firestore**
- Authentication uses **Firebase Auth**

### Switching Storage Providers
You can change the default storage provider in `my/config/storage-switcher.ts`:
```typescript
export const DEFAULT_STORAGE_PROVIDER: StorageProvider = 'supabase'; // or 'firebase'
```

### Manual Provider Selection
You can also specify which provider to use for each upload:
```typescript
const uploadResult = await uploadFile(
  fileUri,
  fileName,
  contentType,
  'supabase' // or 'firebase'
);
```

## Benefits of This Setup

### ✅ **Cost Effective**
- Supabase: 1GB free storage
- Firebase: 5GB free storage
- Use both for maximum free storage

### ✅ **Reliable**
- If one service fails, you can switch to the other
- No vendor lock-in

### ✅ **Flexible**
- Easy to switch between providers
- Can use different providers for different file types

### ✅ **Scalable**
- Can upgrade either service independently
- Easy to add more storage providers

## Troubleshooting

### Supabase Upload Fails
1. Check your Supabase credentials
2. Verify the bucket exists and is public
3. Check file size limits (1GB free tier)

### Firebase Upload Fails
1. Check Firebase Storage rules
2. Verify authentication
3. Check file size limits (5GB free tier)

### Switch to Firebase Storage
If Supabase doesn't work, change the default provider:
```typescript
export const DEFAULT_STORAGE_PROVIDER: StorageProvider = 'firebase';
```

## File Structure
```
my/config/
├── firebase.ts          # Firebase config (Auth, Firestore)
├── supabase-storage.ts  # Supabase storage functions
├── storage-switcher.ts  # Storage provider switcher
└── aws-s3.ts           # AWS S3 (alternative)
``` 