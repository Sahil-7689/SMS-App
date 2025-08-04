// Utility script to check your current teacher ID
// Run this script to see your teacher ID and verify authentication

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC9PH7R6vg5MvGjWDnJ_tk4Ot-iiCoMKbA",
  authDomain: "sms-1.firebaseapp.com",
  projectId: "sms-1-6304f",
  storageBucket: "sms-1-6304f.firebasestorage.app",
  messagingSenderId: "739773901547",
  appId: "1:739773901547:android:b5a8282ed4046af9c66cae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function checkTeacherId() {
  console.log('🔍 Checking authentication status...');
  
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.log('❌ No user is currently signed in.');
    console.log('📝 Please sign in to your teacher account first.');
    console.log('💡 You can sign in through your app or Firebase console.');
    return;
  }
  
  console.log('✅ User is authenticated!');
  console.log('👤 User details:');
  console.log(`   - UID: ${currentUser.uid}`);
  console.log(`   - Email: ${currentUser.email}`);
  console.log(`   - Display Name: ${currentUser.displayName || 'Not set'}`);
  
  console.log('\n📋 Next steps:');
  console.log('1. Copy your UID (teacher ID) from above');
  console.log('2. Run the update-existing-students.js script to fix student assignments');
  console.log('3. Or run add-test-students.js to add new students with correct teacher ID');
}

// Run the function
checkTeacherId(); 