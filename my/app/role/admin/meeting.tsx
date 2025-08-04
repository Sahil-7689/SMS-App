import * as React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Modal, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { 
  addMeeting, 
  getMeetings, 
  updateMeeting, 
  deleteMeeting,
  getStudents,
  getTeachers,
  auth 
} from '../../../config/firebase';

const { width } = Dimensions.get('window');

const MEETING_COLORS = ['#6EE7B7', '#A7F3D0', '#5EEAD4']; // soft green, mint, teal

interface MeetingType { 
  id: string;
  title: string; 
  date: string; 
  time: string; 
  status: string; 
  type: string; 
  details: string; 
  color: string; 
  illustration: any;
  organizerName: string;
  location: string;
  duration: number;
  meetingType: string;
  priority?: string;
  attendees?: string[];
  confirmedAttendees?: any[];
  isOnline?: boolean;
  meetingLink?: string;
  maxAttendees?: number;
}

interface MeetingHistoryType { 
  id: string;
  title: string; 
  date: string; 
  organizer: string; 
  type: string; 
  color: string; 
}

interface User {
  id: string;
  name: string;
  role: string;
  class?: string;
}

export default function MeetingScreen() {
  const [meetings, setMeetings] = React.useState<MeetingType[]>([]);
  const [meetingHistory, setMeetingHistory] = React.useState<MeetingHistoryType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingMeeting, setEditingMeeting] = React.useState<MeetingType | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [users, setUsers] = React.useState<User[]>([]);

  // Form states
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [duration, setDuration] = React.useState('60');
  const [meetingType, setMeetingType] = React.useState<'staff' | 'parent' | 'student' | 'general'>('general');
  const [location, setLocation] = React.useState('');
  const [priority, setPriority] = React.useState<'low' | 'medium' | 'high'>('medium');
  const [isOnline, setIsOnline] = React.useState(false);
  const [meetingLink, setMeetingLink] = React.useState('');
  const [maxAttendees, setMaxAttendees] = React.useState('');
  const [selectedAttendees, setSelectedAttendees] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetchMeetings();
    fetchUsers();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const result = await getMeetings({ status: 'scheduled' });
      if (result.success && result.meetings) {
        setMeetings(result.meetings);
      } else {
        console.error('Failed to fetch meetings:', result.error);
      }

      // Fetch completed/cancelled meetings for history
      const historyResult = await getMeetings({ 
        status: 'completed' 
      });
      if (historyResult.success && historyResult.meetings) {
        setMeetingHistory(historyResult.meetings);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const studentsResult = await getStudents();
      const teachersResult = await getTeachers();
      
      const students = studentsResult.success ? studentsResult.students?.map(s => ({
        id: s.id,
        name: s.name,
        role: 'student',
        class: s.class
      })) || [] : [];
      
      const teachers = teachersResult.success ? teachersResult.teachers?.map(t => ({
        id: t.id,
        name: t.name,
        role: 'teacher'
      })) || [] : [];
      
      setUsers([...students, ...teachers]);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setDuration('60');
    setMeetingType('general');
    setLocation('');
    setPriority('medium');
    setIsOnline(false);
    setMeetingLink('');
    setMaxAttendees('');
    setSelectedAttendees([]);
    setEditingMeeting(null);
  };

  const handleSubmit = async () => {
    if (!title || !date || !time || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const meetingData = {
        title,
        description,
        date,
        time,
        duration: parseInt(duration),
        meetingType,
        location,
        organizerId: auth.currentUser?.uid || '',
        organizerName: auth.currentUser?.displayName || 'Admin',
        attendees: selectedAttendees,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
        isOnline,
        meetingLink: isOnline ? meetingLink : undefined,
        priority,
      };

      const result = await addMeeting(meetingData);
      
      if (result.success) {
        Alert.alert('Success', 'Meeting scheduled successfully');
        setModalVisible(false);
        resetForm();
        fetchMeetings();
      } else {
        Alert.alert('Error', result.error || 'Failed to schedule meeting');
      }
    } catch (error: any) {
      console.error('Error scheduling meeting:', error);
      Alert.alert('Error', error.message || 'Failed to schedule meeting');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (meeting: MeetingType) => {
    setEditingMeeting(meeting);
    setTitle(meeting.title);
    setDescription(meeting.details);
    setDate(meeting.date);
    setTime(meeting.time);
    setDuration(meeting.duration.toString());
    setMeetingType(meeting.meetingType as any);
    setLocation(meeting.location);
    setPriority(meeting.priority as any || 'medium');
    setIsOnline(meeting.isOnline || false);
    setMeetingLink(meeting.meetingLink || '');
    setMaxAttendees(meeting.maxAttendees?.toString() || '');
    setSelectedAttendees(meeting.attendees || []);
    setModalVisible(true);
  };

  const handleDelete = async (meeting: MeetingType) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to cancel this meeting?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteMeeting(meeting.id);
              if (result.success) {
                Alert.alert('Success', 'Meeting cancelled successfully');
                fetchMeetings();
              } else {
                Alert.alert('Error', result.error || 'Failed to cancel meeting');
              }
            } catch (error: any) {
              console.error('Error cancelling meeting:', error);
              Alert.alert('Error', error.message || 'Failed to cancel meeting');
            }
          },
        },
      ]
    );
  };

  const toggleAttendee = (userId: string) => {
    setSelectedAttendees(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getMeetingColor = (index: number) => {
    return MEETING_COLORS[index % MEETING_COLORS.length];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFC107';
      case 'low': return '#4CAF50';
      default: return '#FFC107';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#4CAF50';
      case 'in-progress': return '#2196F3';
      case 'completed': return '#9E9E9E';
      case 'cancelled': return '#F44336';
      default: return '#4CAF50';
    }
  };

  function MeetingHeader() {
    return (
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Admin - Meeting</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Ionicons name="search" size={22} color="#fff" style={{ marginRight: 18 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <FontAwesome name="plus" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function MeetingTabIndicator() {
    return (
      <View style={styles.tabIndicator}>
        <Text style={styles.tabIndicatorText}>Meetings</Text>
      </View>
    );
  }

  function MeetingCard({ meeting, index }: { meeting: MeetingType; index: number }) {
    return (
      <View style={[styles.meetingCard, { backgroundColor: getMeetingColor(index) }]}> 
        <View style={{ flex: 1 }}>
          <View style={styles.meetingHeader}>
            <Text style={styles.meetingDate}>{meeting.date} | {meeting.time}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(meeting.priority || 'medium') }]}>
              <Text style={styles.priorityText}>{meeting.priority?.toUpperCase() || 'MEDIUM'}</Text>
            </View>
          </View>
          <Text style={styles.meetingTitle}>{meeting.title}</Text>
          <Text style={styles.meetingStatus}>
            {meeting.status} • {meeting.meetingType} • {meeting.duration}min
          </Text>
          <Text style={styles.meetingLocation}>
            📍 {meeting.isOnline ? 'Online' : meeting.location}
          </Text>
          {meeting.details && <Text style={styles.meetingDetails}>{meeting.details}</Text>}
          <Text style={styles.meetingOrganizer}>Organizer: {meeting.organizerName}</Text>
        </View>
        <View style={styles.meetingActions}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => handleEdit(meeting)}
          >
            <FontAwesome name="edit" size={16} color="#23262F" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.deleteBtn]}
            onPress={() => handleDelete(meeting)}
          >
            <FontAwesome name="trash" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function MeetingHistoryCard({ meeting, index }: { meeting: MeetingHistoryType; index: number }) {
    return (
      <View style={[styles.historyCard, { backgroundColor: getMeetingColor(index) }]}> 
        <View style={{ flex: 1 }}>
          <Text style={styles.historyDate}>{meeting.date}</Text>
          <Text style={styles.historyTitle}>{meeting.title}</Text>
          <Text style={styles.historyOrganizer}>Organizer: {meeting.organizer}</Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A259FF" />
        <Text style={styles.loadingText}>Loading meetings...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#181A20' }}>
      <MeetingHeader />
      <MeetingTabIndicator />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
        {meetings.length === 0 ? (
          <Text style={styles.noDataText}>No upcoming meetings.</Text>
        ) : (
          meetings.map((meeting, idx) => (
            <MeetingCard meeting={meeting} key={meeting.id} index={idx} />
          ))
        )}
        
        <Text style={styles.sectionTitle}>Meeting History</Text>
        {meetingHistory.length === 0 ? (
          <Text style={styles.noDataText}>No meeting history.</Text>
        ) : (
          meetingHistory.map((meeting, idx) => (
            <MeetingHistoryCard meeting={meeting} key={meeting.id} index={idx} />
          ))
        )}
      </ScrollView>

      {/* Schedule Meeting Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
              </Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                resetForm();
              }}>
                <FontAwesome name="times" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Title */}
              <Text style={styles.modalLabel}>Meeting Title *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter meeting title"
                placeholderTextColor="#A0A0A0"
                value={title}
                onChangeText={setTitle}
              />

              {/* Description */}
              <Text style={styles.modalLabel}>Description</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="Enter meeting description"
                placeholderTextColor="#A0A0A0"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              {/* Date and Time */}
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.modalLabel}>Date *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#A0A0A0"
                    value={date}
                    onChangeText={setDate}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.modalLabel}>Time *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="HH:MM"
                    placeholderTextColor="#A0A0A0"
                    value={time}
                    onChangeText={setTime}
                  />
                </View>
              </View>

              {/* Duration and Type */}
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.modalLabel}>Duration (min)</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="60"
                    placeholderTextColor="#A0A0A0"
                    value={duration}
                    onChangeText={setDuration}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.modalLabel}>Meeting Type</Text>
                  <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>
                      {meetingType.charAt(0).toUpperCase() + meetingType.slice(1)}
                    </Text>
                    <TouchableOpacity 
                      style={styles.pickerButton}
                      onPress={() => {
                        const types = ['staff', 'parent', 'student', 'general'];
                        const currentIndex = types.indexOf(meetingType);
                        const nextIndex = (currentIndex + 1) % types.length;
                        setMeetingType(types[nextIndex] as any);
                      }}
                    >
                      <FontAwesome name="chevron-down" size={16} color="#A0A0A0" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Location */}
              <Text style={styles.modalLabel}>Location *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter meeting location"
                placeholderTextColor="#A0A0A0"
                value={location}
                onChangeText={setLocation}
              />

              {/* Online Meeting */}
              <View style={styles.checkboxContainer}>
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => setIsOnline(!isOnline)}
                >
                  {isOnline && <FontAwesome name="check" size={12} color="#fff" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Online Meeting</Text>
              </View>

              {isOnline && (
                <TextInput
                  style={styles.modalInput}
                  placeholder="Meeting Link (Zoom, Teams, etc.)"
                  placeholderTextColor="#A0A0A0"
                  value={meetingLink}
                  onChangeText={setMeetingLink}
                />
              )}

              {/* Priority */}
              <Text style={styles.modalLabel}>Priority</Text>
              <View style={styles.priorityContainer}>
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityBtn,
                      priority === p && { backgroundColor: getPriorityColor(p) }
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[
                      styles.priorityBtnText,
                      priority === p && { color: '#fff' }
                    ]}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Max Attendees */}
              <Text style={styles.modalLabel}>Max Attendees (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Leave empty for unlimited"
                placeholderTextColor="#A0A0A0"
                value={maxAttendees}
                onChangeText={setMaxAttendees}
                keyboardType="numeric"
              />

              {/* Attendees Selection */}
              <Text style={styles.modalLabel}>Select Attendees</Text>
              <ScrollView style={styles.attendeesContainer} nestedScrollEnabled>
                {users.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={[
                      styles.attendeeItem,
                      selectedAttendees.includes(user.id) && styles.selectedAttendee
                    ]}
                    onPress={() => toggleAttendee(user.id)}
                  >
                    <Text style={[
                      styles.attendeeText,
                      selectedAttendees.includes(user.id) && styles.selectedAttendeeText
                    ]}>
                      {user.name} ({user.role})
                    </Text>
                    {selectedAttendees.includes(user.id) && (
                      <FontAwesome name="check" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalBtn} 
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.submitBtn]} 
                onPress={handleSubmit}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalBtnText, styles.submitBtnText]}>
                    {editingMeeting ? 'Update' : 'Schedule'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#181A20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#181A20',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabIndicator: {
    backgroundColor: '#23262F',
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  tabIndicatorText: {
    color: '#A259FF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 20,
  },
  noDataText: {
    color: '#fff', 
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  meetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    backgroundColor: '#23262F',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  meetingDate: {
    color: '#23262F',
    fontWeight: 'bold',
    fontSize: 13,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  meetingTitle: {
    color: '#181A20',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  meetingStatus: {
    color: '#23262F',
    fontSize: 13,
    marginBottom: 2,
  },
  meetingLocation: {
    color: '#23262F',
    fontSize: 12,
    marginBottom: 2,
  },
  meetingDetails: {
    color: '#23262F',
    fontSize: 12,
    marginBottom: 2,
  },
  meetingOrganizer: {
    color: '#23262F',
    fontSize: 11,
    fontStyle: 'italic',
  },
  meetingActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  actionBtn: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    marginLeft: 4,
  },
  deleteBtn: {
    backgroundColor: '#FF6B6B',
  },
  meetingImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginLeft: 16,
    backgroundColor: '#fff',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#23262F',
  },
  historyDate: {
    color: '#23262F',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  historyTitle: {
    color: '#181A20',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  historyOrganizer: {
    color: '#23262F',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#23262F',
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#353945',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  modalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    backgroundColor: '#353945',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#353945',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerLabel: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  pickerButton: {
    padding: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#A259FF',
    backgroundColor: '#353945',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    color: '#fff',
    fontSize: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priorityBtn: {
    flex: 1,
    backgroundColor: '#353945',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  priorityBtnText: {
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: 'bold',
  },
  attendeesContainer: {
    maxHeight: 150,
    backgroundColor: '#353945',
    borderRadius: 8,
    padding: 8,
  },
  attendeeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  selectedAttendee: {
    backgroundColor: '#A259FF',
  },
  attendeeText: {
    color: '#fff',
    fontSize: 14,
  },
  selectedAttendeeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#353945',
  },
  modalBtn: {
    flex: 1,
    backgroundColor: '#353945',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#A259FF',
  },
  submitBtnText: {
    color: '#fff',
  },
}); 