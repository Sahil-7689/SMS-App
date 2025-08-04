import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { registerUser, saveStudentData } from "../../config/firebase";

export default function StudentRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    password: '',
    confirmPassword: ''
  });
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return false;
    }
    if (!formData.studentId.trim()) {
      Alert.alert('Error', 'Please enter your student ID');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Register user with Firebase Auth
      const authResult = await registerUser(formData.email, formData.password, {
        name: formData.name,
        studentId: formData.studentId,
        role: 'student'
      });

      if (authResult.success) {
        // Save additional student data to Firestore
        const studentDataResult = await saveStudentData({
          uid: authResult.user?.uid || '',
          name: formData.name,
          email: formData.email,
          studentId: formData.studentId,
          role: 'student'
        });

        if (studentDataResult.success) {
          Alert.alert('Success', 'Registration successful!', [
            { text: 'OK', onPress: () => router.replace('/role/student-login') }
          ]);
        } else {
          Alert.alert('Error', 'Failed to save student data');
        }
      } else {
        Alert.alert('Error', authResult.error);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.wrapper}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.replace("/role")}
        >
          <Text style={styles.backButtonText}>{"← Back to Roles"}</Text>
        </TouchableOpacity>
        {/* Header Image */}
        <View style={styles.headerImageContainer}>
          <Image
            source={{ uri: "https://readdy.ai/api/search-image?query=3D%20graduation%20cap%20stacked%20on%20elegant%20academic%20books%2C%20minimalist%20composition%2C%20dark%20teal%20background%2C%20soft%20lighting%2C%20professional%20product%20photography%2C%20centered%20composition%2C%20dramatic%20lighting&width=375&height=200&seq=1&orientation=landscape" }}
            style={styles.headerImage}
            resizeMode="cover"
          />
        </View>
        {/* Title and Description */}
        <Text style={styles.title}>Student Registration</Text>
        <Text style={styles.subtitle}>
          Register as a student to access your courses and assignments
        </Text>
        {/* Register Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#94a3b8"
            autoCapitalize="words"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
          />
          {/* Email Input */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
          />
          {/* Student ID Input */}
          <Text style={styles.label}>Student ID</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter student ID"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            value={formData.studentId}
            onChangeText={(value) => handleInputChange('studentId', value)}
          />
          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter your password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Text style={{ color: "#94a3b8", fontSize: 16 }}>
                {showPassword ? "🙈" : "👁️"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Confirm Password Input */}
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Confirm your password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showConfirmPassword}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
              <Text style={{ color: "#94a3b8", fontSize: 16 }}>
                {showConfirmPassword ? "🙈" : "👁️"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.registerButtonMain, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.registerButtonTextMain}>
              {loading ? 'Registering...' : 'Register'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1e293b" },
  contentContainer: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 16 },
  wrapper: { width: "100%", maxWidth: 375 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(51,65,85,0.3)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 24,
  },
  backButtonText: { color: "#fff", fontSize: 14 },
  headerImageContainer: { marginBottom: 32 },
  headerImage: { width: "100%", height: 200, borderRadius: 8 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 8, textAlign: "center" },
  subtitle: { color: "#cbd5e1", fontSize: 14, marginBottom: 24, textAlign: "center" },
  form: {
    backgroundColor: "rgba(51,65,85,0.3)",
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(71,85,105,0.3)",
    marginBottom: 24,
  },
  label: { color: "#cbd5e1", fontSize: 14, marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: "rgba(51,65,85,0.5)",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    fontSize: 16,
  },
  passwordRow: { flexDirection: "row", alignItems: "center" },
  eyeButton: { marginLeft: 8, padding: 4 },
  registerButtonMain: {
    backgroundColor: "#4ADE80",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  registerButtonDisabled: {
    backgroundColor: "#6B7280",
  },
  registerButtonTextMain: { color: "#fff", fontSize: 16, fontWeight: "bold" },
}); 