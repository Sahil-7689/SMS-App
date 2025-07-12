import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Switch } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TeacherLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Load saved credentials if Remember Me was checked
    const loadCredentials = async () => {
      try {
        const savedRememberMe = await AsyncStorage.getItem('teacherRememberMe');
        if (savedRememberMe === 'true') {
          const savedEmail = await AsyncStorage.getItem('teacherEmail');
          const savedPassword = await AsyncStorage.getItem('teacherPassword');
          setEmail(savedEmail || "");
          setPassword(savedPassword || "");
          setRememberMe(true);
        }
      } catch (e) {
        // Ignore errors
      }
    };
    loadCredentials();
  }, []);

  const handleLogin = async () => {
    if (email === "teacher" && password === "123456789") {
      setError("");
      if (rememberMe) {
        await AsyncStorage.setItem('teacherRememberMe', 'true');
        await AsyncStorage.setItem('teacherEmail', email);
        await AsyncStorage.setItem('teacherPassword', password);
      } else {
        await AsyncStorage.removeItem('teacherRememberMe');
        await AsyncStorage.removeItem('teacherEmail');
        await AsyncStorage.removeItem('teacherPassword');
      }
      router.replace("/role/teacher/dashboard");
    } else {
      setError("Invalid credentials");
    }
  };

  const handleRememberMe = async (value: boolean) => {
    setRememberMe(value);
    if (!value) {
      await AsyncStorage.removeItem('teacherRememberMe');
      await AsyncStorage.removeItem('teacherEmail');
      await AsyncStorage.removeItem('teacherPassword');
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
        <Text style={styles.title}>Teacher Login</Text>
        <Text style={styles.subtitle}>
          Login as a teacher to access your dashboard and manage classes
        </Text>
        {/* Login Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter your password"
              placeholderTextColor="#94a3b8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Text style={{ color: "#94a3b8", fontSize: 16 }}>
                {showPassword ? "🙈" : "👁️"}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Error Message */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {/* Remember Me and Forgot Password */}
          <View style={styles.row}>
            <View style={styles.rememberMeRow}>
              <Switch
                value={rememberMe}
                onValueChange={handleRememberMe}
                thumbColor={rememberMe ? "#A259FF" : "#64748b"}
                trackColor={{ false: "#64748b", true: "#A259FF" }}
              />
              <Text style={styles.rememberMeText}>Remember me</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          {/* Login Button */}
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          {/* Register Section */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/role/teacher-register')}>
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </View>
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
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 },
  rememberMeRow: { flexDirection: "row", alignItems: "center" },
  rememberMeText: { color: "#cbd5e1", fontSize: 14, marginLeft: 8 },
  forgotText: { color: "#A259FF", fontSize: 14 },
  loginButton: {
    backgroundColor: "#A259FF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  errorText: { color: "#ef4444", fontSize: 14, marginTop: 8, textAlign: "center" },
  registerSection: { marginTop: 24, alignItems: "center" },
  registerText: { color: "#cbd5e1", fontSize: 14 },
  registerButton: {
    backgroundColor: "rgba(71,85,105,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  registerButtonText: { color: "#A259FF", fontSize: 14, fontWeight: "bold" },
}); 