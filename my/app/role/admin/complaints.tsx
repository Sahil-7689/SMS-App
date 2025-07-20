import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
  { key: 'progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'urgent', label: 'Urgent' },
];

const STATUS_COLORS = {
  urgent: COLORS.urgent,
  pending: COLORS.pending,
  progress: COLORS.progress,
  resolved: COLORS.resolved,
};

// --- MOCK DATA ---

type ComplaintStatus = 'urgent' | 'pending' | 'progress' | 'resolved';
type ComplaintPriority = 'Low' | 'Medium' | 'High';

interface ComplaintHistory {
  date: string;
  action: string;
  by: string;
}

interface Complaint {
  id: string;
  status: ComplaintStatus;
  description: string;
  date: string;
  priority: ComplaintPriority;
  customer: string;
  history: ComplaintHistory[];
  attachments: any[];
}

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP001',
    status: 'urgent',
    description: 'Water leakage in classroom 10B. Needs immediate attention.',
    date: '2024-06-20',
    priority: 'High',
    customer: 'Amit Kumar',
    history: [{ date: '2024-06-20', action: 'Submitted', by: 'Amit Kumar' }],
    attachments: [],
  },
  {
    id: 'CMP002',
    status: 'pending',
    description: 'Broken window in library.',
    date: '2024-06-19',
    priority: 'Medium',
    customer: 'Priya Singh',
    history: [{ date: '2024-06-19', action: 'Submitted', by: 'Priya Singh' }],
    attachments: [],
  },
  {
    id: 'CMP003',
    status: 'progress',
    description: 'Projector not working in AV room.',
    date: '2024-06-18',
    priority: 'Low',
    customer: 'Rahul Verma',
    history: [
      { date: '2024-06-18', action: 'Submitted', by: 'Rahul Verma' },
      { date: '2024-06-19', action: 'Assigned', by: 'Admin' },
    ],
    attachments: [],
  },
  {
    id: 'CMP004',
    status: 'resolved',
    description: 'Fan not working in staff room.',
    date: '2024-06-15',
    priority: 'Low',
    customer: 'Sunita Rao',
    history: [
      { date: '2024-06-15', action: 'Submitted', by: 'Sunita Rao' },
      { date: '2024-06-16', action: 'Resolved', by: 'Maintenance' },
    ],
    attachments: [],
  },
];

// --- HELPER FUNCTIONS ---
function getStatusLabel(status: ComplaintStatus): string {
  switch (status) {
    case 'urgent': return 'Urgent';
    case 'pending': return 'Pending';
    case 'progress': return 'In Progress';
    case 'resolved': return 'Resolved';
    default: return '';
  }
}

// --- MAIN COMPONENT ---
export default function ComplaintsPage() {
  // --- STATE MANAGEMENT ---
  const [complaints, setComplaints] = useState<Complaint[]>(MOCK_COMPLAINTS);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  
  // Modal States
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  
  // Data States
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  
  // New Complaint Form State
  const [newDescription, setNewDescription] = useState<string>('');
  const [newCustomer, setNewCustomer] = useState<string>('');
  const [newPriority, setNewPriority] = useState<ComplaintPriority>('Medium');

  // Animation State
  const [fabAnim] = useState<Animated.Value>(new Animated.Value(1));

  // --- DERIVED STATE (FILTERING) ---
  const filteredComplaints = useMemo(() =>
    complaints.filter((c: Complaint) =>
      (selectedFilter === 'all' || c.status === selectedFilter) &&
      (c.id.toLowerCase().includes(search.toLowerCase()) || 
       c.description.toLowerCase().includes(search.toLowerCase()) ||
       c.customer.toLowerCase().includes(search.toLowerCase()))
    ), [complaints, selectedFilter, search]);

  // --- HANDLERS ---
  const handleUpdateComplaint = (
    complaintId: string,
    newStatus: ComplaintStatus,
    notes: string = ''
  ): void => {
      setComplaints((prevComplaints: Complaint[]) => {
          const updatedComplaints = prevComplaints.map((c: Complaint) => {
              if (c.id === complaintId) {
                  const newHistory: ComplaintHistory[] = [...c.history, {
                      date: new Date().toISOString().split('T')[0],
                      action: `Status changed to ${getStatusLabel(newStatus)}. ${notes ? `Notes: ${notes}` : ''}`,
                      by: 'Admin'
                  }];
                  return { ...c, status: newStatus, history: newHistory };
              }
              return c;
          });
          return updatedComplaints;
      });
      // To ensure the selected complaint in the modal also reflects the change immediately
      setSelectedComplaint((prev) => prev ? { ...prev, status: newStatus } : null);
  };
  
  const handleAddNewComplaint = (): void => {
      if (!newDescription || !newCustomer) {
          Alert.alert('Missing Information', 'Please fill out both description and customer name.');
          return;
      }
      const newId = `CMP${(complaints.length + 1).toString().padStart(3, '0')}`;
      const newComplaint: Complaint = {
          id: newId,
          status: 'pending',
          description: newDescription,
          date: new Date().toISOString().split('T')[0],
          priority: newPriority,
          customer: newCustomer,
          history: [{ date: new Date().toISOString().split('T')[0], action: 'Submitted', by: newCustomer }],
          attachments: [],
      };
      setComplaints((prev) => [newComplaint, ...prev]);
      setAddModalVisible(false);
      // Reset form
      setNewDescription('');
      setNewCustomer('');
      setNewPriority('Medium');
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
  
  const handleQuickResolve = (complaintId: string): void => {
      handleUpdateComplaint(complaintId, 'resolved');
      Alert.alert('Success', `Complaint ${complaintId} marked as resolved.`);
  }

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
        <Text style={styles.complaintDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.complaintMetaRow}>
          <Text style={styles.complaintDate}>{item.date}</Text>
          <Text style={styles.complaintPriority}>{item.priority}</Text>
        </View>
      </View>
      {item.status !== 'resolved' && (
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => handleQuickResolve(item.id)}>
            <Ionicons name="checkmark-done" size={20} color={COLORS.resolved} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => Alert.alert('Assign', `Assigning complaint ${item.id}...`)}>
            <Ionicons name="person-add" size={20} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Complaints Management</Text>
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
            placeholder="Search by ID, description, customer..."
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
                <Text style={styles.modalDesc}>{selectedComplaint.description}</Text>
                
                <Text style={styles.modalSection}>Customer Info</Text>
                <Text style={styles.modalCustomer}>{selectedComplaint.customer}</Text>
                
                <Text style={styles.modalSection}>History</Text>
                {selectedComplaint.history.map((h: ComplaintHistory, idx: number) => (
                  <Text key={idx} style={styles.modalHistory}>{h.date} - {h.action} by {h.by}</Text>
                ))}
                
                <Text style={styles.modalSection}>Actions</Text>
                 <View style={styles.modalActionsRow}>
                  <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleUpdateComplaint(selectedComplaint.id, 'progress')}>
                    <Text style={styles.modalActionText}>In Progress</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalActionBtn} onPress={() => handleUpdateComplaint(selectedComplaint.id, 'resolved')}>
                    <Text style={styles.modalActionText}>Mark Resolved</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setDetailModalVisible(false)}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Add New Complaint Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddModalVisible(false)}
      >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView>
                 <Text style={styles.modalTitle}>Add New Complaint</Text>
                 
                 <Text style={styles.modalSection}>Description</Text>
                 <TextInput 
                    style={styles.resolutionInput} 
                    placeholder="Enter complaint details..." 
                    placeholderTextColor={COLORS.textSecondary} 
                    multiline 
                    value={newDescription}
                    onChangeText={setNewDescription}
                 />

                 <Text style={styles.modalSection}>Customer Name</Text>
                 <TextInput 
                    style={styles.resolutionInput} 
                    placeholder="e.g., Priya Singh" 
                    placeholderTextColor={COLORS.textSecondary}
                    value={newCustomer}
                    onChangeText={setNewCustomer}
                 />

                 <Text style={styles.modalSection}>Priority</Text>
                 {/* A real app might use a picker here */}
                 <View style={styles.prioritySelector}>
                    <TouchableOpacity onPress={() => setNewPriority('Low')} style={[styles.priorityBtn, newPriority === 'Low' && styles.priorityBtnActive]}><Text style={styles.priorityBtnText}>Low</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setNewPriority('Medium')} style={[styles.priorityBtn, newPriority === 'Medium' && styles.priorityBtnActive]}><Text style={styles.priorityBtnText}>Medium</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => setNewPriority('High')} style={[styles.priorityBtn, newPriority === 'High' && styles.priorityBtnActive]}><Text style={styles.priorityBtnText}>High</Text></TouchableOpacity>
                 </View>

                 <TouchableOpacity style={[styles.modalActionBtn, {backgroundColor: COLORS.resolved, marginTop: 20}]} onPress={handleAddNewComplaint}>
                    <Text style={styles.modalActionText}>Submit Complaint</Text>
                 </TouchableOpacity>

                 <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setAddModalVisible(false)}>
                  <Text style={styles.modalCloseText}>Cancel</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
      </Modal>

      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabAnim }] }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={handleFabPress}>
          <LinearGradient
            colors={[COLORS.accent, COLORS.progress]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Ionicons name="add" size={28} color={COLORS.text} />
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
  complaintPriority: {
    color: COLORS.accent,
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
  prioritySelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
  },
  priorityBtn: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      backgroundColor: COLORS.input,
      alignItems: 'center',
      marginHorizontal: 4,
  },
  priorityBtnActive: {
      backgroundColor: COLORS.accent,
      borderColor: COLORS.text,
      borderWidth: 1,
  },
  priorityBtnText: {
      color: COLORS.text,
      fontWeight: '600',
  }
});
