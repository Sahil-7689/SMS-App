import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  TextInput,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#1E1E1E',
  card: '#232323',
  accent: '#6C63FF',
  accent2: '#FFD600',
  accent3: '#4CAF50',
  accent4: '#FF5252',
  text: '#FFFFFF',
  textSecondary: '#808080',
  chip: '#333333',
  border: '#353945',
  pending: '#FFD600',
  approved: '#4CAF50',
  rejected: '#FF5252',
};

const FILTERS = [
  { key: 'all', label: 'All Requests' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

const STATUS_COLORS: { [key: string]: string } = {
  pending: COLORS.pending,
  approved: COLORS.approved,
  rejected: COLORS.rejected,
};

const MOCK_LEAVES = [
  {
    id: 'L001',
    name: 'Ms. Sharma',
    photo: require('../../../assets/images/icon.png'),
    start: '2024-06-20',
    end: '2024-06-22',
    type: 'Sick Leave',
    status: 'pending',
  },
  {
    id: 'L002',
    name: 'Mr. Verma',
    photo: require('../../../assets/images/icon.png'),
    start: '2024-06-15',
    end: '2024-06-16',
    type: 'Personal Leave',
    status: 'approved',
  },
  {
    id: 'L003',
    name: 'Ms. Rao',
    photo: require('../../../assets/images/icon.png'),
    start: '2024-06-10',
    end: '2024-06-12',
    type: 'Sick Leave',
    status: 'rejected',
  },
  {
    id: 'L004',
    name: 'Mr. Singh',
    photo: require('../../../assets/images/icon.png'),
    start: '2024-06-25',
    end: '2024-06-27',
    type: 'Personal Leave',
    status: 'pending',
  },
];

export default function TeacherLeavesPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ start: '', end: '', type: '', reason: '', file: null });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const filteredLeaves = MOCK_LEAVES.filter(l => selectedFilter === 'all' || l.status === selectedFilter);

  const handleApprove = (id: string) => {
    setToast('Leave approved!');
    setTimeout(() => setToast(''), 2000);
  };
  const handleReject = (id: string) => {
    setToast('Leave rejected!');
    setTimeout(() => setToast(''), 2000);
  };
  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setModalVisible(false);
      setToast('Leave request submitted!');
      setTimeout(() => setToast(''), 2000);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Leave Requests</Text>
      </View>
      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, selectedFilter === f.key && styles.filterChipActive]}
            onPress={() => setSelectedFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, selectedFilter === f.key && styles.filterChipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Leave Requests Grid */}
      {loading ? (
        <ActivityIndicator color={COLORS.accent} size="large" style={{ marginTop: 40 }} />
      ) : filteredLeaves.length === 0 ? (
        <View style={styles.emptyState}><Ionicons name="cloud-offline" size={48} color={COLORS.textSecondary} /><Text style={styles.emptyText}>No leave requests found.</Text></View>
      ) : (
        <FlatList
          data={filteredLeaves}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 8 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          renderItem={({ item }) => (
            <View style={styles.leaveCard}>
              <View style={styles.cardHeader}>
                <Image source={item.photo} style={styles.profilePhoto} />
                <Text style={styles.teacherName}>{item.name}</Text>
              </View>
              <Text style={styles.leaveDates}>{item.start} - {item.end}</Text>
              <Text style={styles.leaveType}>{item.type}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
              </View>
              {item.status === 'pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleApprove(item.id)}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.approved} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleReject(item.id)}>
                    <Ionicons name="close-circle" size={20} color={COLORS.rejected} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.fab, {backgroundColor: COLORS.accent3}]} activeOpacity={0.8} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={28} color={COLORS.text} />
      </TouchableOpacity>
      {/* Leave Application Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Apply for Leave</Text>
            <TextInput
              style={styles.input}
              placeholder="Start Date (YYYY-MM-DD)"
              placeholderTextColor={COLORS.textSecondary}
              value={form.start}
              onChangeText={v => setForm({ ...form, start: v })}
            />
            <TextInput
              style={styles.input}
              placeholder="End Date (YYYY-MM-DD)"
              placeholderTextColor={COLORS.textSecondary}
              value={form.end}
              onChangeText={v => setForm({ ...form, end: v })}
            />
            <TextInput
              style={styles.input}
              placeholder="Leave Type (e.g. Sick, Personal)"
              placeholderTextColor={COLORS.textSecondary}
              value={form.type}
              onChangeText={v => setForm({ ...form, type: v })}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Reason"
              placeholderTextColor={COLORS.textSecondary}
              value={form.reason}
              onChangeText={v => setForm({ ...form, reason: v })}
              multiline
            />
            <TouchableOpacity style={styles.uploadBtn}>
              <Ionicons name="cloud-upload" size={20} color={COLORS.accent} />
              <Text style={styles.uploadText}>Upload Document (optional)</Text>
            </TouchableOpacity>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator color={COLORS.text} /> : <Text style={styles.submitText}>Submit</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Toast Message */}
      {toast ? (
        <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    backgroundColor: COLORS.card,
    paddingTop: 36,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: COLORS.card,
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: COLORS.chip,
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 16,
    marginRight: 8,
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
  leaveCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: (width - 48) / 2,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profilePhoto: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.accent,
    marginRight: 8,
  },
  teacherName: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 15,
  },
  leaveDates: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 2,
  },
  leaveType: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  actionBtn: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 6,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    zIndex: 10,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30,30,30,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.background,
    color: COLORS.text,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  uploadText: {
    color: COLORS.accent,
    fontSize: 14,
    marginLeft: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  submitBtn: {
    backgroundColor: COLORS.accent3,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  submitText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: COLORS.chip,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    flex: 1,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 40,
    zIndex: 100,
  },
  toastText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 12,
  },
}); 