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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleClasses = [
  {
    name: "Class 10A",
    subject: "Mathematics",
    teacherId: "admin-teacher-1",
    teacherName: "Admin Teacher",
    schedule: "Monday, Wednesday, Friday - 9:00 AM",
    room: "Room 101"
  },
  {
    name: "Class 10B",
    subject: "Science",
    teacherId: "admin-teacher-2", 
    teacherName: "Admin Teacher",
    schedule: "Tuesday, Thursday - 10:30 AM",
    room: "Room 102"
  },
  {
    name: "Class 11A",
    subject: "Physics",
    teacherId: "admin-teacher-3",
    teacherName: "Admin Teacher",
    schedule: "Monday, Wednesday - 2:00 PM",
    room: "Room 201"
  },
  {
    name: "Class 11B",
    subject: "Chemistry",
    teacherId: "admin-teacher-4",
    teacherName: "Admin Teacher", 
    schedule: "Tuesday, Friday - 3:30 PM",
    room: "Room 202"
  },
  {
    name: "Class 12A",
    subject: "Biology",
    teacherId: "admin-teacher-5",
    teacherName: "Admin Teacher",
    schedule: "Wednesday, Friday - 11:00 AM",
    room: "Room 301"
  },
  {
    name: "Class 12B",
    subject: "Computer Science",
    teacherId: "admin-teacher-6",
    teacherName: "Admin Teacher",
    schedule: "Monday, Thursday - 1:00 PM",
    room: "Room 302"
  }
];

async function addTestClassesForAdmin() {
  try {
    console.log('Adding test classes for admin syllabus functionality...');

    for (const classData of sampleClasses) {
      const docRef = await addDoc(collection(db, 'classes'), {
        ...classData,
        createdAt: new Date(),
        status: 'active'
      });
      console.log(`Added class: ${classData.name} - ${classData.subject} with ID: ${docRef.id}`);
    }
    
    console.log('All test classes added successfully!');
    console.log('You can now use these classes in the admin syllabus upload functionality.');
  } catch (error) {
    console.error('Error adding test classes:', error);
  }
}

addTestClassesForAdmin(); 