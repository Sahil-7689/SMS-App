import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const classes = [
  { name: '10A', teacher: 'Ms. Priya Sharma', students: 40, room: '201' },
  { name: '10B', teacher: 'Mr. Rajesh Kumar', students: 38, room: '202' },
  { name: '9A', teacher: 'Ms. Anjali Mehra', students: 42, room: '203' },
];

export default function ClassesTabScreen({ search }: { search: string }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.heading}>Classes</Text>
      {classes.map((c, i) => (
        <View key={c.name} style={styles.card}>
          <View style={styles.row}><Text style={styles.label}>Class:</Text><Text style={styles.value}>{c.name}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Teacher:</Text><Text style={styles.value}>{c.teacher}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Students:</Text><Text style={styles.value}>{c.students}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Room:</Text><Text style={styles.value}>{c.room}</Text></View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>Edit</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}><Text style={styles.actionText}>Delete</Text></TouchableOpacity>
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addBtn}><Text style={styles.addBtnText}>+ Add Class</Text></TouchableOpacity>
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