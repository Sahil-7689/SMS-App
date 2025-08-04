// Utility script to add test students to Firebase
// Run this script to populate your database with sample students

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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

// Sample students data
const sampleStudents = [
  {
    name: "Alice Johnson",
    className: "Class 10A",
    class: "10A",
    age: 16,
    rollNo: "10A001",
    email: "alice.johnson@school.com",
    contact: "+1234567890",
    parentName: "John Johnson",
    parentContact: "+1234567891",
    emergency: "+1234567892",
    status: "online",
    createdAt: new Date()
  },
  {
    name: "Bob Smith",
    className: "Class 10A",
    class: "10A",
    age: 15,
    rollNo: "10A002",
    email: "bob.smith@school.com",
    contact: "+1234567893",
    parentName: "Mary Smith",
    parentContact: "+1234567894",
    emergency: "+1234567895",
    status: "offline",
    createdAt: new Date()
  },
  {
    name: "Carol Davis",
    className: "Class 10A",
    class: "10A",
    age: 16,
    rollNo: "10A003",
    email: "carol.davis@school.com",
    contact: "+1234567896",
    parentName: "Robert Davis",
    parentContact: "+1234567897",
    emergency: "+1234567898",
    status: "online",
    createdAt: new Date()
  },
  {
    name: "David Wilson",
    className: "Class 9B",
    class: "9B",
    age: 15,
    rollNo: "9B001",
    email: "david.wilson@school.com",
    contact: "+1234567899",
    parentName: "Sarah Wilson",
    parentContact: "+1234567900",
    emergency: "+1234567901",
    status: "online",
    createdAt: new Date()
  },
  {
    name: "Emma Brown",
    className: "Class 9B",
    class: "9B",
    age: 14,
    rollNo: "9B002",
    email: "emma.brown@school.com",
    contact: "+1234567902",
    parentName: "Michael Brown",
    parentContact: "+1234567903",
    emergency: "+1234567904",
    status: "offline",
    createdAt: new Date()
  },
  {
    name: "Frank Miller",
    className: "Class 8A",
    class: "8A",
    age: 13,
    rollNo: "8A001",
    email: "frank.miller@school.com",
    contact: "+1234567905",
    parentName: "Lisa Miller",
    parentContact: "+1234567906",
    emergency: "+1234567907",
    status: "online",
    createdAt: new Date()
  },
  {
    name: "Grace Taylor",
    className: "Class 8A",
    class: "8A",
    age: 13,
    rollNo: "8A002",
    email: "grace.taylor@school.com",
    contact: "+1234567908",
    parentName: "James Taylor",
    parentContact: "+1234567909",
    emergency: "+1234567910",
    status: "online",
    createdAt: new Date()
  }
];

async function addTestStudents() {
  try {
    console.log('Checking authentication status...');
    
    // Wait for auth state to be determined
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      console.log('No user is currently signed in.');
      console.log('Please sign in to your teacher account first, then run this script again.');
      console.log('You can sign in through your app or Firebase console.');
      return;
    }
    
    const teacherId = currentUser.uid;
    console.log(`Current teacher ID: ${teacherId}`);
    console.log('Adding test students to Firebase...');

    for (const studentData of sampleStudents) {
      const studentWithTeacher = {
        ...studentData,
        assignedTeacherId: teacherId
      };
      
      const docRef = await addDoc(collection(db, 'students'), studentWithTeacher);
      console.log(`Added student: ${studentData.name} with ID: ${docRef.id}`);
    }

    console.log('All test students added successfully!');
    console.log(`All students are now assigned to teacher ID: ${teacherId}`);
    console.log('You should now see multiple students in your app.');
  } catch (error) {
    console.error('Error adding test students:', error);
  }
}

// Run the function
addTestStudents(); 