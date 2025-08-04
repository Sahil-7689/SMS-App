// Utility script to update existing students with correct teacher ID
// Run this script to fix students that have incorrect assignedTeacherId

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
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
const db = getFirestore(app);
const auth = getAuth(app);

async function updateExistingStudents() {
  try {
    console.log('Checking authentication status...');
    
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.log('No user is currently signed in.');
      console.log('Please sign in to your teacher account first, then run this script again.');
      return;
    }
    
    const teacherId = currentUser.uid;
    console.log(`Current teacher ID: ${teacherId}`);
    console.log('Fetching all students...');

    // Get all students
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    const students = studentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${students.length} students in the database`);

    // Filter students that need updating (have wrong assignedTeacherId or none at all)
    const studentsToUpdate = students.filter(student => 
      !student.assignedTeacherId || student.assignedTeacherId === 'test-teacher-1'
    );

    console.log(`Found ${studentsToUpdate.length} students that need updating`);

    if (studentsToUpdate.length === 0) {
      console.log('All students already have the correct teacher ID!');
      return;
    }

    // Update each student
    for (const student of studentsToUpdate) {
      const studentRef = doc(db, 'students', student.id);
      await updateDoc(studentRef, {
        assignedTeacherId: teacherId
      });
      console.log(`Updated student: ${student.name} (ID: ${student.id})`);
    }

    console.log('All students updated successfully!');
    console.log(`All students are now assigned to teacher ID: ${teacherId}`);
    console.log('You should now see multiple students in your app.');

  } catch (error) {
    console.error('Error updating students:', error);
  }
}

// Run the function
updateExistingStudents(); 