import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SUBJECTS = [
  { name: 'Mathematics', score: 85 },
  { name: 'English', score: 78 },
  { name: 'Science', score: 82 },
  { name: 'Social Science', score: 80 },
  { name: 'Hindi', score: 88 },
  { name: 'Computer Science', score: 84 },
];

const STUDENT_NAME = 'SHIN CHAN';
const STUDENT_CLASS = 'Class 10A';

const { width } = Dimensions.get('window');

export default function ResultScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>ACA</Text>
      <View style={styles.studentInfoContainer}>
        <Text style={styles.studentName}>{STUDENT_NAME}</Text>
        <Text style={styles.studentClass}>{STUDENT_CLASS}</Text>
      </View>
      {/* Academic Performance List */}
      <FlatList
        data={SUBJECTS}
        keyExtractor={item => item.name}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.subjectRow}>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{item.name}</Text>
              <Text style={styles.maxMarks}>Max: 100</Text>
            </View>
            <Text style={styles.score}>{item.score}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
      {/* Bottom Card with Gradient */}
      <View style={styles.bottomCardContainer}>
        <LinearGradient
          colors={["#f5e9da", "#e8d6c3"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bottomCard}
        >
          {/* Decorative artwork can be added here if needed */}
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181b', // deep charcoal black
    paddingTop: 56,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
  },
  header: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 8,
  },
  studentInfoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  studentName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 2,
  },
  studentClass: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.7,
  },
  listContent: {
    paddingBottom: 120,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#232326',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  subjectInfo: {
    flexDirection: 'column',
  },
  subjectName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 2,
  },
  maxMarks: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.5,
  },
  score: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  bottomCardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: width,
    alignItems: 'center',
    zIndex: -1,
  },
  bottomCard: {
    width: width * 0.92,
    height: 120,
    borderRadius: 32,
    marginBottom: 24,
    // Optionally add shadow for elevation
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
}); 