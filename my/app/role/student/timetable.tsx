import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  FlatList,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#1A1A2E',
  card: '#252A48',
  accent: '#6B4CE6',
  secondary: '#4CA5FF',
  white: '#fff',
  white80: 'rgba(255,255,255,0.8)',
  white60: 'rgba(255,255,255,0.6)',
  white40: 'rgba(255,255,255,0.4)',
};

const WEEK_DATES = [
  { day: 'Mon', date: 9 },
  { day: 'Tue', date: 10 },
  { day: 'Wed', date: 11 },
  { day: 'Thu', date: 12 },
  { day: 'Fri', date: 13 },
  { day: 'Sat', date: 14 },
  { day: 'Sun', date: 15 },
];
const CURRENT_DATE_INDEX = 2; // Wednesday

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'class', label: 'Classes' },
  { key: 'group', label: 'Groups' },
];

const TIME_SLOTS = [9, 10, 11, 12, 13, 14];

const ACTIVITIES = [
  {
    id: '1',
    type: 'class',
    title: 'Mathematics - Personal Class',
    participants: 'with Dr. Sharma',
    time: 9,
    color: COLORS.accent,
  },
  {
    id: '2',
    type: 'group',
    title: 'Science - Group Class',
    participants: 'with Group A',
    time: 10,
    color: COLORS.secondary,
  },
  {
    id: '3',
    type: 'class',
    title: 'English - Personal Class',
    participants: 'with Ms. Verma',
    time: 12,
    color: COLORS.accent,
  },
  {
    id: '4',
    type: 'group',
    title: 'Social Science - Group Class',
    participants: 'with Group B',
    time: 13,
    color: COLORS.secondary,
  },
];

export default function StudentTimetable() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState(CURRENT_DATE_INDEX);
  const [fabAnim] = useState(new Animated.Value(1));

  const filteredActivities =
    selectedFilter === 'all'
      ? ACTIVITIES
      : ACTIVITIES.filter(a => a.type === selectedFilter);

  const activityCount = filteredActivities.length;

  const handleFabPress = () => {
    Animated.sequence([
      Animated.timing(fabAnim, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.timing(fabAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    // Add new activity logic here
  };

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Timetable</Text>
        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.monthArrow}>
            <Ionicons name="chevron-back" size={20} color={COLORS.white60} />
          </TouchableOpacity>
          <Text style={styles.monthText}>August 2021</Text>
          <TouchableOpacity style={styles.monthArrow}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.white60} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Weekly Date Strip */}
      <View style={styles.dateStrip}>
        {WEEK_DATES.map((d, idx) => (
          <TouchableOpacity
            key={d.date}
            style={[styles.dateItem, idx === selectedDate && styles.dateItemActive]}
            onPress={() => setSelectedDate(idx)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dateDay, idx === selectedDate && styles.dateDayActive]}>{d.day}</Text>
            <Text style={[styles.dateNum, idx === selectedDate && styles.dateNumActive]}>{d.date}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <View style={styles.activityCounter}>
          <Ionicons name="calendar" size={16} color={COLORS.accent} style={{ marginRight: 4 }} />
          <Text style={styles.counterText}>{activityCount} upcoming</Text>
        </View>
        <View style={styles.filterTabs}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterTab, selectedFilter === f.key && styles.filterTabActive]}
              onPress={() => setSelectedFilter(f.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, selectedFilter === f.key && styles.filterTabTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Timeline View */}
      <ScrollView style={styles.timelineScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.timelineRow}>
          {/* Time slots */}
          <View style={styles.timeCol}>
            {TIME_SLOTS.map(t => (
              <View key={t} style={styles.timeSlot}>
                <Text style={styles.timeText}>{t}:00</Text>
              </View>
            ))}
          </View>
          {/* Activities */}
          <View style={styles.activityCol}>
            {TIME_SLOTS.map(t => {
              const activity = filteredActivities.find(a => a.time === t);
              return (
                <View key={t} style={styles.activitySlot}>
                  {activity ? (
                    <TouchableOpacity
                      style={[styles.activityCard, { backgroundColor: COLORS.card, borderLeftColor: activity.color }]}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.activityIndicator, { backgroundColor: activity.color }]} />
                      <View style={styles.activityContent}>
                        <Text style={styles.activityTitle} numberOfLines={1}>{activity.title}</Text>
                        <Text style={styles.activityParticipants} numberOfLines={1}>{activity.participants}</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabAnim }] }]}> 
        <TouchableOpacity activeOpacity={0.8} onPress={handleFabPress}>
          <LinearGradient
            colors={[COLORS.accent, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Ionicons name="add" size={28} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 36,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  navTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: -24, // visually center with back arrow
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  monthArrow: {
    padding: 4,
  },
  monthText: {
    color: COLORS.white80,
    fontSize: 15,
    marginHorizontal: 2,
    fontWeight: '600',
  },
  dateStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 10,
    marginTop: 2,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  dateItemActive: {
    backgroundColor: COLORS.accent,
  },
  dateDay: {
    color: COLORS.white60,
    fontSize: 13,
    fontWeight: '500',
  },
  dateDayActive: {
    color: COLORS.white,
  },
  dateNum: {
    color: COLORS.white40,
    fontSize: 15,
    fontWeight: 'bold',
  },
  dateNumActive: {
    color: COLORS.white,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  activityCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  counterText: {
    color: COLORS.accent,
    fontWeight: '600',
    fontSize: 14,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#23243a',
    borderRadius: 16,
    padding: 2,
  },
  filterTab: {
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: COLORS.accent,
  },
  filterTabText: {
    color: COLORS.white60,
    fontWeight: '600',
    fontSize: 14,
  },
  filterTabTextActive: {
    color: COLORS.white,
  },
  timelineScroll: {
    flex: 1,
    paddingHorizontal: 0,
    marginTop: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingBottom: 80,
  },
  timeCol: {
    width: 60,
    backgroundColor: 'transparent',
  },
  timeSlot: {
    height: 68,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  timeText: {
    color: COLORS.white40,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  activityCol: {
    flex: 1,
  },
  activitySlot: {
    height: 68,
    justifyContent: 'center',
    marginBottom: 2,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderLeftWidth: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  activityIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  activityParticipants: {
    color: COLORS.white60,
    fontSize: 13,
    fontWeight: '400',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 