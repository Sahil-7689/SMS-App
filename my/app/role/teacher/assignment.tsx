import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal, TextInput, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import type { ImagePickerAsset } from 'expo-image-picker';
import { addAssignment, getAssignments } from '../../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCENT = '#A259FF';
const BG_DARK = '#181A20';
const CARD_BG = '#23262F';
const GRAY = '#A0A0A0';
const WHITE = '#fff';

const SUBJECT_COLORS = {
  Math: '#F59E42',
  Science: '#4ADE80',
  English: '#60A5FA',
  SS: '#F472B6',
};

// Update assignment type to allow optional attachment
type Assignment = {
  id: number;
  title: string;
  due: string;
  class: string;
  subject: string;
  attachment?: ImagePickerAsset;
};
const ASSIGNMENTS: Assignment[] = []; // TODO: Inject assignments from API or context
export default function AssignmentTab() {
  const [selectedClass, setSelectedClass] = useState('10');
  const [selectedSubject, setSelectedSubject] = useState('SS');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDue, setNewDue] = useState('');
  const [newClass, setNewClass] = useState(selectedClass);
  const [newSubject, setNewSubject] = useState(selectedSubject);
  const [attachment, setAttachment] = useState<ImagePickerAsset | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Fetch assignments from Firebase on component mount
  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const result = await getAssignments({
        class: selectedClass,
        subject: selectedSubject
      });
      
      if (result.success && result.assignments) {
        const firebaseAssignments = result.assignments.map((assignment: any) => ({
          id: assignment.id,
          title: assignment.title,
          due: assignment.dueDate,
          class: assignment.class,
          subject: assignment.subject,
          attachment: assignment.attachmentFileName ? {
            uri: '',
            width: 0,
            height: 0,
            fileName: assignment.attachmentFileName,
            type: assignment.attachmentType || 'application/octet-stream',
            fileSize: 0
          } : undefined
        }));
        setAssignments(firebaseAssignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const filteredAssignments = assignments.filter(
    a => a.class === selectedClass && a.subject === selectedSubject
  );

  const pickAttachment = async () => {
    // Try document picker first for PDFs and other documents
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '*/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        // Convert DocumentPicker result to ImagePickerAsset format for consistency
        const attachmentAsset: ImagePickerAsset = {
          uri: asset.uri,
          width: 0,
          height: 0,
          fileName: asset.name,
          type: 'image', // Default to image type for compatibility
          fileSize: asset.size,
        };
        setAttachment(attachmentAsset);
        return;
      }
    } catch (error) {
      console.error('Document picker error:', error);
      // Fall back to image picker if document picker fails
    }

    // Fall back to image picker for images and videos
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access gallery is required!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAttachment(result.assets[0]);
    }
  };

  const handleSaveAssignment = async () => {
    if (!newTitle.trim() || !newDue.trim() || !newClass.trim() || !newSubject.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Get teacher info from AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      const userData = userDataString ? JSON.parse(userDataString) : {};

      const assignmentData = {
        title: newTitle.trim(),
        dueDate: newDue.trim(),
        class: newClass.trim(),
        subject: newSubject.trim(),
        teacherId: userData.uid || 'unknown',
        teacherName: userData.name || 'Unknown Teacher',
        attachmentFileName: attachment?.fileName || undefined,
        attachmentType: attachment?.type || undefined
      };

      const result = await addAssignment(assignmentData);
      
      if (result.success) {
        Alert.alert('Success', 'Assignment created successfully!');
        setNewTitle('');
        setNewDue('');
        setNewClass(selectedClass);
        setNewSubject(selectedSubject);
        setAttachment(undefined);
        setAddModalVisible(false);
        
        // Refresh assignments list
        fetchAssignments();
      } else {
        Alert.alert('Error', result.error || 'Failed to create assignment');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG_DARK }}>
      {/* Header Section */}
      <View style={styles.headerBar}>
        <TouchableOpacity>
          <Feather name="search" size={22} color={WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TeacherDashboard</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={22} color={WHITE} />
        </TouchableOpacity>
      </View>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={require('../../../assets/images/icon.png')} style={styles.avatar} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.teacherName}>Ms. Priya Sharma</Text>
          <Text style={styles.teacherClass}>Class Teacher - 10</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
          <Ionicons name="add" size={22} color={WHITE} />
          <Text style={styles.addBtnText}>Add Assignment</Text>
        </TouchableOpacity>
      </View>
      {/* Assignment Creation Controls */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>{selectedClass}</Text>
          <Ionicons name="chevron-down" size={18} color={WHITE} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>{selectedSubject}</Text>
          <Ionicons name="chevron-down" size={18} color={WHITE} />
        </TouchableOpacity>
      </View>
      {/* Add Assignment Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Assignment</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Title"
              placeholderTextColor={GRAY}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Due Date (YYYY-MM-DD)"
              placeholderTextColor={GRAY}
              value={newDue}
              onChangeText={setNewDue}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Class"
              placeholderTextColor={GRAY}
              value={newClass}
              onChangeText={setNewClass}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Subject"
              placeholderTextColor={GRAY}
              value={newSubject}
              onChangeText={setNewSubject}
            />
            <TouchableOpacity style={styles.uploadBtn} onPress={pickAttachment}>
              <Ionicons name="cloud-upload-outline" size={20} color={WHITE} />
              <Text style={styles.uploadBtnText}>{attachment ? 'Change Attachment' : 'Upload Attachment'}</Text>
            </TouchableOpacity>
            {attachment && (
              <View style={styles.attachmentPreview}>
                {attachment.type && attachment.type.startsWith('image') ? (
                  <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
                ) : (
                  <Text style={styles.attachmentText}>{attachment.fileName || 'File Selected'}</Text>
                )}
              </View>
            )}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: ACCENT }]}
                onPress={handleSaveAssignment}
                disabled={loading}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>{loading ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* Assignments List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.sectionTitle}>View Assignments</Text>
        {filteredAssignments.length === 0 ? (
          <Text style={{ color: GRAY, textAlign: 'center', marginTop: 32 }}>No assignments found.</Text>
        ) : (
          filteredAssignments.map(a => (
            <View key={a.id} style={styles.assignmentCard}>
              <View style={[styles.subjectIndicator, { backgroundColor: SUBJECT_COLORS[a.subject as keyof typeof SUBJECT_COLORS] || ACCENT }]} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.assignmentDue}>{a.due}</Text>
                <Text style={styles.assignmentTitle}>{a.title}</Text>
                <Text style={styles.assignmentClass}>Class {a.class}</Text>
                {'attachment' in a && a.attachment && (
                  <View style={styles.attachmentPreview}>
                    {a.attachment.type && a.attachment.type.startsWith('image') ? (
                      <Image source={{ uri: a.attachment.uri }} style={styles.attachmentImage} />
                    ) : (
                      <Text style={styles.attachmentText}>{a.attachment.fileName || 'File Attached'}</Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 12,
    backgroundColor: BG_DARK,
  },
  headerTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: BG_DARK,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: CARD_BG,
  },
  teacherName: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 2,
  },
  teacherClass: {
    color: GRAY,
    fontSize: 14,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginLeft: 12,
    shadowColor: ACCENT,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  addBtnText: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 6,
    letterSpacing: 1,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
    flex: 1,
    marginLeft: 0,
  },
  dropdownText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 8,
  },
  sectionTitle: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 12,
    marginLeft: 20,
  },
  assignmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  subjectIndicator: {
    width: 6,
    height: 48,
    borderRadius: 3,
    marginRight: 10,
  },
  assignmentThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: CARD_BG,
  },
  assignmentDue: {
    color: GRAY,
    fontSize: 13,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  assignmentTitle: {
    color: BG_DARK,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  assignmentClass: {
    color: GRAY,
    fontSize: 13,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18,18,18,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 24,
    width: 320,
    maxWidth: '90%',
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  modalTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: BG_DARK,
    color: WHITE,
    borderRadius: 8,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#353945',
    marginLeft: 10,
  },
  modalBtnText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  uploadBtnText: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  attachmentPreview: {
    marginTop: 8,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  attachmentImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginTop: 4,
  },
  attachmentText: {
    color: ACCENT,
    fontSize: 14,
    marginTop: 4,
  },
}); 