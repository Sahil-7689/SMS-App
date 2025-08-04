import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStudentLeaveRequests, updateStudentLeaveStatus } from '../../../config/firebase';

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

interface Leave {
  id: string;
  teacherId?: string;
  teacherName?: string;
  studentId?: string;
  studentName?: string;
  studentClass?: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: string;
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  adminComment?: string;
  attachmentFileName?: string;
  attachmentType?: string;
  parentContact?: string;
  isStudent?: boolean;
}

export default function TeacherLeavesPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [teacherId, setTeacherId] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('');
  const [toast, setToast] = useState('');

  const filteredLeaves = leaves.filter(l => {
    return selectedFilter === 'all' || l.status === selectedFilter;
  });

  useEffect(() => {
    fetchTeacherInfo();
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    fetchLeaveRequests();
  }, [selectedFilter]);

  const fetchTeacherInfo = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        setTeacherId(parsed.uid || '');
        setTeacherName(parsed.name || parsed.fullName || '');
      }
    } catch (error) {
      console.error('Error fetching teacher info:', error);
    }
  };

    const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      
      // Build filters object - only include status if it's not 'all'
      const studentFilters: any = {};
      
      if (selectedFilter !== 'all') {
        studentFilters.status = selectedFilter;
      }
      
      // Fetch student leave requests (all students for teacher to review)
      const studentResult = await getStudentLeaveRequests(studentFilters);
      
      let allLeaves: Leave[] = [];
      
      // Map student leave requests
      if (studentResult.success && studentResult.leaveRequests) {
        const studentLeaves: Leave[] = studentResult.leaveRequests.map((doc: any) => ({
          id: doc.id,
          studentId: doc.studentId || '',
          studentName: doc.studentName || '',
          studentClass: doc.studentClass || '',
          startDate: doc.startDate || '',
          endDate: doc.endDate || '',
          leaveType: doc.leaveType || '',
          reason: doc.reason || '',
          status: doc.status || 'pending',
          submittedAt: doc.submittedAt?.toDate() || new Date(),
          reviewedBy: doc.reviewedBy || '',
          reviewedAt: doc.reviewedAt?.toDate() || undefined,
          adminComment: doc.adminComment || '',
          attachmentFileName: doc.attachmentFileName || '',
          attachmentType: doc.attachmentType || '',
          parentContact: doc.parentContact || '',
          isStudent: true,
        }));
        
        allLeaves = [...studentLeaves, ...allLeaves];
      }
      
      setLeaves(allLeaves);
      
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      Alert.alert('Error', 'Failed to fetch leave requests');
      setLeaves([]); // Ensure leaves is set to empty array on error
    } finally {
      setLoading(false);
    }
  };



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleApproveLeave = async (leaveId: string, studentName: string) => {
    try {
      const result = await updateStudentLeaveStatus(
        leaveId, 
        'approved', 
        teacherId, 
        teacherName, 
        'Leave request approved by teacher'
      );
      
      if (result.success) {
        Alert.alert('Success', `Leave request for ${studentName} has been approved`);
        fetchLeaveRequests(); // Refresh the list
      } else {
        Alert.alert('Error', result.error || 'Failed to approve leave request');
      }
    } catch (error) {
      console.error('Error approving leave request:', error);
      Alert.alert('Error', 'Failed to approve leave request');
    }
  };

  const handleRejectLeave = async (leaveId: string, studentName: string) => {
    try {
      const result = await updateStudentLeaveStatus(
        leaveId, 
        'rejected', 
        teacherId, 
        teacherName, 
        'Leave request rejected by teacher'
      );
      
      if (result.success) {
        Alert.alert('Success', `Leave request for ${studentName} has been rejected`);
        fetchLeaveRequests(); // Refresh the list
      } else {
        Alert.alert('Error', result.error || 'Failed to reject leave request');
      }
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      Alert.alert('Error', 'Failed to reject leave request');
    }
  };



  return (
    <View style={styles.container}>
             {/* Header */}
       <View style={styles.headerBar}>
         <Text style={styles.headerTitle}>Student Leave Requests</Text>
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
         <View style={styles.emptyState}>
           <Ionicons name="cloud-offline" size={48} color={COLORS.textSecondary} />
           <Text style={styles.emptyText}>No leave requests found.</Text>
         </View>
       ) : (
        <FlatList
          data={filteredLeaves}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 8 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
                                       renderItem={({ item, index }) => (
           <View style={[
             styles.leaveCard, 
             item.isStudent && styles.studentLeaveCard
           ]}>
             <View style={styles.cardHeader}>
               <View style={[
                 styles.profilePhoto,
                 item.isStudent && styles.studentProfilePhoto
               ]}>
                 <Ionicons 
                   name={item.isStudent ? "school" : "person"} 
                   size={20} 
                   color={item.isStudent ? COLORS.accent2 : COLORS.accent} 
                 />
               </View>
               <View style={styles.nameContainer}>
                 <Text style={[
                   styles.teacherName,
                   item.isStudent && styles.studentName
                 ]}>
                   {item.isStudent ? item.studentName : item.teacherName}
                 </Text>
                 {item.isStudent && (
                   <Text style={styles.studentClass}>Class {item.studentClass}</Text>
                 )}
               </View>
               {item.isStudent && (
                 <View style={styles.studentBadge}>
                   <Text style={styles.studentBadgeText}>Student</Text>
                 </View>
               )}
             </View>
             <Text style={styles.leaveDates}>
               {formatDate(item.startDate)} - {formatDate(item.endDate)}
             </Text>
             <Text style={styles.leaveType}>{item.leaveType}</Text>
             <Text style={styles.leaveReason} numberOfLines={2}>
               {item.reason}
             </Text>
             {item.isStudent && item.parentContact && (
               <Text style={styles.parentContact} numberOfLines={1}>
                 Parent: {item.parentContact}
               </Text>
             )}
             <View style={styles.statusRow}>
               <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[item.status] }]} />
               <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                 {getStatusText(item.status)}
               </Text>
             </View>
             {item.adminComment && (
               <Text style={styles.adminComment} numberOfLines={2}>
                 Admin: {item.adminComment}
               </Text>
             )}
                           {item.attachmentFileName && (
                <View style={styles.attachmentRow}>
                  <Ionicons name="document" size={16} color={COLORS.accent} />
                  <Text style={styles.attachmentText} numberOfLines={1}>
                    {item.attachmentFileName}
                  </Text>
                </View>
              )}
              
              {/* Action Buttons - Only show for pending requests */}
              {item.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApproveLeave(item.id, item.studentName || '')}
                  >
                    <Ionicons name="checkmark" size={16} color={COLORS.text} />
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleRejectLeave(item.id, item.studentName || '')}
                  >
                    <Ionicons name="close" size={16} color={COLORS.text} />
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
         )}
        />
      )}
      
      
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
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
  leaveReason: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 6,
    lineHeight: 16,
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
  adminComment: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 4,
    lineHeight: 14,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  attachmentText: {
    color: COLORS.accent,
    fontSize: 11,
    marginLeft: 4,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    zIndex: 10,
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
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
  // Student leave request styles
  studentLeaveCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent2,
  },
  studentProfilePhoto: {
    borderColor: COLORS.accent2,
  },
  nameContainer: {
    flex: 1,
    marginLeft: 8,
  },
  studentName: {
    color: COLORS.accent2,
  },
  studentClass: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  studentBadge: {
    backgroundColor: COLORS.accent2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  studentBadgeText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
     parentContact: {
     color: COLORS.textSecondary,
     fontSize: 11,
     marginBottom: 4,
     fontStyle: 'italic',
   },
   // Action button styles
   actionButtons: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     marginTop: 8,
     gap: 8,
   },
   actionButton: {
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'center',
     paddingVertical: 6,
     paddingHorizontal: 8,
     borderRadius: 6,
     flex: 1,
   },
   approveButton: {
     backgroundColor: COLORS.accent3,
   },
   rejectButton: {
     backgroundColor: COLORS.accent4,
   },
   actionButtonText: {
     color: COLORS.text,
     fontSize: 12,
     fontWeight: '600',
     marginLeft: 4,
   },
   
 }); 