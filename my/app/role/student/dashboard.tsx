import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ScrollView, FlatList, Modal, Animated, Easing, Pressable, Platform, Vibration } from "react-native";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";

const notices = [
  { id: '1', icon: 'bullhorn' as const, title: 'Exam Schedule Released', desc: 'Mid-term exams start from 15th June.' },
  { id: '2', icon: 'calendar-check-o' as const, title: 'Holiday Notice', desc: 'School closed on 21st June for festival.' },
  { id: '3', icon: 'info-circle' as const, title: 'Fee Reminder', desc: 'Last date for fee payment is 25th June.' },
];

const notifications = [
  { id: '1', text: 'Math assignment due tomorrow.' },
  { id: '2', text: 'Science webinar on Friday.' },
];

const StudentScreen: React.FC = () => {
  const [profileVisible, setProfileVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'account'
  const router = useRouter();

  // Example student details with expanded information
  const studentDetails = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@school.edu',
    phone: '+91 98765 43210',
    role: 'Student',
    class: 'Class 10-B',
    status: 'Active',
    // Personal Details
    fullName: 'Sarah Elizabeth Johnson',
    dateOfBirth: '12 August 2008',
    gender: 'Female',
    nationality: 'Indian',
    address: 'Mumbai, Maharashtra, India',
    // Account Details
    displayName: 'Student_Sarah',
    accountCreated: '1 September 2023',
    lastLogin: '1 hour ago',
    membershipStatus: 'Standard',
    accountVerification: 'Verified',
    languagePreference: 'English',
  };

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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
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
        <View style={[styles.metricCard, { backgroundColor: '#23262F' }]}> 
          <FontAwesome name="calendar-check-o" size={28} color="#4ADE80" style={styles.metricIcon} />
          <Text style={styles.metricLabel}>Attendance</Text>
          <Text style={styles.metricValue}>75%</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: '#23262F' }]}> 
          <FontAwesome name="trophy" size={28} color="#FFD700" style={styles.metricIcon} />
          <Text style={styles.metricLabel}>Current Rank</Text>
          <Text style={styles.metricValue}>7th</Text>
        </View>
      </View>
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { backgroundColor: '#23262F' }]}> 
          <FontAwesome name="tasks" size={28} color="#FFA500" style={styles.metricIcon} />
          <Text style={styles.metricLabel}>Assignments</Text>
          <Text style={styles.metricValue}>03/10</Text>
        </View>
        <View style={[styles.metricCard, { backgroundColor: '#23262F' }]}> 
          <FontAwesome name="star" size={28} color="#A259FF" style={styles.metricIcon} />
          <Text style={styles.metricLabel}>Internal Score</Text>
          <Text style={styles.metricValue}>82</Text>
        </View>
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
            <FontAwesome name={n.icon} size={22} color="#A259FF" style={{ marginRight: 12 }} />
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
        <Text style={[styles.sectionTitle, { marginTop: 18 }]}>June 2024</Text>
        <View style={styles.calendarRow}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.calendarDay}>{day}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>
          {/* Example: 1st starts on Saturday, so 6 blanks */}
          {Array.from({ length: 6 }).map((_, i) => <View key={'b'+i} style={styles.calendarCell} />)}
          {Array.from({ length: 30 }).map((_, i) => {
            const date = i + 1;
            const isToday = date === 12; // Example: today is 12th
            return (
              <View key={date} style={[styles.calendarCell, isToday && styles.calendarToday]}>
                <Text style={[styles.calendarDate, isToday && styles.calendarDateToday]}>{date}</Text>
              </View>
            );
          })}
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

            {/* Footer */}
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
});

export default StudentScreen; 