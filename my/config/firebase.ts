import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { uploadFile, deleteFile, getStorageDownloadURL } from './storage-switcher';


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

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Network connectivity check
export const checkNetworkConnectivity = async () => {
  try {
    // Simple network check by trying to fetch a small resource
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Network connectivity check failed:', error);
    return false;
  }
};

// Authentication functions
export const registerUser = async (email: string, password: string, userData: any) => {
  try {
    // Check network connectivity first
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      return { success: false, error: 'No internet connection. Please check your network and try again.' };
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save additional user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      email: user.email,
      createdAt: new Date(),
      role: userData.role
    });
    
    return { success: true, user };
  } catch (error: any) {
    console.error('Registration error:', error);
    
    let errorMessage = 'Registration failed';
    
    if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error - please check your internet connection and try again';
    } else if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password is too weak. Please use at least 6 characters';
    } else {
      errorMessage = error.message || 'An unexpected error occurred';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    // Add timeout and better error handling
    const userCredential = await Promise.race([
      signInWithEmailAndPassword(auth, email, password),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - please check your internet connection')), 15000)
      )
    ]);
    
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    
    return { success: true, user, userData };
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Login failed';
    
    if (error.code === 'auth/network-request-failed') {
      errorMessage = 'Network error - please check your internet connection and try again';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email address';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled';
    } else if (error.message?.includes('timeout')) {
      errorMessage = error.message;
    } else {
      errorMessage = error.message || 'An unexpected error occurred';
    }
    
    return { success: false, error: errorMessage };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Firestore functions for different roles
export const saveStudentData = async (studentData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'students'), {
      ...studentData,
      createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const saveTeacherData = async (teacherData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'teachers'), {
      ...teacherData,
      createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const saveAdminData = async (adminData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'admins'), {
      ...adminData,
      createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Assignment management functions
export const addAssignment = async (assignmentData: {
  title: string;
  dueDate: string;
  class: string;
  subject: string;
  teacherId?: string;
  teacherName?: string;
  attachmentFileName?: string;
  attachmentType?: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, 'assignments'), {
      ...assignmentData,
      createdAt: new Date(),
      status: 'active'
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Add assignment error:', error);
    return { success: false, error: error.message };
  }
};

export const getAssignments = async (filters?: {
  class?: string;
  subject?: string;
  teacherId?: string;
}) => {
  try {
    let q: any = collection(db, 'assignments');
    
    // Apply filters if provided
    if (filters) {
      const constraints = [];
      if (filters.class) {
        constraints.push(where('class', '==', filters.class));
      }
      if (filters.subject) {
        constraints.push(where('subject', '==', filters.subject));
      }
      if (filters.teacherId) {
        constraints.push(where('teacherId', '==', filters.teacherId));
      }
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }
    
    const querySnapshot = await getDocs(q);
    const assignments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    
    return { success: true, assignments };
  } catch (error: any) {
    console.error('Get assignments error:', error);
    return { success: false, error: error.message };
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { success: true, user: querySnapshot.docs[0].data() };
    }
    return { success: false, error: 'User not found' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Student assignment submission functions
export const submitAssignment = async (assignmentId: string, studentId: string, studentName: string, submissionData: {
  fileName: string;
  fileUri: string;
  fileType: string;
  submittedAt: Date;
}) => {
  try {
    // Upload file to Firebase Storage
    const response = await fetch(submissionData.fileUri);
    const blob = await response.blob();
    
    const fileName = `submissions/${assignmentId}/${studentId}_${submissionData.fileName}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Save submission data to Firestore
    const submissionRef = await addDoc(collection(db, 'assignment_submissions'), {
      assignmentId,
      studentId,
      studentName,
      fileName: submissionData.fileName,
      fileType: submissionData.fileType,
      fileUrl: downloadURL,
      submittedAt: submissionData.submittedAt,
      status: 'submitted'
    });
    
    return { success: true, id: submissionRef.id, fileUrl: downloadURL };
  } catch (error: any) {
    console.error('Submit assignment error:', error);
    return { success: false, error: error.message };
  }
};

export const getAssignmentSubmissions = async (assignmentId?: string, studentId?: string) => {
  try {
    let q: any = collection(db, 'assignment_submissions');
    
    const constraints = [];
    if (assignmentId) {
      constraints.push(where('assignmentId', '==', assignmentId));
    }
    if (studentId) {
      constraints.push(where('studentId', '==', studentId));
    }
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    const querySnapshot = await getDocs(q);
    const submissions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    
    return { success: true, submissions };
  } catch (error: any) {
    console.error('Get submissions error:', error);
    return { success: false, error: error.message };
  }
};

// File download helper function
export const getFileDownloadURL = async (filePath: string) => {
  try {
    const storageRef = ref(storage, filePath);
    const downloadURL = await getDownloadURL(storageRef);
    return { success: true, url: downloadURL };
  } catch (error: any) {
    console.error('Get download URL error:', error);
    return { success: false, error: error.message };
  }
};

// Resource management functions
export const addResource = async (resourceData: {
  title: string;
  subject: string;
  class: string;
  teacherId?: string;
  teacherName?: string;
  attachmentFileName?: string;
  attachmentType?: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, 'resources'), {
      ...resourceData,
      createdAt: new Date(),
      status: 'active'
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Add resource error:', error);
    return { success: false, error: error.message };
  }
};

export const getResources = async (filters?: {
  class?: string;
  subject?: string;
  teacherId?: string;
}) => {
  try {
    let q: any = collection(db, 'resources');
    
    // Apply filters if provided
    if (filters) {
      const constraints = [];
      if (filters.class) {
        constraints.push(where('class', '==', filters.class));
      }
      if (filters.subject) {
        constraints.push(where('subject', '==', filters.subject));
      }
      if (filters.teacherId) {
        constraints.push(where('teacherId', '==', filters.teacherId));
      }
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }
    
    const querySnapshot = await getDocs(q);
    const resources = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    
    return { success: true, resources };
  } catch (error: any) {
    console.error('Get resources error:', error);
    return { success: false, error: error.message };
  }
};

export const getResourceDownloadURL = async (resourceId: string, fileName: string) => {
  try {
    const filePath = `resources/${resourceId}/${fileName}`;
    const fileRef = ref(storage, filePath);
    const downloadURL = await getDownloadURL(fileRef);
    return { success: true, downloadURL };
  } catch (error: any) {
    console.error('Get resource download URL error:', error);
    return { success: false, error: error.message };
  }
};

// Leave Management Functions
export const submitLeaveRequest = async (leaveData: {
  teacherId: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  attachmentFileName?: string;
  attachmentType?: string;
}) => {
  try {
    console.log('Firebase submitLeaveRequest - leaveData:', leaveData);
    
    // Filter out undefined values to prevent Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(leaveData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, 'leave_requests'), {
      ...filteredData,
      status: 'pending',
      submittedAt: new Date(),
      reviewedBy: null,
      reviewedAt: null,
      adminComment: null
    });
    console.log('Firebase submitLeaveRequest - document created with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Submit leave request error:', error);
    return { success: false, error: error.message };
  }
};

export const getLeaveRequests = async (filters?: {
  teacherId?: string;
  status?: string;
  adminView?: boolean;
}) => {
  try {
    console.log('Firebase getLeaveRequests - filters:', filters);
    let q: any = collection(db, 'leave_requests');

    if (filters) {
      const constraints = [];
      if (filters.teacherId) {
        console.log('Firebase getLeaveRequests - adding teacherId filter:', filters.teacherId);
        constraints.push(where('teacherId', '==', filters.teacherId));
      }
      if (filters.status && filters.status !== 'all') {
        console.log('Firebase getLeaveRequests - adding status filter:', filters.status);
        constraints.push(where('status', '==', filters.status));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }

    console.log('Firebase getLeaveRequests - executing query');
    const querySnapshot = await getDocs(q);
    console.log('Firebase getLeaveRequests - querySnapshot size:', querySnapshot.size);
    console.log('Firebase getLeaveRequests - querySnapshot docs:', querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
    
    const leaveRequests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));

    console.log('Firebase getLeaveRequests - returning leaveRequests:', leaveRequests);
    return { success: true, leaveRequests };
  } catch (error: any) {
    console.error('Get leave requests error:', error);
    return { success: false, error: error.message };
  }
};

export const updateLeaveStatus = async (leaveId: string, status: 'approved' | 'rejected', adminId: string, adminName: string, comment?: string) => {
  try {
    const leaveRef = doc(db, 'leave_requests', leaveId);
    await updateDoc(leaveRef, {
      status: status,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      adminComment: comment || null
    });
    return { success: true };
  } catch (error: any) {
    console.error('Update leave status error:', error);
    return { success: false, error: error.message };
  }
};

// Student Leave Management Functions
export const submitStudentLeaveRequest = async (leaveData: {
  studentId: string;
  studentName: string;
  studentClass: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  parentContact?: string;
  attachmentFileName?: string;
  attachmentType?: string;
}) => {
  try {
    // Filter out undefined values to prevent Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(leaveData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, 'student_leave_requests'), {
      ...filteredData,
      status: 'pending',
      submittedAt: new Date(),
      reviewedBy: null,
      reviewedAt: null,
      adminComment: null
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Submit student leave request error:', error);
    return { success: false, error: error.message };
  }
};

export const getStudentLeaveRequests = async (filters?: {
  studentId?: string;
  status?: string;
  adminView?: boolean;
}) => {
  try {
    console.log('Firebase getStudentLeaveRequests - filters:', filters);
    let q: any = collection(db, 'student_leave_requests');

    if (filters) {
      const constraints = [];
      if (filters.studentId) {
        console.log('Firebase getStudentLeaveRequests - adding studentId filter:', filters.studentId);
        constraints.push(where('studentId', '==', filters.studentId));
      }
      if (filters.status && filters.status !== 'all') {
        console.log('Firebase getStudentLeaveRequests - adding status filter:', filters.status);
        constraints.push(where('status', '==', filters.status));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }

    console.log('Firebase getStudentLeaveRequests - executing query');
    const querySnapshot = await getDocs(q);
    console.log('Firebase getStudentLeaveRequests - querySnapshot size:', querySnapshot.size);
    console.log('Firebase getStudentLeaveRequests - querySnapshot docs:', querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
    
    const leaveRequests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));

    console.log('Firebase getStudentLeaveRequests - returning leaveRequests:', leaveRequests);
    return { success: true, leaveRequests };
  } catch (error: any) {
    console.error('Get student leave requests error:', error);
    return { success: false, error: error.message };
  }
};

export const updateStudentLeaveStatus = async (leaveId: string, status: 'approved' | 'rejected', adminId: string, adminName: string, comment?: string) => {
  try {
    const leaveRef = doc(db, 'student_leave_requests', leaveId);
    await updateDoc(leaveRef, {
      status: status,
      reviewedBy: adminId,
      reviewedAt: new Date(),
      adminComment: comment || null
    });
    return { success: true };
  } catch (error: any) {
    console.error('Update student leave status error:', error);
    return { success: false, error: error.message };
  }
};

// Student Management Functions
export const getStudents = async (filters?: {
  class?: string;
  teacherId?: string;
  className?: string;
}) => {
  try {
    console.log('🔍 Fetching students with filters:', filters);
    let q: any = collection(db, 'students');
    
    if (filters) {
      const constraints = [];
      if (filters.class) {
        constraints.push(where('class', '==', filters.class));
      }
      if (filters.teacherId) {
        constraints.push(where('teacherId', '==', filters.teacherId));
      }
      if (filters.className) {
        constraints.push(where('className', '==', filters.className));
      }
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }
    
    const querySnapshot = await getDocs(q);
    const students = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    
    console.log(`👥 Found ${students.length} students`);
    return { success: true, students };
  } catch (error: any) {
    console.error('❌ Get students error:', error);
    return { success: false, error: error.message };
  }
};

export const getTeachers = async (filters?: {
  subject?: string;
  department?: string;
}) => {
  try {
    console.log('🔍 Fetching teachers with filters:', filters);
    let q: any = collection(db, 'teachers');
    
    if (filters) {
      const constraints = [];
      if (filters.subject) {
        constraints.push(where('subject', '==', filters.subject));
      }
      if (filters.department) {
        constraints.push(where('department', '==', filters.department));
      }
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }
    
    const querySnapshot = await getDocs(q);
    const teachers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    
    console.log(`👨‍🏫 Found ${teachers.length} teachers`);
    return { success: true, teachers };
  } catch (error: any) {
    console.error('❌ Get teachers error:', error);
    return { success: false, error: error.message };
  }
};

export const getClasses = async (teacherId?: string) => {
  try {
    let q: any = collection(db, 'classes');
    
    if (teacherId) {
      q = query(q, where('teacherId', '==', teacherId));
    }
    
    const querySnapshot = await getDocs(q);
    const classes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    
    return { success: true, classes };
  } catch (error: any) {
    console.error('Get classes error:', error);
    return { success: false, error: error.message };
  }
};

export const addClass = async (classData: {
  name: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  schedule?: string;
  room?: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, 'classes'), {
      ...classData,
      createdAt: new Date(),
      status: 'active'
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Add class error:', error);
    return { success: false, error: error.message };
  }
};

// Attendance Management Functions
export const submitAttendance = async (attendanceData: {
  classId: string;
  className: string;
  date: string;
  teacherId: string;
  teacherName: string;
  students: Array<{
    studentId: string;
    studentName: string;
    rollNo: string;
    status: 'present' | 'absent' | 'late';
  }>;
}) => {
  try {
    const docRef = await addDoc(collection(db, 'attendance'), {
      ...attendanceData,
      submittedAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Submit attendance error:', error);
    return { success: false, error: error.message };
  }
};

export const getAttendanceHistory = async (filters?: {
  classId?: string;
  date?: string;
  teacherId?: string;
}) => {
  try {
    let q: any = collection(db, 'attendance');
    
    if (filters) {
      const constraints = [];
      if (filters.classId) {
        constraints.push(where('classId', '==', filters.classId));
      }
      if (filters.date) {
        constraints.push(where('date', '==', filters.date));
      }
      if (filters.teacherId) {
        constraints.push(where('teacherId', '==', filters.teacherId));
      }
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }
    
    const querySnapshot = await getDocs(q);
    const attendanceRecords = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    
    return { success: true, attendanceRecords };
  } catch (error: any) {
    console.error('Get attendance history error:', error);
    return { success: false, error: error.message };
  }
};

// Syllabus Management Functions
export const addSyllabus = async (syllabusData: {
  className: string;
  subject: string;
  title: string;
  description?: string;
  adminId: string;
  adminName: string;
  fileName: string;
  fileUri: string;
  fileType: string;
}) => {
  try {
    console.log('📁 Starting syllabus upload...');
    console.log('📋 Syllabus data:', {
      className: syllabusData.className,
      subject: syllabusData.subject,
      title: syllabusData.title,
      fileName: syllabusData.fileName,
      fileType: syllabusData.fileType
    });

    // Validate file URI
    if (!syllabusData.fileUri) {
      throw new Error('File URI is required');
    }

    // Use storage switcher to upload file
    const uploadResult = await uploadFile(
      syllabusData.fileUri,
      syllabusData.fileName,
      syllabusData.fileType || 'application/pdf',
      'supabase' // Using Supabase for syllabus storage
    );

    if (!uploadResult.success) {
      throw new Error(uploadResult.error);
    }

    console.log('✅ File upload successful using:', uploadResult.provider);
    if (uploadResult.fallbackReason) {
      console.log('⚠️ Upload completed with fallback reason:', uploadResult.fallbackReason);
    }
    
    // Save syllabus data to Firestore
    console.log('💾 Saving to Firestore...');
    
    // Filter out undefined values to prevent Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(syllabusData).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(collection(db, 'syllabi'), {
      ...filteredData,
      fileName: uploadResult.fileName,
      downloadURL: uploadResult.downloadURL,
      storageProvider: uploadResult.provider, // Store which provider was used
      fallbackReason: uploadResult.fallbackReason || null, // Store fallback reason if any
      uploadedAt: new Date(),
      status: 'active'
    });
    
    console.log('✅ Syllabus saved to Firestore with ID:', docRef.id);
    return { success: true, id: docRef.id, downloadURL: uploadResult.downloadURL };
  } catch (error: any) {
    console.error('❌ Add syllabus error:', error);
    console.error('❌ Error message:', error.message);
    
    return { success: false, error: error.message };
  }
};

export const getSyllabi = async (filters?: {
  className?: string;
  subject?: string;
  adminId?: string;
}) => {
  try {
    let q: any = collection(db, 'syllabi');
    
    if (filters) {
      const constraints = [];
      if (filters.className) {
        constraints.push(where('className', '==', filters.className));
      }
      if (filters.subject) {
        constraints.push(where('subject', '==', filters.subject));
      }
      if (filters.adminId) {
        constraints.push(where('adminId', '==', filters.adminId));
      }
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }
    
    const querySnapshot = await getDocs(q);
    const syllabi = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    
    return { success: true, syllabi };
  } catch (error: any) {
    console.error('Get syllabi error:', error);
    return { success: false, error: error.message };
  }
};

export const updateSyllabus = async (syllabusId: string, updateData: {
  title?: string;
  description?: string;
  fileName?: string;
  fileUri?: string;
  fileType?: string;
}) => {
  try {
    const syllabusRef = doc(db, 'syllabi', syllabusId);
    
    // If there's a new file, upload it
    if (updateData.fileUri && updateData.fileName) {
      const fileRef = ref(storage, `syllabi/${updateData.fileName}`);
      const response = await fetch(updateData.fileUri);
      const blob = await response.blob();
      await uploadBytes(fileRef, blob);
      
      const downloadURL = await getDownloadURL(fileRef);
      
      await updateDoc(syllabusRef, {
        ...updateData,
        downloadURL,
        updatedAt: new Date()
      });
    } else {
      await updateDoc(syllabusRef, {
        ...updateData,
        updatedAt: new Date()
      });
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Update syllabus error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteSyllabus = async (syllabusId: string, fileName: string, storageProvider?: string) => {
  try {
    // Use storage switcher to delete file
    const deleteResult = await deleteFile(
      fileName,
      storageProvider === 'firebase' ? 'supabase' : (storageProvider as 'supabase' | undefined) || 'supabase'
    );

    if (!deleteResult.success) {
      throw new Error(deleteResult.error);
    }
    
    // Delete document from Firestore
    const syllabusRef = doc(db, 'syllabi', syllabusId);
    await updateDoc(syllabusRef, {
      status: 'deleted',
      deletedAt: new Date()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Delete syllabus error:', error);
    return { success: false, error: error.message };
  }
};

export const getSyllabusDownloadURL = async (syllabusId: string, fileName: string) => {
  try {
    // Use storage switcher to get download URL
    const result = await getStorageDownloadURL(fileName, 'supabase');
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return { success: true, downloadURL: result.downloadURL };
  } catch (error: any) {
    console.error('Get syllabus download URL error:', error);
    return { success: false, error: error.message };
  }
};

// Notice Management Functions
export const addNotice = async (noticeData: {
  title: string;
  content: string;
  adminId: string;
  adminName: string;
  priority?: 'low' | 'medium' | 'high';
  targetAudience?: 'all' | 'teachers' | 'students' | 'parents';
}) => {
  try {
    console.log('📢 Adding notice...');
    console.log('📋 Notice data:', {
      title: noticeData.title,
      content: noticeData.content,
      adminName: noticeData.adminName,
      priority: noticeData.priority,
      targetAudience: noticeData.targetAudience
    });

    // Filter out undefined values to prevent Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(noticeData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, 'notices'), {
      ...filteredData,
      createdAt: new Date(),
      status: 'active'
    });
    
    console.log('✅ Notice saved to Firestore with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('❌ Add notice error:', error);
    return { success: false, error: error.message };
  }
};

export const getNotices = async (filters?: {
  targetAudience?: string;
  status?: string;
  adminId?: string;
}) => {
  try {
    console.log('🔍 Fetching notices with filters:', filters);
    let q: any = collection(db, 'notices');
    
    if (filters) {
      const constraints = [];
      if (filters.targetAudience) {
        constraints.push(where('targetAudience', '==', filters.targetAudience));
      }
      if (filters.status && filters.status !== 'all') {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.adminId) {
        constraints.push(where('adminId', '==', filters.adminId));
      }
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }
    
    const querySnapshot = await getDocs(q);
    const notices = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    
    console.log(`📋 Found ${notices.length} notices:`, notices.map(n => ({ id: n.id, title: n.title, targetAudience: n.targetAudience })));
    return { success: true, notices };
  } catch (error: any) {
    console.error('❌ Get notices error:', error);
    return { success: false, error: error.message };
  }
};

export const updateNotice = async (noticeId: string, updateData: {
  title?: string;
  content?: string;
  priority?: 'low' | 'medium' | 'high';
  targetAudience?: 'all' | 'teachers' | 'students' | 'parents';
  status?: 'active' | 'inactive';
}) => {
  try {
    const noticeRef = doc(db, 'notices', noticeId);
    
    // Filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    await updateDoc(noticeRef, {
      ...filteredData,
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Update notice error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteNotice = async (noticeId: string) => {
  try {
    const noticeRef = doc(db, 'notices', noticeId);
    await updateDoc(noticeRef, {
      status: 'deleted',
      deletedAt: new Date()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Delete notice error:', error);
    return { success: false, error: error.message };
  }
};

// Result Management Functions
export const addResult = async (resultData: {
  studentId: string;
  studentName: string;
  studentClass: string;
  examType: string;
  examDate: string;
  subjects: Array<{
    subjectName: string;
    marksObtained: number;
    maxMarks: number;
    grade?: string;
  }>;
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  adminId: string;
  adminName: string;
  fileName?: string;
  fileUri?: string;
  fileType?: string;
}) => {
  try {
    console.log('📊 Adding result...');
    console.log('📋 Result data:', {
      studentName: resultData.studentName,
      studentClass: resultData.studentClass,
      examType: resultData.examType,
      examDate: resultData.examDate,
      subjectsCount: resultData.subjects.length,
      totalMarks: resultData.totalMarks,
      percentage: resultData.percentage
    });

    // Upload file if provided
    let uploadResult = null;
    if (resultData.fileUri && resultData.fileName) {
      uploadResult = await uploadFile(
        resultData.fileUri,
        resultData.fileName,
        resultData.fileType || 'application/pdf'
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      console.log('✅ File upload successful using:', uploadResult.provider);
      if (uploadResult.fallbackReason) {
        console.log('⚠️ Upload completed with fallback reason:', uploadResult.fallbackReason);
      }
    }

    // Filter out undefined values to prevent Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(resultData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, 'results'), {
      ...filteredData,
      fileName: uploadResult?.fileName || null,
      downloadURL: uploadResult?.downloadURL || null,
      storageProvider: uploadResult?.provider || null,
      fallbackReason: uploadResult?.fallbackReason || null,
      uploadedAt: new Date(),
      status: 'active'
    });
    
    console.log('✅ Result saved to Firestore with ID:', docRef.id);
    return { success: true, id: docRef.id, downloadURL: uploadResult?.downloadURL };
  } catch (error: any) {
    console.error('❌ Add result error:', error);
    return { success: false, error: error.message };
  }
};

export const getResults = async (filters?: {
  studentId?: string;
  studentClass?: string;
  examType?: string;
  status?: string;
  adminId?: string;
}) => {
  try {
    console.log('🔍 Fetching results with filters:', filters);
    let q: any = collection(db, 'results');
    
    if (filters) {
      const constraints = [];
      if (filters.studentId) {
        constraints.push(where('studentId', '==', filters.studentId));
      }
      if (filters.studentClass) {
        constraints.push(where('studentClass', '==', filters.studentClass));
      }
      if (filters.examType) {
        constraints.push(where('examType', '==', filters.examType));
      }
      if (filters.status && filters.status !== 'all') {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.adminId) {
        constraints.push(where('adminId', '==', filters.adminId));
      }
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }
    
    const querySnapshot = await getDocs(q);
    const results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    
    console.log(`📊 Found ${results.length} results:`, results.map(r => ({ 
      id: r.id, 
      studentName: r.studentName, 
      examType: r.examType,
      percentage: r.percentage 
    })));
    return { success: true, results };
  } catch (error: any) {
    console.error('❌ Get results error:', error);
    return { success: false, error: error.message };
  }
};

export const updateResult = async (resultId: string, updateData: {
  subjects?: Array<{
    subjectName: string;
    marksObtained: number;
    maxMarks: number;
    grade?: string;
  }>;
  totalMarks?: number;
  maxTotalMarks?: number;
  percentage?: number;
  fileName?: string;
  fileUri?: string;
  fileType?: string;
}) => {
  try {
    const resultRef = doc(db, 'results', resultId);
    
    // Upload new file if provided
    let uploadResult = null;
    if (updateData.fileUri && updateData.fileName) {
      uploadResult = await uploadFile(
        updateData.fileUri,
        updateData.fileName,
        updateData.fileType || 'application/pdf'
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }
    }
    
    // Filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    await updateDoc(resultRef, {
      ...filteredData,
      fileName: uploadResult?.fileName || updateData.fileName,
      downloadURL: uploadResult?.downloadURL,
      storageProvider: uploadResult?.provider,
      fallbackReason: uploadResult?.fallbackReason,
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Update result error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteResult = async (resultId: string, fileName?: string, storageProvider?: string) => {
  try {
    const resultRef = doc(db, 'results', resultId);
    
    // Delete file if exists
    if (fileName) {
      const deleteResult = await deleteFile(
        fileName,
        storageProvider === 'firebase' ? 'supabase' : (storageProvider as 'supabase' | undefined) || 'supabase'
      );
      
      if (!deleteResult.success) {
        console.warn('⚠️ File deletion failed:', deleteResult.error);
      }
    }
    
    await updateDoc(resultRef, {
      status: 'deleted',
      deletedAt: new Date()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Delete result error:', error);
    return { success: false, error: error.message };
  }
};

export const getResultDownloadURL = async (resultId: string, fileName: string) => {
  try {
    const result = await getStorageDownloadURL(fileName, 'supabase');
    
    if (!result.success) {
      throw new Error(result.error);
    }
    
    return { success: true, downloadURL: result.downloadURL };
  } catch (error: any) {
    console.error('Get result download URL error:', error);
    return { success: false, error: error.message };
  }
};

// Meeting Management Functions
export const addMeeting = async (meetingData: {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number; // in minutes
  meetingType: 'staff' | 'parent' | 'student' | 'general';
  location: string;
  organizerId: string;
  organizerName: string;
  attendees?: string[]; // array of user IDs
  maxAttendees?: number;
  isOnline?: boolean;
  meetingLink?: string;
  priority?: 'low' | 'medium' | 'high';
}) => {
  try {
    console.log('📅 Adding meeting...');
    console.log('📋 Meeting data:', {
      title: meetingData.title,
      date: meetingData.date,
      time: meetingData.time,
      type: meetingData.meetingType,
      organizer: meetingData.organizerName
    });

    // Filter out undefined values to prevent Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(meetingData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, 'meetings'), {
      ...filteredData,
      createdAt: new Date(),
      status: 'scheduled',
      attendees: meetingData.attendees || [],
      confirmedAttendees: []
    });
    
    console.log('✅ Meeting saved to Firestore with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('❌ Add meeting error:', error);
    return { success: false, error: error.message };
  }
};

export const getMeetings = async (filters?: {
  organizerId?: string;
  attendeeId?: string;
  status?: string;
  meetingType?: string;
  date?: string;
}) => {
  try {
    console.log('🔍 Fetching meetings with filters:', filters);
    let q: any = collection(db, 'meetings');
    
    if (filters) {
      const constraints = [];
      if (filters.organizerId) {
        constraints.push(where('organizerId', '==', filters.organizerId));
      }
      if (filters.attendeeId) {
        constraints.push(where('attendees', 'array-contains', filters.attendeeId));
      }
      if (filters.status && filters.status !== 'all') {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.meetingType) {
        constraints.push(where('meetingType', '==', filters.meetingType));
      }
      if (filters.date) {
        constraints.push(where('date', '==', filters.date));
      }
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }
    
    const querySnapshot = await getDocs(q);
    const meetings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    
    console.log(`📅 Found ${meetings.length} meetings:`, meetings.map(m => ({ 
      id: m.id, 
      title: m.title, 
      date: m.date,
      status: m.status 
    })));
    return { success: true, meetings };
  } catch (error: any) {
    console.error('❌ Get meetings error:', error);
    return { success: false, error: error.message };
  }
};

export const updateMeeting = async (meetingId: string, updateData: {
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  duration?: number;
  location?: string;
  attendees?: string[];
  maxAttendees?: number;
  isOnline?: boolean;
  meetingLink?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
}) => {
  try {
    const meetingRef = doc(db, 'meetings', meetingId);
    
    // Filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    await updateDoc(meetingRef, {
      ...filteredData,
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Update meeting error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteMeeting = async (meetingId: string) => {
  try {
    const meetingRef = doc(db, 'meetings', meetingId);
    await updateDoc(meetingRef, {
      status: 'cancelled',
      cancelledAt: new Date()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Delete meeting error:', error);
    return { success: false, error: error.message };
  }
};

export const joinMeeting = async (meetingId: string, userId: string, userName: string) => {
  try {
    const meetingRef = doc(db, 'meetings', meetingId);
    
    await updateDoc(meetingRef, {
      confirmedAttendees: arrayUnion({ userId, userName, joinedAt: new Date() })
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Join meeting error:', error);
    return { success: false, error: error.message };
  }
};

export const leaveMeeting = async (meetingId: string, userId: string) => {
  try {
    const meetingRef = doc(db, 'meetings', meetingId);
    
    // Get current meeting data
    const meetingDoc = await getDoc(meetingRef);
    if (!meetingDoc.exists()) {
      throw new Error('Meeting not found');
    }
    
    const meetingData = meetingDoc.data();
    const updatedAttendees = meetingData.confirmedAttendees?.filter(
      (attendee: any) => attendee.userId !== userId
    ) || [];
    
    await updateDoc(meetingRef, {
      confirmedAttendees: updatedAttendees
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Leave meeting error:', error);
    return { success: false, error: error.message };
  }
};

// Timetable Management Functions
export const addTimetable = async (timetableData: {
  className: string;
  classId: string;
  days: string[];
  periods: string[];
  slots: Array<{
    dayIndex: number;
    periodIndex: number;
    subject: string;
    teacherId: string;
    teacherName: string;
    room?: string;
    startTime?: string;
    endTime?: string;
  }>;
  adminId: string;
  adminName: string;
  academicYear?: string;
  semester?: string;
}) => {
  try {
    console.log('📅 Adding timetable...');
    console.log('📋 Timetable data:', {
      className: timetableData.className,
      days: timetableData.days.length,
      periods: timetableData.periods.length,
      slots: timetableData.slots.length
    });

    // Filter out undefined values to prevent Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(timetableData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, 'timetables'), {
      ...filteredData,
      createdAt: new Date(),
      status: 'active'
    });
    
    console.log('✅ Timetable saved to Firestore with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('❌ Add timetable error:', error);
    return { success: false, error: error.message };
  }
};

export const getTimetables = async (filters?: {
  className?: string;
  classId?: string;
  adminId?: string;
  status?: string;
  academicYear?: string;
}) => {
  try {
    console.log('🔍 Fetching timetables with filters:', filters);
    let q: any = collection(db, 'timetables');
    
    if (filters) {
      const constraints = [];
      if (filters.className) {
        constraints.push(where('className', '==', filters.className));
      }
      if (filters.classId) {
        constraints.push(where('classId', '==', filters.classId));
      }
      if (filters.adminId) {
        constraints.push(where('adminId', '==', filters.adminId));
      }
      if (filters.status && filters.status !== 'all') {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.academicYear) {
        constraints.push(where('academicYear', '==', filters.academicYear));
      }
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }
    
    const querySnapshot = await getDocs(q);
    const timetables = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    
    console.log(`📅 Found ${timetables.length} timetables:`, timetables.map(t => ({ 
      id: t.id, 
      className: t.className,
      days: t.days?.length || 0,
      periods: t.periods?.length || 0
    })));
    return { success: true, timetables };
  } catch (error: any) {
    console.error('❌ Get timetables error:', error);
    return { success: false, error: error.message };
  }
};

export const updateTimetable = async (timetableId: string, updateData: {
  days?: string[];
  periods?: string[];
  slots?: Array<{
    dayIndex: number;
    periodIndex: number;
    subject: string;
    teacherId: string;
    teacherName: string;
    room?: string;
    startTime?: string;
    endTime?: string;
  }>;
  academicYear?: string;
  semester?: string;
  status?: 'active' | 'inactive';
}) => {
  try {
    const timetableRef = doc(db, 'timetables', timetableId);
    
    // Filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    await updateDoc(timetableRef, {
      ...filteredData,
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Update timetable error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteTimetable = async (timetableId: string) => {
  try {
    const timetableRef = doc(db, 'timetables', timetableId);
    await updateDoc(timetableRef, {
      status: 'deleted',
      deletedAt: new Date()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Delete timetable error:', error);
    return { success: false, error: error.message };
  }
};

export const getTimetableForClass = async (classId: string, academicYear?: string) => {
  try {
    let q: any = collection(db, 'timetables');
    const constraints = [where('classId', '==', classId), where('status', '==', 'active')];
    
    if (academicYear) {
      constraints.push(where('academicYear', '==', academicYear));
    }
    
    q = query(q, ...constraints);
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const timetable = {
        id: querySnapshot.docs[0].id,
        ...(querySnapshot.docs[0].data() as any)
      };
      return { success: true, timetable };
    }
    
    return { success: false, error: 'No timetable found for this class' };
  } catch (error: any) {
    console.error('Get timetable for class error:', error);
    return { success: false, error: error.message };
  }
};

// Complaint Management Functions
export const addComplaint = async (complaintData: {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  studentId: string;
  studentName: string;
  studentClass?: string;
  attachments?: string[];
}) => {
  try {
    console.log('📝 Adding complaint...');
    console.log('📋 Complaint data:', {
      title: complaintData.title,
      category: complaintData.category,
      priority: complaintData.priority,
      studentName: complaintData.studentName
    });

    // Filter out undefined values to prevent Firestore errors
    const filteredData = Object.fromEntries(
      Object.entries(complaintData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, 'complaints'), {
      ...filteredData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      adminResponse: null,
      adminId: null,
      adminName: null,
      resolvedAt: null
    });
    
    console.log('✅ Complaint saved to Firestore with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('❌ Add complaint error:', error);
    return { success: false, error: error.message };
  }
};

export const getComplaints = async (filters?: {
  studentId?: string;
  status?: string;
  priority?: string;
  category?: string;
  adminId?: string;
}) => {
  try {
    console.log('🔍 Fetching complaints with filters:', filters);
    let q: any = collection(db, 'complaints');
    
    if (filters) {
      const constraints = [];
      if (filters.studentId) {
        constraints.push(where('studentId', '==', filters.studentId));
      }
      if (filters.status && filters.status !== 'all') {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.priority && filters.priority !== 'all') {
        constraints.push(where('priority', '==', filters.priority));
      }
      if (filters.category && filters.category !== 'all') {
        constraints.push(where('category', '==', filters.category));
      }
      if (filters.adminId) {
        constraints.push(where('adminId', '==', filters.adminId));
      }
      
      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }
    
    const querySnapshot = await getDocs(q);
    const complaints = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as any)
    }));
    
    console.log(`📝 Found ${complaints.length} complaints:`, complaints.map(c => ({ 
      id: c.id, 
      title: c.title,
      status: c.status,
      priority: c.priority,
      studentName: c.studentName
    })));
    return { success: true, complaints };
  } catch (error: any) {
    console.error('❌ Get complaints error:', error);
    return { success: false, error: error.message };
  }
};

export const updateComplaint = async (complaintId: string, updateData: {
  status?: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  adminResponse?: string;
  adminId?: string;
  adminName?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
}) => {
  try {
    const complaintRef = doc(db, 'complaints', complaintId);
    
    // Filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    // Add resolvedAt timestamp if status is being changed to resolved
    if (updateData.status === 'resolved') {
      filteredData.resolvedAt = new Date().toISOString();
    }
    
    await updateDoc(complaintRef, {
      ...filteredData,
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Update complaint error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteComplaint = async (complaintId: string) => {
  try {
    const complaintRef = doc(db, 'complaints', complaintId);
    await updateDoc(complaintRef, {
      status: 'deleted',
      deletedAt: new Date()
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Delete complaint error:', error);
    return { success: false, error: error.message };
  }
};

export const getComplaintStats = async () => {
  try {
    const result = await getComplaints();
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    const complaints = result.complaints || [];
    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'pending').length,
      inProgress: complaints.filter(c => c.status === 'in-progress').length,
      resolved: complaints.filter(c => c.status === 'resolved').length,
      rejected: complaints.filter(c => c.status === 'rejected').length,
      highPriority: complaints.filter(c => c.priority === 'high').length,
      mediumPriority: complaints.filter(c => c.priority === 'medium').length,
      lowPriority: complaints.filter(c => c.priority === 'low').length,
    };
    
    return { success: true, stats };
  } catch (error: any) {
    console.error('Get complaint stats error:', error);
    return { success: false, error: error.message };
  }
};