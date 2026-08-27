import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ROUTES from "../../constants/routes";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useAuth();

  const [email, setEmail] = useState(route?.params?.prefillEmail || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    const emailTrim = email.trim();
    if (!emailTrim || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await login(emailTrim, password);
      if (data.role === "workshop_manager") {
        navigation.reset({ index: 0, routes: [{ name: "WorkshopStack" }] });
      } else if (data.role === "manager") {
        navigation.reset({ index: 0, routes: [{ name: "ManagerStack" }] });
      } else if (data.role === "rental_owner") {
        navigation.reset({ index: 0, routes: [{ name: "RentalStack" }] });
      } else if (data.role === "driver") {
        navigation.reset({ index: 0, routes: [{ name: "DriverStack" }] });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Invalid email or password. Please try again.";
      Alert.alert("Sign In Failed", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <SafeAreaView style={{  flex: 1, backgroundColor: "#FFFFFF"  }} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Back Button */}
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ width: 40, height: 40, justifyContent: "center" }}
        >
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 36,
            flexGrow: 1,
            justifyContent: "space-between",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            {/* Header */}
            <View style={{ marginBottom: 28 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: "#2563EB",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <Ionicons name="car" size={26} color="#FFFFFF" />
              </View>
              <Text style={{ fontSize: 28, fontWeight: "800", color: "#0F172A", letterSpacing: -0.5 }}>
                Sign In
              </Text>
              <Text style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
                Enter your email and password to access your account.
              </Text>
            </View>

            {/* Email Field */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Email Address
              </Text>
              <View
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#CBD5E1",
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  height: 48,
                }}
              >
                <Ionicons name="mail-outline" size={18} color="#94A3B8" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    fontSize: 14,
                    color: "#0F172A",
                  }}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#334155", marginBottom: 6 }}>
                Password
              </Text>
              <View
                style={{
                  backgroundColor: "#F8FAFC",
                  borderWidth: 1,
                  borderColor: "#CBD5E1",
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  height: 48,
                }}
              >
                <Ionicons name="lock-closed-outline" size={18} color="#94A3B8" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    fontSize: 14,
                    color: "#0F172A",
                  }}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
              style={{ alignSelf: "flex-end", paddingVertical: 4, marginBottom: 20 }}
            >
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#2563EB" }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={isSubmitting}
              style={{
                height: 50,
                backgroundColor: "#2563EB",
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            {/* Need account */}
            <TouchableOpacity
              onPress={() => navigation.navigate(ROUTES.PURCHASE)}
              style={{ marginTop: 24, alignItems: "center" }}
            >
              <Text style={{ fontSize: 13, color: "#64748B" }}>
                Don't have an account?{" "}
                <Text style={{ fontWeight: "700", color: "#2563EB" }}>Get Started</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}