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
  Dimensions,
  FlatList
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { 
  addTimetable, 
  getTimetables, 
  updateTimetable, 
  deleteTimetable,
  getClasses,
  getTeachers,
  auth 
} from '../../../config/firebase';

const { width } = Dimensions.get('window');

interface TimetableSlot {
  dayIndex: number;
  periodIndex: number;
  subject: string;
  teacherId: string;
  teacherName: string;
  room?: string;
  startTime?: string;
  endTime?: string;
}

interface Timetable {
  id: string;
  className: string;
  classId: string;
  days: string[];
  periods: string[];
  slots: TimetableSlot[];
  adminId: string;
  adminName: string;
  academicYear?: string;
  semester?: string;
  status: string;
  createdAt: any;
}

interface Class {
  id: string;
  name: string;
  section?: string;
}

interface Teacher {
  id: string;
  name: string;
  subject?: string;
}

const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DEFAULT_PERIODS = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7', 'Period 8'];

export default function TimetableTabScreen({ search }: { search: string }) {
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  // Form states
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');
  const [days, setDays] = useState<string[]>(DEFAULT_DAYS);
  const [periods, setPeriods] = useState<string[]>(DEFAULT_PERIODS);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);

  useEffect(() => {
    fetchTimetables();
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const result = await getTimetables({ status: 'active' });
      if (result.success && result.timetables) {
        setTimetables(result.timetables);
      } else {
        console.error('Failed to fetch timetables:', result.error);
      }
    } catch (error) {
      console.error('Error fetching timetables:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const result = await getClasses();
      if (result.success && result.classes) {
        setClasses(result.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const result = await getTeachers();
      if (result.success && result.teachers) {
        setTeachers(result.teachers);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const resetForm = () => {
    setSelectedClass('');
    setAcademicYear('');
    setSemester('');
    setDays(DEFAULT_DAYS);
    setPeriods(DEFAULT_PERIODS);
    setSlots([]);
    setEditingTimetable(null);
  };

  const handleSubmit = async () => {
    if (!selectedClass) {
      Alert.alert('Error', 'Please select a class');
      return;
    }

    try {
      setSaving(true);
      
      const selectedClassData = classes.find(c => c.id === selectedClass);
      if (!selectedClassData) {
        Alert.alert('Error', 'Selected class not found');
        return;
      }

      const timetableData = {
        className: selectedClassData.name,
        classId: selectedClass,
        days,
        periods,
        slots,
        adminId: auth.currentUser?.uid || '',
        adminName: auth.currentUser?.displayName || 'Admin',
        academicYear: academicYear || undefined,
        semester: semester || undefined,
      };

      const result = await addTimetable(timetableData);
      
      if (result.success) {
        Alert.alert('Success', 'Timetable created successfully');
        setModalVisible(false);
        resetForm();
        fetchTimetables();
      } else {
        Alert.alert('Error', result.error || 'Failed to create timetable');
      }
    } catch (error: any) {
      console.error('Error creating timetable:', error);
      Alert.alert('Error', error.message || 'Failed to create timetable');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (timetable: Timetable) => {
    setEditingTimetable(timetable);
    setSelectedClass(timetable.classId);
    setAcademicYear(timetable.academicYear || '');
    setSemester(timetable.semester || '');
    setDays(timetable.days);
    setPeriods(timetable.periods);
    setSlots(timetable.slots);
    setModalVisible(true);
  };

  const handleDelete = async (timetable: Timetable) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this timetable?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteTimetable(timetable.id);
              if (result.success) {
                Alert.alert('Success', 'Timetable deleted successfully');
                fetchTimetables();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete timetable');
              }
            } catch (error: any) {
              console.error('Error deleting timetable:', error);
              Alert.alert('Error', error.message || 'Failed to delete timetable');
            }
          },
        },
      ]
    );
  };

  const handleView = (timetable: Timetable) => {
    setSelectedTimetable(timetable);
    setViewModalVisible(true);
  };

  const addSlot = (dayIndex: number, periodIndex: number) => {
    Alert.alert(
      'Add Subject',
      'Select subject and teacher for this slot',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: () => {
            // Show teacher selection
            const teacherOptions = teachers.map(teacher => ({
              text: `${teacher.name}${teacher.subject ? ` (${teacher.subject})` : ''}`,
              onPress: () => {
                const subject = prompt('Enter subject name:');
                if (subject) {
                  const newSlot: TimetableSlot = {
                    dayIndex,
                    periodIndex,
                    subject,
                    teacherId: teacher.id,
                    teacherName: teacher.name,
                  };
                  setSlots(prev => [...prev, newSlot]);
                }
              }
            }));
            teacherOptions.push({ text: 'Cancel', onPress: () => {} });
            Alert.alert('Select Teacher', 'Choose a teacher:', teacherOptions);
          }
        }
      ]
    );
  };

  const removeSlot = (dayIndex: number, periodIndex: number) => {
    setSlots(prev => prev.filter(slot => 
      !(slot.dayIndex === dayIndex && slot.periodIndex === periodIndex)
    ));
  };

  const getSlotForPosition = (dayIndex: number, periodIndex: number) => {
    return slots.find(slot => 
      slot.dayIndex === dayIndex && slot.periodIndex === periodIndex
    );
  };

  const filteredTimetables = timetables.filter(timetable =>
    timetable.className.toLowerCase().includes(search.toLowerCase()) ||
    (timetable.academicYear && timetable.academicYear.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A259FF" />
        <Text style={styles.loadingText}>Loading timetables...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.heading}>Class Timetables</Text>
        
        {filteredTimetables.length === 0 ? (
          <Text style={styles.noDataText}>No timetables available.</Text>
        ) : (
          filteredTimetables.map((timetable) => (
            <View key={timetable.id} style={styles.timetableCard}>
              <View style={styles.cardHeader}>
                <View style={styles.classInfo}>
                  <Text style={styles.className}>{timetable.className}</Text>
                  <Text style={styles.timetableDetails}>
                    {timetable.days.length} days • {timetable.periods.length} periods
                    {timetable.academicYear && ` • ${timetable.academicYear}`}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => handleView(timetable)}
                  >
                    <FontAwesome name="eye" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionBtn}
                    onPress={() => handleEdit(timetable)}
                  >
                    <FontAwesome name="edit" size={16} color="#FFC107" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(timetable)}
                  >
                    <FontAwesome name="trash" size={16} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
        
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addBtnText}>+ Create Timetable</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Create/Edit Timetable Modal */}
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
                {editingTimetable ? 'Edit Timetable' : 'Create Timetable'}
              </Text>
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                resetForm();
              }}>
                <FontAwesome name="times" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Class Selection */}
              <Text style={styles.modalLabel}>Class *</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>
                  {selectedClass ? 
                    classes.find(c => c.id === selectedClass)?.name || 'Select Class' 
                    : 'Select Class'
                  }
                </Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => {
                    const classOptions = classes.map(cls => ({
                      text: cls.name,
                      onPress: () => setSelectedClass(cls.id)
                    }));
                    classOptions.push({ text: 'Cancel', onPress: () => {} });
                    Alert.alert('Select Class', 'Choose a class:', classOptions);
                  }}
                >
                  <FontAwesome name="chevron-down" size={16} color="#A0A0A0" />
                </TouchableOpacity>
              </View>

              {/* Academic Year */}
              <Text style={styles.modalLabel}>Academic Year (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., 2024-2025"
                placeholderTextColor="#A0A0A0"
                value={academicYear}
                onChangeText={setAcademicYear}
              />

              {/* Semester */}
              <Text style={styles.modalLabel}>Semester (Optional)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Fall, Spring"
                placeholderTextColor="#A0A0A0"
                value={semester}
                onChangeText={setSemester}
              />

              {/* Timetable Grid */}
              <Text style={styles.modalLabel}>Timetable Schedule</Text>
              <Text style={styles.modalSubLabel}>
                Tap on any cell to add a subject and teacher
              </Text>
              
              <View style={styles.timetableGrid}>
                {/* Header Row */}
                <View style={styles.gridRow}>
                  <View style={[styles.gridCell, styles.headerCell]}>
                    <Text style={styles.headerText}>Day/Period</Text>
                  </View>
                  {periods.map((period, index) => (
                    <View key={index} style={[styles.gridCell, styles.headerCell]}>
                      <Text style={styles.headerText}>{period}</Text>
                    </View>
                  ))}
                </View>

                {/* Data Rows */}
                {days.map((day, dayIndex) => (
                  <View key={dayIndex} style={styles.gridRow}>
                    <View style={[styles.gridCell, styles.headerCell]}>
                      <Text style={styles.headerText}>{day}</Text>
                    </View>
                    {periods.map((period, periodIndex) => {
                      const slot = getSlotForPosition(dayIndex, periodIndex);
                      return (
                        <TouchableOpacity
                          key={periodIndex}
                          style={[styles.gridCell, slot && styles.filledCell]}
                          onPress={() => slot ? removeSlot(dayIndex, periodIndex) : addSlot(dayIndex, periodIndex)}
                        >
                          {slot ? (
                            <View style={styles.slotContent}>
                              <Text style={styles.slotSubject}>{slot.subject}</Text>
                              <Text style={styles.slotTeacher}>{slot.teacherName}</Text>
                            </View>
                          ) : (
                            <Text style={styles.emptySlot}>+</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
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
                    {editingTimetable ? 'Update' : 'Create'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* View Timetable Modal */}
      <Modal
        visible={viewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedTimetable?.className} Timetable
              </Text>
              <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                <FontAwesome name="times" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedTimetable && (
                <View style={styles.timetableGrid}>
                  {/* Header Row */}
                  <View style={styles.gridRow}>
                    <View style={[styles.gridCell, styles.headerCell]}>
                      <Text style={styles.headerText}>Day/Period</Text>
                    </View>
                    {selectedTimetable.periods.map((period, index) => (
                      <View key={index} style={[styles.gridCell, styles.headerCell]}>
                        <Text style={styles.headerText}>{period}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Data Rows */}
                  {selectedTimetable.days.map((day, dayIndex) => (
                    <View key={dayIndex} style={styles.gridRow}>
                      <View style={[styles.gridCell, styles.headerCell]}>
                        <Text style={styles.headerText}>{day}</Text>
                      </View>
                      {selectedTimetable.periods.map((period, periodIndex) => {
                        const slot = selectedTimetable.slots.find(s => 
                          s.dayIndex === dayIndex && s.periodIndex === periodIndex
                        );
                        return (
                          <View key={periodIndex} style={[styles.gridCell, slot && styles.filledCell]}>
                            {slot ? (
                              <View style={styles.slotContent}>
                                <Text style={styles.slotSubject}>{slot.subject}</Text>
                                <Text style={styles.slotTeacher}>{slot.teacherName}</Text>
                                {slot.room && <Text style={styles.slotRoom}>Room: {slot.room}</Text>}
                              </View>
                            ) : (
                              <Text style={styles.emptySlot}>-</Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.submitBtn]} 
                onPress={() => setViewModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, styles.submitBtnText]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#181A20', 
    padding: 16 
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
  heading: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  noDataText: {
    color: '#fff', 
    textAlign: 'center',
    marginTop: 40,
  },
  timetableCard: {
    backgroundColor: '#23262F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timetableDetails: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionBtn: {
    backgroundColor: '#353945',
    borderRadius: 6,
    padding: 8,
    marginLeft: 4,
  },
  deleteBtn: {
    backgroundColor: '#FF6B6B',
  },
  addBtn: { 
    backgroundColor: '#4A90E2', 
    borderRadius: 8, 
    paddingVertical: 12, 
    alignItems: 'center', 
    marginTop: 8 
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
    width: width * 0.95,
    maxHeight: '95%',
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
    maxHeight: 600,
  },
  modalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  modalSubLabel: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 16,
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
  modalInput: {
    backgroundColor: '#353945',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  timetableGrid: {
    borderWidth: 1,
    borderColor: '#353945',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#353945',
    padding: 8,
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCell: {
    backgroundColor: '#353945',
    minHeight: 40,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  filledCell: {
    backgroundColor: '#4A90E2',
  },
  emptySlot: {
    color: '#A0A0A0',
    fontSize: 20,
    fontWeight: 'bold',
  },
  slotContent: {
    alignItems: 'center',
  },
  slotSubject: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  slotTeacher: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  slotRoom: {
    color: '#fff',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 1,
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