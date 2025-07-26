import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Modal, Platform, KeyboardAvoidingView } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';

const ACCENT = '#A259FF';
const BG_DARK = '#181A20';
const CARD_BG = '#23262F';
const GRAY = '#A0A0A0';
const WHITE = '#fff';
const TEAL = '#2DD4BF';

type Resource = {
  id: number;
  subject: string;
  class: string;
  file: string;
  type: string;
  attachment?: ImagePickerAsset;
};
const RESOURCES: Resource[] = []; // TODO: Inject resources from API or context
const CLASSES: string[] = []; // TODO: Inject classes from API or context
const SUBJECTS: string[] = []; // TODO: Inject subjects from API or context

export default function ResourcesPage() {
  const [selectedClass, setSelectedClass] = useState('10');
  const [selectedSubject, setSelectedSubject] = useState('Math');
  const [search, setSearch] = useState('');
  const [resources, setResources] = useState<Resource[]>(RESOURCES);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newClass, setNewClass] = useState(selectedClass);
  const [newSubject, setNewSubject] = useState(selectedSubject);
  const [attachment, setAttachment] = useState<ImagePickerAsset | undefined>(undefined);

  const filteredResources = resources.filter(
    r => (selectedClass === r.class) && (selectedSubject === r.subject) && (r.file.toLowerCase().includes(search.toLowerCase()))
  );

  const pickAttachment = async () => {
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
      setNewFileName(result.assets[0].fileName || 'UploadedFile');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG_DARK }}>
      {/* Header Section */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Resources</Text>
      </View>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Feather name="search" size={18} color={GRAY} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search resources..."
          placeholderTextColor={GRAY}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {/* Teacher Profile Card */}
      <View style={styles.profileCard}>
        <Image source={require('../../../assets/images/icon.png')} style={styles.avatar} />
        <View style={{ marginLeft: 14 }}>
          <Text style={styles.teacherName}>Ms. Priya Sharma</Text>
          <Text style={styles.teacherClass}>Class Teacher - 10</Text>
        </View>
      </View>
      {/* Upload Button */}
      <TouchableOpacity style={styles.uploadBtn} onPress={() => setUploadModalVisible(true)}>
        <Ionicons name="cloud-upload-outline" size={20} color={WHITE} />
        <Text style={styles.uploadBtnText}>Upload Resources</Text>
      </TouchableOpacity>
      {/* Upload Resource Modal */}
      <Modal
        visible={uploadModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUploadModalVisible(false)}
      >
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Upload Resource</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="File Name"
              placeholderTextColor={GRAY}
              value={newFileName}
              onChangeText={setNewFileName}
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
              <Text style={styles.uploadBtnText}>{attachment ? 'Change File' : 'Upload File'}</Text>
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
              <TouchableOpacity style={styles.modalBtn} onPress={() => setUploadModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: ACCENT }]}
                onPress={() => {
                  if (newFileName.trim() && newClass.trim() && newSubject.trim()) {
                    setResources([
                      {
                        id: Date.now(),
                        subject: newSubject.trim(),
                        class: newClass.trim(),
                        file: newFileName.trim(),
                        type: attachment && attachment.type ? attachment.type.split('/')[1].toUpperCase() : 'FILE',
                        attachment,
                      },
                      ...resources,
                    ]);
                    setNewFileName('');
                    setNewClass(selectedClass);
                    setNewSubject(selectedSubject);
                    setAttachment(undefined);
                    setUploadModalVisible(false);
                  }
                }}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* Upload Configuration Dropdowns */}
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
      {/* Resource List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {filteredResources.length === 0 ? (
          <Text style={{ color: GRAY, textAlign: 'center', marginTop: 32 }}>No resources found.</Text>
        ) : (
          filteredResources.map((r, idx) => (
            <View key={r.id} style={styles.resourceCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.resourceSubject}>{r.subject} - Class {r.class}</Text>
                <Text style={styles.resourceFile}>{r.file}</Text>
                {'attachment' in r && r.attachment && (
                  <View style={styles.attachmentPreview}>
                    {r.attachment.type && r.attachment.type.startsWith('image') ? (
                      <Image source={{ uri: r.attachment.uri }} style={styles.attachmentImage} />
                    ) : (
                      <Text style={styles.attachmentText}>{r.attachment.fileName || 'File Attached'}</Text>
                    )}
                  </View>
                )}
              </View>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={32}
                color={idx % 2 === 0 ? TEAL : WHITE}
                style={styles.resourceIcon}
              />
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
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: WHITE,
    fontSize: 15,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ACCENT,
  },
  teacherName: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  teacherClass: {
    color: GRAY,
    fontSize: 13,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 20,
    marginBottom: 14,
    alignSelf: 'flex-start',
    shadowColor: ACCENT,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  uploadBtnText: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
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
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  resourceSubject: {
    color: GRAY,
    fontSize: 13,
    marginBottom: 2,
    fontWeight: 'bold',
  },
  resourceFile: {
    color: WHITE,
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  resourceIcon: {
    marginLeft: 16,
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