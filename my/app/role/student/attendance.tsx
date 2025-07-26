import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Modal } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface QuickStat { label: string; value: number; }
interface Subject { name: string; total: number; attended: number; }
const OVERALL_ATTENDANCE: number = 0; // TODO: Inject from API or context
const PRESENT: number = 0; // TODO: Inject from API or context
const ABSENT: number = 0; // TODO: Inject from API or context
const QUICK_STATS: QuickStat[] = []; // TODO: Inject from API or context
const SUBJECTS: Subject[] = []; // TODO: Inject from API or context

export default function AttendanceScreen() {
  const [leaveNoteModalVisible, setLeaveNoteModalVisible] = useState(false);
  const [leaveNoteData, setLeaveNoteData] = useState({
    reason: '',
    startDate: '',
    endDate: '',
    description: '',
    type: 'sick' // 'sick', 'personal', 'emergency'
  });

  const handleLeaveNote = () => {
    setLeaveNoteModalVisible(true);
    // Reset form data
    setLeaveNoteData({
      reason: '',
      startDate: '',
      endDate: '',
      description: '',
      type: 'sick'
    });
  };

  const handleLeaveNoteChange = (field: string, value: string) => {
    setLeaveNoteData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitLeaveNote = () => {
    // Validate required fields
    if (!leaveNoteData.reason || !leaveNoteData.startDate || !leaveNoteData.endDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Here you would typically send the leave note data to your backend
    console.log('Leave note submitted:', leaveNoteData);
    alert('Leave note submitted successfully!');
    setLeaveNoteModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Attendance</Text>
        <TouchableOpacity>
          <FontAwesome name="bell" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <FontAwesome name="search" size={16} color="#A0A0A0" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#A0A0A0"
        />
      </View>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={require('../../../assets/images/icon.png')} style={styles.avatar} />
        <View style={{ marginLeft: 14 }}>
          <Text style={styles.profileName}>Student</Text>
          <Text style={styles.profileClass}>Class 10-B</Text>
        </View>
      </View>
      {/* Overall Attendance */}
      <View style={styles.overallCard}>
        <Text style={styles.overallLabel}>Overall Attendance</Text>
        <Text style={styles.overallPercent}>{OVERALL_ATTENDANCE}%</Text>
        <View style={styles.barChartRow}>
          <View style={styles.barChartLabelRow}>
            <FontAwesome name="check-circle" size={16} color="#4ADE80" style={{ marginRight: 6 }} />
            <Text style={styles.barChartLabel}>Present</Text>
          </View>
          <View style={styles.barChartLabelRow}>
            <FontAwesome name="times-circle" size={16} color="#F472B6" style={{ marginRight: 6 }} />
            <Text style={styles.barChartLabel}>Absent</Text>
          </View>
        </View>
        <View style={styles.barChartBg}>
          <View style={[styles.barChartFill, { width: `${(PRESENT / (PRESENT + ABSENT)) * 100}%`, backgroundColor: '#4ADE80' }]} />
          <View style={[styles.barChartFill, { width: `${(ABSENT / (PRESENT + ABSENT)) * 100}%`, backgroundColor: '#F472B6' }]} />
        </View>
        <View style={styles.barChartNumbersRow}>
          <Text style={styles.barChartNumber}>{PRESENT}</Text>
          <Text style={styles.barChartNumber}>{ABSENT}</Text>
        </View>
      </View>
      {/* Quick Statistics */}
      <View style={styles.statsGrid}>
        {QUICK_STATS.length === 0 ? <Text style={{color:'#fff', textAlign:'center'}}>No stats available.</Text> : QUICK_STATS.map((stat, idx) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.leaveBtn} onPress={handleLeaveNote}>
        <Text style={styles.leaveBtnText}>Add Leave Note</Text>
      </TouchableOpacity>
      {/* Subject-wise Breakdown */}
      <Text style={styles.sectionTitle}>Subject-wise Attendance</Text>
      <View style={styles.subjectList}>
        {SUBJECTS.length === 0 ? <Text style={{color:'#fff', textAlign:'center'}}>No subjects available.</Text> : SUBJECTS.map((s, idx) => {
          const percent = Math.round((s.attended / s.total) * 100);
          return (
            <View key={s.name}>
              <View style={styles.subjectRow}>
                <Text style={styles.subjectName}>{s.name}</Text>
                <Text style={styles.subjectStats}>{s.attended} / {s.total} ({percent}%)</Text>
              </View>
              {idx < SUBJECTS.length - 1 && <View style={styles.divider} />}
            </View>
          );
        })}
      </View>

      {/* Leave Note Modal */}
      <Modal
        visible={leaveNoteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLeaveNoteModalVisible(false)}
      >
        <View style={styles.leaveNoteModalOverlay}>
          <View style={styles.leaveNoteModalContent}>
            <View style={styles.leaveNoteModalHeader}>
              <Text style={styles.leaveNoteModalTitle}>Submit Leave Note</Text>
              <TouchableOpacity onPress={() => setLeaveNoteModalVisible(false)}>
                <FontAwesome name="times" size={20} color="#B0B0B0" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.leaveNoteForm} showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Leave Type *</Text>
                <View style={styles.leaveTypeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.leaveTypeBtn,
                      leaveNoteData.type === 'sick' && styles.leaveTypeBtnActive
                    ]}
                    onPress={() => handleLeaveNoteChange('type', 'sick')}
                  >
                    <FontAwesome name="bed" size={14} color={leaveNoteData.type === 'sick' ? '#FFFFFF' : '#B0B0B0'} />
                    <Text style={[
                      styles.leaveTypeBtnText,
                      leaveNoteData.type === 'sick' && styles.leaveTypeBtnTextActive
                    ]}>Sick Leave</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.leaveTypeBtn,
                      leaveNoteData.type === 'personal' && styles.leaveTypeBtnActive
                    ]}
                    onPress={() => handleLeaveNoteChange('type', 'personal')}
                  >
                    <FontAwesome name="user" size={14} color={leaveNoteData.type === 'personal' ? '#FFFFFF' : '#B0B0B0'} />
                    <Text style={[
                      styles.leaveTypeBtnText,
                      leaveNoteData.type === 'personal' && styles.leaveTypeBtnTextActive
                    ]}>Personal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.leaveTypeBtn,
                      leaveNoteData.type === 'emergency' && styles.leaveTypeBtnActive
                    ]}
                    onPress={() => handleLeaveNoteChange('type', 'emergency')}
                  >
                    <FontAwesome name="exclamation-triangle" size={14} color={leaveNoteData.type === 'emergency' ? '#FFFFFF' : '#B0B0B0'} />
                    <Text style={[
                      styles.leaveTypeBtnText,
                      leaveNoteData.type === 'emergency' && styles.leaveTypeBtnTextActive
                    ]}>Emergency</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Reason *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter leave reason"
                  placeholderTextColor="#B0B0B0"
                  value={leaveNoteData.reason}
                  onChangeText={(text) => handleLeaveNoteChange('reason', text)}
                />
              </View>

              <View style={styles.dateRow}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Start Date *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#B0B0B0"
                    value={leaveNoteData.startDate}
                    onChangeText={(text) => handleLeaveNoteChange('startDate', text)}
                  />
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>End Date *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#B0B0B0"
                    value={leaveNoteData.endDate}
                    onChangeText={(text) => handleLeaveNoteChange('endDate', text)}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Description</Text>
                <TextInput
                  style={[styles.formInput, styles.textArea]}
                  placeholder="Additional details (optional)"
                  placeholderTextColor="#B0B0B0"
                  value={leaveNoteData.description}
                  onChangeText={(text) => handleLeaveNoteChange('description', text)}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <View style={styles.leaveNoteModalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setLeaveNoteModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmitLeaveNote}
              >
                <Text style={styles.submitBtnText}>Submit Leave Note</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

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
    paddingTop: 32,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23262F',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23262F',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#A259FF',
  },
  profileName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  profileClass: {
    color: '#A0A0A0',
    fontSize: 13,
  },
  overallCard: {
    backgroundColor: '#23262F',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  overallLabel: {
    color: '#A0A0A0',
    fontSize: 15,
    marginBottom: 6,
  },
  overallPercent: {
    color: '#fff',
    fontSize: 38,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  barChartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    marginBottom: 2,
  },
  barChartLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barChartLabel: {
    color: '#A0A0A0',
    fontSize: 13,
    marginRight: 8,
  },
  barChartBg: {
    flexDirection: 'row',
    width: '100%',
    height: 12,
    backgroundColor: '#353945',
    borderRadius: 6,
    marginTop: 4,
    marginBottom: 2,
    overflow: 'hidden',
  },
  barChartFill: {
    height: 12,
    borderRadius: 6,
  },
  barChartNumbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 2,
  },
  barChartNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    marginBottom: 10,
  },
  statCard: {
    backgroundColor: '#23262F',
    borderRadius: 12,
    flex: 1,
    minWidth: 140,
    margin: 6,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    color: '#A0A0A0',
    fontSize: 13,
    textAlign: 'center',
  },
  leaveBtn: {
    backgroundColor: '#A259FF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginHorizontal: 20,
    marginBottom: 18,
    alignItems: 'center',
    shadowColor: '#A259FF',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  leaveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 10,
    marginLeft: 20,
  },
  subjectList: {
    backgroundColor: '#23262F',
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 6,
    padding: 10,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  subjectName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  subjectStats: {
    color: '#A0A0A0',
    fontSize: 15,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#353945',
    marginHorizontal: 4,
  },
  // Leave Note Modal Styles
  leaveNoteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveNoteModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
  },
  leaveNoteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  leaveNoteModalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  leaveNoteForm: {
    padding: 20,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#23262F',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  leaveTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  leaveTypeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333333',
    backgroundColor: 'transparent',
    gap: 6,
  },
  leaveTypeBtnActive: {
    backgroundColor: '#A259FF',
    borderColor: '#A259FF',
  },
  leaveTypeBtnText: {
    color: '#B0B0B0',
    fontSize: 12,
    fontWeight: '500',
  },
  leaveTypeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  leaveNoteModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  cancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  cancelBtnText: {
    color: '#B0B0B0',
    fontSize: 16,
    fontWeight: '500',
  },
  submitBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#A259FF',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 