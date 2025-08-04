import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC9PH7R6vg5MvGjWDnJ_tk4Ot-iiCoMKbA",
  authDomain: "sms-1.firebaseapp.com",
  projectId: "sms-1-6304f",
  storageBucket: "sms-1-6304f.firebasestorage.app",
  messagingSenderId: "739773901547",
  appId: "1:739773901547:android:b5a8282ed4046af9c66cae"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

async function checkFirebaseStorage() {
  console.log('🔍 Checking Firebase Storage configuration...');
  
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('❌ No user is authenticated. Please sign in first.');
      console.log('💡 Solution: Sign in to your admin account before testing uploads.');
      return;
    }
    
    console.log('✅ User authenticated:', currentUser.email);
    
    // Test storage access with a small test file
    console.log('🧪 Testing storage access...');
    
    const testFileName = `test_${Date.now()}.txt`;
    const testRef = ref(storage, `test/${testFileName}`);
    
    // Create a simple test blob
    const testBlob = new Blob(['Test file for storage access'], { type: 'text/plain' });
    
    console.log('📤 Attempting to upload test file...');
    const uploadResult = await uploadBytes(testRef, testBlob);
    console.log('✅ Test upload successful:', uploadResult);
    
    console.log('🔗 Getting download URL...');
    const downloadURL = await getDownloadURL(testRef);
    console.log('✅ Download URL obtained:', downloadURL);
    
    console.log('\n🎉 Firebase Storage is working correctly!');
    console.log('📋 Current configuration:');
    console.log(`   - Storage Bucket: ${storage.app.options.storageBucket}`);
    console.log(`   - Authenticated User: ${currentUser.email}`);
    console.log(`   - User UID: ${currentUser.uid}`);
    
    console.log('\n💡 If syllabus uploads still fail, check:');
    console.log('   1. File size (should be under 100MB)');
    console.log('   2. File type (should be PDF)');
    console.log('   3. Network connection');
    console.log('   4. Firebase Storage rules (see below)');
    
    console.log('\n📝 Recommended Firebase Storage Rules:');
    console.log(`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to read and write syllabi
    match /syllabi/{className}/{fileName} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read and write test files
    match /test/{fileName} {
      allow read, write: if request.auth != null;
    }
    
    // Default rule - deny all
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
    `);
    
  } catch (error) {
    console.error('❌ Firebase Storage test failed:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    
    if (error.code === 'storage/unauthorized') {
      console.log('\n🔧 SOLUTION: Update Firebase Storage Rules');
      console.log('Go to Firebase Console > Storage > Rules and update to:');
      console.log(`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /syllabi/{className}/{fileName} {
      allow read, write: if request.auth != null;
    }
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
      `);
    } else if (error.code === 'storage/unauthenticated') {
      console.log('\n🔧 SOLUTION: User not authenticated');
      console.log('Make sure you are signed in to your admin account.');
    } else if (error.code === 'storage/quota-exceeded') {
      console.log('\n🔧 SOLUTION: Storage quota exceeded');
      console.log('Upgrade your Firebase plan or delete unused files.');
    } else {
      console.log('\n🔧 GENERAL TROUBLESHOOTING:');
      console.log('1. Check Firebase Console for any service disruptions');
      console.log('2. Verify your Firebase project is properly configured');
      console.log('3. Check network connectivity');
      console.log('4. Try uploading a smaller file first');
    }
  }
}

checkFirebaseStorage(); 