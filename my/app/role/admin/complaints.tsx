import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
  Animated,
  Modal,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  getComplaints, 
  updateComplaint, 
  deleteComplaint,
  getComplaintStats,
  auth 
} from '../../../config/firebase';

const { width } = Dimensions.get('window');

// --- STYLING AND CONSTANTS ---
const COLORS = {
  background: '#1E1E1E',
  card: '#2D2D2D',
  accent: '#6200EE',
  urgent: '#FF4444',
  pending: '#FFB74D',
  progress: '#448AFF',
  resolved: '#4CAF50',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  input: '#3A3A3A',
};

const FILTERS = [
  { key: 'all', label: 'All Complaints' },
  { key: 'pending', label: 'Pending' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_COLORS = {
  urgent: COLORS.urgent,
  pending: COLORS.pending,
  'in-progress': COLORS.progress,
  resolved: COLORS.resolved,
  rejected: COLORS.urgent,
};

// --- TYPES ---
type ComplaintStatus = 'pending' | 'in-progress' | 'resolved' | 'rejected';
type ComplaintPriority = 'low' | 'medium' | 'high';

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  studentId: string;
  studentName: string;
  studentClass?: string;
  createdAt: any;
  updatedAt: any;
  adminResponse?: string;
  adminId?: string;
  adminName?: string;
  resolvedAt?: string;
}

// --- HELPER FUNCTIONS ---
function getStatusLabel(status: ComplaintStatus): string {
  switch (status) {
    case 'pending': return 'Pending';
    case 'in-progress': return 'In Progress';
    case 'resolved': return 'Resolved';
    case 'rejected': return 'Rejected';
    default: return '';
  }
}

function formatDate(date: any): string {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString();
}

// --- MAIN COMPONENT ---
export default function ComplaintsPage() {
  // --- STATE MANAGEMENT ---
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  
  // Modal States
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  
  // Data States
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  // Response Form State
  const [adminResponse, setAdminResponse] = useState<string>('');

  // Animation State
  const [fabAnim] = useState<Animated.Value>(new Animated.Value(1));

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const result = await getComplaints();
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

  // --- DERIVED STATE (FILTERING) ---
  const filteredComplaints = useMemo(() =>
    complaints.filter((c: Complaint) =>
      (selectedFilter === 'all' || c.status === selectedFilter) &&
      (c.id.toLowerCase().includes(search.toLowerCase()) || 
       c.title.toLowerCase().includes(search.toLowerCase()) ||
       c.description.toLowerCase().includes(search.toLowerCase()) ||
       c.studentName.toLowerCase().includes(search.toLowerCase()))
    ), [complaints, selectedFilter, search]);

  // --- HANDLERS ---
  const handleUpdateComplaint = async (
    complaintId: string,
    newStatus: ComplaintStatus,
    response?: string
  ): Promise<void> => {
    try {
      const adminId = auth.currentUser?.uid;
      const adminName = auth.currentUser?.displayName || 'Admin';
      
      const updateData: any = {
        status: newStatus,
        adminId,
        adminName,
      };
      
      if (response) {
        updateData.adminResponse = response;
      }
      
      const result = await updateComplaint(complaintId, updateData);
      
      if (result.success) {
        // Update local state
        setComplaints((prevComplaints: Complaint[]) => {
          const updatedComplaints = prevComplaints.map((c: Complaint) => {
            if (c.id === complaintId) {
              return { 
                ...c, 
                status: newStatus,
                adminResponse: response || c.adminResponse,
                adminId,
                adminName,
                updatedAt: new Date()
              };
            }
            return c;
          });
          return updatedComplaints;
        });
        
        // Update selected complaint in modal
        setSelectedComplaint((prev) => prev ? { 
          ...prev, 
          status: newStatus,
          adminResponse: response || prev.adminResponse,
          adminId,
          adminName
        } : null);
        
        setAdminResponse('');
        Alert.alert('Success', `Complaint ${complaintId} updated successfully.`);
      } else {
        Alert.alert('Error', result.error || 'Failed to update complaint');
      }
    } catch (error: any) {
      console.error('Error updating complaint:', error);
      Alert.alert('Error', error.message || 'Failed to update complaint');
    }
  };
  
  const handleDeleteComplaint = async (complaintId: string): Promise<void> => {
    try {
      const result = await deleteComplaint(complaintId);
      if (result.success) {
        setComplaints((prev) => prev.filter(c => c.id !== complaintId));
        Alert.alert('Success', `Complaint ${complaintId} deleted successfully.`);
      } else {
        Alert.alert('Error', result.error || 'Failed to delete complaint');
      }
    } catch (error: any) {
      console.error('Error deleting complaint:', error);
      Alert.alert('Error', error.message || 'Failed to delete complaint');
    }
  };

  const handleFabPress = (): void => {
    Animated.sequence([
      Animated.timing(fabAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.timing(fabAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start(() => setAddModalVisible(true));
  };

  const handleCardPress = (complaint: Complaint): void => {
    setSelectedComplaint(complaint);
    setDetailModalVisible(true);
  };
  
  const handleQuickResolve = async (complaintId: string): Promise<void> => {
    await handleUpdateComplaint(complaintId, 'resolved');
  };

  const handleQuickReject = async (complaintId: string): Promise<void> => {
    Alert.alert(
      'Reject Complaint',
      'Are you sure you want to reject this complaint?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            await handleUpdateComplaint(complaintId, 'rejected');
          },
        },
      ]
    );
  };

  // --- RENDER METHODS ---
  const renderComplaintCard = ({ item }: { item: Complaint }) => (
    <TouchableOpacity
      style={styles.complaintCard}
      activeOpacity={0.85}
      onPress={() => handleCardPress(item)}
    >
      <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.complaintId}>{item.id}</Text>
        <Text style={styles.complaintTitle}>{item.title}</Text>
        <Text style={styles.complaintDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.complaintMetaRow}>
          <Text style={styles.complaintDate}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.complaintStudent}>{item.studentName}</Text>
          <Text style={[styles.complaintPriority, { color: item.priority === 'high' ? '#FF6B6B' : item.priority === 'medium' ? '#FFC107' : '#4CAF50' }]}>
            {item.priority.toUpperCase()}
          </Text>
        </View>
      </View>
      {item.status !== 'resolved' && item.status !== 'rejected' && (
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => handleQuickResolve(item.id)}>
            <Ionicons name="checkmark-done" size={20} color={COLORS.resolved} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => handleQuickReject(item.id)}>
            <Ionicons name="close" size={20} color={COLORS.urgent} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading complaints...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Student Complaints</Text>
        <Text style={styles.headerCount}>{complaints.length} Total Complaints</Text>
      </View>

      {/* Filter Controls */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, selectedFilter === f.key && styles.filterChipActive]}
            onPress={() => setSelectedFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, selectedFilter === f.key && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, title, description, student..."
            placeholderTextColor={COLORS.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Complaints List */}
      <FlatList
        data={filteredComplaints}
        keyExtractor={item => item.id}
        renderItem={renderComplaintCard}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 10 }}
        ListEmptyComponent={<Text style={styles.emptyText}>No complaints found.</Text>}
        refreshing={loading}
        onRefresh={fetchComplaints}
      />

      {/* --- MODALS --- */}

      {/* Detail Modal */}
      {selectedComplaint && (
        <Modal
          visible={detailModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                <Text style={styles.modalTitle}>Complaint Details</Text>
                <View style={styles.modalStatusRow}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[selectedComplaint.status], marginRight: 8 }]} />
                  <Text style={styles.modalStatusLabel}>{getStatusLabel(selectedComplaint.status)}</Text>
                </View>
                <Text style={styles.modalId}>ID: {selectedComplaint.id}</Text>
                <Text style={styles.modalTitle}>{selectedComplaint.title}</Text>
                <Text style={styles.modalDesc}>{selectedComplaint.description}</Text>
                
                <Text style={styles.modalSection}>Student Info</Text>
                <Text style={styles.modalCustomer}>{selectedComplaint.studentName}</Text>
                {selectedComplaint.studentClass && (
                  <Text style={styles.modalCustomer}>Class: {selectedComplaint.studentClass}</Text>
                )}
                
                <Text style={styles.modalSection}>Complaint Details</Text>
                <Text style={styles.modalHistory}>Category: {selectedComplaint.category}</Text>
                <Text style={styles.modalHistory}>Priority: {selectedComplaint.priority.toUpperCase()}</Text>
                <Text style={styles.modalHistory}>Submitted: {formatDate(selectedComplaint.createdAt)}</Text>
                <Text style={styles.modalHistory}>Last Updated: {formatDate(selectedComplaint.updatedAt)}</Text>
                
                {selectedComplaint.adminResponse && (
                  <>
                    <Text style={styles.modalSection}>Admin Response</Text>
                    <Text style={styles.modalHistory}>{selectedComplaint.adminResponse}</Text>
                    {selectedComplaint.adminName && (
                      <Text style={styles.modalHistory}>- {selectedComplaint.adminName}</Text>
                    )}
                  </>
                )}
                
                <Text style={styles.modalSection}>Response</Text>
                <TextInput 
                   style={styles.resolutionInput} 
                   placeholder="Enter your response..." 
                   placeholderTextColor={COLORS.textSecondary} 
                   multiline 
                   value={adminResponse}
                   onChangeText={setAdminResponse}
                />
                
                <Text style={styles.modalSection}>Actions</Text>
                 <View style={styles.modalActionsRow}>
                  <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleUpdateComplaint(selectedComplaint.id, 'in-progress', adminResponse)}>
                    <Text style={styles.modalActionText}>In Progress</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleUpdateComplaint(selectedComplaint.id, 'resolved', adminResponse)}>
                    <Text style={styles.modalActionText}>Mark Resolved</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity style={[styles.modalActionBtn, { backgroundColor: COLORS.urgent }]} onPress={() => handleUpdateComplaint(selectedComplaint.id, 'rejected', adminResponse)}>
                    <Text style={styles.modalActionText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.modalActionBtn, { backgroundColor: '#FF5722' }]} onPress={() => {
                    Alert.alert(
                      'Delete Complaint',
                      'Are you sure you want to delete this complaint?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => handleDeleteComplaint(selectedComplaint.id)
                        },
                      ]
                    );
                  }}>
                    <Text style={styles.modalActionText}>Delete</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => {
                  setDetailModalVisible(false);
                  setAdminResponse('');
                }}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabAnim }] }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleFabPress}>
          <LinearGradient
            colors={[COLORS.accent, COLORS.progress]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <FontAwesome name="refresh" size={24} color={COLORS.text} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: 16,
    fontSize: 16,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '600',
  },
  headerCount: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginTop: 4,
  },
  filterScroll: {
    paddingHorizontal: 12,
    maxHeight: 50,
  },
  filterChip: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.accent,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.text,
  },
  searchRow: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    height: '100%',
  },
  complaintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 14,
  },
  complaintId: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  complaintTitle: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  complaintDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  complaintMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  complaintDate: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  complaintStudent: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '500',
  },
  complaintPriority: {
    fontSize: 13,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'column',
    marginLeft: 10,
  },
  quickActionBtn: {
    backgroundColor: COLORS.input,
    borderRadius: 8,
    padding: 6,
    marginBottom: 6,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '85%',
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalStatusLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
  modalId: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  },
  modalDesc: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  modalSection: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  modalCustomer: {
    color: COLORS.text,
    fontSize: 15,
  },
  modalHistory: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 4,
  },
  resolutionInput: {
    backgroundColor: COLORS.input,
    color: COLORS.text,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  modalActionBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  modalActionText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  modalCloseBtn: {
    backgroundColor: COLORS.urgent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  modalCloseText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    elevation: 8,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
