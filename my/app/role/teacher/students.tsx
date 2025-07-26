import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#181A20',
  card: '#232136',
  accent: '#6C63FF',
  accent2: '#FF7043',
  accent3: '#29B6F6',
  accent4: '#66BB6A',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  border: '#353945',
  alert: '#FF5252',
  warning: '#FFD600',
  info: '#448AFF',
  success: '#4CAF50',
};

interface Student { name?: string; id?: string; class?: string; age?: number; contact?: string; emergency?: string; photo?: any; status?: string; }
const mockStudent: Student = {}; // TODO: Inject student from API or context
interface Subject { name: string; grade: string; progress: number; color: string; }
const mockSubjects: Subject[] = []; // TODO: Inject subjects from API or context
interface Attendance { percent: number; present: number; absent: number; late: number; total: number; monthly: { day: number; status: string; }[]; }
const mockAttendance: Attendance = { percent: 0, present: 0, absent: 0, late: 0, total: 0, monthly: [] }; // TODO: Inject attendance from API or context
interface Message { id: number; text: string; time: string; unread: boolean; }
const mockMessages: Message[] = []; // TODO: Inject messages from API or context
interface Alert { id: number; type: string; text: string; color: string; }
const mockAlerts: Alert[] = []; // TODO: Inject alerts from API or context

function StatusDot({ status }: { status: string }) {
  let color = COLORS.textSecondary;
  if (status === 'online') color = COLORS.success;
  if (status === 'offline') color = COLORS.alert;
  return <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginLeft: 8 }} />;
}

export default function TeacherStudentPage() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <View style={styles.headerBar}>
        <Image source={mockStudent.photo} style={styles.profilePhoto} />
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.studentName}>{mockStudent.name}</Text>
          <Text style={styles.studentClass}>Class {mockStudent.class}</Text>
        </View>
        <StatusDot status={mockStudent.status || ''} />
      </View>
      {/* Alerts Dashboard */}
      <View style={styles.alertsRow}>
        {mockAlerts.map(a => (
          <View key={a.id} style={[styles.alertCard, { backgroundColor: a.color }] }>
            <Ionicons name={a.type === 'alert' ? 'alert-circle' : a.type === 'info' ? 'information-circle' : 'warning'} size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.alertText}>{a.text}</Text>
          </View>
        ))}
      </View>
      {/* Student Profile Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Student Profile</Text>
        <View style={styles.profileRow}>
          <Image source={mockStudent.photo} style={styles.profileAvatar} />
          <View style={{ marginLeft: 16 }}>
            <Text style={styles.profileLabel}>ID: <Text style={styles.profileValue}>{mockStudent.id}</Text></Text>
            <Text style={styles.profileLabel}>Age: <Text style={styles.profileValue}>{mockStudent.age}</Text></Text>
            <Text style={styles.profileLabel}>Contact: <Text style={styles.profileValue}>{mockStudent.contact}</Text></Text>
            <Text style={styles.profileLabel}>Emergency: <Text style={[styles.profileValue, { color: COLORS.alert }]}>{mockStudent.emergency}</Text></Text>
          </View>
        </View>
      </View>
      {/* Academic Performance */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Academic Performance</Text>
        <FlatList
          data={mockSubjects}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.name}
          renderItem={({ item }) => (
            <View style={[styles.subjectCard, { borderColor: item.color }]}> 
              <Text style={styles.subjectName}>{item.name}</Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBar, { width: `${item.progress * 100}%`, backgroundColor: item.color }]} />
              </View>
              <Text style={[styles.gradeText, { color: item.color }]}>{item.grade}</Text>
            </View>
          )}
        />
      </View>
      {/* Attendance Tracking */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Attendance</Text>
        <View style={styles.attendanceRow}>
          <View style={styles.attendanceCircle}>
            <Text style={styles.attendancePercent}>{mockAttendance.percent}%</Text>
            <Text style={styles.attendanceLabel}>Present</Text>
          </View>
          <View style={styles.attendanceStats}>
            <Text style={styles.attendanceStat}>Present: <Text style={{ color: COLORS.success }}>{mockAttendance.present}</Text></Text>
            <Text style={styles.attendanceStat}>Absent: <Text style={{ color: COLORS.alert }}>{mockAttendance.absent}</Text></Text>
            <Text style={styles.attendanceStat}>Late: <Text style={{ color: COLORS.warning }}>{mockAttendance.late}</Text></Text>
            <Text style={styles.attendanceStat}>Total: <Text style={{ color: COLORS.text }}>{mockAttendance.total}</Text></Text>
          </View>
        </View>
      </View>
      {/* Communication Tools */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Communication</Text>
        {mockMessages.map(m => (
          <View key={m.id} style={styles.messageRow}>
            <Text style={[styles.messageText, m.unread && styles.unreadText]}>{m.text}</Text>
            <Text style={styles.messageTime}>{m.time}</Text>
            {m.unread && <View style={styles.unreadDot} />}
          </View>
        ))}
        <View style={styles.commActionsRow}>
          <TouchableOpacity style={styles.commActionBtn}><Ionicons name="chatbubble-ellipses" size={20} color={COLORS.accent} /><Text style={styles.commActionText}>Message</Text></TouchableOpacity>
          <TouchableOpacity style={styles.commActionBtn}><Ionicons name="call" size={20} color={COLORS.success} /><Text style={styles.commActionText}>Call</Text></TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232136',
    paddingTop: 36,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#232136',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  profilePhoto: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  studentName: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  studentClass: {
    color: COLORS.textSecondary,
    fontSize: 15,
    marginTop: 2,
  },
  alertsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 18,
    marginTop: 18,
    marginBottom: 8,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 120,
    shadowColor: COLORS.alert,
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  alertText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 18,
    marginBottom: 18,
    shadowColor: COLORS.card,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  profileLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  profileValue: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  subjectCard: {
    backgroundColor: '#232136',
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
    marginRight: 12,
    alignItems: 'center',
    width: 120,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  subjectName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    borderRadius: 6,
  },
  gradeText: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 2,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  attendanceCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success,
    marginRight: 18,
  },
  attendancePercent: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  attendanceLabel: {
    color: '#fff',
    fontSize: 13,
    marginTop: 2,
  },
  attendanceStats: {
    flex: 1,
  },
  attendanceStat: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 2,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageText: {
    color: COLORS.text,
    fontSize: 14,
    flex: 1,
  },
  unreadText: {
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  messageTime: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginLeft: 6,
  },
  commActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  commActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  commActionText: {
    color: COLORS.text,
    fontSize: 14,
    marginLeft: 6,
  },
}); 