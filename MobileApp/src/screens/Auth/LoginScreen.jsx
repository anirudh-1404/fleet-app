import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ROUTES from "../../constants/routes";

import CustomInput from "../../components/inputs/CustomInput";
import PrimaryButton from "../../components/buttons/PrimaryButton";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { login } = useAuth();

  const [email, setEmail] = useState(route?.params?.prefillEmail || "");
  const [password, setPassword] = useState("");
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
      if (data.role === "manager") {
        navigation.reset({ index: 0, routes: [{ name: "ManagerStack" }] });
      } else if (data.role === "driver") {
        navigation.reset({ index: 0, routes: [{ name: "DriverStack" }] });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Invalid email or password. Please try again.";
      Alert.alert("Login Failed", errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Outer flex container — 3 equal sections */}
        <View style={{ flex: 1, paddingHorizontal: 24, paddingBottom: 16 }}>

          {/* Section 1: Top Branding — flex 1 */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                backgroundColor: "#2563EB",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#2563EB",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 5,
              }}
            >
              <Ionicons name="car-sport" size={32} color="#FFFFFF" />
            </View>

            <Text style={{ fontSize: 30, fontWeight: "800", color: "#0F172A", marginTop: 14, letterSpacing: -0.5 }}>
              Fleev
            </Text>
            <Text style={{ fontSize: 13, color: "#64748B", textAlign: "center", marginTop: 4, fontWeight: "500" }}>
              Sign in to manage your work effortlessly.
            </Text>
          </View>

          {/* Section 2: Middle Form — flex 2 (bigger so inputs have room) */}
          <View style={{ flex: 2, justifyContent: "center" }}>
            {/* Email */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
                Email Address
              </Text>
              <CustomInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                leftIcon="mail-outline"
              />
            </View>

            {/* Password */}
            <View style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#334155", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>
                Password
              </Text>
              <CustomInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                leftIcon="lock-closed-outline"
              />
            </View>

            <TouchableOpacity
              style={{ alignSelf: "flex-end", paddingVertical: 4 }}
              onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
            >
              <Text style={{ fontSize: 12, color: "#2563EB", fontWeight: "700" }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <View style={{ marginTop: 20 }}>
              {isSubmitting ? (
                <View style={{ height: 56, backgroundColor: "#2563EB", borderRadius: 20, alignItems: "center", justifyContent: "center" }}>
                  <ActivityIndicator color="white" />
                </View>
              ) : (
                <PrimaryButton title="Sign In" onPress={handleLogin} />
              )}
            </View>
          </View>

          {/* Section 3: Bottom Footer — flex 1 */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", paddingBottom: 4 }}>
            <Text style={{ fontSize: 11, color: "#94A3B8" }}>
              By continuing, you agree to our
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <TouchableOpacity>
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#64748B" }}>Terms</Text>
              </TouchableOpacity>
              <Text style={{ marginHorizontal: 6, fontSize: 11, color: "#CBD5E1" }}>&</Text>
              <TouchableOpacity>
                <Text style={{ fontSize: 11, fontWeight: "600", color: "#64748B" }}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}