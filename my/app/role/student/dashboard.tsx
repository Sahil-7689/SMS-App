// Corrected code for: sahil-7689/sms-app/SMS-App-main/my/app/role/student/dashboard.tsx

import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, FlatList, Modal, Animated, Easing, Pressable, Platform, Vibration, Alert, ActivityIndicator } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";

// Add explicit types for placeholders
interface Notice { id: string; icon: string; title: string; desc: string; }
interface Notification { id: string; text: string; }
interface Resource { id: string; title: string; file: string; }
interface Assignment { id: string; title: string; file: string; due: string; }
interface SubjectScore { subject: string; score: number; max: number; color: string; }
interface StudentDetails {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  class?: string;
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
const notices: Notice[] = []; // TODO: Inject notices from API or context
const notifications: Notification[] = []; // TODO: Inject notifications from API or context
const mockResources: Resource[] = []; // TODO: Inject resources from API or context
const mockAssignments: Assignment[] = []; // TODO: Inject assignments from API or context
const OVERALL_ATTENDANCE = 84;
const PRESENT = 37;
const ABSENT = 20;
const QUICK_STATS = [
  { label: 'Total Classes', value: 47 },
  { label: 'Classes Attended', value: 37 },
  { label: 'Late Attended', value: 7 },
  { label: 'Classes Missed', value: 20 },
];
const SUBJECTS = [
  { name: 'Math', total: 12, attended: 10 },
  { name: 'Science', total: 11, attended: 8 },
  { name: 'English', total: 13, attended: 12 },
  { name: 'Social Studies', total: 11, attended: 7 },
];

const SUBJECT_SCORES: SubjectScore[] = []; // TODO: Inject subject scores from API or context

const RANKING_DATA = {
  currentRank: 7,
  totalStudents: 45,
  previousRank: 9,
  rankChange: '+2',
  classAverage: 78,
  topRank: 1,
  performance: [
    { subject: 'Math', rank: 5, score: 92 },
    { subject: 'Science', rank: 8, score: 85 },
    { subject: 'English', rank: 3, score: 88 },
    { subject: 'Social Studies', rank: 12, score: 76 },
  ],
  recentRanks: [
    { month: 'Jan', rank: 9 },
    { month: 'Feb', rank: 8 },
    { month: 'Mar', rank: 7 },
    { month: 'Apr', rank: 7 },
  ]
};

const StudentScreen: React.FC = () => {
  const [uploadText, setUploadText] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string }>({});
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: 'idle' | 'uploading' | 'success' | 'error' }>({});
  const [profileVisible, setProfileVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState('personal');
  const router = useRouter();
  const [assignmentModalVisible, setAssignmentModalVisible] = useState(false);
  const [attendanceModalVisible, setAttendanceModalVisible] = useState(false);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [rankModalVisible, setRankModalVisible] = useState(false);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0-indexed
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const today = new Date();

  // Helper functions
  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleResourceDownload = (file: string) => {
    Alert.alert('Download', `Pretend downloading: ${file}`);
  };

  const handleAssignmentDownload = (file: string) => {
    Alert.alert('Download', `Pretend downloading: ${file}`);
  };

  const handleAssignmentUpload = (assignmentId: string) => {
    if (!uploadText) {
      Alert.alert('Error', 'Please enter a file name to upload.');
      return;
    }
    setUploadStatus(prev => ({ ...prev, [assignmentId]: 'uploading' }));
    setTimeout(() => {
      const success = Math.random() > 0.2;
      if (success) {
        setUploadedFiles(prev => ({ ...prev, [assignmentId]: uploadText }));
        setUploadStatus(prev => ({ ...prev, [assignmentId]: 'success' }));
        Alert.alert('Success', `File "${uploadText}" uploaded successfully!`);
        setTimeout(() => setUploadStatus(prev => ({ ...prev, [assignmentId]: 'idle' })), 3000);
      } else {
        setUploadStatus(prev => ({ ...prev, [assignmentId]: 'error' }));
        Alert.alert('Error', 'Upload failed. Please try again.');
        setTimeout(() => setUploadStatus(prev => ({ ...prev, [assignmentId]: 'idle' })), 3000);
      }
      setUploadingId(null);
      setUploadText('');
    }, 1500);
  };

  const studentDetails: StudentDetails = {}; // TODO: Inject student details from API or context

  const handleLogout = async () => {
    Vibration.vibrate(10);
    await AsyncStorage.removeItem('studentRememberMe');
    await AsyncStorage.removeItem('studentEmail');
    await AsyncStorage.removeItem('studentPassword');
    setProfileVisible(false);
    router.replace('/role');
  };

  const openProfile = () => {
    setProfileVisible(true);
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 300, easing: Easing.in(Easing.ease), useNativeDriver: true })
    ]).start();
  };

  const closeProfile = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 200, useNativeDriver: true })
    ]).start(() => setProfileVisible(false));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* ... (The rest of the JSX remains exactly the same) ... */}
            {/* Header Section */}
            <View style={styles.headerSection}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>StudentDashboard</Text>
          <TouchableOpacity>
            <FontAwesome name="bell" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#A0A0A0"
        />
        <View style={styles.profileRow}>
          <TouchableOpacity onPress={openProfile}>
            <Image source={require("../../../assets/images/icon.png")} style={styles.avatar} />
          </TouchableOpacity>
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.profileName}>Student Name</Text>
            <Text style={styles.profileClass}>Class 10-B</Text>
          </View>
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={styles.metricsRow}>
        <TouchableOpacity style={[styles.metricCard, { backgroundColor: '#23262F' }]} onPress={() => setAttendanceModalVisible(true)}>
          <FontAwesome name="calendar-check-o" size={28} color="#4ADE80" style={styles.metricIcon} />
          <Text style={styles.metricLabel}>Attendance</Text>
          <Text style={styles.metricValue}>75%</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.metricCard, { backgroundColor: '#23262F' }]} onPress={() => setRankModalVisible(true)}>
          <FontAwesome name="trophy" size={28} color="#FFD700" style={styles.metricIcon} />
          <Text style={styles.metricLabel}>Current Rank</Text>
          <Text style={styles.metricValue}>7th</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.metricsRow}>
        <TouchableOpacity style={[styles.metricCard, { backgroundColor: '#23262F' }]} onPress={() => setAssignmentModalVisible(true)}>
          <FontAwesome name="tasks" size={28} color="#FFA500" style={styles.metricIcon} />
          <Text style={styles.metricLabel}>Assignments</Text>
          <Text style={styles.metricValue}>03/10</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.metricCard, { backgroundColor: '#23262F' }]} onPress={() => setScoreModalVisible(true)}>
          <FontAwesome name="star" size={28} color="#A259FF" style={styles.metricIcon} />
          <Text style={styles.metricLabel}>Internal Score</Text>
          <Text style={styles.metricValue}>82</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications & Updates */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>New Notifications</Text>
        {notifications.map(n => (
          <View key={n.id} style={styles.notificationRow}>
            <FontAwesome name="circle" size={10} color="#4ADE80" style={{ marginRight: 8 }} />
            <Text style={styles.notificationText}>{n.text}</Text>
          </View>
        ))}
      </View>

      {/* Notice Board */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Notice Board</Text>
        {notices.map(n => (
          <View key={n.id} style={styles.noticeCard}>
            <FontAwesome name={n.icon as any} size={22} color="#A259FF" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.noticeTitle}>{n.title}</Text>
              <Text style={styles.noticeDesc}>{n.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Calendar Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Upcoming Event</Text>
        <View style={styles.eventPreview}>
          <FontAwesome name="video-camera" size={20} color="#FFD700" style={{ marginRight: 10 }} />
          <Text style={styles.eventText}>Webinar: Science & Technology - 18th June, 10:00 AM</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
          <TouchableOpacity onPress={() => {
            if (currentMonth === 0) {
              setCurrentMonth(11);
              setCurrentYear(currentYear - 1);
            } else {
              setCurrentMonth(currentMonth - 1);
            }
          }}>
            <FontAwesome name="chevron-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.sectionTitle, { marginTop: 0 }]}>{monthNames[currentMonth]} {currentYear}</Text>
          <TouchableOpacity onPress={() => {
            if (currentMonth === 11) {
              setCurrentMonth(0);
              setCurrentYear(currentYear + 1);
            } else {
              setCurrentMonth(currentMonth + 1);
            }
          }}>
            <FontAwesome name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.calendarRow}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <Text key={day} style={styles.calendarDay}>{day}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {/* Blank days before the 1st */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <View key={'b'+i} style={styles.calendarCell} />
          ))}
          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const date = i + 1;
            const isToday =
              date === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();
            return (
              <View key={date} style={[styles.calendarCell, isToday && styles.calendarToday]}>
                <Text style={[styles.calendarDate, isToday && styles.calendarDateToday]}>{date}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Teacher Resources */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Teacher Resources</Text>
        {mockResources.map(item => (
          <View key={item.id} style={styles.resourceRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.resourceTitle}>{item.title}</Text>
              <Text style={styles.resourceFile}>{item.file}</Text>
            </View>
            <TouchableOpacity style={styles.downloadBtn} onPress={() => handleResourceDownload(item.file)}>
              <FontAwesome name="download" size={22} color="#fff" />
              <Text style={styles.downloadText}>Download</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Modals */}
      <Modal
        visible={assignmentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAssignmentModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#23262F', borderRadius: 18, padding: 24, width: '90%', maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Assignments</Text>
              <TouchableOpacity onPress={() => setAssignmentModalVisible(false)}>
                <FontAwesome name="times" size={22} color="#B0B0B0" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {mockAssignments.map(item => {
                const isUploaded = uploadedFiles[item.id];
                const uploadStatusForItem = uploadStatus[item.id] || 'idle';
                
                return (
                  <View key={item.id} style={{ backgroundColor: '#181A20', borderRadius: 12, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 }}>{item.title}</Text>
                      <Text style={{ color: '#A0A0A0', fontSize: 13, marginBottom: 2 }}>{item.file}</Text>
                      <Text style={{ color: '#FFD700', fontSize: 13, marginBottom: 8 }}>Due: {item.due}</Text>
                      
                      {isUploaded && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                          <FontAwesome name="check-circle" size={16} color="#4ADE80" style={{ marginRight: 6 }} />
                          <Text style={{ color: '#4ADE80', fontSize: 13 }}>Uploaded: {isUploaded}</Text>
                        </View>
                      )}
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <TextInput
                          style={{ 
                            flex: 1, 
                            backgroundColor: '#23262F', 
                            color: '#fff', 
                            borderRadius: 8, 
                            fontSize: 14, 
                            padding: 8, 
                            borderWidth: 1, 
                            borderColor: uploadStatusForItem === 'error' ? '#F44336' : '#A259FF', 
                            marginRight: 8 
                          }}
                          placeholder="Enter file name to upload..."
                          placeholderTextColor="#A0A0A0"
                          value={uploadingId === item.id ? uploadText : ''}
                          onChangeText={text => {
                            setUploadText(text);
                            setUploadingId(item.id);
                          }}
                          onFocus={() => setUploadingId(item.id)}
                          editable={uploadStatusForItem !== 'uploading'}
                        />
                        <TouchableOpacity 
                          style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center', 
                            backgroundColor: uploadStatusForItem === 'uploading' ? '#666' : uploadStatusForItem === 'success' ? '#4ADE80' : uploadStatusForItem === 'error' ? '#F44336' : '#4ADE80', 
                            borderRadius: 8, 
                            paddingVertical: 8, 
                            paddingHorizontal: 14 
                          }} 
                          onPress={() => handleAssignmentUpload(item.id)}
                          disabled={uploadStatusForItem === 'uploading'}
                        >
                          {uploadStatusForItem === 'uploading' ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : uploadStatusForItem === 'success' ? (
                            <FontAwesome name="check" size={16} color="#fff" />
                          ) : uploadStatusForItem === 'error' ? (
                            <FontAwesome name="times" size={16} color="#fff" />
                          ) : (
                            <FontAwesome name="upload" size={16} color="#fff" />
                          )}
                          <Text style={{ color: '#fff', fontSize: 14, marginLeft: 6, fontWeight: '500' }}>
                            {uploadStatusForItem === 'uploading' ? 'Uploading...' : 
                             uploadStatusForItem === 'success' ? 'Success' : 
                             uploadStatusForItem === 'error' ? 'Failed' : 'Upload'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#A259FF', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, marginLeft: 12, alignSelf: 'flex-start' }} 
                      onPress={() => handleAssignmentDownload(item.file)}
                    >
                      <FontAwesome name="download" size={22} color="#fff" />
                      <Text style={{ color: '#fff', fontSize: 14, marginLeft: 6, fontWeight: '500' }}>Download</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={attendanceModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAttendanceModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#23262F', borderRadius: 18, padding: 24, width: '90%', maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Attendance</Text>
              <TouchableOpacity onPress={() => setAttendanceModalVisible(false)}>
                <FontAwesome name="times" size={22} color="#B0B0B0" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginBottom: 18 }}>
                <Text style={{ color: '#A0A0A0', fontSize: 15 }}>Overall Attendance</Text>
                <Text style={{ color: '#fff', fontSize: 38, fontWeight: 'bold', marginBottom: 8 }}>{OVERALL_ATTENDANCE}%</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginTop: 8, marginBottom: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome name="check-circle" size={16} color="#4ADE80" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#A0A0A0', fontSize: 13 }}>Present</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <FontAwesome name="times-circle" size={16} color="#F472B6" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#A0A0A0', fontSize: 13 }}>Absent</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', width: '80%', height: 10, backgroundColor: '#181A20', borderRadius: 6, overflow: 'hidden', marginBottom: 4 }}>
                  <View style={{ width: `${(PRESENT / (PRESENT + ABSENT)) * 100}%`, backgroundColor: '#4ADE80', height: 10 }} />
                  <View style={{ width: `${(ABSENT / (PRESENT + ABSENT)) * 100}%`, backgroundColor: '#F472B6', height: 10 }} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '80%' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{PRESENT}</Text>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>{ABSENT}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 }}>
                {QUICK_STATS.map(stat => (
                  <View key={stat.label} style={{ width: '48%', backgroundColor: '#181A20', borderRadius: 10, padding: 12, marginBottom: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{stat.value}</Text>
                    <Text style={{ color: '#A0A0A0', fontSize: 13 }}>{stat.label}</Text>
                  </View>
                ))}
              </View>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Subject-wise Attendance</Text>
              {SUBJECTS.map((s, idx) => {
                const percent = Math.round((s.attended / s.total) * 100);
                return (
                  <View key={s.name} style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 15 }}>{s.name}</Text>
                      <Text style={{ color: '#A0A0A0', fontSize: 14 }}>{s.attended} / {s.total} ({percent}%)</Text>
                    </View>
                    {idx < SUBJECTS.length - 1 && <View style={{ height: 1, backgroundColor: '#333', marginVertical: 6 }} />}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={scoreModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setScoreModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#23262F', borderRadius: 18, padding: 24, width: '90%', maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Internal Score</Text>
              <TouchableOpacity onPress={() => setScoreModalVisible(false)}>
                <FontAwesome name="times" size={22} color="#B0B0B0" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginBottom: 18 }}>
                <Text style={{ color: '#A0A0A0', fontSize: 15 }}>Overall Score</Text>
                <Text style={{ color: '#fff', fontSize: 38, fontWeight: 'bold', marginBottom: 8 }}>82</Text>
                <Text style={{ color: '#A0A0A0', fontSize: 13, marginBottom: 12 }}>/ 100</Text>
              </View>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Subject Scores</Text>
              {SUBJECT_SCORES.map((s, idx) => (
                <View key={s.subject} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: s.color, marginRight: 10 }} />
                    <Text style={{ color: '#fff', fontSize: 15, flex: 1 }}>{s.subject}</Text>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: 'bold', marginLeft: 8 }}>{s.score}</Text>
                    <Text style={{ color: '#A0A0A0', fontSize: 13, marginLeft: 2 }}>/ {s.max}</Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: '#181A20', borderRadius: 4, overflow: 'hidden', marginTop: 2 }}>
                    <View style={{ width: `${(s.score / s.max) * 100}%`, height: 8, backgroundColor: s.color }} />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={rankModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRankModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#23262F', borderRadius: 18, padding: 24, width: '90%', maxHeight: '90%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>Current Rank</Text>
              <TouchableOpacity onPress={() => setRankModalVisible(false)}>
                <FontAwesome name="times" size={22} color="#B0B0B0" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Text style={{ color: '#A0A0A0', fontSize: 15 }}>Your Current Rank</Text>
                <Text style={{ color: '#FFD700', fontSize: 42, fontWeight: 'bold', marginBottom: 4 }}>{RANKING_DATA.currentRank}</Text>
                <Text style={{ color: '#A0A0A0', fontSize: 16 }}>out of {RANKING_DATA.totalStudents} students</Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <FontAwesome name="arrow-up" size={16} color="#4ADE80" style={{ marginRight: 6 }} />
                  <Text style={{ color: '#4ADE80', fontSize: 16, fontWeight: 'bold' }}>{RANKING_DATA.rankChange}</Text>
                  <Text style={{ color: '#A0A0A0', fontSize: 14, marginLeft: 4 }}>from last month</Text>
                </View>
              </View>

              <View style={{ backgroundColor: '#181A20', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Class Performance</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ color: '#A0A0A0', fontSize: 14 }}>Class Average</Text>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{RANKING_DATA.classAverage}%</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: '#A0A0A0', fontSize: 14 }}>Top Rank</Text>
                  <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: 'bold' }}>{RANKING_DATA.topRank}</Text>
                </View>
              </View>

              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>Subject-wise Ranking</Text>
              {RANKING_DATA.performance.map((subject) => (
                <View key={subject.subject} style={{ backgroundColor: '#181A20', borderRadius: 10, padding: 12, marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{subject.subject}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: 'bold', marginRight: 8 }}>#{subject.rank}</Text>
                      <Text style={{ color: '#A0A0A0', fontSize: 13 }}>({subject.score}%)</Text>
                    </View>
                  </View>
                </View>
              ))}

              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>Recent Ranking History</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                {RANKING_DATA.recentRanks.map((rank) => (
                  <View key={rank.month} style={{ alignItems: 'center', flex: 1 }}>
                    <Text style={{ color: '#A0A0A0', fontSize: 12 }}>{rank.month}</Text>
                    <Text style={{ color: '#FFD700', fontSize: 16, fontWeight: 'bold' }}>#{rank.rank}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
            <TouchableOpacity style={styles.closeButton} onPress={closeProfile}>
              <FontAwesome name="times" size={20} color="#B0B0B0" />
            </TouchableOpacity>

            <View style={styles.profileHeader}>
              <TouchableOpacity activeOpacity={0.8} style={styles.profileAvatarWrapper}>
                <Image source={require("../../../assets/images/icon.png")} style={styles.profileAvatar} />
                <View style={styles.profileAvatarUploadIcon}>
                  <FontAwesome name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
              <View style={styles.profileHeaderInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileDisplayName}>{studentDetails.name}</Text>
                  <FontAwesome name="check-circle" size={16} color="#4ADE80" style={styles.verificationBadge} />
                </View>
                <Text style={styles.profileEmail}>{studentDetails.email}</Text>
              </View>
            </View>

            <View style={styles.profileDivider} />

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

            <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
              {activeTab === 'personal' ? (
                <View style={styles.personalDetails}>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Full Name</Text>
                      <Text style={styles.infoValue}>{studentDetails.fullName}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Date of Birth</Text>
                      <Text style={styles.infoValue}>{studentDetails.dateOfBirth}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Gender</Text>
                      <Text style={styles.infoValue}>{studentDetails.gender}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Nationality</Text>
                      <Text style={styles.infoValue}>{studentDetails.nationality}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Address</Text>
                      <View style={styles.addressRow}>
                        <FontAwesome name="map-marker" size={14} color="#B0B0B0" style={styles.addressIcon} />
                        <Text style={styles.infoValue}>{studentDetails.address}</Text>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Phone Number</Text>
                      <Text style={styles.infoValue}>{studentDetails.phone}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.accountDetails}>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Display Name</Text>
                      <Text style={styles.infoValue}>{studentDetails.displayName}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Account Created</Text>
                      <Text style={styles.infoValue}>{studentDetails.accountCreated}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Last Login</Text>
                      <Text style={styles.infoValue}>{studentDetails.lastLogin}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Membership Status</Text>
                      <View style={styles.statusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: '#4ADE80' }]}>
                          <Text style={styles.statusBadgeText}>{studentDetails.membershipStatus}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Account Verification</Text>
                      <View style={styles.statusRow}>
                        <FontAwesome name="check-circle" size={16} color="#4ADE80" style={styles.verificationIcon} />
                        <Text style={styles.infoValue}>{studentDetails.accountVerification}</Text>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Language Preference</Text>
                      <Text style={styles.infoValue}>{studentDetails.languagePreference}</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.profileFooter}>
              <TouchableOpacity
                style={styles.profileLogoutBtn}
                activeOpacity={0.85}
                onPress={handleLogout}
              >
                <FontAwesome name="sign-out" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.profileLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
  },
  headerSection: {
    paddingTop: 32,
    paddingBottom: 18,
    paddingHorizontal: 20,
    backgroundColor: '#181A20',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  searchInput: {
    backgroundColor: '#23262F',
    color: '#fff',
    borderRadius: 8,
    fontSize: 16,
    padding: 8,
    marginBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#23262F',
  },
  profileName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  profileClass: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricLabel: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 2,
  },
  metricValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionCard: {
    backgroundColor: '#23262F',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notificationText: {
    color: '#fff',
    fontSize: 14,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#181A20',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  noticeTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  noticeDesc: {
    color: '#A0A0A0',
    fontSize: 13,
  },
  eventPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181A20',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  eventText: {
    color: '#fff',
    fontSize: 14,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 2,
  },
  calendarDay: {
    color: '#A0A0A0',
    fontSize: 13,
    width: 32,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  calendarCell: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
    borderRadius: 8,
  },
  calendarToday: {
    backgroundColor: '#A259FF',
  },
  calendarDate: {
    color: '#fff',
    fontSize: 14,
  },
  calendarDateToday: {
    color: '#fff',
    fontWeight: 'bold',
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
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#2C2C2C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#2D5CFE',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  profileImageHover: {
    shadowColor: '#2D5CFE',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 16,
    backgroundColor: 'rgba(45,92,254,0.2)',
  },
  profileAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#23262F',
  },
  profileNameLarge: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(255,255,255,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  profileEmailGlow: {
    color: '#B0B0B0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(45,92,254,0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  profilePhoneGlow: {
    color: '#B0B0B0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(45,92,254,0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  profileDivider: {
    height: 1,
    width: '100%',
    backgroundColor: '#333333',
    marginVertical: 0,
    alignSelf: 'center',
  },
  logoutBtn: {
    backgroundColor: '#461818',
    borderRadius: 16,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
    shadowColor: '#FF3B30',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    transitionDuration: '200ms',
  },
  logoutBtnHover: {
    backgroundColor: '#FF3B30',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(255,59,48,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23262F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  resourceTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceFile: {
    color: '#A0A0A0',
    fontSize: 13,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A259FF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginLeft: 12,
    alignSelf: 'flex-start',
  },
  downloadText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#23262F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  assignmentTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  assignmentFile: {
    color: '#A0A0A0',
    fontSize: 13,
    marginBottom: 2,
  },
  assignmentDue: {
    color: '#FFD700',
    fontSize: 13,
    marginBottom: 8,
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  uploadInput: {
    flex: 1,
    backgroundColor: '#181A20',
    color: '#fff',
    borderRadius: 8,
    fontSize: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#A259FF',
    marginRight: 8,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ADE80',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  uploadText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default StudentScreen;