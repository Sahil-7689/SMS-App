import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  Modal,
  Animated,
  Pressable,
  AppState
} from 'react-native';
import { Easing } from 'react-native';
import {
  Calendar as CalendarIcon
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { auth, getStudents, getClasses, submitAttendance, addClass, getNotices } from '../../../config/firebase';
// [REMOVE] import { useTheme } from '../../../context/ThemeContext';
// Removed Picker import - will use TouchableOpacity dropdown instead

const { width } = Dimensions.get('window');

const darkTheme = {
  background: '#181A20',
  card: '#232136',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  accent: '#A259FF', // purple accent
  border: '#232136',
  muted: '#353945',
  purple: '#A259FF',
  gray: '#7B7B7B',
};


const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];



export default function DashboardScreen() {
  // [REMOVE] const { theme, toggleTheme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed)
  const [currentYear, setCurrentYear] = useState(2024);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const today = new Date();
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const currentDate = isCurrentMonth ? today.getDate() : null;
  const [profileVisible, setProfileVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'account'
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [attendanceData, setAttendanceData] = useState<{[key: string]: string}>({});
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classDropdownVisible, setClassDropdownVisible] = useState(false);
  const [mainClassDropdownVisible, setMainClassDropdownVisible] = useState(false);
  const [addClassModalVisible, setAddClassModalVisible] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassSubject, setNewClassSubject] = useState('');
  const [newClassSchedule, setNewClassSchedule] = useState('');
  const [newClassRoom, setNewClassRoom] = useState('');
  const [addingClass, setAddingClass] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const router = useRouter();

  // Fetch notices on component mount
  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoadingNotices(true);
      // Fetch notices for teachers specifically AND notices for all audiences
      const teachersResult = await getNotices({ 
        status: 'active',
        targetAudience: 'teachers'
      });
      
      const allResult = await getNotices({ 
        status: 'active',
        targetAudience: 'all'
      });
      
      if (teachersResult.success && allResult.success) {
        // Combine and deduplicate notices
        const allNotices = [...(teachersResult.notices || []), ...(allResult.notices || [])];
        const uniqueNotices = allNotices.filter((notice, index, self) => 
          index === self.findIndex(n => n.id === notice.id)
        );
        setNotices(uniqueNotices);
        console.log('Fetched notices:', uniqueNotices.length, 'notices');
      } else {
        console.error('Failed to fetch notices:', teachersResult.error || allResult.error);
      }
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoadingNotices(false);
    }
  };

  // Notice interface
  interface Notice {
    id?: string;
    title: string;
    content: string;
    adminId?: string;
    adminName?: string;
    priority?: 'low' | 'medium' | 'high';
    targetAudience?: 'all' | 'teachers' | 'students' | 'parents';
    createdAt?: any;
    status?: string;
  }

  // Example teacher details with expanded information
  interface TeacherDetails {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    department?: string;
    status?: string;
    fullName?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    address?: string;
    displayName?: string;
    accountCreated?: string;
    lastLogin?: string;
    membershipStatus?: string;
    accountVerification?: string;
    languagePreference?: string;
  }
  const teacherDetails: TeacherDetails = {}; // TODO: Inject teacher details from API or context

  // Fetch classes for the teacher
  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No authenticated user found');
        return;
      }

      console.log('Fetching classes for teacher ID:', currentUser.uid);
      const result = await getClasses(currentUser.uid);
      console.log('Classes fetch result:', result);
      
      if (result.success) {
        setClasses(result.classes || []);
        console.log('Classes set:', result.classes);
        if (result.classes && result.classes.length > 0) {
          setSelectedClass(result.classes[0].name);
          setSelectedClassId(result.classes[0].id);
          console.log('Selected first class:', result.classes[0]);
        } else {
          console.log('No classes found for this teacher');
        }
      } else {
        console.error('Failed to fetch classes:', result.error);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setMainClassDropdownVisible(false);
      setClassDropdownVisible(false);
    };

    // Add event listener for clicks outside
    const subscription = AppState.addEventListener('change', handleClickOutside);
    return () => subscription?.remove();
  }, []);

  // Close main dropdown when class changes
  useEffect(() => {
    setMainClassDropdownVisible(false);
  }, [selectedClassId]);

  // Fetch students for the selected class
  const fetchStudents = async (classId: string) => {
    try {
      setLoadingStudents(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No authenticated user found');
        return;
      }

      console.log('🔍 Fetching students with filters:', {
        className: selectedClass,
        teacherId: currentUser.uid
      });

      const result = await getStudents({ 
        className: selectedClass,
        teacherId: currentUser.uid 
      });
      
      console.log('📊 Students fetch result:', result);
      
      if (result.success) {
        console.log(`✅ Found ${result.students?.length || 0} students`);
        setStudents(result.students || []);
        // Initialize attendance data
        const initialAttendance: {[key: string]: string} = {};
        result.students?.forEach((student: any) => {
          initialAttendance[student.id] = 'present'; // Default to present
        });
        setAttendanceData(initialAttendance);
      } else {
        console.error('❌ Failed to fetch students:', result.error);
      }
    } catch (error) {
      console.error('❌ Error fetching students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Load classes when component mounts
  React.useEffect(() => {
    fetchClasses();
  }, []);

  // Load students when class changes
  React.useEffect(() => {
    if (selectedClassId) {
      fetchStudents(selectedClassId);
    }
  }, [selectedClassId]);

  // Attendance functions
  const handleTakeAttendance = () => {
    if (!selectedClassId) {
      alert('Please select a class first');
      return;
    }
    setAttendanceModalVisible(true);
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('No authenticated user found');
        return;
      }

      const attendanceStudents = students.map(student => ({
        studentId: student.id,
        studentName: student.name || student.fullName,
        rollNo: student.rollNo || student.rollNumber,
        status: (attendanceData[student.id] || 'present') as 'present' | 'absent' | 'late'
      }));

      const attendanceDataToSubmit = {
        classId: selectedClassId,
        className: selectedClass,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        teacherId: currentUser.uid,
        teacherName: teacherDetails.name || 'Unknown Teacher',
        students: attendanceStudents
      };

      const result = await submitAttendance(attendanceDataToSubmit);
      if (result.success) {
        alert('Attendance submitted successfully!');
        setAttendanceModalVisible(false);
      } else {
        alert('Failed to submit attendance: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('Error submitting attendance. Please try again.');
    }
  };

  // Marks modal state
  const [marksModalVisible, setMarksModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [marks, setMarks] = useState<{ [studentId: number]: string }>({});
  const subjects = ['Math', 'Science', 'English', 'Social Studies']; // TODO: Inject from API or context

  const handleOpenMarksModal = () => {
    setMarksModalVisible(true);
    setSelectedSubject(subjects[0] || '');
    setMarks({});
  };
  const handleSetMark = (studentId: number, value: string) => {
    setMarks(prev => ({ ...prev, [studentId]: value }));
  };
  const handleSubmitMarks = () => {
    // TODO: Send marks to backend
    setMarksModalVisible(false);
    alert('Marks submitted!');
  };

  const handleAddClass = async () => {
    try {
      setAddingClass(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('No authenticated user found');
        return;
      }

      if (!newClassName.trim() || !newClassSubject.trim()) {
        alert('Please fill in class name and subject');
        return;
      }

                      const classData: any = {
                  name: newClassName.trim(),
                  subject: newClassSubject.trim(),
                  teacherId: currentUser.uid,
                  teacherName: teacherDetails.name || 'Unknown Teacher',
                };

                // Only add optional fields if they have values
                if (newClassSchedule.trim()) {
                  classData.schedule = newClassSchedule.trim();
                }
                if (newClassRoom.trim()) {
                  classData.room = newClassRoom.trim();
                }

      const result = await addClass(classData);
      if (result.success) {
        alert('Class added successfully!');
        setAddClassModalVisible(false);
        // Reset form
        setNewClassName('');
        setNewClassSubject('');
        setNewClassSchedule('');
        setNewClassRoom('');
        // Refresh classes list
        fetchClasses();
      } else {
        alert('Failed to add class: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding class:', error);
      alert('Error adding class. Please try again.');
    } finally {
      setAddingClass(false);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.calendarDay} />
      );
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === currentDate;
      const isSelected = day === selectedDate;
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isToday && styles.todayHighlight,
            isSelected && styles.selectedDay
          ]}
          onPress={() => setSelectedDate(day)}
        >
          <Text style={[
            styles.calendarDayText,
            isToday && styles.todayText,
            isSelected && styles.selectedText
          ]}>{day}</Text>
        </TouchableOpacity>
      );
    }
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const openProfile = () => {
    setProfileVisible(true);
    scaleAnim.setValue(0.95);
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeProfile = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start(() => setProfileVisible(false));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: darkTheme.background }}>
      <StatusBar barStyle="light-content" backgroundColor={darkTheme.background} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.avatarCircle} onPress={openProfile}>
            <Image source={require('../../../assets/images/icon.png')} style={{ width: 36, height: 36, borderRadius: 18 }} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.teacherName}>{teacherDetails.name || 'Loading...'}</Text>
            <Text style={styles.teacherTitle}>{teacherDetails.role || 'Loading...'}</Text>
          </View>
        </View>

        {/* Main Class Selector */}
        <View style={styles.mainClassSelector}>
          <Text style={styles.mainClassSelectorLabel}>Current Class:</Text>
          <TouchableOpacity 
            style={styles.mainClassSelectorBtn}
            onPress={() => setMainClassDropdownVisible(!mainClassDropdownVisible)}
          >
            <Text style={styles.mainClassSelectorText}>
              {loadingClasses ? 'Loading classes...' : selectedClass || 'Select Class'}
            </Text>
            <FontAwesome name="chevron-down" size={16} color="#B0B0B0" />
          </TouchableOpacity>
          
                        {/* Main Class Dropdown */}
              {mainClassDropdownVisible && (
                <Pressable 
                  style={styles.dropdownOverlay} 
                  onPress={() => setMainClassDropdownVisible(false)}
                >
                  <View style={styles.mainClassDropdown}>
                    <ScrollView style={styles.mainClassDropdownList} showsVerticalScrollIndicator={false}>
                      {classes.length === 0 ? (
                        <View style={styles.emptyDropdownItem}>
                          <Text style={styles.emptyDropdownText}>No classes available</Text>
                        </View>
                      ) : (
                        classes.map((classItem) => (
                          <TouchableOpacity
                            key={classItem.id}
                            style={[
                              styles.mainClassDropdownItem,
                              selectedClassId === classItem.id && styles.mainClassDropdownItemSelected
                            ]}
                            onPress={() => {
                              setSelectedClass(classItem.name);
                              setSelectedClassId(classItem.id);
                              setMainClassDropdownVisible(false);
                            }}
                          >
                            <Text style={[
                              styles.mainClassDropdownItemText,
                              selectedClassId === classItem.id && styles.mainClassDropdownItemTextSelected
                            ]}>
                              {classItem.name}
                            </Text>
                            {selectedClassId === classItem.id && (
                              <FontAwesome name="check" size={14} color="#4ADE80" />
                            )}
                          </TouchableOpacity>
                        ))
                      )}
                    </ScrollView>
                  </View>
                </Pressable>
              )}
        </View>

        {/* Add Class Button */}
        <TouchableOpacity 
          style={styles.addClassButton}
          onPress={() => setAddClassModalVisible(true)}
        >
          <FontAwesome name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.addClassButtonText}>Add New Class</Text>
        </TouchableOpacity>
        {/* Profile Modal */}
        <Modal
          visible={profileVisible}
          animationType="none"
          transparent={true}
          onRequestClose={closeProfile}
        >
          <Pressable style={styles.profileOverlay} onPress={closeProfile}>
            <Animated.View style={[
              styles.profilePopupContainer,
              { transform: [{ scale: scaleAnim }], opacity: opacityAnim }
            ]}
              onStartShouldSetResponder={() => true}
              onTouchEnd={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <TouchableOpacity style={styles.closeButton} onPress={closeProfile}>
                <FontAwesome name="times" size={20} color="#B0B0B0" />
              </TouchableOpacity>

              {/* Header Section */}
              <View style={styles.profileHeader}>
                <TouchableOpacity activeOpacity={0.8} style={styles.profileAvatarWrapper}>
                  <Image source={require('../../../assets/images/icon.png')} style={styles.profileAvatar} />
                  <View style={styles.profileAvatarUploadIcon}>
                    <FontAwesome name="camera" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
                <View style={styles.profileHeaderInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.profileDisplayName}>{teacherDetails.fullName || 'Loading...'}</Text>
                    <FontAwesome name="check-circle" size={16} color="#4ADE80" style={styles.verificationBadge} />
                  </View>
                  <Text style={styles.profileEmail}>{teacherDetails.email || 'Loading...'}</Text>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.profileDivider} />

              {/* Tab Navigation */}
              <View style={styles.tabContainer}>
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === 'personal' && styles.activeTabButton]}
                  onPress={() => setActiveTab('personal')}
                >
                  <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText]}>Personal Details</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === 'account' && styles.activeTabButton]}
                  onPress={() => setActiveTab('account')}
                >
                  <Text style={[styles.tabText, activeTab === 'account' && styles.activeTabText]}>Account Details</Text>
                </TouchableOpacity>
              </View>

              {/* Tab Content */}
              <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'personal' ? (
                  <View style={styles.personalDetails}>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Full Name</Text>
                        <Text style={styles.infoValue}>{teacherDetails.fullName || 'Loading...'}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Date of Birth</Text>
                        <Text style={styles.infoValue}>{teacherDetails.dateOfBirth || 'Loading...'}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Gender</Text>
                        <Text style={styles.infoValue}>{teacherDetails.gender || 'Loading...'}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Nationality</Text>
                        <Text style={styles.infoValue}>{teacherDetails.nationality || 'Loading...'}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Address</Text>
                        <View style={styles.addressRow}>
                          <FontAwesome name="map-marker" size={14} color="#B0B0B0" style={styles.addressIcon} />
                          <Text style={styles.infoValue}>{teacherDetails.address || 'Loading...'}</Text>
                        </View>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Phone Number</Text>
                        <Text style={styles.infoValue}>{teacherDetails.phone || 'Loading...'}</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.accountDetails}>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Display Name</Text>
                        <Text style={styles.infoValue}>{teacherDetails.displayName || 'Loading...'}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Account Created</Text>
                        <Text style={styles.infoValue}>{teacherDetails.accountCreated || 'Loading...'}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Last Login</Text>
                        <Text style={styles.infoValue}>{teacherDetails.lastLogin || 'Loading...'}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Membership Status</Text>
                        <View style={styles.statusRow}>
                          <View style={[styles.statusBadge, { backgroundColor: '#A259FF' }]}>
                            <Text style={styles.statusBadgeText}>{teacherDetails.membershipStatus || 'Loading...'}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Account Verification</Text>
                        <View style={styles.statusRow}>
                          <FontAwesome name="check-circle" size={16} color="#4ADE80" style={styles.verificationIcon} />
                          <Text style={styles.infoValue}>{teacherDetails.accountVerification || 'Loading...'}</Text>
                        </View>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Language Preference</Text>
                        <Text style={styles.infoValue}>{teacherDetails.languagePreference || 'Loading...'}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Footer */}
              <View style={styles.profileFooter}>
                <TouchableOpacity
                  style={styles.profileLogoutBtn}
                  activeOpacity={0.85}
                  onPress={() => { setProfileVisible(false); router.replace('/role'); }}
                >
                  <FontAwesome name="sign-out" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.profileLogoutText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Pressable>
        </Modal>

        {/* Attendance Modal */}
        <Modal
          visible={attendanceModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAttendanceModalVisible(false)}
        >
          <View style={styles.attendanceModalOverlay}>
            <View style={styles.attendanceModalContent}>
              <View style={styles.attendanceModalHeader}>
                <Text style={styles.attendanceModalTitle}>Take Attendance</Text>
                <TouchableOpacity onPress={() => setAttendanceModalVisible(false)}>
                  <FontAwesome name="times" size={20} color="#B0B0B0" />
                </TouchableOpacity>
              </View>
              
                                                          <View style={styles.classSelector}>
                 <Text style={styles.classSelectorLabel}>Select Class:</Text>
                 <TouchableOpacity 
                   style={styles.classSelectorBtn}
                   onPress={() => setClassDropdownVisible(!classDropdownVisible)}
                 >
                   <Text style={styles.classSelectorText}>
                     {loadingClasses ? 'Loading classes...' : selectedClass || 'Select Class'}
                   </Text>
                   <FontAwesome name="chevron-down" size={16} color="#B0B0B0" />
                 </TouchableOpacity>
                 
                 {/* Class Dropdown */}
                 {classDropdownVisible && (
                   <Pressable 
                     style={styles.dropdownOverlay} 
                     onPress={() => setClassDropdownVisible(false)}
                   >
                     <View style={styles.classDropdown}>
                       <ScrollView style={styles.classDropdownList} showsVerticalScrollIndicator={false}>
                         {classes.length === 0 ? (
                           <View style={styles.emptyDropdownItem}>
                             <Text style={styles.emptyDropdownText}>No classes available</Text>
                           </View>
                         ) : (
                           classes.map((classItem) => (
                             <TouchableOpacity
                               key={classItem.id}
                               style={[
                                 styles.classDropdownItem,
                                 selectedClassId === classItem.id && styles.classDropdownItemSelected
                               ]}
                               onPress={() => {
                                 setSelectedClass(classItem.name);
                                 setSelectedClassId(classItem.id);
                                 setClassDropdownVisible(false);
                               }}
                             >
                               <Text style={[
                                 styles.classDropdownItemText,
                                 selectedClassId === classItem.id && styles.classDropdownItemTextSelected
                               ]}>
                                 {classItem.name}
                               </Text>
                               {selectedClassId === classItem.id && (
                                 <FontAwesome name="check" size={14} color="#4ADE80" />
                               )}
                             </TouchableOpacity>
                           ))
                         )}
                       </ScrollView>
                     </View>
                   </Pressable>
                 )}
               </View>

                             <ScrollView style={styles.studentsList} showsVerticalScrollIndicator={false}>
                 {loadingStudents ? (
                   <View style={styles.loadingContainer}>
                     <Text style={styles.loadingText}>Loading students...</Text>
                   </View>
                 ) : students.length === 0 ? (
                   <View style={styles.emptyContainer}>
                     <Text style={styles.emptyText}>No students found in this class.</Text>
                   </View>
                 ) : (
                   students.map((student) => (
                     <View key={student.id} style={styles.studentRow}>
                       <View style={styles.studentInfo}>
                         <Text style={styles.studentName}>{student.name || student.fullName}</Text>
                         <Text style={styles.studentRollNo}>Roll No: {student.rollNo || student.rollNumber}</Text>
                       </View>
                       <View style={styles.attendanceButtons}>
                         <TouchableOpacity
                           style={[
                             styles.attendanceBtn,
                             attendanceData[student.id] === 'present' && styles.attendanceBtnActive
                           ]}
                           onPress={() => handleAttendanceChange(student.id, 'present')}
                         >
                           <Text style={[
                             styles.attendanceBtnText,
                             attendanceData[student.id] === 'present' && styles.attendanceBtnTextActive
                           ]}>Present</Text>
                         </TouchableOpacity>
                         <TouchableOpacity
                           style={[
                             styles.attendanceBtn,
                             attendanceData[student.id] === 'absent' && styles.attendanceBtnActive
                           ]}
                           onPress={() => handleAttendanceChange(student.id, 'absent')}
                         >
                           <Text style={[
                             styles.attendanceBtnText,
                             attendanceData[student.id] === 'absent' && styles.attendanceBtnTextActive
                           ]}>Absent</Text>
                         </TouchableOpacity>
                         <TouchableOpacity
                           style={[
                             styles.attendanceBtn,
                             attendanceData[student.id] === 'late' && styles.attendanceBtnActive
                           ]}
                           onPress={() => handleAttendanceChange(student.id, 'late')}
                         >
                           <Text style={[
                             styles.attendanceBtnText,
                             attendanceData[student.id] === 'late' && styles.attendanceBtnTextActive
                           ]}>Late</Text>
                         </TouchableOpacity>
                       </View>
                     </View>
                   ))
                 )}
               </ScrollView>

              <View style={styles.attendanceModalFooter}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setAttendanceModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmitAttendance}
                >
                  <Text style={styles.submitBtnText}>Submit Attendance</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Marks Modal */}
        <Modal
          visible={marksModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setMarksModalVisible(false)}
        >
          <View style={styles.attendanceModalOverlay}>
            <View style={styles.attendanceModalContent}>
              <View style={styles.attendanceModalHeader}>
                <Text style={styles.attendanceModalTitle}>Add Subject-wise Marks</Text>
                <TouchableOpacity onPress={() => setMarksModalVisible(false)}>
                  <FontAwesome name="times" size={20} color="#B0B0B0" />
                </TouchableOpacity>
              </View>
              <View style={styles.classSelector}>
                <Text style={styles.classSelectorLabel}>Select Subject:</Text>
                <TouchableOpacity 
                  style={styles.subjectSelectorBtn}
                  onPress={() => {
                    // Simple subject selection - you can enhance this with a modal
                    const currentIndex = subjects.indexOf(selectedSubject);
                    const nextIndex = (currentIndex + 1) % subjects.length;
                    setSelectedSubject(subjects[nextIndex]);
                  }}
                >
                  <Text style={styles.subjectSelectorText}>{selectedSubject || 'Select Subject'}</Text>
                  <FontAwesome name="chevron-down" size={16} color="#B0B0B0" />
                </TouchableOpacity>
              </View>
                             <ScrollView style={styles.studentsList} showsVerticalScrollIndicator={false}>
                 {loadingStudents ? (
                   <View style={styles.loadingContainer}>
                     <Text style={styles.loadingText}>Loading students...</Text>
                   </View>
                 ) : students.length === 0 ? (
                   <View style={styles.emptyContainer}>
                     <Text style={styles.emptyText}>No students found in this class.</Text>
                   </View>
                 ) : (
                   students.map(student => (
                     <View key={student.id} style={styles.studentRow}>
                       <View style={styles.studentInfo}>
                         <Text style={styles.studentName}>{student.name || student.fullName}</Text>
                         <Text style={styles.studentRollNo}>Roll No: {student.rollNo || student.rollNumber}</Text>
                       </View>
                       <TextInput
                         style={styles.marksInput}
                         placeholder="Marks"
                         placeholderTextColor="#A0A0A0"
                         keyboardType="numeric"
                         value={marks[student.id] || ''}
                         onChangeText={value => handleSetMark(student.id, value)}
                       />
                     </View>
                   ))
                 )}
               </ScrollView>
              <View style={styles.attendanceModalFooter}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setMarksModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmitMarks}
                >
                  <Text style={styles.submitBtnText}>Submit Marks</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Class Modal */}
        <Modal
          visible={addClassModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAddClassModalVisible(false)}
        >
          <View style={styles.attendanceModalOverlay}>
            <View style={styles.attendanceModalContent}>
              <View style={styles.attendanceModalHeader}>
                <Text style={styles.attendanceModalTitle}>Add New Class</Text>
                <TouchableOpacity onPress={() => setAddClassModalVisible(false)}>
                  <FontAwesome name="times" size={20} color="#B0B0B0" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.addClassForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Class Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Class 10A, Grade 9B"
                    placeholderTextColor="#A0A0A0"
                    value={newClassName}
                    onChangeText={setNewClassName}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Subject *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Mathematics, Science, English"
                    placeholderTextColor="#A0A0A0"
                    value={newClassSubject}
                    onChangeText={setNewClassSubject}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Schedule (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Monday, Wednesday, Friday - 9:00 AM"
                    placeholderTextColor="#A0A0A0"
                    value={newClassSchedule}
                    onChangeText={setNewClassSchedule}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Room (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., Room 101, Lab 2"
                    placeholderTextColor="#A0A0A0"
                    value={newClassRoom}
                    onChangeText={setNewClassRoom}
                  />
                </View>
              </View>
              
              <View style={styles.attendanceModalFooter}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setAddClassModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, addingClass && styles.submitBtnDisabled]}
                  onPress={handleAddClass}
                  disabled={addingClass}
                >
                  <Text style={styles.submitBtnText}>
                    {addingClass ? 'Adding...' : 'Add Class'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Group Actions */}
        <View style={styles.groupActionsRow}>
          <TouchableOpacity style={styles.groupActionBtn} onPress={handleTakeAttendance}>
            <FontAwesome name="check-circle" size={16} color="#fff" />
            <Text style={styles.groupActionText}>Take Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.groupActionBtn} onPress={handleOpenMarksModal}>
            <FontAwesome name="pencil" size={16} color="#fff" />
            <Text style={styles.groupActionText}>Marks</Text>
          </TouchableOpacity>
        </View>

                 {/* Calendar Widget */}
         <Text style={styles.sectionHeading}>Event Calendar</Text>
         <View style={styles.calendarCard}>
           <View style={styles.calendarHeader}>
             <TouchableOpacity onPress={() => navigateMonth('prev')}>
               <Text style={styles.calendarNav}>{'<'}</Text>
             </TouchableOpacity>
             <Text style={styles.calendarMonth}>{months[currentMonth]} {currentYear}</Text>
             <TouchableOpacity onPress={() => navigateMonth('next')}>
               <Text style={styles.calendarNav}>{'>'}</Text>
             </TouchableOpacity>
           </View>
           <View style={styles.weekHeader}>
             {weekDays.map((d, i) => (
               <Text key={`${d}-${i}`} style={styles.weekDay}>{d}</Text>
             ))}
           </View>
           <View style={styles.calendarGrid}>{renderCalendar()}</View>
         </View>

         {/* Notice Board */}
         <Text style={styles.sectionHeading}>Notice Board</Text>
         <View style={styles.noticeBoardCard}>
           <View style={styles.noticeBoardHeader}>
             <FontAwesome name="bullhorn" size={20} color={darkTheme.accent} />
             <Text style={styles.noticeBoardTitle}>Latest Notices</Text>
           </View>
           <View style={styles.noticeList}>
             {loadingNotices ? (
               <Text style={styles.noticeContent}>Loading notices...</Text>
             ) : notices.length === 0 ? (
               <Text style={styles.noticeContent}>No notices available.</Text>
             ) : (
               notices.map((notice, index) => {
                 const priorityColors = {
                   high: '#FF6B6B',
                   medium: '#4ECDC4',
                   low: '#45B7D1'
                 };
                 
                 const priorityText = {
                   high: 'High Priority',
                   medium: 'Medium Priority',
                   low: 'Low Priority'
                 };

                 const noticeDate = notice.createdAt ? 
                   new Date(notice.createdAt.toDate()).toLocaleDateString('en-US', { 
                     month: 'short', 
                     day: 'numeric', 
                     year: 'numeric' 
                   }) : 'Recent';

                 return (
                   <View key={notice.id || index} style={styles.noticeItem}>
                     <View style={styles.noticeItemHeader}>
                       <Text style={styles.noticeTitle}>{notice.title}</Text>
                       <Text style={styles.noticeDate}>{noticeDate}</Text>
                     </View>
                     <Text style={styles.noticeContent}>
                       {notice.content}
                     </Text>
                     <View style={styles.noticePriority}>
                       <View style={[
                         styles.priorityBadge, 
                         { backgroundColor: priorityColors[notice.priority || 'medium'] }
                       ]}>
                         <Text style={styles.priorityText}>
                           {priorityText[notice.priority || 'medium']}
                         </Text>
                       </View>
                     </View>
                   </View>
                 );
               })
             )}
           </View>
         </View>


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: darkTheme.muted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherName: {
    color: darkTheme.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  teacherTitle: {
    color: darkTheme.accent,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },

  sectionHeading: {
    color: darkTheme.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 18,
    marginBottom: 10,
  },
  groupActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 18,
  },
  groupActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 4,
  },
  groupActionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },

  calendarCard: {
    backgroundColor: darkTheme.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calendarMonth: {
    color: darkTheme.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  calendarNav: {
    color: darkTheme.accent,
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekDay: {
    flex: 1,
    color: darkTheme.textSecondary,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: (width - 72) / 7,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  calendarDayText: {
    color: darkTheme.textSecondary,
    fontSize: 15,
  },
  todayHighlight: {
    backgroundColor: darkTheme.accent,
    borderRadius: 18,
    width: (width - 72) / 7,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  selectedDay: {
    borderWidth: 2,
    borderColor: darkTheme.accent,
    borderRadius: 18,
  },
  selectedText: {
    color: darkTheme.accent,
    fontWeight: 'bold',
  },
  noticeBoardCard: {
    backgroundColor: darkTheme.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
  },
  noticeBoardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  noticeBoardTitle: {
    color: darkTheme.text,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  noticeList: {
    gap: 12,
  },
  noticeItem: {
    backgroundColor: darkTheme.muted,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: darkTheme.accent,
  },
  noticeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeTitle: {
    color: darkTheme.text,
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  noticeDate: {
    color: darkTheme.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  noticeContent: {
    color: darkTheme.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  noticePriority: {
    alignItems: 'flex-start',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },


  profileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePopupContainer: {
    width: 360,
    maxWidth: '90%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  profileHeaderInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verificationBadge: {
    marginLeft: 8,
  },
  profileAvatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#A259FF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#23262F',
    overflow: 'hidden',
  },
  profileAvatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    resizeMode: 'cover',
  },
  profileAvatarUploadIcon: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  profileDisplayName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    color: '#B0B0B0',
    fontSize: 14,
    marginBottom: 0,
  },
  profileDivider: {
    height: 1,
    width: '100%',
    backgroundColor: '#333333',
    marginVertical: 0,
    alignSelf: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#A259FF',
  },
  tabText: {
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 24,
    maxHeight: 300,
  },
  personalDetails: {
    paddingBottom: 16,
  },
  accountDetails: {
    paddingBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 16,
  },
  infoLabel: {
    color: '#B0B0B0',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIcon: {
    marginRight: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  verificationIcon: {
    marginRight: 6,
  },
  profileFooter: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  profileLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  profileLogoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Attendance Modal Styles
  attendanceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
  },
  attendanceModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  attendanceModalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  classSelector: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  classSelectorLabel: {
    color: '#B0B0B0',
    fontSize: 14,
    marginBottom: 8,
  },
  classSelectorBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#23262F',
    padding: 12,
    borderRadius: 8,
  },
  classSelectorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  studentsList: {
    padding: 20,
    maxHeight: 400,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  studentRollNo: {
    color: '#B0B0B0',
    fontSize: 14,
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  attendanceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: 'transparent',
  },
  attendanceBtnActive: {
    backgroundColor: '#A259FF',
    borderColor: '#A259FF',
  },
  attendanceBtnText: {
    color: '#B0B0B0',
    fontSize: 12,
    fontWeight: '500',
  },
  attendanceBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  attendanceModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  cancelBtnText: {
    color: '#B0B0B0',
    fontSize: 16,
    fontWeight: '500',
  },
  submitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#A259FF',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  profileAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 18,
  },
  profileNameLarge: {
    color: darkTheme.text,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileRoleLarge: {
    color: darkTheme.textSecondary,
    fontSize: 18,
    marginBottom: 24,
  },
  profileInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  profileInfoLabel: {
    color: darkTheme.textSecondary,
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
  profileInfoValue: {
    color: darkTheme.text,
    fontSize: 16,
  },
  logoutBtn: {
    marginTop: 40,
    backgroundColor: darkTheme.accent,
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
  closeBtnFull: {
    marginTop: 18,
    backgroundColor: darkTheme.card,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: darkTheme.textSecondary,
  },
  closeBtnTextFull: {
    color: darkTheme.textSecondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  marksInput: {
    backgroundColor: '#232136',
    color: '#fff',
    borderRadius: 8,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 70,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#353945',
  },
  subjectSelectorBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#232136',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#353945',
  },
     subjectSelectorText: {
     color: '#FFFFFF',
     fontSize: 16,
     fontWeight: '500',
   },
   loadingContainer: {
     padding: 20,
     alignItems: 'center',
     justifyContent: 'center',
   },
   loadingText: {
     color: '#B0B0B0',
     fontSize: 16,
     fontWeight: '500',
   },
   emptyContainer: {
     padding: 20,
     alignItems: 'center',
     justifyContent: 'center',
   },
   emptyText: {
     color: '#B0B0B0',
     fontSize: 16,
     fontWeight: '500',
   },
   // Main Class Selector Styles
   mainClassSelector: {
     marginHorizontal: 20,
     marginBottom: 18,
   },
   mainClassSelectorLabel: {
     color: darkTheme.textSecondary,
     fontSize: 14,
     fontWeight: '600',
     marginBottom: 8,
   },
   mainClassSelectorBtn: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     backgroundColor: darkTheme.card,
     paddingHorizontal: 16,
     paddingVertical: 12,
     borderRadius: 10,
     borderWidth: 1,
     borderColor: darkTheme.textSecondary,
   },
   mainClassSelectorText: {
     color: darkTheme.text,
     fontSize: 16,
     fontWeight: '500',
   },
   mainClassDropdown: {
     position: 'absolute',
     top: '100%',
     left: 0,
     right: 0,
     backgroundColor: darkTheme.card,
     borderRadius: 10,
     borderWidth: 1,
     borderColor: darkTheme.textSecondary,
     maxHeight: 200,
     zIndex: 1000,
     marginTop: 4,
   },
   mainClassDropdownList: {
     maxHeight: 200,
   },
   mainClassDropdownItem: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     paddingHorizontal: 16,
     paddingVertical: 12,
     borderBottomWidth: 1,
     borderBottomColor: darkTheme.textSecondary,
   },
   mainClassDropdownItemSelected: {
     backgroundColor: darkTheme.accent,
   },
   mainClassDropdownItemText: {
     color: darkTheme.text,
     fontSize: 16,
     fontWeight: '500',
   },
   mainClassDropdownItemTextSelected: {
     color: '#fff',
     fontWeight: '600',
   },
   // Class Dropdown Styles (for attendance modal)
   classDropdown: {
     position: 'absolute',
     top: '100%',
     left: 0,
     right: 0,
     backgroundColor: darkTheme.card,
     borderRadius: 10,
     borderWidth: 1,
     borderColor: darkTheme.textSecondary,
     maxHeight: 150,
     zIndex: 1000,
     marginTop: 4,
   },
   classDropdownList: {
     maxHeight: 150,
   },
   classDropdownItem: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     paddingHorizontal: 16,
     paddingVertical: 12,
     borderBottomWidth: 1,
     borderBottomColor: darkTheme.textSecondary,
   },
   classDropdownItemSelected: {
     backgroundColor: darkTheme.accent,
   },
   classDropdownItemText: {
     color: darkTheme.text,
     fontSize: 16,
     fontWeight: '500',
   },
   classDropdownItemTextSelected: {
     color: '#fff',
     fontWeight: '600',
   },
   // Dropdown overlay for click outside functionality
   dropdownOverlay: {
     position: 'absolute',
     top: 0,
     left: 0,
     right: 0,
     bottom: 0,
     zIndex: 999,
   },
   // Empty dropdown styles
   emptyDropdownItem: {
     paddingHorizontal: 16,
     paddingVertical: 12,
     alignItems: 'center',
   },
   emptyDropdownText: {
     color: darkTheme.textSecondary,
     fontSize: 14,
     fontStyle: 'italic',
   },
   // Add Class Button styles
   addClassButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     backgroundColor: darkTheme.accent,
     paddingHorizontal: 20,
     paddingVertical: 12,
     borderRadius: 10,
     marginHorizontal: 20,
     marginTop: 16,
     marginBottom: 8,
   },
   addClassButtonText: {
     color: '#FFFFFF',
     fontSize: 16,
     fontWeight: '600',
     marginLeft: 8,
   },
   // Add Class Modal styles
   addClassForm: {
     paddingHorizontal: 20,
     paddingVertical: 16,
   },
   inputGroup: {
     marginBottom: 16,
   },
   inputLabel: {
     color: darkTheme.text,
     fontSize: 14,
     fontWeight: '500',
     marginBottom: 8,
   },
   textInput: {
     backgroundColor: darkTheme.muted,
     borderRadius: 8,
     paddingHorizontal: 12,
     paddingVertical: 12,
     color: darkTheme.text,
     fontSize: 16,
     borderWidth: 1,
     borderColor: darkTheme.textSecondary,
   },
   submitBtnDisabled: {
     opacity: 0.6,
   },
}); 