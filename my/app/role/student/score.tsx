import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const SUBJECT_SCORES = [
  { subject: 'Math', score: 92, max: 100, color: '#A259FF' },
  { subject: 'Science', score: 85, max: 100, color: '#4ADE80' },
  { subject: 'English', score: 78, max: 100, color: '#60A5FA' },
  { subject: 'Social Studies', score: 88, max: 100, color: '#F472B6' },
];

export default function ScoreScreen() {
  const overall = Math.round(
    SUBJECT_SCORES.reduce((sum, s) => sum + s.score, 0) / SUBJECT_SCORES.length
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Score Overview</Text>
        <FontAwesome name="star" size={28} color="#A259FF" />
      </View>
      {/* Overall Score */}
      <View style={styles.overallCard}>
        <Text style={styles.overallLabel}>Overall Score</Text>
        <Text style={styles.overallScore}>{overall}</Text>
        <Text style={styles.overallOutOf}>/ 100</Text>
      </View>
      {/* Subject Scores */}
      <Text style={styles.sectionTitle}>Subject Scores</Text>
      {SUBJECT_SCORES.map((s, idx) => (
        <View key={s.subject} style={styles.subjectCard}>
          <View style={[styles.subjectColor, { backgroundColor: s.color }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.subjectName}>{s.subject}</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: `${(s.score / s.max) * 100}%`, backgroundColor: s.color }]} />
            </View>
          </View>
          <Text style={styles.subjectScore}>{s.score}</Text>
          <Text style={styles.subjectOutOf}>/ {s.max}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A20',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  overallCard: {
    backgroundColor: '#23262F',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  overallLabel: {
    color: '#A0A0A0',
    fontSize: 15,
    marginBottom: 6,
  },
  overallScore: {
    color: '#A259FF',
    fontSize: 38,
    fontWeight: 'bold',
  },
  overallOutOf: {
    color: '#A0A0A0',
    fontSize: 15,
    marginTop: 2,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 10,
    marginLeft: 20,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23262F',
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  subjectColor: {
    width: 8,
    height: 48,
    borderRadius: 4,
    marginRight: 14,
  },
  subjectName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
  },
  barBg: {
    width: '100%',
    height: 8,
    backgroundColor: '#353945',
    borderRadius: 4,
    marginBottom: 2,
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  subjectScore: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 16,
  },
  subjectOutOf: {
    color: '#A0A0A0',
    fontSize: 14,
    marginLeft: 2,
  },
}); 