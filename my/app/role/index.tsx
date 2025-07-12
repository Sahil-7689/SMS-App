import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { useRouter } from 'expo-router';
import IconSymbol from '../../components/ui/IconSymbol';

const RoleScreen: React.FC = () => {
  const router = useRouter();

  const handleRoleSelect = (role: string) => {
    router.push({ pathname: `/role/${role}` as any });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.wrapper}>
        {/* Header Image */}
        <View style={styles.headerImageContainer}>
          <Image
            source={{ uri: "https://readdy.ai/api/search-image?query=3D%20graduation%20cap%20stacked%20on%20elegant%20academic%20books%2C%20minimalist%20composition%2C%20dark%20teal%20background%2C%20soft%20lighting%2C%20professional%20product%20photography%2C%20centered%20composition%2C%20dramatic%20lighting&width=375&height=200&seq=1&orientation=landscape" }}
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Select Your Role</Text>

        {/* Role Cards */}
        <View style={styles.roleCardsContainer}>
          {/* Admin Card */}
          <TouchableOpacity 
            style={styles.roleCard} 
            onPress={() => handleRoleSelect('admin-login')}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconBackground, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                  <IconSymbol name="chevron-right" size={24} color="#60A5FA" />
                </View>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.roleName}>Admin</Text>
                <Text style={styles.roleDescription}>
                  Login as an administrator to access the dashboard to manage app data.
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Student Card */}
          <TouchableOpacity 
            style={styles.roleCard} 
            onPress={() => handleRoleSelect('student-login')}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconBackground, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                  <IconSymbol name="chevron-right" size={24} color="#4ADE80" />
                </View>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.roleName}>Student</Text>
                <Text style={styles.roleDescription}>
                  Login as a student to explore course materials and assignments.
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Teacher Card */}
          <TouchableOpacity 
            style={styles.roleCard} 
            onPress={() => handleRoleSelect('teacher-login')}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <View style={[styles.iconBackground, { backgroundColor: 'rgba(147, 51, 234, 0.2)' }]}>
                  <IconSymbol name="chevron-right" size={24} color="#A78BFA" />
                </View>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.roleName}>Teacher</Text>
                <Text style={styles.roleDescription}>
                  Login as a teacher to create courses, assignments, and track student progress.
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b', // slate-800
  },
  contentContainer: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: 375,
  },
  headerImageContainer: {
    marginBottom: 32,
  },
  headerImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 32,
    textAlign: 'center',
  },
  roleCardsContainer: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.5)', // slate-700/50
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)', // slate-600/30
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextContainer: {
    flex: 1,
  },
  roleName: {
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 16,
  },
  roleDescription: {
    color: '#cbd5e1', // slate-300
    fontSize: 14,
    lineHeight: 20,
  },
});

export default RoleScreen; 