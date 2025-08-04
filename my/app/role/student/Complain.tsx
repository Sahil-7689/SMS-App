import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { 
  addComplaint, 
  getComplaints, 
  auth 
} from '../../../config/firebase';

const { width } = Dimensions.get('window');

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  studentId: string;
  studentName: string;
  studentClass?: string;
  createdAt: any;
  updatedAt: any;
  adminResponse?: string;
  adminName?: string;
  resolvedAt?: string;
}

const COMPLAINT_CATEGORIES = [
  'Academic',
  'Infrastructure',
  'Transportation',
  'Food & Canteen',
  'Hostel',
  'Library',
  'Sports',
  'Other'
];

const PRIORITY_COLORS = {
  low: '#4CAF50',
  medium: '#FFC107',
  high: '#FF6B6B'
};

const STATUS_COLORS = {
  pending: '#FFC107',
  'in-progress': '#2196F3',
  resolved: '#4CAF50',
  rejected: '#FF6B6B'
};

export default function ComplaintsScreen() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academic');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const studentId = auth.currentUser?.uid;
      if (!studentId) {
        console.error('No authenticated user found');
        return;
      }

      const result = await getComplaints({ studentId });
      if (result.success && result.complaints) {
        setComplaints(result.complaints);
      } else {
        console.error('Failed to fetch complaints:', result.error);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Academic');
    setPriority('medium');
  };

  const handleSubmit = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const studentId = auth.currentUser?.uid;
      const studentName = auth.currentUser?.displayName || 'Student';
      
      if (!studentId) {
        Alert.alert('Error', 'Please login to submit a complaint');
        return;
      }

      const complaintData = {
        title,
        description,
        category,
        priority,
        studentId,
        studentName,
      };

      const result = await addComplaint(complaintData);
      
      if (result.success) {
        Alert.alert('Success', 'Complaint submitted successfully');
        setModalVisible(false);
        resetForm();
        fetchComplaints();
      } else {
        Alert.alert('Error', result.error || 'Failed to submit complaint');
      }
    } catch (error: any) {
      console.error('Error submitting complaint:', error);
      Alert.alert('Error', error.message || 'Failed to submit complaint');
    } finally {
      setSaving(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A259FF" />
        <Text style={styles.loadingText}>Loading complaints...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>My Complaints</Text>
          <FontAwesome name="exclamation-triangle" size={28} color="#A259FF" />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{complaints.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {complaints.filter(c => c.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {complaints.filter(c => c.status === 'resolved').length}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>

        {/* Complaints List */}
        <Text style={styles.sectionTitle}>Recent Complaints</Text>
        {complaints.length === 0 ? (
          <Text style={styles.noDataText}>No complaints submitted yet.</Text>
        ) : (
          complaints.map((complaint) => (
            <View key={complaint.id} style={styles.complaintCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.complaintTitle}>{complaint.title}</Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: STATUS_COLORS[complaint.status] }
                ]}>
                  <Text style={styles.statusText}>
                    {getStatusLabel(complaint.status)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.complaintDescription} numberOfLines={3}>
                {complaint.description}
              </Text>
              
              <View style={styles.cardMeta}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Category:</Text>
                  <Text style={styles.metaValue}>{complaint.category}</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Priority:</Text>
                  <View style={[
                    styles.priorityBadge, 
                    { backgroundColor: PRIORITY_COLORS[complaint.priority] }
                  ]}>
                    <Text style={styles.priorityText}>
                      {complaint.priority.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.complaintDate}>
                Submitted: {formatDate(complaint.createdAt)}
              </Text>
              
              {complaint.adminResponse && (
                <View style={styles.responseContainer}>
                  <Text style={styles.responseLabel}>Admin Response:</Text>
                  <Text style={styles.responseText}>{complaint.adminResponse}</Text>
                  {complaint.adminName && (
                    <Text style={styles.responseBy}>- {complaint.adminName}</Text>
                  )}
                </View>
              )}
            </View>
          ))
        )}
        
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addBtnText}>+ Submit New Complaint</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Submit Complaint Modal */}
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
              <Text style={styles.modalTitle}>Submit Complaint</Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                resetForm();
              }}>
                <FontAwesome name="times" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Title */}
              <Text style={styles.modalLabel}>Complaint Title *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter complaint title"
                placeholderTextColor="#A0A0A0"
                value={title}
                onChangeText={setTitle}
              />

              {/* Description */}
              <Text style={styles.modalLabel}>Description *</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="Describe your complaint in detail..."
                placeholderTextColor="#A0A0A0"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />

              {/* Category */}
              <Text style={styles.modalLabel}>Category</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>{category}</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => {
                    const options = COMPLAINT_CATEGORIES.map(cat => ({
                      text: cat,
                      onPress: () => setCategory(cat)
                    }));
                    options.push({ text: 'Cancel', onPress: () => {} });
                    Alert.alert('Select Category', 'Choose a category:', options);
                  }}
                >
                  <FontAwesome name="chevron-down" size={16} color="#A0A0A0" />
                </TouchableOpacity>
              </View>

              {/* Priority */}
              <Text style={styles.modalLabel}>Priority</Text>
              <View style={styles.priorityContainer}>
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityBtn,
                      priority === p && { backgroundColor: PRIORITY_COLORS[p] }
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
                    Submit
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
  container: {
    flex: 1,
    backgroundColor: '#181A20',
  },
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
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#23262F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    color: '#A259FF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 20,
  },
  noDataText: {
    color: '#fff', 
    textAlign: 'center',
    marginTop: 40,
    marginHorizontal: 20,
  },
  complaintCard: {
    backgroundColor: '#23262F',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  complaintTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  complaintDescription: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardMeta: {
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaLabel: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  metaValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  complaintDate: {
    color: '#A0A0A0',
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  responseContainer: {
    backgroundColor: '#353945',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  responseLabel: {
    color: '#A259FF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  responseText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
  },
  responseBy: {
    color: '#A0A0A0',
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  addBtn: { 
    backgroundColor: '#4A90E2', 
    borderRadius: 8, 
    paddingVertical: 12, 
    alignItems: 'center', 
    marginTop: 8,
    marginHorizontal: 20,
  },
  addBtnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
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
    height: 100,
    textAlignVertical: 'top',
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