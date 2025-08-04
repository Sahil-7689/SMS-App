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
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { FontAwesome } from '@expo/vector-icons';
import { 
  addResult, 
  getResults, 
  updateResult, 
  deleteResult,
  getStudents,
  auth 
} from '../../../config/firebase';

interface Subject {
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
}

interface Result {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  examType: string;
  examDate: string;
  subjects: Subject[];
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  adminId: string;
  adminName: string;
  fileName?: string;
  downloadURL?: string;
  uploadedAt?: any;
  status?: string;
}

interface Student {
  id: string;
  name: string;
  class: string;
  rollNo: string;
}

const { width } = Dimensions.get('window');

export default function ResultTabScreen({ search }: { search: string }) {
  const [results, setResults] = useState<Result[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingResult, setEditingResult] = useState<Result | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [examType, setExamType] = useState('');
  const [examDate, setExamDate] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);

  useEffect(() => {
    fetchResults();
    fetchStudents();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const result = await getResults({ status: 'active' });
      if (result.success && result.results) {
        setResults(result.results);
      } else {
        console.error('Failed to fetch results:', result.error);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const result = await getStudents();
      if (result.success && result.students) {
        setStudents(result.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedFile(result);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const resetForm = () => {
    setSelectedStudent('');
    setExamType('');
    setExamDate('');
    setSelectedFile(null);
    setEditingResult(null);
  };

  const handleSubmit = async () => {
    if (!selectedStudent || !examType || !examDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!selectedFile?.assets?.[0]) {
      Alert.alert('Error', 'Please select a result file');
      return;
    }

    const student = students.find(s => s.id === selectedStudent);
    if (!student) {
      Alert.alert('Error', 'Selected student not found');
      return;
    }

    try {
      setUploading(true);
      
      const resultData = {
        studentId: selectedStudent,
        studentName: student.name,
        studentClass: student.class,
        examType,
        examDate,
        subjects: [], // Empty subjects array since we're only uploading files
        totalMarks: 0,
        maxTotalMarks: 0,
        percentage: 0,
        adminId: auth.currentUser?.uid || '',
        adminName: auth.currentUser?.displayName || 'Admin',
        fileName: selectedFile.assets[0].name,
        fileUri: selectedFile.assets[0].uri,
        fileType: selectedFile.assets[0].mimeType,
      };

      const result = await addResult(resultData);
      
      if (result.success) {
        Alert.alert('Success', 'Result uploaded successfully');
        setModalVisible(false);
        resetForm();
        fetchResults();
      } else {
        Alert.alert('Error', result.error || 'Failed to upload result');
      }
    } catch (error: any) {
      console.error('Error uploading result:', error);
      Alert.alert('Error', error.message || 'Failed to upload result');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (result: Result) => {
    setEditingResult(result);
    setSelectedStudent(result.studentId);
    setExamType(result.examType);
    setExamDate(result.examDate);
    setModalVisible(true);
  };

  const handleDelete = async (result: Result) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this result?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const deleteResultResponse = await deleteResult(result.id, result.fileName, (result as any).storageProvider);
              if (deleteResultResponse.success) {
                Alert.alert('Success', 'Result deleted successfully');
                fetchResults();
              } else {
                Alert.alert('Error', deleteResultResponse.error || 'Failed to delete result');
              }
            } catch (error: any) {
              console.error('Error deleting result:', error);
              Alert.alert('Error', error.message || 'Failed to delete result');
            }
          },
        },
      ]
    );
  };

  const filteredResults = results.filter(result =>
    result.studentName.toLowerCase().includes(search.toLowerCase()) ||
    result.examType.toLowerCase().includes(search.toLowerCase()) ||
    result.studentClass.toLowerCase().includes(search.toLowerCase())
  );

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 80) return '#8BC34A';
    if (percentage >= 70) return '#FFC107';
    if (percentage >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.heading}>Student Results</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A259FF" />
            <Text style={styles.loadingText}>Loading results...</Text>
          </View>
        ) : filteredResults.length === 0 ? (
          <Text style={styles.noDataText}>No results available.</Text>
        ) : (
          filteredResults.map((result) => (
            <View key={result.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{result.studentName}</Text>
                  <Text style={styles.studentClass}>Class: {result.studentClass}</Text>
                </View>
                <View style={styles.examInfo}>
                  <Text style={styles.examType}>{result.examType}</Text>
                  <Text style={styles.examDate}>{result.examDate}</Text>
                </View>
              </View>
              
              {result.subjects && result.subjects.length > 0 ? (
                <>
                  <View style={styles.percentageContainer}>
                    <Text style={[styles.percentage, { color: getGradeColor(result.percentage) }]}>
                      {result.percentage}%
                    </Text>
                    <Text style={styles.totalMarks}>
                      {result.totalMarks}/{result.maxTotalMarks}
                    </Text>
                  </View>

                  <View style={styles.subjectsContainer}>
                    {result.subjects.map((subject, index) => (
                      <View key={index} style={styles.subjectRow}>
                        <Text style={styles.subjectName}>{subject.subjectName}</Text>
                        <Text style={styles.subjectMarks}>
                          {subject.marksObtained}/{subject.maxMarks}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.fileInfoContainer}>
                  <FontAwesome name="file-pdf-o" size={24} color="#A259FF" />
                  <Text style={styles.fileInfoText}>Result file uploaded</Text>
                </View>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={() => handleEdit(result)}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.deleteBtn]} 
                  onPress={() => handleDelete(result)}
                >
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        
        <TouchableOpacity 
          style={styles.addBtn} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addBtnText}>+ Upload Result</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add/Edit Result Modal */}
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
                {editingResult ? 'Edit Result' : 'Upload Result'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesome name="times" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Student Selection */}
              <Text style={styles.modalLabel}>Student *</Text>
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>
                  {selectedStudent ? 
                    students.find(s => s.id === selectedStudent)?.name || 'Select Student' 
                    : 'Select Student'
                  }
                </Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => {
                    const studentOptions = students.map(student => ({
                      text: `${student.name} (${student.class})`,
                      onPress: () => setSelectedStudent(student.id)
                    }));
                    studentOptions.push({ text: 'Cancel', onPress: () => {} });
                    Alert.alert('Select Student', 'Choose a student:', studentOptions);
                  }}
                >
                  <FontAwesome name="chevron-down" size={16} color="#A0A0A0" />
                </TouchableOpacity>
              </View>

              {/* Exam Type */}
              <Text style={styles.modalLabel}>Exam Type *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g., Mid Term, Final Exam, Unit Test"
                placeholderTextColor="#A0A0A0"
                value={examType}
                onChangeText={setExamType}
              />

              {/* Exam Date */}
              <Text style={styles.modalLabel}>Exam Date *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#A0A0A0"
                value={examDate}
                onChangeText={setExamDate}
              />

              {/* File Upload */}
              <Text style={styles.modalLabel}>Result File *</Text>
              <TouchableOpacity style={styles.fileUploadBtn} onPress={pickDocument}>
                <FontAwesome name="upload" size={20} color="#A259FF" />
                <Text style={styles.fileUploadText}>
                  {selectedFile?.assets?.[0]?.name || 'Choose File'}
                </Text>
              </TouchableOpacity>

              {selectedFile?.assets?.[0] && (
                <View style={styles.fileInfoContainer}>
                  <FontAwesome name="check-circle" size={16} color="#4CAF50" />
                  <Text style={styles.fileSelectedText}>
                    File selected: {selectedFile.assets[0].name}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalBtn} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.submitBtn]} 
                onPress={handleSubmit}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalBtnText, styles.submitBtnText]}>
                    {editingResult ? 'Update' : 'Upload'}
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
    padding: 16 
  },
  heading: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  noDataText: {
    color: '#fff', 
    textAlign: 'center',
    marginTop: 40,
  },
  card: { 
    backgroundColor: '#23262F', 
    borderRadius: 10, 
    padding: 16, 
    marginBottom: 16 
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentClass: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  examInfo: {
    alignItems: 'flex-end',
  },
  examType: {
    color: '#A259FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  examDate: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  percentageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#353945',
    borderRadius: 8,
  },
  percentage: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  totalMarks: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subjectsContainer: {
    marginBottom: 12,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subjectName: {
    color: '#fff',
    fontSize: 14,
  },
  subjectMarks: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#353945',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  fileInfoText: {
    color: '#A259FF',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  fileSelectedText: {
    color: '#4CAF50',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  actionRow: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 8 
  },
  actionBtn: { 
    backgroundColor: '#353945', 
    borderRadius: 6, 
    paddingVertical: 6, 
    paddingHorizontal: 14, 
    marginLeft: 8 
  },
  actionText: { 
    color: '#4A90E2', 
    fontWeight: 'bold' 
  },
  deleteBtn: {
    backgroundColor: '#FF6B6B',
  },
  deleteText: {
    color: '#fff',
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
    maxHeight: 400,
  },
  modalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
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
  fileUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#353945',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  fileUploadText: {
    color: '#A259FF',
    marginLeft: 12,
    fontSize: 16,
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