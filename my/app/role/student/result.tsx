import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { getResults, auth } from '../../../config/firebase';

interface Subject {
  subjectName: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
}

interface Result {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  examType: string;
  examDate: string;
  subjects: Subject[];
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  adminId: string;
  adminName: string;
  fileName?: string;
  downloadURL?: string;
  uploadedAt?: any;
  status?: string;
}

const { width } = Dimensions.get('window');

export default function ResultScreen() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No authenticated user found');
        setLoading(false);
        return;
      }

      const result = await getResults({ 
        studentId: currentUser.uid,
        status: 'active' 
      });
      
      if (result.success && result.results) {
        setResults(result.results);
        console.log('Fetched results:', result.results.length, 'results');
      } else {
        console.error('Failed to fetch results:', result.error);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 80) return '#8BC34A';
    if (percentage >= 70) return '#FFC107';
    if (percentage >= 60) return '#FF9800';
    return '#F44336';
  };

  const getGradeText = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    return 'D';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderResultCard = ({ item: result }: { item: Result }) => (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <View style={styles.examInfo}>
          <Text style={styles.examType}>{result.examType}</Text>
          <Text style={styles.examDate}>{formatDate(result.examDate)}</Text>
        </View>
        <View style={styles.percentageContainer}>
          <Text style={[styles.percentage, { color: getGradeColor(result.percentage) }]}>
            {result.percentage}%
          </Text>
          <Text style={styles.grade}>{getGradeText(result.percentage)}</Text>
        </View>
      </View>

      <View style={styles.totalMarksContainer}>
        <Text style={styles.totalMarksText}>
          Total: {result.totalMarks}/{result.maxTotalMarks}
        </Text>
      </View>

      <View style={styles.subjectsContainer}>
        {result.subjects.map((subject, index) => (
          <View key={index} style={styles.subjectRow}>
            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{subject.subjectName}</Text>
              <Text style={styles.maxMarks}>Max: {subject.maxMarks}</Text>
            </View>
            <View style={styles.marksContainer}>
              <Text style={styles.marks}>{subject.marksObtained}</Text>
              {subject.grade && (
                <Text style={[styles.subjectGrade, { color: getGradeColor((subject.marksObtained / subject.maxMarks) * 100) }]}>
                  {subject.grade}
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {result.downloadURL && (
        <TouchableOpacity 
          style={styles.downloadBtn}
          onPress={() => {
            Alert.alert(
              'Download Result',
              'Would you like to download the result file?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Download', 
                  onPress: () => {
                    // TODO: Implement file download functionality
                    Alert.alert('Info', 'Download functionality will be implemented soon');
                  }
                }
              ]
            );
          }}
        >
          <FontAwesome name="download" size={16} color="#A259FF" />
          <Text style={styles.downloadText}>Download Result</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A259FF" />
        <Text style={styles.loadingText}>Loading your results...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Results</Text>
      <View style={styles.studentInfoContainer}>
        <Text style={styles.studentName}>
          {results.length > 0 ? results[0].studentName : 'Student'}
        </Text>
        <Text style={styles.studentClass}>
          {results.length > 0 ? `Class: ${results[0].studentClass}` : 'Class'}
        </Text>
      </View>

      {/* Results List */}
      {results.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <FontAwesome name="graduation-cap" size={48} color="#A0A0A0" />
          <Text style={styles.noResultsText}>No results available yet</Text>
          <Text style={styles.noResultsSubtext}>
            Your exam results will appear here once they are uploaded by your school.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={renderResultCard}
          showsVerticalScrollIndicator={false}
        />
      )}

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
    backgroundColor: '#18181b',
    paddingTop: 56,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
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
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noResultsText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    color: '#A0A0A0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 120,
  },
  resultCard: {
    backgroundColor: '#232326',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  examInfo: {
    flex: 1,
  },
  examType: {
    color: '#A259FF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  examDate: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  percentageContainer: {
    alignItems: 'center',
  },
  percentage: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  grade: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalMarksContainer: {
    backgroundColor: '#353945',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  totalMarksText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subjectsContainer: {
    marginBottom: 16,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#353945',
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  maxMarks: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  marksContainer: {
    alignItems: 'flex-end',
  },
  marks: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  subjectGrade: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#353945',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  downloadText: {
    color: '#A259FF',
    marginLeft: 8,
    fontSize: 16,
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
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
}); 