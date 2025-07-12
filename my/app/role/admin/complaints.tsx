import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

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
};

const FILTERS = [
  { key: 'all', label: 'All Complaints' },
  { key: 'pending', label: 'Pending' },
  { key: 'progress', label: 'In Progress' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'urgent', label: 'Urgent' },
];

const STATUS_COLORS: { [key: string]: string } = {
  urgent: COLORS.urgent,
  pending: COLORS.pending,
  progress: COLORS.progress,
  resolved: COLORS.resolved,
};

type ComplaintStatus = 'urgent' | 'pending' | 'progress' | 'resolved';
type Complaint = {
  id: string;
  status: ComplaintStatus;
  description: string;
  date: string;
  priority: string;
  customer: string;
  history: { date: string; action: string; by: string }[];
  attachments: any[];
};

const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP001',
    status: 'urgent',
    description: 'Water leakage in classroom 10B. Needs immediate attention.',
    date: '2024-06-20',
    priority: 'High',
    customer: 'Amit Kumar',
    history: [
      { date: '2024-06-20', action: 'Submitted', by: 'Amit Kumar' },
    ],
    attachments: [],
  },
  {
    id: 'CMP002',
    status: 'pending',
    description: 'Broken window in library.',
    date: '2024-06-19',
    priority: 'Medium',
    customer: 'Priya Singh',
    history: [
      { date: '2024-06-19', action: 'Submitted', by: 'Priya Singh' },
    ],
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

function getStatusLabel(status: ComplaintStatus) {
  switch (status) {
    case 'urgent': return 'Urgent';
    case 'pending': return 'Pending';
    case 'progress': return 'In Progress';
    case 'resolved': return 'Resolved';
    default: return '';
  }
}

export default function ComplaintsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [fabAnim] = useState(new Animated.Value(1));

  const filteredComplaints = MOCK_COMPLAINTS.filter(c =>
    (selectedFilter === 'all' || c.status === selectedFilter) &&
    (c.id.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleFabPress = () => {
    Animated.sequence([
      Animated.timing(fabAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.timing(fabAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    // Add new complaint logic here
  };

  const handleCardPress = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setModalVisible(true);
  };

  // Swipe actions would be implemented with a library like react-native-gesture-handler or react-native-swipe-list-view
  // For now, show placeholder buttons for Mark Resolved and Assign

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Complaints Management</Text>
        <Text style={styles.headerCount}>{MOCK_COMPLAINTS.length} Complaints</Text>
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
            <View style={styles.filterChipTextWrapper}>
              <Text
                style={[
                  styles.filterChipText,
                  { opacity: selectedFilter === f.key ? 0 : 1 }
                ]}
              >
                {f.label}
              </Text>
              <Text
                style={[
                  styles.filterChipTextActive,
                  { opacity: selectedFilter === f.key ? 1 : 0, position: 'absolute', left: 0, right: 0 }
                ]}
              >
                {f.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search complaints..."
            placeholderTextColor={COLORS.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterIconBtn} activeOpacity={1}>
          <Ionicons name="filter" size={22} color={COLORS.accent} />
        </TouchableOpacity>
      </View>
      {/* Complaints List */}
      <FlatList
        data={filteredComplaints}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
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
            {/* Placeholder swipe actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.quickActionBtn}>
                <Ionicons name="checkmark-done" size={20} color={COLORS.resolved} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionBtn}>
                <Ionicons name="person-add" size={20} color={COLORS.accent} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No complaints found.</Text>}
      />
      {/* Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedComplaint && (
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
                {selectedComplaint.history.map((h, idx) => (
                  <Text key={idx} style={styles.modalHistory}>{h.date} - {h.action} by {h.by}</Text>
                ))}
                <Text style={styles.modalSection}>Attachments</Text>
                <Text style={styles.modalAttachment}>No attachments</Text>
                <Text style={styles.modalSection}>Status Update</Text>
                <TouchableOpacity style={styles.statusDropdown}><Text style={styles.statusDropdownText}>Change Status</Text></TouchableOpacity>
                <Text style={styles.modalSection}>Resolution Notes</Text>
                <TextInput style={styles.resolutionInput} placeholder="Add notes..." placeholderTextColor={COLORS.textSecondary} multiline />
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity style={styles.modalActionBtn}><Text style={styles.modalActionText}>Update Status</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.modalActionBtn}><Text style={styles.modalActionText}>Mark Resolved</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.modalActionBtn}><Text style={styles.modalActionText}>Assign</Text></TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabAnim }] }]}> 
        <TouchableOpacity activeOpacity={0.8} onPress={handleFabPress}>
          <LinearGradient
            colors={[COLORS.accent, COLORS.progress]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Ionicons name="add" size={28} color={COLORS.text} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 36,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerCount: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginBottom: 6,
  },
  filterScroll: {
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 7,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.accent,
  },
  filterChipTextWrapper: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  filterChipTextActive: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'System',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
  },
  filterIconBtn: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  complaintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
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
    marginBottom: 2,
  },
  complaintDesc: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  complaintMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  complaintDate: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  complaintPriority: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'column',
    marginLeft: 10,
    alignItems: 'center',
  },
  quickActionBtn: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 6,
    marginBottom: 6,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30,30,30,0.85)',
    justifyContent: 'flex-end',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalStatusLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  modalId: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  modalDesc: {
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 10,
  },
  modalSection: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  modalCustomer: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 6,
  },
  modalHistory: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 2,
  },
  modalAttachment: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  statusDropdown: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  statusDropdownText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  resolutionInput: {
    backgroundColor: COLORS.background,
    color: COLORS.text,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    minHeight: 60,
    marginBottom: 10,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalActionBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  modalActionText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseBtn: {
    backgroundColor: COLORS.urgent,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 