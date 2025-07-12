import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Modal, Animated, Easing, Pressable, Platform, KeyboardAvoidingView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const metrics = [
  { icon: <FontAwesome name="graduation-cap" size={28} color="#fff" />, label: 'Total Students', value: '2500' },
  { icon: <FontAwesome name="users" size={28} color="#fff" />, label: 'Total Teachers', value: '100' },
  { icon: <FontAwesome name="user" size={28} color="#fff" />, label: 'Total Parents', value: '2000' },
  { icon: <FontAwesome name="money" size={28} color="#fff" />, label: 'Total Earning', value: '₹2,50,00,000' },
];

const notices = [
  'Parent-Teacher Meeting scheduled for next week',
  'Summer vacation starts from July 1st',
  'New library books available for students',
  'Sports day registration opens tomorrow',
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AdminDashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed)
  const [currentYear, setCurrentYear] = useState(2024);
  const today = new Date();
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();
  const currentDate = isCurrentMonth ? today.getDate() : null;
  const [profileVisible, setProfileVisible] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' or 'account'
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(require('../../../assets/images/icon.png'));
  const [notices, setNotices] = useState([
    'Parent-Teacher Meeting scheduled for next week',
    'Summer vacation starts from July 1st',
    'New library books available for students',
    'Sports day registration opens tomorrow',
  ]);
  const [events, setEvents] = useState([
    {
      title: 'Cybersecurity Webinar',
      date: 'June 25, 2024',
      desc: 'Join us for an informative session on cybersecurity best practices for students and staff.'
    }
  ]);
  const [noticeModalVisible, setNoticeModalVisible] = useState(false);
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [newNotice, setNewNotice] = useState('');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');

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

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

  const renderCalendar = () => {
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === currentDate;
      days.push(
        <View
          key={day}
          style={[styles.calendarDay, isToday && styles.todayHighlight]}
        >
          <Text style={[styles.calendarDayText, isToday && styles.todayText]}>{day}</Text>
        </View>
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

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access gallery is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage({ uri: result.assets[0].uri });
    }
  };

  // Example admin details with expanded information
  const adminDetails = {
    name: 'John Administrator',
    email: 'admin@school.edu',
    phone: '+91 98765 43210',
    role: 'Administrator',
    department: 'IT & Systems',
    status: 'Online',
    // Personal Details
    fullName: 'John Michael Administrator',
    dateOfBirth: '15 March 1985',
    gender: 'Male',
    nationality: 'Indian',
    address: 'Mumbai, Maharashtra, India',
    // Account Details
    displayName: 'Admin_John',
    accountCreated: '15 January 2020',
    lastLogin: '2 hours ago',
    membershipStatus: 'Premium',
    accountVerification: 'Verified',
    languagePreference: 'English',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <TouchableOpacity style={styles.avatarCircle} onPress={openProfile}>
          <Image source={require('../../../assets/images/icon.png')} style={{ width: 36, height: 36, borderRadius: 18 }} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ACA</Text>
        <View style={styles.headerIcons}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#A0A0A0"
          />
          <TouchableOpacity style={styles.headerIconBtn}>
            <FontAwesome name="bell" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Admin Profile Modal */}
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
              <TouchableOpacity onPress={pickImage} activeOpacity={0.8} style={styles.profileAvatarWrapper}>
                <Image source={profileImage} style={styles.profileAvatar} />
                <View style={styles.profileAvatarUploadIcon}>
                  <FontAwesome name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
              <View style={styles.profileHeaderInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileDisplayName}>{adminDetails.name}</Text>
                  <FontAwesome name="check-circle" size={16} color="#4ADE80" style={styles.verificationBadge} />
                </View>
                <Text style={styles.profileEmail}>{adminDetails.email}</Text>
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
                      <Text style={styles.infoValue}>{adminDetails.fullName}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Date of Birth</Text>
                      <Text style={styles.infoValue}>{adminDetails.dateOfBirth}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Gender</Text>
                      <Text style={styles.infoValue}>{adminDetails.gender}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Nationality</Text>
                      <Text style={styles.infoValue}>{adminDetails.nationality}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Address</Text>
                      <View style={styles.addressRow}>
                        <FontAwesome name="map-marker" size={14} color="#B0B0B0" style={styles.addressIcon} />
                        <Text style={styles.infoValue}>{adminDetails.address}</Text>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Phone Number</Text>
                      <Text style={styles.infoValue}>{adminDetails.phone}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.accountDetails}>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Display Name</Text>
                      <Text style={styles.infoValue}>{adminDetails.displayName}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Account Created</Text>
                      <Text style={styles.infoValue}>{adminDetails.accountCreated}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Last Login</Text>
                      <Text style={styles.infoValue}>{adminDetails.lastLogin}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Membership Status</Text>
                      <View style={styles.statusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: '#A259FF' }]}>
                          <Text style={styles.statusBadgeText}>{adminDetails.membershipStatus}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Account Verification</Text>
                      <View style={styles.statusRow}>
                        <FontAwesome name="check-circle" size={16} color="#4ADE80" style={styles.verificationIcon} />
                        <Text style={styles.infoValue}>{adminDetails.accountVerification}</Text>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Language Preference</Text>
                      <Text style={styles.infoValue}>{adminDetails.languagePreference}</Text>
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
                <FontAwesome name="sign-out" size={18} color="#FF3B30" style={{ marginRight: 8 }} />
                <Text style={styles.profileLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Overview Cards */}
      <Text style={styles.sectionHeading}>Overview</Text>
      <View style={styles.metricsGrid}>
        {metrics.map((metric, idx) => (
          <View key={idx} style={styles.metricCard}>
            {metric.icon}
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionHeading}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => setNoticeModalVisible(true)}>
          <Text style={styles.quickActionText}>Add Notice</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn} onPress={() => setEventModalVisible(true)}>
          <Text style={styles.quickActionText}>Add Event</Text>
        </TouchableOpacity>
      </View>
      {/* Add Notice Modal */}
      <Modal
        visible={noticeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNoticeModalVisible(false)}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Notice</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter notice details"
              placeholderTextColor="#B3B3B3"
              value={newNotice}
              onChangeText={setNewNotice}
              multiline
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setNoticeModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#A259FF' }]}
                onPress={() => {
                  if (newNotice.trim()) {
                    setNotices([newNotice.trim(), ...notices]);
                    setNewNotice('');
                    setNoticeModalVisible(false);
                  }
                }}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* Add Event Modal */}
      <Modal
        visible={eventModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEventModalVisible(false)}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Event</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Event Title"
              placeholderTextColor="#B3B3B3"
              value={newEventTitle}
              onChangeText={setNewEventTitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Event Date (e.g. June 30, 2024)"
              placeholderTextColor="#B3B3B3"
              value={newEventDate}
              onChangeText={setNewEventDate}
            />
            <TextInput
              style={[styles.modalInput, { height: 60 }]}
              placeholder="Event Description"
              placeholderTextColor="#B3B3B3"
              value={newEventDesc}
              onChangeText={setNewEventDesc}
              multiline
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setEventModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#A259FF' }]}
                onPress={() => {
                  if (newEventTitle.trim() && newEventDate.trim() && newEventDesc.trim()) {
                    setEvents([{ title: newEventTitle.trim(), date: newEventDate.trim(), desc: newEventDesc.trim() }, ...events]);
                    setNewEventTitle('');
                    setNewEventDate('');
                    setNewEventDesc('');
                    setEventModalVisible(false);
                  }
                }}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Notice Board */}
      <Text style={styles.sectionHeading}>Notice Board</Text>
      <View style={styles.noticeBoard}>
        {notices.map((notice, idx) => (
          <View key={idx} style={styles.noticeItem}>
            <Text style={styles.noticeText}>{`Notice ${idx + 1}. ${notice}`}</Text>
            <FontAwesome name="chevron-right" size={18} color="#A0A0A0" />
          </View>
        ))}
      </View>

      {/* Event Calendar */}
      <Text style={styles.sectionHeading}>Event Calendar</Text>
      {events.map((event, idx) => (
        <View style={styles.eventCard} key={idx}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDate}>{event.date}</Text>
          <Text style={styles.eventDesc}>{event.desc}</Text>
        </View>
      ))}
      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')}>
            <FontAwesome name="chevron-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.calendarMonth}>{months[currentMonth]} {currentYear}</Text>
          <TouchableOpacity onPress={() => navigateMonth('next')}>
            <FontAwesome name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.weekHeader}>
          {weekDays.map((d, i) => (
            <Text key={`${d}-${i}`} style={styles.weekDay}>{d}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>{renderCalendar()}</View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    backgroundColor: '#181A20',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#23262F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  searchInput: {
    backgroundColor: '#23262F',
    color: '#fff',
    borderRadius: 8,
    fontSize: 16,
    padding: 8,
    marginRight: 8,
    width: 120,
  },
  sectionHeading: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 18,
    marginBottom: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  metricCard: {
    width: '47%',
    backgroundColor: '#23262F',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  metricValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  metricLabel: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: '#23262F',
    borderRadius: 10,
    paddingVertical: 14,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  quickActionText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noticeBoard: {
    backgroundColor: '#23262F',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 4,
  },
  noticeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#353945',
  },
  noticeText: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  eventCard: {
    backgroundColor: '#23262F',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 16,
  },
  eventTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  eventDate: {
    color: '#A259FF',
    fontSize: 14,
    marginBottom: 4,
  },
  eventDesc: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  calendarCard: {
    backgroundColor: '#23262F',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calendarMonth: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekDay: {
    flex: 1,
    color: '#A0A0A0',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  calendarDayText: {
    color: '#A0A0A0',
    fontSize: 15,
  },
  todayHighlight: {
    backgroundColor: '#A259FF',
    borderRadius: 18,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  fullModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullModalContent: {
    backgroundColor: '#23262F',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: 320,
    maxWidth: '90%',
    justifyContent: 'center',
  },
  profileAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 18,
  },
  profileNameLarge: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileRoleLarge: {
    color: '#A0A0A0',
    fontSize: 18,
    marginBottom: 24,
  },
  profileInfoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  profileInfoLabel: {
    color: '#A0A0A0',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
  profileInfoValue: {
    color: '#fff',
    fontSize: 16,
  },
  logoutBtn: {
    marginTop: 40,
    backgroundColor: '#A259FF',
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
    backgroundColor: '#23262F',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#A0A0A0',
  },
  closeBtnTextFull: {
    color: '#A0A0A0',
    fontWeight: 'bold',
    fontSize: 16,
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
  profileAvatarUploadBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18,18,18,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#23262F',
    borderRadius: 16,
    padding: 24,
    width: 320,
    maxWidth: '90%',
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#181A20',
    color: '#fff',
    borderRadius: 8,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#353945',
    marginLeft: 10,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminDashboard; 