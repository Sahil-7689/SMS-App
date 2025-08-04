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
  Dimensions 
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { FontAwesome } from '@expo/vector-icons';
import { 
  addSyllabus, 
  getSyllabi, 
  updateSyllabus, 
  deleteSyllabus,
  getClasses,
  auth 
} from '../../../config/firebase';

interface Syllabus {
  id: string;
  className: string;
  subject: string;
  title: string;
  description?: string;
  fileName: string;
  downloadURL: string;
  uploadedAt: Date;
  adminName: string;
}

interface Class {
  id: string;
  name: string;
  subject: string;
}

const { width } = Dimensions.get('window');

export default function SyllabusTabScreen({ search }: { search: string }) {
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState<Syllabus | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [classDropdownVisible, setClassDropdownVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all classes for the dropdown
      const classesResult = await getClasses();
      if (classesResult.success && classesResult.classes) {
        setClasses(classesResult.classes);
      }

      // Fetch all syllabi
      const syllabiResult = await getSyllabi();
      if (syllabiResult.success && syllabiResult.syllabi) {
        setSyllabi(syllabiResult.syllabi);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load syllabi data');
    } finally {
      setLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedFile(result);
        return result.assets[0];
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
    return null;
  };

  const handleUpload = async () => {
    if (!selectedClass || !selectedSubject || !title || !selectedFile) {
      Alert.alert('Error', 'Please fill in all required fields and select a PDF file');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to upload a syllabus');
      return;
    }

    try {
      setUploading(true);
      
      const file = selectedFile.assets?.[0];
      if (!file) {
        Alert.alert('Error', 'No file selected');
        return;
      }

      const syllabusData = {
        className: selectedClass,
        subject: selectedSubject,
        title,
        description: description || undefined,
        adminId: currentUser.uid,
        adminName: currentUser.displayName || currentUser.email || 'Admin',
        fileName: file.name,
        fileUri: file.uri,
        fileType: file.mimeType || 'application/pdf'
      };

      const result = await addSyllabus(syllabusData);
      
      if (result.success) {
        Alert.alert('Success', 'Syllabus uploaded successfully');
        setModalVisible(false);
        resetForm();
        fetchData(); // Refresh the list
      } else {
        Alert.alert('Error', result.error || 'Failed to upload syllabus');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload syllabus');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedSyllabus || !title) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);
      
      const updateData: any = {
        title,
        description: description || undefined
      };

      // If a new file is selected, include it in the update
      if (selectedFile && selectedFile.assets && selectedFile.assets[0]) {
        const file = selectedFile.assets[0];
        updateData.fileName = file.name;
        updateData.fileUri = file.uri;
        updateData.fileType = file.mimeType || 'application/pdf';
      }

      const result = await updateSyllabus(selectedSyllabus.id, updateData);
      
      if (result.success) {
        Alert.alert('Success', 'Syllabus updated successfully');
        setEditModalVisible(false);
        resetForm();
        fetchData(); // Refresh the list
      } else {
        Alert.alert('Error', result.error || 'Failed to update syllabus');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update syllabus');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (syllabus: Syllabus) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete "${syllabus.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteSyllabus(syllabus.id, syllabus.fileName);
              if (result.success) {
                Alert.alert('Success', 'Syllabus deleted successfully');
                fetchData(); // Refresh the list
              } else {
                Alert.alert('Error', result.error || 'Failed to delete syllabus');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete syllabus');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setSelectedClass('');
    setSelectedSubject('');
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setSelectedSyllabus(null);
    setClassDropdownVisible(false);
  };

  const openEditModal = (syllabus: Syllabus) => {
    setSelectedSyllabus(syllabus);
    setSelectedClass(syllabus.className);
    setSelectedSubject(syllabus.subject);
    setTitle(syllabus.title);
    setDescription(syllabus.description || '');
    setSelectedFile(null);
    setEditModalVisible(true);
  };

  const filteredSyllabi = syllabi.filter(syllabus => {
    const searchLower = search.toLowerCase();
    return (
      syllabus.title.toLowerCase().includes(searchLower) ||
      syllabus.className.toLowerCase().includes(searchLower) ||
      syllabus.subject.toLowerCase().includes(searchLower) ||
      syllabus.description?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A259FF" />
        <Text style={styles.loadingText}>Loading syllabi...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.heading}>Syllabus Management</Text>
      
      {filteredSyllabi.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="file-pdf-o" size={48} color="#A0A0A0" />
          <Text style={styles.emptyText}>No syllabi available</Text>
          <Text style={styles.emptySubtext}>Upload PDF syllabi for your classes</Text>
        </View>
      ) : (
        filteredSyllabi.map((syllabus) => (
          <View key={syllabus.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <FontAwesome name="file-pdf-o" size={24} color="#A259FF" />
              <View style={styles.cardTitleContainer}>
                <Text style={styles.cardTitle}>{syllabus.title}</Text>
                <Text style={styles.cardSubtitle}>
                  {syllabus.className} • {syllabus.subject}
                </Text>
              </View>
            </View>
            
            {syllabus.description && (
              <Text style={styles.description}>{syllabus.description}</Text>
            )}
            
            <View style={styles.cardDetails}>
              <Text style={styles.detailText}>
                <Text style={styles.label}>File: </Text>
                {syllabus.fileName}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Uploaded: </Text>
                {new Date(syllabus.uploadedAt).toLocaleDateString()}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>By: </Text>
                {syllabus.adminName}
              </Text>
            </View>
            
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => {
                  // Handle download/view
                  Alert.alert('Download', 'Download functionality will be implemented');
                }}
              >
                <FontAwesome name="download" size={16} color="#4A90E2" />
                <Text style={styles.actionText}>Download</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionBtn}
                onPress={() => openEditModal(syllabus)}
              >
                <FontAwesome name="edit" size={16} color="#4A90E2" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => handleDelete(syllabus)}
              >
                <FontAwesome name="trash" size={16} color="#FF6B6B" />
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
        <FontAwesome name="plus" size={20} color="#fff" />
        <Text style={styles.addBtnText}>Upload New Syllabus</Text>
      </TouchableOpacity>

      {/* Upload Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Syllabus</Text>
                             <TouchableOpacity onPress={() => {
                 setModalVisible(false);
                 resetForm();
               }}>
                 <FontAwesome name="times" size={20} color="#A0A0A0" />
               </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
                             <View style={styles.inputGroup}>
                 <Text style={styles.inputLabel}>Class *</Text>
                 <TouchableOpacity 
                   style={styles.pickerContainer}
                   onPress={() => setClassDropdownVisible(!classDropdownVisible)}
                 >
                   <Text style={styles.pickerText}>
                     {selectedClass || 'Select a class'}
                   </Text>
                   <FontAwesome 
                     name={classDropdownVisible ? "chevron-up" : "chevron-down"} 
                     size={16} 
                     color="#A0A0A0" 
                   />
                 </TouchableOpacity>
                 {classDropdownVisible && (
                   <ScrollView style={styles.dropdown} nestedScrollEnabled>
                     {classes.length === 0 ? (
                       <View style={styles.emptyDropdownItem}>
                         <Text style={styles.emptyDropdownText}>No classes available</Text>
                       </View>
                     ) : (
                       classes.map((cls) => (
                         <TouchableOpacity
                           key={cls.id}
                           style={styles.dropdownItem}
                           onPress={() => {
                             setSelectedClass(cls.name);
                             setSelectedSubject(cls.subject);
                             setClassDropdownVisible(false);
                           }}
                         >
                           <Text style={styles.dropdownText}>{cls.name}</Text>
                           <Text style={styles.dropdownSubtext}>{cls.subject}</Text>
                         </TouchableOpacity>
                       ))
                     )}
                   </ScrollView>
                 )}
               </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter syllabus title"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter description (optional)"
                  placeholderTextColor="#A0A0A0"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PDF File *</Text>
                <TouchableOpacity 
                  style={styles.filePicker}
                  onPress={pickDocument}
                >
                  <FontAwesome name="file-pdf-o" size={24} color="#A259FF" />
                  <Text style={styles.filePickerText}>
                    {selectedFile?.assets?.[0]?.name || 'Select PDF file'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
                             <TouchableOpacity 
                 style={styles.cancelBtn}
                 onPress={() => {
                   setModalVisible(false);
                   resetForm();
                 }}
               >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitBtn, uploading && styles.submitBtnDisabled]}
                onPress={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Syllabus</Text>
                             <TouchableOpacity onPress={() => {
                 setEditModalVisible(false);
                 resetForm();
               }}>
                 <FontAwesome name="times" size={20} color="#A0A0A0" />
               </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Class</Text>
                <Text style={styles.readOnlyText}>{selectedClass}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subject</Text>
                <Text style={styles.readOnlyText}>{selectedSubject}</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.textInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter syllabus title"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter description (optional)"
                  placeholderTextColor="#A0A0A0"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current File</Text>
                <Text style={styles.readOnlyText}>
                  {selectedSyllabus?.fileName}
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New PDF File (Optional)</Text>
                <TouchableOpacity 
                  style={styles.filePicker}
                  onPress={pickDocument}
                >
                  <FontAwesome name="file-pdf-o" size={24} color="#A259FF" />
                  <Text style={styles.filePickerText}>
                    {selectedFile?.assets?.[0]?.name || 'Select new PDF file'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
                             <TouchableOpacity 
                 style={styles.cancelBtn}
                 onPress={() => {
                   setEditModalVisible(false);
                   resetForm();
                 }}
               >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitBtn, uploading && styles.submitBtnDisabled]}
                onPress={handleEdit}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Update</Text>
                )}
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
    padding: 16 
  },
  heading: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181A20',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 8,
  },
  card: { 
    backgroundColor: '#23262F', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16 
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 2,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  cardDetails: {
    marginBottom: 16,
  },
  detailText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 4,
  },
  label: {
    color: '#A0A0A0',
    fontWeight: 'bold',
  },
  actionRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: 8,
  },
  actionBtn: { 
    flex: 1,
    backgroundColor: '#353945', 
    borderRadius: 8, 
    paddingVertical: 10, 
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: { 
    color: '#4A90E2', 
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteBtn: {
    backgroundColor: '#3A2A2A',
  },
  deleteText: {
    color: '#FF6B6B',
  },
  addBtn: { 
    backgroundColor: '#A259FF', 
    borderRadius: 12, 
    paddingVertical: 16, 
    alignItems: 'center', 
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#23262F',
    borderRadius: 16,
    width: width * 0.9,
    maxHeight: '80%',
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#353945',
    gap: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#353945',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  readOnlyText: {
    color: '#A0A0A0',
    fontSize: 16,
    padding: 12,
    backgroundColor: '#353945',
    borderRadius: 8,
  },
  pickerContainer: {
    backgroundColor: '#353945',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdown: {
    backgroundColor: '#353945',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2D36',
  },
  dropdownText: {
    color: '#fff',
    fontSize: 16,
  },
     dropdownSubtext: {
     color: '#A0A0A0',
     fontSize: 14,
     marginTop: 2,
   },
   emptyDropdownItem: {
     padding: 12,
     alignItems: 'center',
   },
   emptyDropdownText: {
     color: '#A0A0A0',
     fontSize: 14,
     fontStyle: 'italic',
   },
  filePicker: {
    backgroundColor: '#353945',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filePickerText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#353945',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#A259FF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitBtnDisabled: {
    backgroundColor: '#666',
  },
});