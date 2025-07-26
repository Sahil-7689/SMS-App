import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MEETING_COLORS = ['#6EE7B7', '#A7F3D0', '#5EEAD4']; // soft green, mint, teal
interface MeetingType { title: string; date: string; time: string; status: string; type: string; details: string; color: string; illustration: any; }
interface MeetingHistoryType { title: string; date: string; organizer: string; type: string; color: string; }
const MEETING_TYPES: MeetingType[] = []; // TODO: Inject meeting types from API or context
const MEETING_HISTORY: MeetingHistoryType[] = []; // TODO: Inject meeting history from API or context

function MeetingHeader() {
  return (
    <View style={styles.headerSection}>
      <Text style={styles.headerTitle}>Admin - Meeting</Text>
      <View style={styles.headerIcons}>
        <TouchableOpacity>
          <Ionicons name="search" size={22} color="#fff" style={{ marginRight: 18 }} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function MeetingTabIndicator() {
  return (
    <View style={styles.tabIndicator}>
      <Text style={styles.tabIndicatorText}>Meetings</Text>
    </View>
  );
}

function MeetingCard({ meeting }: { meeting: MeetingType }) {
  return (
    <View style={[styles.meetingCard, { backgroundColor: meeting.color }]}> 
      <View style={{ flex: 1 }}>
        <Text style={styles.meetingDate}>{meeting.date} | {meeting.time}</Text>
        <Text style={styles.meetingTitle}>{meeting.title}</Text>
        <Text style={styles.meetingStatus}>{meeting.status} • {meeting.type}</Text>
        {meeting.details && <Text style={styles.meetingDetails}>{meeting.details}</Text>}
      </View>
      <Image source={meeting.illustration} style={styles.meetingImage} />
    </View>
  );
}

function MeetingHistoryCard({ meeting }: { meeting: MeetingHistoryType }) {
  return (
    <View style={[styles.historyCard, { backgroundColor: meeting.color }]}> 
      <View style={{ flex: 1 }}>
        <Text style={styles.historyDate}>{meeting.date}</Text>
        <Text style={styles.historyTitle}>{meeting.title}</Text>
        <Text style={styles.historyOrganizer}>Organizer: {meeting.organizer}</Text>
      </View>
    </View>
  );
}

export default function MeetingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#181A20' }}>
      <MeetingHeader />
      <MeetingTabIndicator />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
        {MEETING_TYPES.length === 0 ? <Text style={{color:'#fff', textAlign:'center'}}>No upcoming meetings.</Text> : MEETING_TYPES.map((meeting, idx) => (
          <MeetingCard meeting={meeting} key={idx} />
        ))}
        <Text style={styles.sectionTitle}>Meeting History</Text>
        {MEETING_HISTORY.length === 0 ? <Text style={{color:'#fff', textAlign:'center'}}>No meeting history.</Text> : MEETING_HISTORY.map((meeting, idx) => (
          <MeetingHistoryCard meeting={meeting} key={idx} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 32,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#181A20',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabIndicator: {
    backgroundColor: '#23262F',
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  tabIndicatorText: {
    color: '#A259FF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 20,
  },
  meetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    backgroundColor: '#23262F',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  meetingDate: {
    color: '#23262F',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  meetingTitle: {
    color: '#181A20',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  meetingStatus: {
    color: '#23262F',
    fontSize: 13,
    marginBottom: 2,
  },
  meetingDetails: {
    color: '#23262F',
    fontSize: 12,
  },
  meetingImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginLeft: 16,
    backgroundColor: '#fff',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#23262F',
  },
  historyDate: {
    color: '#23262F',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 2,
  },
  historyTitle: {
    color: '#181A20',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  historyOrganizer: {
    color: '#23262F',
    fontSize: 12,
  },
}); 