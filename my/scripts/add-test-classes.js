// Utility script to add test classes to Firebase
// Run this script to populate your database with sample classes

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

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

// Sample classes data
const sampleClasses = [
  {
    name: "Class 10A",
    subject: "Mathematics",
    teacherId: "test-teacher-1", // Replace with actual teacher ID
    teacherName: "John Smith",
    schedule: "Monday, Wednesday, Friday - 9:00 AM",
    room: "Room 101"
  },
  {
    name: "Class 9B",
    subject: "Science",
    teacherId: "test-teacher-1", // Replace with actual teacher ID
    teacherName: "John Smith",
    schedule: "Tuesday, Thursday - 10:30 AM",
    room: "Room 102"
  },
  {
    name: "Class 8A",
    subject: "English",
    teacherId: "test-teacher-1", // Replace with actual teacher ID
    teacherName: "John Smith",
    schedule: "Monday, Wednesday - 2:00 PM",
    room: "Room 103"
  }
];

async function addTestClasses() {
  try {
    console.log('Adding test classes to Firebase...');
    
    for (const classData of sampleClasses) {
      const docRef = await addDoc(collection(db, 'classes'), {
        ...classData,
        createdAt: new Date(),
        status: 'active'
      });
      console.log(`Added class: ${classData.name} with ID: ${docRef.id}`);
    }
    
    console.log('All test classes added successfully!');
  } catch (error) {
    console.error('Error adding test classes:', error);
  }
}

// Run the function
addTestClasses(); 