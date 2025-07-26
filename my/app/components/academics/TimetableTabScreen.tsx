import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const days: string[] = []; // TODO: Inject days from API or context
const periods: string[] = []; // TODO: Inject periods from API or context
interface TimetableSlot { subject: string; teacher: string; }
const timetable: TimetableSlot[][] = []; // TODO: Inject timetable from API or context

export default function TimetableTabScreen({ search }: { search: string }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.heading}>Weekly Timetable</Text>
      {days.length === 0 || periods.length === 0 || timetable.length === 0 ? <Text style={{color:'#fff', textAlign:'center'}}>No timetable available.</Text> : (
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.cell, styles.headerCell]}></Text>
            {periods.map(p => (
              <Text key={p} style={[styles.cell, styles.headerCell]}>{p}</Text>
            ))}
          </View>
          {days.map((day, i) => (
            <View key={day} style={styles.row}>
              <Text style={[styles.cell, styles.headerCell]}>{day}</Text>
              {timetable[i].map((slot, j) => (
                <View key={j} style={styles.cell}>
                  <Text style={styles.subject}>{slot.subject}</Text>
                  <Text style={styles.teacher}>{slot.teacher}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity style={styles.downloadBtn}><Text style={styles.downloadBtnText}>Download Timetable</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#181A20', padding: 16 },
  heading: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  table: { borderWidth: 1, borderColor: '#353945', borderRadius: 8, overflow: 'hidden', marginBottom: 16 },
  row: { flexDirection: 'row' },
  cell: { flex: 1, borderWidth: 1, borderColor: '#353945', padding: 8, alignItems: 'center', justifyContent: 'center' },
  headerCell: { backgroundColor: '#23262F', color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  subject: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  teacher: { color: '#A0A0A0', fontSize: 12 },
  downloadBtn: { backgroundColor: '#4A90E2', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  downloadBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 