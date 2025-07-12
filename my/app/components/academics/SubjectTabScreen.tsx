import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const subjects = [
  { code: 'SUB101', name: 'Mathematics', teacher: 'Dr. Eleanor Vance', type: 'Core', maxMarks: 100 },
  { code: 'SUB102', name: 'Physics', teacher: 'Dr. Theodore Hayes', type: 'Core', maxMarks: 100 },
  { code: 'SUB103', name: 'Chemistry', teacher: 'Dr. Olivia Bennett', type: 'Core', maxMarks: 100 },
];

export default function SubjectTabScreen({ search }: { search: string }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.heading}>Subjects</Text>
      {subjects.map((s, i) => (
        <View key={s.code} style={styles.card}>
          <View style={styles.row}><Text style={styles.label}>Code:</Text><Text style={styles.value}>{s.code}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Name:</Text><Text style={styles.value}>{s.name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Teacher:</Text><Text style={styles.value}>{s.teacher}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Type:</Text><Text style={styles.value}>{s.type}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Max Marks:</Text><Text style={styles.value}>{s.maxMarks}</Text></View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>Edit</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>Delete</Text></TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn}><Text style={styles.addBtnText}>+ Add Subject</Text></TouchableOpacity>
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
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  actionBtn: { backgroundColor: '#353945', borderRadius: 6, paddingVertical: 6, paddingHorizontal: 14, marginLeft: 8 },
  actionText: { color: '#4A90E2', fontWeight: 'bold' },
  addBtn: { backgroundColor: '#4A90E2', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 