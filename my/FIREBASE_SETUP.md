# Firebase Setup Guide for SMS App

## Prerequisites
- Firebase account
- Node.js and npm installed
- Expo CLI installed

## Step 1: Install Firebase Dependencies

Run the following command in your project directory:

```bash
npm install firebase
```

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "sms-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 3: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Click "Save"

## Step 4: Set Up Firestore Database

1. In your Firebase project, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for development (you can add security rules later)
4. Select a location for your database
5. Click "Done"

## Step 5: Get Firebase Configuration

1. In your Firebase project, click the gear icon next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Enter your app nickname (e.g., "SMS App Web")
6. Click "Register app"
7. Copy the Firebase configuration object

## Step 6: Update Firebase Configuration

1. Open `config/firebase.ts` in your project
2. Replace the placeholder configuration with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 7: Set Up Firestore Security Rules

In your Firebase console, go to Firestore Database > Rules and update the rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read and write to their role-specific collections
    match /students/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /teachers/{document} {
      allow read, write: if request.auth != null;
    }
    
    match /admins/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 8: Test the Setup

1. Start your Expo development server:
```bash
npm start
```

2. Test registration and login functionality for each role:
   - Student registration/login
   - Teacher registration/login
   - Admin registration/login

## Features Implemented

### Authentication
- ✅ User registration with email/password
- ✅ User login with role-based access
- ✅ Remember me functionality
- ✅ Form validation
- ✅ Error handling

### Database Structure
- **users** collection: Stores user authentication data
- **students** collection: Stores student-specific data
- **teachers** collection: Stores teacher-specific data
- **admins** collection: Stores admin-specific data

### Role-Based Access
- Students can only access student features
- Teachers can only access teacher features
- Admins can only access admin features
- Admin registration requires special admin code (ADMIN2024)

## Security Notes

1. **Admin Code**: The admin registration requires the code "ADMIN2024". In production, consider implementing a more secure admin invitation system.

2. **Firestore Rules**: The current rules allow all authenticated users to read/write to role collections. In production, implement more restrictive rules based on user roles.

3. **Environment Variables**: Consider moving Firebase configuration to environment variables for better security.

## Troubleshooting

### Common Issues

1. **"Firebase not initialized" error**
   - Make sure you've installed the firebase package
   - Check that your Firebase configuration is correct

2. **"Permission denied" error**
   - Check your Firestore security rules
   - Ensure authentication is properly set up

3. **"User not found" error**
   - Make sure the user exists in Firebase Authentication
   - Check that the user data was properly saved to Firestore

### Testing Credentials

For testing purposes, you can create test accounts:
- Student: student@test.com / password123
- Teacher: teacher@test.com / password123
- Admin: admin@test.com / password123 (with admin code: ADMIN2024)

## Next Steps

1. **Add Password Reset**: Implement forgot password functionality
2. **Email Verification**: Add email verification for new accounts
3. **Profile Management**: Add user profile editing capabilities
4. **Data Validation**: Add more comprehensive form validation
5. **Offline Support**: Implement offline data synchronization
6. **Push Notifications**: Add push notification support
7. **File Upload**: Add support for profile pictures and document uploads