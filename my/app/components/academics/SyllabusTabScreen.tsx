import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const syllabi = [
  { subject: 'Mathematics', updated: '2024-06-01', link: '#' },
  { subject: 'Physics', updated: '2024-05-20', link: '#' },
  { subject: 'Chemistry', updated: '2024-05-15', link: '#' },
];

export default function SyllabusTabScreen({ search }: { search: string }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.heading}>Syllabus</Text>
      {syllabi.map((s, i) => (
        <View key={s.subject} style={styles.card}>
          <View style={styles.row}><Text style={styles.label}>Subject:</Text><Text style={styles.value}>{s.subject}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Last Updated:</Text><Text style={styles.value}>{s.updated}</Text></View>
          <TouchableOpacity style={styles.linkBtn}><Text style={styles.linkText}>View/Download</Text></TouchableOpacity>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>Edit</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>Delete</Text></TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn}><Text style={styles.addBtnText}>+ Add Syllabus</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181A20', padding: 16 },
  heading: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#23262F', borderRadius: 10, padding: 16, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { color: '#A0A0A0', fontWeight: 'bold', width: 110 },
  value: { color: '#fff', flex: 1 },
  linkBtn: { marginTop: 8, marginBottom: 4 },
  linkText: { color: '#4A90E2', fontWeight: 'bold', textDecorationLine: 'underline' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  actionBtn: { backgroundColor: '#353945', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 14, marginLeft: 8 },
  actionText: { color: '#4A90E2', fontWeight: 'bold' },
  addBtn: { backgroundColor: '#4A90E2', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});