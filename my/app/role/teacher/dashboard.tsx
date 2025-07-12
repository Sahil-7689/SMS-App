import React, { useState } from 'react';
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
  Pressable
} from 'react-native';
import { Easing } from 'react-native';
import {
  Search,
  Users,
  Calendar as CalendarIcon,
  BarChart2,
  Mail,
  UserCheck
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
// [REMOVE] import { useTheme } from '../../../context/ThemeContext';

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

const groupChats = [
  { name: '10th A Class Group' },
  { name: 'Teacher Group' },
  { name: '9th B Class Group' },
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const upcomingClasses = [
  { date: '2024-06-20', subject: 'Mathematics', time: '09:00 - 10:00', class: '10th A' },
  { date: '2024-06-21', subject: 'Physics', time: '10:15 - 11:15', class: '9th B' },
  { date: '2024-06-22', subject: 'Chemistry', time: '11:30 - 12:30', class: '10th A' },
];

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
  const [selectedClass, setSelectedClass] = useState('10th A Class Group');
  const [attendanceData, setAttendanceData] = useState<{[key: number]: string}>({});
  const router = useRouter();

  // Example teacher details with expanded information
  const teacherDetails = {
    name: 'Mr. Sahil Kumar',
    email: 'sahil.kumar@school.edu',
    phone: '+91 98765 43210',
    role: 'Teacher',
    department: 'Mathematics',
    status: 'Active',
    // Personal Details
    fullName: 'Sahil Rajesh Kumar',
    dateOfBirth: '8 July 1988',
    gender: 'Male',
    nationality: 'Indian',
    address: 'Delhi, India',
    // Account Details
    displayName: 'Teacher_Sahil',
    accountCreated: '15 August 2022',
    lastLogin: '30 minutes ago',
    membershipStatus: 'Premium',
    accountVerification: 'Verified',
    languagePreference: 'English',
  };

  // Mock student data for attendance
  const students = [
    { id: 1, name: 'Aarav Patel', rollNo: '001', status: 'present' },
    { id: 2, name: 'Priya Sharma', rollNo: '002', status: 'present' },
    { id: 3, name: 'Rahul Singh', rollNo: '003', status: 'absent' },
    { id: 4, name: 'Ananya Gupta', rollNo: '004', status: 'present' },
    { id: 5, name: 'Vikram Mehta', rollNo: '005', status: 'late' },
    { id: 6, name: 'Zara Khan', rollNo: '006', status: 'present' },
    { id: 7, name: 'Aditya Verma', rollNo: '007', status: 'present' },
    { id: 8, name: 'Ishita Reddy', rollNo: '008', status: 'absent' },
  ];

  // Attendance functions
  const handleTakeAttendance = () => {
    setAttendanceModalVisible(true);
    // Initialize attendance data with current status
    const initialAttendance: {[key: number]: string} = {};
    students.forEach(student => {
      initialAttendance[student.id] = student.status;
    });
    setAttendanceData(initialAttendance);
  };

  const handleAttendanceChange = (studentId: number, status: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = () => {
    // Here you would typically send the attendance data to your backend
    console.log('Attendance submitted:', attendanceData);
    alert('Attendance submitted successfully!');
    setAttendanceModalVisible(false);
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
            <Text style={styles.teacherName}>Mr. Sahil Kumar</Text>
            <Text style={styles.teacherTitle}>Classteacher INA</Text>
          </View>
        </View>
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
                    <Text style={styles.profileDisplayName}>{teacherDetails.name}</Text>
                    <FontAwesome name="check-circle" size={16} color="#4ADE80" style={styles.verificationBadge} />
                  </View>
                  <Text style={styles.profileEmail}>{teacherDetails.email}</Text>
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
                        <Text style={styles.infoValue}>{teacherDetails.fullName}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Date of Birth</Text>
                        <Text style={styles.infoValue}>{teacherDetails.dateOfBirth}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Gender</Text>
                        <Text style={styles.infoValue}>{teacherDetails.gender}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Nationality</Text>
                        <Text style={styles.infoValue}>{teacherDetails.nationality}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Address</Text>
                        <View style={styles.addressRow}>
                          <FontAwesome name="map-marker" size={14} color="#B0B0B0" style={styles.addressIcon} />
                          <Text style={styles.infoValue}>{teacherDetails.address}</Text>
                        </View>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Phone Number</Text>
                        <Text style={styles.infoValue}>{teacherDetails.phone}</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.accountDetails}>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Display Name</Text>
                        <Text style={styles.infoValue}>{teacherDetails.displayName}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Account Created</Text>
                        <Text style={styles.infoValue}>{teacherDetails.accountCreated}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Last Login</Text>
                        <Text style={styles.infoValue}>{teacherDetails.lastLogin}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Membership Status</Text>
                        <View style={styles.statusRow}>
                          <View style={[styles.statusBadge, { backgroundColor: '#A259FF' }]}>
                            <Text style={styles.statusBadgeText}>{teacherDetails.membershipStatus}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Account Verification</Text>
                        <View style={styles.statusRow}>
                          <FontAwesome name="check-circle" size={16} color="#4ADE80" style={styles.verificationIcon} />
                          <Text style={styles.infoValue}>{teacherDetails.accountVerification}</Text>
                        </View>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Language Preference</Text>
                        <Text style={styles.infoValue}>{teacherDetails.languagePreference}</Text>
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
                <TouchableOpacity style={styles.classSelectorBtn}>
                  <Text style={styles.classSelectorText}>{selectedClass}</Text>
                  <FontAwesome name="chevron-down" size={16} color="#B0B0B0" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.studentsList} showsVerticalScrollIndicator={false}>
                {students.map((student) => (
                  <View key={student.id} style={styles.studentRow}>
                    <View style={styles.studentInfo}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentRollNo}>Roll No: {student.rollNo}</Text>
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
                ))}
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

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color={darkTheme.text} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={darkTheme.textSecondary}
          />
        </View>
        {/* Group Communication */}
        <Text style={styles.sectionHeading}>Group Chat</Text>
        <View style={styles.groupChatSection}>
          {groupChats.map((group, idx) => (
            <View key={idx} style={styles.groupChatCard}>
              <Users size={22} color={darkTheme.accent} />
              <Text style={styles.groupChatName}>{group.name}</Text>
            </View>
          ))}
          <View style={styles.groupActionsRow}>
            <TouchableOpacity style={styles.groupActionBtn} onPress={handleTakeAttendance}>
              <UserCheck size={16} color="#fff" />
              <Text style={styles.groupActionText}>Take Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.groupActionBtn}>
              <Mail size={16} color="#fff" />
              <Text style={styles.groupActionText}>Send Mail to Parents</Text>
            </TouchableOpacity>
          </View>
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
        {/* Progress Tracking */}
        <Text style={styles.sectionHeading}>Student Progress</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <BarChart2 size={22} color={darkTheme.accent} />
            <Text style={styles.progressTitle}>Analytics Overview</Text>
          </View>
          {/* Placeholder for chart/graph */}
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>[Chart/Graph Placeholder]</Text>
          </View>
        </View>
        {/* Schedule Section */}
        <Text style={styles.sectionHeading}>Upcoming Classes</Text>
        <View style={styles.scheduleCard}>
          {upcomingClasses.map((cls, idx) => (
            <View key={idx} style={styles.classItem}>
              <CalendarIcon size={18} color={darkTheme.accent} style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.classSubject}>{cls.subject}</Text>
                <Text style={styles.classInfo}>{cls.class} | {cls.time}</Text>
                <Text style={styles.classDate}>{cls.date}</Text>
              </View>
            </View>
          ))}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.purple,
    marginHorizontal: 20,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 18,
    marginTop: 6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: darkTheme.text,
    fontSize: 16,
  },
  sectionHeading: {
    color: darkTheme.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 18,
    marginBottom: 10,
  },
  groupChatSection: {
    backgroundColor: darkTheme.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 14,
  },
  groupChatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.muted,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  groupChatName: {
    color: darkTheme.text,
    fontSize: 15,
    marginLeft: 10,
    fontWeight: '600',
  },
  groupActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
  progressCard: {
    backgroundColor: darkTheme.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    color: darkTheme.text,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  chartPlaceholder: {
    height: 100,
    backgroundColor: darkTheme.muted,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  chartPlaceholderText: {
    color: darkTheme.textSecondary,
    fontSize: 14,
  },
  scheduleCard: {
    backgroundColor: darkTheme.card,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 16,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.muted,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  classSubject: {
    color: darkTheme.text,
    fontWeight: 'bold',
    fontSize: 15,
  },
  classInfo: {
    color: darkTheme.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  classDate: {
    color: darkTheme.accent,
    fontSize: 13,
    marginTop: 2,
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
}); 